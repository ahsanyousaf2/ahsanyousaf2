"use client";

import { Copy } from "lucide-react";
import { useState } from "react";

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative">
      <div className="flex items-center justify-between rounded-t-lg bg-[rgb(var(--dark-700))] px-4 py-2 text-xs text-gray-400">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 transition-colors hover:text-white"
        >
          <Copy className="h-3.5 w-3.5" />
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-b-lg bg-[rgb(var(--dark-800))] p-4 text-sm text-gray-300">
        <code>{code}</code>
      </pre>
    </div>
  );
}

const endpoints = [
  {
    method: "POST",
    path: "/api/v1/remove-background",
    description: "Remove background from an image with AI precision.",
    params: [
      { name: "file", type: "file", required: true, description: "Image file (JPG, PNG, WEBP)" },
      { name: "preserve_shadows", type: "boolean", required: false, description: "Preserve shadows in output" },
      { name: "edge_refinement", type: "boolean", required: false, description: "Apply edge refinement" },
      { name: "output_format", type: "string", required: false, description: "png or webp" },
      { name: "high_resolution", type: "boolean", required: false, description: "Export at original resolution" },
    ],
    example: `curl -X POST http://localhost:8000/api/v1/remove-background \\
  -F "file=@image.jpg" \\
  -F "preserve_shadows=false" \\
  -F "output_format=png"`,
  },
  {
    method: "POST",
    path: "/api/v1/replace-background",
    description: "Remove background and replace with a new one.",
    params: [
      { name: "file", type: "file", required: true, description: "Image file" },
      { name: "background_type", type: "string", required: false, description: "color, blur" },
      { name: "color_r", type: "integer", required: false, description: "Red channel (0-255)" },
      { name: "color_g", type: "integer", required: false, description: "Green channel (0-255)" },
      { name: "color_b", type: "integer", required: false, description: "Blue channel (0-255)" },
      { name: "blur_strength", type: "integer", required: false, description: "Blur intensity (0-100)" },
    ],
    example: `curl -X POST http://localhost:8000/api/v1/replace-background \\
  -F "file=@image.jpg" \\
  -F "background_type=color" \\
  -F "color_r=255" \\
  -F "color_g=255" \\
  -F "color_b=255"`,
  },
  {
    method: "POST",
    path: "/api/v1/batch-remove",
    description: "Process multiple images in a single request.",
    params: [
      { name: "files", type: "file[]", required: true, description: "Multiple image files" },
      { name: "output_format", type: "string", required: false, description: "png or webp" },
    ],
    example: `curl -X POST http://localhost:8000/api/v1/batch-remove \\
  -F "files=@image1.jpg" \\
  -F "files=@image2.jpg" \\
  -F "output_format=png"`,
  },
  {
    method: "GET",
    path: "/health",
    description: "Check API health status.",
    params: [],
    example: "curl http://localhost:8000/health",
  },
];

export default function ApiDocsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold">API Documentation</h1>
        <p className="mt-4 text-lg text-[rgb(var(--muted-foreground))]">
          Integrate background removal into your applications with our REST API.
        </p>
      </div>

      <div className="mb-8 rounded-xl border bg-[rgb(var(--card))] p-6">
        <h2 className="mb-2 text-lg font-semibold">Base URL</h2>
        <CodeBlock code="http://localhost:8000" language="text" />
        <p className="mt-4 text-sm text-[rgb(var(--muted-foreground))]">
          The API is also available with interactive Swagger documentation at{" "}
          <code className="rounded bg-[rgb(var(--muted))] px-1.5 py-0.5 text-sm">/api/docs</code>
        </p>
      </div>

      <div className="space-y-8">
        {endpoints.map((ep) => (
          <div key={ep.path} className="rounded-xl border bg-[rgb(var(--card))] p-6">
            <div className="mb-4 flex items-center gap-3">
              <span
                className={`rounded px-2.5 py-1 text-xs font-bold uppercase ${
                  ep.method === "GET"
                    ? "bg-green-500/10 text-green-500"
                    : "bg-primary-500/10 text-primary-500"
                }`}
              >
                {ep.method}
              </span>
              <code className="text-sm font-mono">{ep.path}</code>
            </div>
            <p className="mb-4 text-sm text-[rgb(var(--muted-foreground))]">{ep.description}</p>

            {ep.params.length > 0 && (
              <div className="mb-4">
                <h4 className="mb-2 text-sm font-semibold">Parameters</h4>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[rgb(var(--muted))]">
                      <tr>
                        <th className="px-4 py-2 font-medium">Name</th>
                        <th className="px-4 py-2 font-medium">Type</th>
                        <th className="px-4 py-2 font-medium">Required</th>
                        <th className="px-4 py-2 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ep.params.map((p) => (
                        <tr key={p.name} className="border-t">
                          <td className="px-4 py-2 font-mono text-xs">{p.name}</td>
                          <td className="px-4 py-2 text-xs">{p.type}</td>
                          <td className="px-4 py-2 text-xs">{p.required ? "Yes" : "No"}</td>
                          <td className="px-4 py-2 text-xs">{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <h4 className="mb-2 text-sm font-semibold">Example</h4>
            <CodeBlock code={ep.example} />
          </div>
        ))}
      </div>
    </div>
  );
}
