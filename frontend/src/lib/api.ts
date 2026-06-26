function createCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { canvas: c, ctx: c.getContext("2d")! };
}

function colorDist(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function sampleBgColor(data: Uint8ClampedArray, w: number, h: number) {
  const samples: [number, number, number][] = [];
  const step = 20;
  for (let x = 0; x < w; x += step) {
    for (let y = 0; y < h; y += step) {
      if (x < 5 || y < 5 || x > w - 5 || y > h - 5) {
        const i = (y * w + x) * 4;
        samples.push([data[i], data[i + 1], data[i + 2]]);
      }
    }
  }
  const avgR = Math.round(samples.reduce((s, c) => s + c[0], 0) / samples.length);
  const avgG = Math.round(samples.reduce((s, c) => s + c[1], 0) / samples.length);
  const avgB = Math.round(samples.reduce((s, c) => s + c[2], 0) / samples.length);
  return [avgR, avgG, avgB] as const;
}

function removeBgCanvas(
  img: HTMLImageElement,
  threshold = 60,
  featherPx = 3
): Promise<Blob> {
  const w = img.width;
  const h = img.height;
  const maxDim = 1200;

  let scale = 1;
  if (w > maxDim || h > maxDim) {
    scale = Math.min(maxDim / w, maxDim / h);
  }
  const cw = Math.round(w * scale);
  const ch = Math.round(h * scale);

  const { canvas, ctx } = createCanvas(cw, ch);
  ctx.drawImage(img, 0, 0, cw, ch);

  const imageData = ctx.getImageData(0, 0, cw, ch);
  const d = imageData.data;

  const [bgR, bgG, bgB] = sampleBgColor(d, cw, ch);

  for (let i = 0; i < d.length; i += 4) {
    const dist = colorDist(d[i], d[i + 1], d[i + 2], bgR, bgG, bgB);
    if (dist > threshold) continue;
    const alpha = Math.max(0, Math.min(255, ((dist - threshold + featherPx) / featherPx) * 255));
    d[i + 3] = alpha;
  }

  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
}

export async function preloadModel() {}

export async function removeBackground(
  file: File,
  options?: {
    preserveShadows?: boolean;
    edgeRefinement?: boolean;
    outputFormat?: string;
    highResolution?: boolean;
  }
): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = URL.createObjectURL(file);
  });

  return removeBgCanvas(img);
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
  const blob = await removeBackground(file);
  const imageBitmap = await createImageBitmap(blob);
  const { canvas, ctx } = createCanvas(imageBitmap.width, imageBitmap.height);

  if (options.backgroundType === "color" && options.color) {
    const { r, g, b } = options.color;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (options.backgroundType === "blur") {
    ctx.filter = `blur(${options.blurStrength || 30}px)`;
    ctx.drawImage(imageBitmap, 0, 0);
    ctx.filter = "none";
  }

  ctx.drawImage(imageBitmap, 0, 0);
  imageBitmap.close();

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

export function onModelProgress(_fn: (pct: number) => void) {}
