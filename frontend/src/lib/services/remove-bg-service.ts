import { BgRemoverService } from "./bg-remover.types";

function mimeFromName(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg": case "jpeg": return "image/jpeg";
    case "png": return "image/png";
    case "webp": return "image/webp";
    default: return "application/octet-stream";
  }
}

/**
 * Background removal service implementation.
 *
 * To swap to a self-hosted system in the future:
 * 1. Create a new class implementing BgRemoverService
 * 2. Update the factory in services/index.ts
 * 3. Done — no other code changes needed.
 */
export class RemoveBgService implements BgRemoverService {
  private apiKey: string;
  private endpoint = "https://api.remove.bg/v1.0/removebg";

  constructor(apiKey: string) {
    if (!apiKey) throw new Error("Background removal service is not configured (missing API key)");
    this.apiKey = apiKey;
  }

  async removeBackground(imageBuffer: ArrayBuffer, fileName?: string): Promise<ArrayBuffer> {
    if (!imageBuffer || imageBuffer.byteLength === 0) {
      throw new Error("Empty image buffer received");
    }

    const name = fileName || "image.png";
    const mime = mimeFromName(name);
    const blob = new Blob([imageBuffer], { type: mime });
    const formData = new FormData();
    formData.append("image_file", blob, name);
    formData.append("size", "auto");

    console.log(`[RemoveBgService] sending ${name} (${mime}, ${imageBuffer.byteLength} bytes)`);

    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: { "X-Api-Key": this.apiKey },
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "unknown error");
      console.error(`[RemoveBgService] error ${res.status}:`, text);
      throw new Error(`Background removal service error (${res.status})`);
    }

    const result = await res.arrayBuffer();
    console.log(`[RemoveBgService] success, got ${result.byteLength} bytes`);
    return result;
  }
}
