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
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm/"
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
      const alpha = isBinary ? (raw > 0 ? 255 : 0) : Math.round(Math.max(0, Math.min(255, raw * 255)));
      pixels[(y * canvas.width + x) * 4 + 3] = alpha;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return new Promise((r) => canvas.toBlob((b) => r(b!), "image/png"));
}

export async function removeBackground(
  file: File,
  options?: { preserveShadows?: boolean; edgeRefinement?: boolean; outputFormat?: string; highResolution?: boolean }
): Promise<Blob> {
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

  // Let the render settle before feeding to the model
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
      console.error("MediaPipe segment(img) failed:", err2);
      // One last try – OffscreenCanvas if available
      try {
        const offscreen = new OffscreenCanvas(cw, ch);
        const octx = offscreen.getContext("2d")!;
        octx.drawImage(bitmap, 0, 0, cw, ch);
        results = model.segment(offscreen as unknown as HTMLCanvasElement);
      } catch (err3) {
        console.error("MediaPipe segment(offscreen) failed:", err3);
        return renderFallback(bitmap);
      }
    }
  }

  if (!results) {
    console.warn("MediaPipe returned null/undefined results");
    return renderFallback(bitmap);
  }

  // Check if confidence masks were actually returned
  const cm = results.confidenceMasks as any[] | undefined;

  // confidenceMasks[0] = background, confidenceMasks[1] = foreground (selfie)
  if (cm && cm.length >= 2 && cm[1]) {
    const mask = cm[1];
    const data = mask.getAsFloat32Array();
    if (data && data.length > 0) {
      return applyMaskToImage(bitmap, data, mask.width, mask.height, false);
    }
  }

  if (cm && cm.length >= 1 && cm[0]) {
    const mask = cm[0];
    const data = mask.getAsFloat32Array();
    if (data && data.length > 0) {
      const inv = new Float32Array(data.length);
      for (let i = 0; i < data.length; i++) inv[i] = 1 - data[i];
      return applyMaskToImage(bitmap, inv, mask.width, mask.height, false);
    }
  }

  if (results.categoryMask) {
    const mask = results.categoryMask;
    const data = mask.getAsFloat32Array();
    if (data && data.length > 0) {
      return applyMaskToImage(bitmap, data, mask.width, mask.height, true);
    }
  }

  console.warn("MediaPipe returned results but no usable mask data", Object.keys(results));
  return renderFallback(bitmap);
}

export async function replaceBackground(
  file: File,
  options: { backgroundType: string; color?: { r: number; g: number; b: number }; blurStrength?: number; preserveShadows?: boolean }
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
