"use client";

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

export async function removeBackground(file: File): Promise<Blob> {
  const compressed = await compressForUpload(file);
  const formData = new FormData();
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
