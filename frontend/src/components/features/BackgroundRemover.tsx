"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ImageUploader } from "./ImageUploader";
import { removeBackground, preloadModel, isModelReady, getModelError } from "@/lib/api";
import { Loader2, Download } from "lucide-react";

export function BackgroundRemover() {
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [inputPreview, setInputPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [initState, setInitState] = useState<"loading" | "ready" | "error">("loading");
  const [initProgress, setInitProgress] = useState<string>("Initializing...");
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const hasInit = useRef(false);

  useEffect(() => {
    if (hasInit.current) return;
    hasInit.current = true;

    if (isModelReady()) {
      setInitState("ready");
      return;
    }

    const err = getModelError();
    if (err) {
      setInitState("error");
      setInitProgress(err);
      return;
    }

    preloadModel((_loaded, _total, stage) => {
      setInitProgress(stage);
    })
      .then(() => setInitState("ready"))
      .catch((e) => {
        setInitState("error");
        setInitProgress(e.message || "Failed to load AI model");
      });
  }, []);

  const handleImageSelect = useCallback((file: File) => {
    setInputFile(file);
    setInputPreview(URL.createObjectURL(file));
    setResultUrl(null);
  }, []);

  const handleClear = useCallback(() => {
    setInputFile(null);
    setInputPreview(null);
    setResultUrl(null);
  }, []);

  const handleRemoveBackground = async () => {
    if (!inputFile) return;
    setIsProcessing(true);
    setProcessingStatus("Removing background...");
    try {
      const blob = await removeBackground(inputFile, (_loaded, _total, stage) => {
        setProcessingStatus(stage || "Removing background...");
      });
      setResultUrl(URL.createObjectURL(blob));
      setProcessingStatus("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "removed-bg.png";
    a.click();
  };

  const isBusy = initState === "loading" || isProcessing;

  return (
    <div className="mx-auto max-w-6xl">
      {initState === "loading" && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-primary-500/20 bg-primary-500/5 px-4 py-3 text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
          <span>{initProgress}</span>
        </div>
      )}

      {initState === "error" && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600">
          {initProgress}. Please refresh or try a different browser (Chrome/Edge recommended).
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Original Image</h3>
          <div className="min-h-[400px]">
            <ImageUploader
              onImageSelect={handleImageSelect}
              currentImage={inputPreview}
              onClear={handleClear}
              disabled={initState !== "ready"}
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
                <p className="text-sm text-[rgb(var(--muted-foreground))]">{processingStatus}</p>
              </div>
            ) : resultUrl ? (
              <img src={resultUrl} alt="Result" className="h-full w-full object-contain" />
            ) : (
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                {initState !== "ready" ? "Preparing AI model..." : "Upload an image to get started"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3 rounded-xl border bg-[rgb(var(--card))] p-6">
        <button
          onClick={handleRemoveBackground}
          disabled={!inputFile || isBusy}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-600 to-purple-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:from-primary-500 hover:to-purple-500 disabled:opacity-50"
        >
          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isProcessing ? "Processing..." : initState !== "ready" ? "Loading..." : "Remove Background"}
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
