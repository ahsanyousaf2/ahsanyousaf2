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
    const { FilesetResolver, ImageSegmenter } = await import("@mediapipe/tasks-vision");
    const wasmFileset = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.15/wasm/"
    );
    segmenter = await ImageSegmenter.createFromOptions(wasmFileset, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
      },
      runningMode: "IMAGE",
      outputConfidenceMasks: true,
    });
    progressHook(100);
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
  const bitmap = await createImageBitmap(file);
  const w = bitmap.width;
  const h = bitmap.height;

  let results;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
    results = model.segment(canvas);
  } catch {
    bitmap.close();
    const fbCanvas = document.createElement("canvas");
    fbCanvas.width = w;
    fbCanvas.height = h;
    fbCanvas.getContext("2d")!.drawImage(bitmap, 0, 0);
    return new Promise((r) => fbCanvas.toBlob((b) => r(b!), "image/png"));
  }

  const mask = results.confidenceMasks?.[1] || results.categoryMask;
  if (!mask) {
    bitmap.close();
    const fbCanvas = document.createElement("canvas");
    fbCanvas.width = w;
    fbCanvas.height = h;
    fbCanvas.getContext("2d")!.drawImage(bitmap, 0, 0);
    return new Promise((r) => fbCanvas.toBlob((b) => r(b!), "image/png"));
  }

  const maskData = mask.getAsFloat32Array();
  const mw = mask.width;
  const mh = mask.height;

  const { canvas: resultCanvas, ctx: rctx } = createCanvas(w, h);
  rctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const imageData = rctx.getImageData(0, 0, w, h);
  const pixels = imageData.data;
  const isCategory = !results.confidenceMasks;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const mx = Math.round((x / w) * mw);
      const my = Math.round((y / h) * mh);
      const mi = my * mw + mx;
      let alpha = maskData[mi] ?? 0;
      if (isCategory) alpha = alpha > 0 ? 255 : 0;
      pixels[(y * w + x) * 4 + 3] = Math.round(Math.max(0, Math.min(255, alpha * 255)));
    }
  }

  rctx.putImageData(imageData, 0, 0);

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
    const bh = bitmap.height * scale;
    ctx.drawImage(bitmap, 0, y, 1024, bh);
    y += bh;
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
