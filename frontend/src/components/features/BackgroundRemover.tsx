"use client";

import { useState, useCallback } from "react";
import { ImageUploader } from "./ImageUploader";
import { removeBackground } from "@/lib/api";
import { Loader2, Download } from "lucide-react";

export function BackgroundRemover() {
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [inputPreview, setInputPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  const handleImageSelect = useCallback((file: File) => {
    setInputFile(file);
    setInputPreview(URL.createObjectURL(file));
    setResultUrl(null);
    setProgress(null);
  }, []);

  const handleClear = useCallback(() => {
    setInputFile(null);
    setInputPreview(null);
    setResultUrl(null);
    setProgress(null);
  }, []);

  const handleRemoveBackground = async () => {
    if (!inputFile) return;
    setIsProcessing(true);
    setProgress(0);
    try {
      const blob = await removeBackground(inputFile, (loaded, total) => {
        setProgress(Math.round((loaded / total) * 100));
      });
      setResultUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "removed-bg.png";
    a.click();
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Original Image</h3>
          <div className="min-h-[400px]">
            <ImageUploader
              onImageSelect={handleImageSelect}
              currentImage={inputPreview}
              onClear={handleClear}
            />
          </div>
          <div className="rounded-lg border bg-[rgb(var(--muted))]/30 p-3 text-xs text-[rgb(var(--muted-foreground))] space-y-1.5">
            <p><span className="font-medium text-[rgb(var(--foreground))]">Supported formats:</span> JPG, PNG, WEBP</p>
            <p><span className="font-medium text-[rgb(var(--foreground))]">Max file size:</span> 20MB</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Result</h3>
          <div className="flex min-h-[400px] items-center justify-center rounded-xl border-2 border-dashed border-[rgb(var(--border))] bg-[rgb(var(--muted))]/50">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-3 px-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                <p className="text-sm text-[rgb(var(--muted-foreground))]">
                  {progress !== null && progress < 100 ? "Downloading AI model..." : "Processing..."}
                </p>
                {progress !== null && (
                  <div className="h-2 w-48 overflow-hidden rounded-full bg-[rgb(var(--muted))]">
                    <div
                      className="h-full rounded-full bg-primary-500 transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            ) : resultUrl ? (
              <img src={resultUrl} alt="Result" className="h-full w-full object-contain" />
            ) : (
              <p className="text-sm text-[rgb(var(--muted-foreground))]">Upload an image to get started</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3 rounded-xl border bg-[rgb(var(--card))] p-6">
        <button
          onClick={handleRemoveBackground}
          disabled={!inputFile || isProcessing}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-600 to-purple-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:from-primary-500 hover:to-purple-500 disabled:opacity-50"
        >
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isProcessing ? "Processing..." : "Remove Background"}
        </button>

        {resultUrl && (
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-lg border bg-[rgb(var(--card))] px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[rgb(var(--muted))]"
          >
            <Download className="h-4 w-4" />
            Download PNG
          </button>
        )}
      </div>
    </div>
  );
}
