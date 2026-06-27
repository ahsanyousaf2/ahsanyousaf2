"use client";

const IMGLY_CDN = "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/dist/index.mjs";
let imglyModule: any = null;

async function getImgly() {
  if (!imglyModule) {
    imglyModule = await import(/* webpackIgnore: true */ IMGLY_CDN);
  }
  return imglyModule;
}

export async function removeBackground(
  file: File,
  onProgress?: (loaded: number, total: number) => void
): Promise<Blob> {
  try {
    const { removeBackground: removeImgBg } = await getImgly();
    const blob = await removeImgBg(file, {
      model: "medium",
      progress: (key: string, current: number, total: number) => {
        if (key === "model:download") {
          onProgress?.(current, total);
        }
      },
    });
    return blob;
  } catch (err: any) {
    console.error("removeBackground failed:", err);
    throw new Error(
      err.message?.includes("WebGL")
        ? "Your browser does not support WebGL. Please use a modern browser like Chrome, Firefox, or Edge."
        : err.message || "Failed to remove background. Please try again."
    );
  }
}
