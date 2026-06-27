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

export default function ApiDocsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold">API Documentation</h1>
        <p className="mt-4 text-lg text-[rgb(var(--muted-foreground))]">
          Background removal API. Send an image, get back a transparent PNG.
        </p>
      </div>

      <div className="space-y-8">
        <div className="rounded-xl border bg-[rgb(var(--card))] p-6">
          <h3 className="mb-4 text-lg font-semibold">Remove Background</h3>
          <CodeBlock
            code={`curl -X POST https://your-site.com/api/remove-bg \\
  -F "image=@photo.jpg" \\
  -o result.png`}
            language="bash"
          />
        </div>

        <div className="rounded-xl border bg-[rgb(var(--card))] p-6">
          <h3 className="mb-4 text-lg font-semibold">JavaScript / TypeScript</h3>
          <CodeBlock
            code={`import { removeBackground, replaceBackground } from "@/lib/api";

// Remove background from a File
const file = event.target.files[0];
const blob = await removeBackground(file);
const url = URL.createObjectURL(blob);

// Replace background with a color
const result = await replaceBackground(file, {
  backgroundType: "color",
  color: { r: 37, g: 99, b: 235 },
});`}
            language="typescript"
          />
        </div>

        <div className="rounded-xl border bg-[rgb(var(--card))] p-6">
          <h3 className="mb-4 text-lg font-semibold">Replace Background</h3>
          <CodeBlock
            code={`import { replaceBackground } from "@/lib/api";

const blob = await replaceBackground(file, {
  backgroundType: "color",
  color: { r: 37, g: 99, b: 235 }, // blue
});`}
            language="typescript"
          />
        </div>
      </div>
    </div>
  );
}
