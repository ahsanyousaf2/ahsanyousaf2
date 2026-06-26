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
        <h1 className="text-4xl font-bold">Client-Side API</h1>
        <p className="mt-4 text-lg text-[rgb(var(--muted-foreground))]">
          Background removal runs entirely in the browser using the U2Net deep learning model via ONNX Runtime Web.
          No server required.
        </p>
      </div>

      <div className="mb-8 rounded-xl border bg-[rgb(var(--card))] p-6">
        <h2 className="mb-2 text-lg font-semibold">Installation</h2>
        <CodeBlock code={`npm install @xenova/transformers`} language="bash" />
      </div>

      <div className="space-y-8">
        <div className="rounded-xl border bg-[rgb(var(--card))] p-6">
          <h3 className="mb-4 text-lg font-semibold">Remove Background</h3>
          <CodeBlock
            code={`import { removeBackground, preloadModel } from "@/lib/api";

// Optional: preload the model ahead of time
await preloadModel();

// Remove background from a File
const file = event.target.files[0];
const blob = await removeBackground(file);
const url = URL.createObjectURL(blob);`}
            language="typescript"
          />
        </div>

        <div className="rounded-xl border bg-[rgb(var(--card))] p-6">
          <h3 className="mb-4 text-lg font-semibold">With Options</h3>
          <CodeBlock
            code={`import { removeBackground } from "@/lib/api";

const blob = await removeBackground(file, {
  outputFormat: "png",
  highResolution: true,
});`}
            language="typescript"
          />
        </div>

        <div className="rounded-xl border bg-[rgb(var(--card))] p-6">
          <h3 className="mb-4 text-lg font-semibold">Background Replacement</h3>
          <CodeBlock
            code={`import { replaceBackground } from "@/lib/api";

const blob = await replaceBackground(file, {
  backgroundType: "color",
  color: { r: 37, g: 99, b: 235 }, // blue
});`}
            language="typescript"
          />
        </div>

        <div className="rounded-xl border bg-[rgb(var(--card))] p-6">
          <h3 className="mb-4 text-lg font-semibold">Model Progress</h3>
          <CodeBlock
            code={`import { preloadModel, onModelProgress } from "@/lib/api";

onModelProgress((pct) => {
  console.log(\`Model downloading: \${pct}%\`);
});
await preloadModel();`}
            language="typescript"
          />
        </div>
      </div>
    </div>
  );
}
