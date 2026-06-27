"use client";

const IMGLY_CDN = "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/dist/index.mjs";

let removeImgBg: ((file: File | Blob, config?: any) => Promise<Blob>) | null = null;
let modelReady = false;
let modelError: string | null = null;
let preloadPromise: Promise<void> | null = null;

type ProgressCallback = (loaded: number, total: number, stage: string) => void;

export function isModelReady() {
  return modelReady;
}

export function getModelError() {
  return modelError;
}

async function ensureLibrary() {
  if (removeImgBg) return;
  const mod = await import(/* webpackIgnore: true */ IMGLY_CDN);
  removeImgBg = mod.removeBackground;
}

export async function preloadModel(onProgress?: ProgressCallback): Promise<void> {
  if (preloadPromise) return preloadPromise;
  if (modelReady) return;

  preloadPromise = (async () => {
    try {
      onProgress?.(0, 1, "Loading AI engine...");
      await ensureLibrary();

      onProgress?.(1, 4, "Downloading AI model...");

      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Failed to create test image"))), "image/png");
      });

      await removeImgBg!(blob!, {
        model: "medium",
        progress: (_key: string, current: number, total: number) => {
          onProgress?.(current, total, "Downloading AI model...");
        },
      });

      modelReady = true;
      onProgress?.(1, 1, "AI model ready!");
    } catch (err: any) {
      modelError = err.message || "Failed to load AI model";
      modelReady = false;
      preloadPromise = null;
      throw err;
    }
  })();

  return preloadPromise;
}

export async function removeBackground(
  file: File,
  onProgress?: ProgressCallback
): Promise<Blob> {
  if (!modelReady) {
    await preloadModel(onProgress);
  }

  try {
    await ensureLibrary();
    const blob = await removeImgBg!(file, {
      model: "medium",
      progress: (_key: string, current: number, total: number) => {
        if (current < total) {
          onProgress?.(current, total, "Removing background...");
        }
      },
    });
    return blob;
  } catch (err: any) {
    console.error("removeBackground failed:", err);
    modelReady = false;
    preloadPromise = null;
    throw new Error(
      err.message?.includes("WebGL")
        ? "Your browser does not support WebGL. Please use Chrome, Firefox, or Edge."
        : err.message || "Failed to remove background."
    );
  }
}
