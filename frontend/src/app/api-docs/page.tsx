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
          Background removal runs entirely in the browser. No server required.
        </p>
      </div>

      <div className="mb-8 rounded-xl border bg-[rgb(var(--card))] p-6">
        <h2 className="mb-2 text-lg font-semibold">Installation</h2>
        <CodeBlock code={`npm install @imgly/background-removal`} language="bash" />
      </div>

      <div className="space-y-8">
        <div className="rounded-xl border bg-[rgb(var(--card))] p-6">
          <h3 className="mb-4 text-lg font-semibold">Remove Background</h3>
          <CodeBlock
            code={`import { removeBackground } from "@imgly/background-removal";

const image = document.getElementById("myImage");
const blob = await removeBackground(image);
const url = URL.createObjectURL(blob);`}
            language="typescript"
          />
        </div>

        <div className="rounded-xl border bg-[rgb(var(--card))] p-6">
          <h3 className="mb-4 text-lg font-semibold">With Options</h3>
          <CodeBlock
            code={`import removeBackground from "@imgly/background-removal";

const blob = await removeBackground(image, {
  model: "isnet_fp16",
  output: {
    format: { quality: 0.8, type: "png" },
  },
});`}
            language="typescript"
          />
        </div>

        <div className="rounded-xl border bg-[rgb(var(--card))] p-6">
          <h3 className="mb-4 text-lg font-semibold">Preloading</h3>
          <CodeBlock
            code={`import { preload } from "@imgly/background-removal";

// Preload the model at a convenient time
await preload();`}
            language="typescript"
          />
        </div>
      </div>
    </div>
  );
}
