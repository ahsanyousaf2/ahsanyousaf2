const IMGLY_CDN = "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/";

let modelLoaded = false;
let _onProgress: ((pct: number) => void) | null = null;

export function onModelProgress(fn: (pct: number) => void) {
  _onProgress = fn;
}

async function getImgly() {
  const mod = await import(
    /* webpackIgnore: true */
    "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/dist/index.mjs"
  );
  return mod;
}

export async function preloadModel() {
  if (!modelLoaded) {
    const { preload } = await getImgly();
    await preload({
      publicPath: IMGLY_CDN,
      progress: (_key: string, current: number, total: number) => {
        const pct = total > 0 ? Math.round((current / total) * 100) : 0;
        _onProgress?.(pct);
      },
    });
    modelLoaded = true;
    _onProgress?.(100);
  }
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
  await preloadModel();

  const { removeBackground: removeBg } = await getImgly();
  const quality = options?.highResolution ? 1.0 : 0.8;

  return removeBg(file, {
    publicPath: IMGLY_CDN,
    output: {
      format: "image/png",
      quality,
    },
  });
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
  await preloadModel();

  const { removeBackground: removeBg } = await getImgly();
  const blob = await removeBg(file, {
    publicPath: IMGLY_CDN,
    output: {
      format: "image/png",
      quality: 1.0,
    },
  });

  if (options.backgroundType === "color" && options.color) {
    const { r, g, b } = options.color;
    const imageBitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageBitmap, 0, 0);
    imageBitmap.close();
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
  }

  if (options.backgroundType === "blur") {
    const imageBitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx = canvas.getContext("2d")!;
    ctx.filter = `blur(${options.blurStrength || 30}px)`;
    ctx.drawImage(imageBitmap, 0, 0);
    ctx.filter = "none";
    ctx.drawImage(imageBitmap, 0, 0);
    imageBitmap.close();
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
  }

  return blob;
}

export async function batchRemoveBackground(
  files: File[],
  options?: {
    preserveShadows?: boolean;
    edgeRefinement?: boolean;
    outputFormat?: string;
  }
): Promise<Blob> {
  await preloadModel();
  const { removeBackground: removeBg } = await getImgly();

  const results = await Promise.all(
    files.map((file) =>
      removeBg(file, {
        publicPath: IMGLY_CDN,
      })
    )
  );

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = 1024;

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

export async function checkHealth(): Promise<{ status: string; service: string }> {
  return { status: "ok", service: "client-side" };
}
