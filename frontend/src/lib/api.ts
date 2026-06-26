import { pipeline, env } from "@xenova/transformers";

env.allowLocalModels = false;
env.useBrowserCache = true;

let segmenter: any = null;
let progressCallback: ((pct: number) => void) | null = null;

export function onModelProgress(fn: (pct: number) => void) {
  progressCallback = fn;
}

function progressHook(pct: number) {
  progressCallback?.(Math.round(pct * 100));
}

async function getSegmenter() {
  if (!segmenter) {
    segmenter = await pipeline("image-segmentation", "Xenova/u2net", {
      progress_callback: (data: any) => {
        if (data.status === "progress") {
          progressHook(data.progress);
        }
      },
    });
  }
  return segmenter;
}

export async function preloadModel() {
  await getSegmenter();
}

function createCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { canvas: c, ctx: c.getContext("2d")! };
}

async function imageToBlob(img: HTMLImageElement): Promise<Blob> {
  const { canvas, ctx } = createCanvas(img.width, img.height);
  ctx.drawImage(img, 0, 0);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
}

async function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function applyMask(
  image: HTMLImageElement,
  maskData: ImageData
): Promise<Blob> {
  const w = image.width;
  const h = image.height;
  const { canvas, ctx } = createCanvas(w, h);

  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, w, h);
  const pixels = imageData.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const mi = (y * maskData.width + x) * 4;
      const alpha = maskData.data[mi];
      pixels[i + 3] = alpha;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
}

export async function removeBackground(
  file: File,
  options?: {
    preserveShadows?: boolean;
    edgeRefinement?: boolean;
    outputFormat?: string;
    highResolution?: boolean;
  }
): Promise<Blob> {
  const model = await getSegmenter();
  const img = await fileToImage(file);

  const result = await model(img);
  const maskOutput = result[0]?.mask;

  if (!maskOutput) {
    return imageToBlob(img);
  }

  const { width, height } = maskOutput;
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = width;
  maskCanvas.height = height;

  const ctx = maskCanvas.getContext("2d")!;
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  const toTensor = maskOutput.data || maskOutput;
  for (let i = 0; i < width * height; i++) {
    const val = Math.round((toTensor[i] ?? 0) * 255);
    data[i * 4] = val;
    data[i * 4 + 1] = val;
    data[i * 4 + 2] = val;
    data[i * 4 + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);

  const resultCanvas = document.createElement("canvas");
  resultCanvas.width = img.width;
  resultCanvas.height = img.height;
  const rctx = resultCanvas.getContext("2d")!;

  rctx.drawImage(img, 0, 0);
  rctx.drawImage(maskCanvas, 0, 0, img.width, img.height);

  const finalData = rctx.getImageData(0, 0, img.width, img.height);

  const maskData = ctx.getImageData(0, 0, width, height);
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = img.width;
  tempCanvas.height = img.height;
  const tctx = tempCanvas.getContext("2d")!;
  tctx.drawImage(maskCanvas, 0, 0, img.width, img.height);
  const resizedMask = tctx.getImageData(0, 0, img.width, img.height);

  for (let i = 0; i < img.width * img.height; i++) {
    finalData.data[i * 4 + 3] = resizedMask.data[i * 4];
  }

  rctx.putImageData(finalData, 0, 0);

  return new Promise((resolve) =>
    resultCanvas.toBlob((b) => resolve(b!), options?.outputFormat || "png")
  );
}

export async function replaceBackground(
  file: File,
  options: {
    backgroundType: string;
    color?: { r: number; g: number; b: number };
    blurStrength?: number;
    preserveShadows?: boolean;
  }
): Promise<Blob> {
  const noBg = await removeBackground(file);
  const bitmap = await createImageBitmap(noBg);
  const { canvas, ctx } = createCanvas(bitmap.width, bitmap.height);

  if (options.backgroundType === "color" && options.color) {
    const { r, g, b } = options.color;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (options.backgroundType === "blur") {
    ctx.filter = `blur(${options.blurStrength || 30}px)`;
  }

  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
}

export async function batchRemoveBackground(
  files: File[],
  options?: { preserveShadows?: boolean; edgeRefinement?: boolean; outputFormat?: string }
): Promise<Blob> {
  const results = await Promise.all(files.map((f) => removeBackground(f)));
  const { canvas, ctx } = createCanvas(1024, 0);
  let y = 0;

  for (const blob of results) {
    const bitmap = await createImageBitmap(blob);
    const scale = 1024 / bitmap.width;
    const h = bitmap.height * scale;
    ctx.drawImage(bitmap, 0, y, 1024, h);
    y += h;
    bitmap.close();
  }
  canvas.height = y;

  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b!), options?.outputFormat || "png")
  );
}

export async function checkHealth() {
  return { status: "ok", service: "client-side" };
}
