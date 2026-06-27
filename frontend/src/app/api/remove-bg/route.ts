import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("image");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing 'image' file in form data" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const body = new FormData();
    body.append("image_file_b64", base64);
    body.append("size", "auto");

    const apiKey = process.env.BG_REMOVER_API_KEY;

    const res = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey || "",
      },
      body,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "unknown error");
      console.error("/api/remove-bg upstream error:", res.status, text);
      return NextResponse.json({ error: text || `Upstream error ${res.status}` }, { status: res.status });
    }

    const result = await res.arrayBuffer();

    return new NextResponse(result, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": result.byteLength.toString(),
      },
    });
  } catch (err: any) {
    console.error("/api/remove-bg error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
