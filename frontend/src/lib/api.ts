"use client";

import { removeBackground as removeImgBg } from "@imgly/background-removal";

export async function removeBackground(
  file: File,
  onProgress?: (loaded: number, total: number) => void
): Promise<Blob> {
  try {
    const blob = await removeImgBg(file, {
      model: "medium",
      progress: (key, current, total) => {
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
