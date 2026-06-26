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

function readMaskPixels(raw: any, channels: number, len: number): Float32Array {
  const out = new Float32Array(len);
  const isFloat = raw instanceof Float32Array || raw instanceof Float64Array;

  if (isFloat) {
    if (channels === 1) {
      for (let i = 0; i < len; i++) out[i] = raw[i] ?? 0;
    } else {
      for (let i = 0; i < len; i++) out[i] = raw[i * channels] ?? 0;
    }
  } else {
    if (channels === 1) {
      for (let i = 0; i < len; i++) out[i] = (raw[i] ?? 0) / 255;
    } else {
      for (let i = 0; i < len; i++) out[i] = (raw[i * channels] ?? 0) / 255;
    }
  }
  return out;
}

function contrastCurve(val: number): number {
  if (val > 0.5) return 0.5 + (val - 0.5) * 1.5;
  return val * 0.5;
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

  const results = await model(img);
  let maskOutput = null;
  for (const r of results) {
    if (r.label !== "background") {
      maskOutput = r.mask;
      break;
    }
  }
  if (!maskOutput) maskOutput = results[0]?.mask;
  if (!maskOutput) return imageToBlob(img);

  const mw = maskOutput.width || maskOutput.dims?.[1] || maskOutput.dims?.[3];
  const mh = maskOutput.height || maskOutput.dims?.[0] || maskOutput.dims?.[2];
  const w = typeof mw === "number" ? mw : (maskOutput.dims?.[3] ?? 320);
  const h = typeof mh === "number" ? mh : (maskOutput.dims?.[2] ?? 320);
  const channels = maskOutput.channels || 1;
  const raw = maskOutput.data || maskOutput;
  const pixels = readMaskPixels(raw, channels, w * h);

  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = w;
  maskCanvas.height = h;
  const ctx = maskCanvas.getContext("2d")!;
  const imageData = ctx.createImageData(w, h);
  const data = imageData.data;

  const upper = pixels.reduce((a, b) => Math.max(a, b), 0);
  const lower = pixels.reduce((a, b) => Math.min(a, b), 1);
  const mean = pixels.reduce((s, v) => s + v, 0) / pixels.length;

  const inverted = mean > 0.6;
  const threshold = Math.max(0.05, lower + (upper - lower) * 0.1);

  for (let i = 0; i < w * h; i++) {
    let val = inverted ? 1 - pixels[i] : pixels[i];
    if (val < threshold) val = 0;
    const boosted = contrastCurve(val);
    const final = Math.round(Math.max(0, Math.min(255, boosted * 255)));
    const di = i * 4;
    data[di] = final;
    data[di + 1] = final;
    data[di + 2] = final;
    data[di + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);

  const resultCanvas = document.createElement("canvas");
  resultCanvas.width = img.width;
  resultCanvas.height = img.height;
  const rctx = resultCanvas.getContext("2d")!;
  rctx.imageSmoothingEnabled = true;
  rctx.imageSmoothingQuality = "high";

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = img.width;
  tempCanvas.height = img.height;
  const tctx = tempCanvas.getContext("2d")!;
  tctx.imageSmoothingEnabled = true;
  tctx.imageSmoothingQuality = "high";
  tctx.drawImage(maskCanvas, 0, 0, img.width, img.height);
  const resizedMask = tctx.getImageData(0, 0, img.width, img.height);

  rctx.drawImage(img, 0, 0);

  const finalData = rctx.getImageData(0, 0, img.width, img.height);
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
