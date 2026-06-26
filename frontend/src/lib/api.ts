"use client";

import { FilesetResolver, ImageSegmenter } from "@mediapipe/tasks-vision";

let segmenter: any = null;
let progressCallback: ((pct: number) => void) | null = null;

export function onModelProgress(fn: (pct: number) => void) {
  progressCallback = fn;
}

async function getSegmenter() {
  if (segmenter) return segmenter;

  try {
    const wasmFileset = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm/"
    );
    segmenter = await ImageSegmenter.createFromOptions(wasmFileset, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
      },
      runningMode: "IMAGE",
      outputCategoryMask: true,
      outputConfidenceMasks: true,
    });
    progressCallback?.(100);
    return segmenter;
  } catch (err) {
    console.error("MediaPipe init failed:", err);
    throw new Error("Failed to load AI model. Check console for details.");
  }
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

function renderFallback(bitmap: ImageBitmap): Promise<Blob> {
  const { canvas, ctx } = createCanvas(bitmap.width, bitmap.height);
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  return new Promise((r) => canvas.toBlob((b) => r(b!), "image/png"));
}

function applyMaskToImage(bitmap: ImageBitmap, maskData: Float32Array, mw: number, mh: number, isBinary: boolean): Promise<Blob> {
  const { canvas, ctx } = createCanvas(bitmap.width, bitmap.height);
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const mx = Math.min(Math.round((x / canvas.width) * mw), mw - 1);
      const my = Math.min(Math.round((y / canvas.height) * mh), mh - 1);
      const raw = maskData[my * mw + mx] ?? 0;
      let alpha: number;
      if (isBinary) {
        alpha = raw > 0 ? 255 : 0;
      } else {
        // Apply threshold to remove "shadow" artifacts
        alpha = raw > 0.3 ? Math.round(Math.min(255, ((raw - 0.3) / 0.7) * 255)) : 0;
      }
      pixels[(y * canvas.width + x) * 4 + 3] = alpha;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return new Promise((r) => canvas.toBlob((b) => r(b!), "image/png"));
}

async function removeBgClientSide(file: File): Promise<Blob> {
  const model = await getSegmenter();
  const bitmap = await createImageBitmap(file);
  const w = bitmap.width;
  const h = bitmap.height;

  const maxDim = 1024;
  let cw: number, ch: number;
  if (w > h) {
    cw = Math.min(w, maxDim);
    ch = Math.round(cw * (h / w));
  } else {
    ch = Math.min(h, maxDim);
    cw = Math.round(ch * (w / h));
  }

  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, cw, ch);

  await new Promise((r) => setTimeout(r, 50));

  let results: any;
  try {
    results = model.segment(canvas);
  } catch (err) {
    console.error("MediaPipe segment(canvas) failed:", err);
    try {
      const img = new Image();
      const blobUrl = URL.createObjectURL(file);
      img.src = blobUrl;
      await img.decode();
      results = model.segment(img);
      URL.revokeObjectURL(blobUrl);
    } catch (err2) {
      console.error("MediaPipe all attempts failed:", err2);
      return renderFallback(bitmap);
    }
  }

  if (!results) {
    console.warn("MediaPipe returned null results");
    return renderFallback(bitmap);
  }

  function confidenceToAlpha(raw: number): number {
    return raw > 0.3 ? Math.round(Math.min(255, ((raw - 0.3) / 0.7) * 255)) : 0;
  }

  function tryApply(mask: any, invert: boolean): Promise<Blob> | null {
    if (!mask) return null;
    const data = mask.getAsFloat32Array();
    if (!data || data.length === 0) return null;
    if (invert) {
      const inv = new Float32Array(data.length);
      for (let i = 0; i < data.length; i++) {
        const raw = data[i];
        inv[i] = 1 - raw;
      }
      return applyMaskToImage(bitmap, inv, mask.width, mask.height, false);
    }
    return applyMaskToImage(bitmap, data, mask.width, mask.height, false);
  }

  async function tryConfidence(masks: any[] | undefined, index: number, invert: boolean): Promise<Blob | null> {
    if (!masks || index >= masks.length || !masks[index]) return null;
    const mask = masks[index];
    const data = mask.getAsFloat32Array();
    if (!data || data.length === 0) return null;
    if (invert) {
      const inv = new Float32Array(data.length);
      for (let i = 0; i < data.length; i++) inv[i] = 1 - data[i];
      return applyMaskToImage(bitmap, inv, mask.width, mask.height, false);
    }
    return applyMaskToImage(bitmap, data, mask.width, mask.height, false);
  }

  // Category mask: 0 = background, 1 = foreground (binary, most reliable)
  const cat = results.categoryMask;
  if (cat) {
    const catData = cat.getAsFloat32Array();
    if (catData && catData.length > 0) {
      return applyMaskToImage(bitmap, catData, cat.width, cat.height, true);
    }
  }

  // Try foreground confidence mask at index 1
  const cm = results.confidenceMasks as any[] | undefined;
  let fg = await tryConfidence(cm, 1, false);
  if (fg) return fg;

  // Try foreground confidence mask at index 0 (some models swap order)
  fg = await tryConfidence(cm, 0, false);
  if (fg) return fg;

  // Try inverted background mask at index 1
  fg = await tryConfidence(cm, 1, true);
  if (fg) return fg;

  // Try inverted background mask at index 0
  fg = await tryConfidence(cm, 0, true);
  if (fg) return fg;

  console.warn("MediaPipe no usable mask, keys:", Object.keys(results));
  return renderFallback(bitmap);
}

export async function removeBackground(
  file: File,
  _options?: { preserveShadows?: boolean; edgeRefinement?: boolean; outputFormat?: string; highResolution?: boolean }
): Promise<Blob> {
  return removeBgClientSide(file);
}

export async function replaceBackground(
  file: File,
  options: { backgroundType: string; color?: { r: number; g: number; b: number }; blurStrength?: number; preserveShadows?: boolean }
): Promise<Blob> {
  const noBg = await removeBgClientSide(file);
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
  files: File[], options?: { preserveShadows?: boolean; edgeRefinement?: boolean; outputFormat?: string }
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

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), options?.outputFormat || "png"));
}

export async function checkHealth() {
  return { status: "ok", service: "client-side" };
}
