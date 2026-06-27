"use client";

/**
 * Compress image to stay under Vercel's 4.5MB serverless body limit.
 * Resizes to max 2000px and JPEG 80% quality if needed.
 */
async function compressForUpload(file: File): Promise<Blob> {
  if (file.size < 4 * 1024 * 1024) return file;

  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;
  const maxDim = 2000;
  if (width > maxDim || height > maxDim) {
    const scale = Math.min(maxDim / width, maxDim / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((r) => canvas.toBlob((b) => r(b!), "image/jpeg", 0.8));
}

async function removeBgViaServerApi(file: File): Promise<Blob> {
  const compressed = await compressForUpload(file);
  const formData = new FormData();
  // Use .jpg extension for compressed images (convert to JPEG), preserve original for uncompressed
  const name = compressed === file ? file.name : file.name.replace(/\.[^.]+$/, ".jpg");
  formData.append("image", compressed, name);

  const res = await fetch("/api/remove-bg", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Server error ${res.status}`);
  }

  return res.blob();
}

export async function removeBackground(file: File): Promise<Blob> {
  try {
    return await removeBgViaServerApi(file);
  } catch (err: any) {
    console.error("removeBackground failed:", err);
    throw new Error(err.message || "Failed to remove background. Please try again.");
  }
}

export async function replaceBackground(
  source: File | Blob,
  options: { backgroundType: string; color?: { r: number; g: number; b: number }; blurStrength?: number }
): Promise<Blob> {
  const noBg = source instanceof File ? await removeBackground(source) : source;
  const bitmap = await createImageBitmap(noBg);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d")!;

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

export async function checkHealth() {
  return { status: "ok", service: "api" };
}
