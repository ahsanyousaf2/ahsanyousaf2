"use client";

import { removeBackground } from "@/lib/api";
import { useState, useRef } from "react";
import { Loader2, Download, Copy } from "lucide-react";

export default function ApiDocsPage() {
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleRemove = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const blob = await removeBackground(file);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold">API</h1>
        <p className="mt-4 text-lg text-[rgb(var(--muted-foreground))]">
          Background removal runs entirely in your browser. Import the function and use it directly.
        </p>
      </div>

      <div className="rounded-xl border bg-[rgb(var(--card))] p-6">
        <h3 className="mb-4 text-lg font-semibold">Usage</h3>
        <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-300">
          <code>{`import { removeBackground } from "@/lib/api";

const file = event.target.files[0];
const blob = await removeBackground(file);
const url = URL.createObjectURL(blob);`}</code>
        </pre>
      </div>

      <div className="mt-8 rounded-xl border bg-[rgb(var(--card))] p-6">
        <h3 className="mb-4 text-lg font-semibold">Try It</h3>
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="text-sm"
          />
          <button
            onClick={handleRemove}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:from-primary-500 hover:to-purple-500 disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Remove Background
          </button>
        </div>
        {resultUrl && (
          <div className="mt-4">
            <img src={resultUrl} alt="Result" className="max-h-64 rounded-lg object-contain" />
            <a
              href={resultUrl}
              download="removed-bg.png"
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-primary-400"
            >
              <Download className="h-4 w-4" />
              Download PNG
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
