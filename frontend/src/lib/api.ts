import { removeBackground as imglyRemoveBackground, preload } from "@imgly/background-removal";

let modelLoaded = false;

export async function preloadModel() {
  if (!modelLoaded) {
    await preload();
    modelLoaded = true;
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

  const quality = options?.highResolution ? 1.0 : 0.8;

  const blob = await imglyRemoveBackground(file, {
    output: {
      format: "image/png" as const,
      quality,
    },
  });

  return blob;
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

  const blob = await imglyRemoveBackground(file, {
    output: {
      format: "image/png" as const,
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

  const results = await Promise.all(
    files.map((file) => imglyRemoveBackground(file))
  );

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const totalHeight = results.reduce((sum, b) => sum + b.size, 0);
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
