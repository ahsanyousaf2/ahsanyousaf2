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
    const buf = Buffer.from(imageBuffer);
    const base64 = buf.toString("base64");

    console.log(`[RemoveBgService] sending ${name} (${imageBuffer.byteLength} bytes as base64)`);

    const form = new FormData();
    form.append("image_file_b64", base64);
    form.append("size", "auto");

    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: { "X-Api-Key": this.apiKey },
      body: form,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "unknown error");
      console.error(`[RemoveBgService] error ${res.status}:`, text);
      throw new Error(text || `Background removal service error (${res.status})`);
    }

    const result = await res.arrayBuffer();
    console.log(`[RemoveBgService] success, got ${result.byteLength} bytes`);
    return result;
  }
}
