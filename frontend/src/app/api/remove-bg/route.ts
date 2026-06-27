import { NextRequest, NextResponse } from "next/server";
import { getBgRemoverService } from "@/lib/services";

/**
 * POST /api/remove-bg
 *
 * Accepts a multipart/form-data upload with an "image" field.
 * Proxies to the background-removal service and returns the PNG.
 */
export async function POST(req: NextRequest) {
  try {
    let imageBuffer: ArrayBuffer;
    let fileName: string | undefined;

    const ct = req.headers.get("content-type") || "";

    if (ct.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("image");
      if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: "Missing 'image' file in form data" }, { status: 400 });
      }
      imageBuffer = await file.arrayBuffer();
      fileName = file.name;
    } else {
      imageBuffer = await req.arrayBuffer();
      if (!imageBuffer || imageBuffer.byteLength === 0) {
        return NextResponse.json({ error: "Empty request body" }, { status: 400 });
      }
    }

    if (!imageBuffer || imageBuffer.byteLength === 0) {
      return NextResponse.json({ error: "No image data received" }, { status: 400 });
    }

    const service = getBgRemoverService();
    const result = await service.removeBackground(imageBuffer, fileName);

    return new NextResponse(result, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": result.byteLength.toString(),
      },
    });
  } catch (err: any) {
    console.error("/api/remove-bg error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/remove-bg
 * Health check — verifies the service is configured.
 */
export async function GET() {
  const apiKey = process.env.BG_REMOVER_API_KEY || "";
  const service = process.env.BG_REMOVER_SERVICE || "not set";
  const keyPrefix = apiKey ? apiKey.slice(0, 4) + "..." : "NOT SET";

  return NextResponse.json({
    status: "ok",
    service,
    key: keyPrefix,
    note: "POST an image to /api/remove-bg to process it",
  });
}
