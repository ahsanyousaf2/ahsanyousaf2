"use client";

import { useState, useCallback, useEffect } from "react";
import { ImageUploader } from "./ImageUploader";
import { ProcessingResult } from "@/types";
import { removeBackground, replaceBackground, preloadModel, onModelProgress } from "@/lib/api";
import { Loader2, Download, Check, Palette, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackgroundRemover() {
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [inputPreview, setInputPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [modelProgress, setModelProgress] = useState(0);
  const [preserveShadows, setPreserveShadows] = useState(false);
  const [edgeRefinement, setEdgeRefinement] = useState(true);
  const [highResolution, setHighResolution] = useState(true);
  const [showCompare, setShowCompare] = useState(false);
  const [backgroundType, setBackgroundType] = useState<string>("none");
  const [bgColor, setBgColor] = useState("#000000");

  useEffect(() => {
    onModelProgress((pct) => setModelProgress(pct));
    preloadModel().finally(() => setModelLoading(false));
  }, []);

  const handleImageSelect = useCallback((file: File) => {
    setInputFile(file);
    setInputPreview(URL.createObjectURL(file));
    setResult(null);
  }, []);

  const handleClear = useCallback(() => {
    setInputFile(null);
    setInputPreview(null);
    setResult(null);
  }, []);

  const handleRemoveBackground = async () => {
    if (!inputFile) return;
    setIsProcessing(true);
    try {
      const blob = await removeBackground(inputFile, {
        preserveShadows,
        edgeRefinement,
        highResolution,
      });
      setResult({ blob, url: URL.createObjectURL(blob) });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReplaceBackground = async () => {
    if (!inputFile) return;
    setIsProcessing(true);
    try {
      const hex = bgColor.replace("#", "");
      const blob = await replaceBackground(inputFile, {
        backgroundType,
        color: backgroundType === "color" ? {
          r: parseInt(hex.slice(0, 2), 16),
          g: parseInt(hex.slice(2, 4), 16),
          b: parseInt(hex.slice(4, 6), 16),
        } : undefined,
        blurStrength: 30,
        preserveShadows,
      });
      setResult({ blob, url: URL.createObjectURL(blob) });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (format: string) => {
    if (!result) return;
    const ext = format === "png" ? "png" : "webp";
    const a = document.createElement("a");
    a.href = result.url;
    a.download = `removed-bg.${ext}`;
    a.click();
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Original Image</h3>
          <div className="min-h-[400px]">
            <ImageUploader
              onImageSelect={handleImageSelect}
              currentImage={inputPreview}
              onClear={handleClear}
            />
          </div>
        </div>

        {/* Result */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Result</h3>
          <div className="flex min-h-[400px] items-center justify-center rounded-xl border-2 border-dashed border-[rgb(var(--border))] bg-[rgb(var(--muted))]/50">
            {modelLoading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Downloading AI model... {modelProgress}%</p>
                <div className="h-2 w-48 overflow-hidden rounded-full bg-[rgb(var(--muted))]">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-purple-600 transition-all duration-300" style={{ width: `${modelProgress}%` }} />
                </div>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">U2Net model (~20MB) - cached after first load</p>
              </div>
            ) : isProcessing ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Processing...</p>
              </div>
            ) : result ? (
              <div className="relative h-full w-full">
                {showCompare && inputPreview ? (
                  <div className="relative h-full w-full">
                    <img src={inputPreview} alt="Original" className="h-full w-full object-contain" />
                    <div className="absolute inset-0" style={{ clipPath: `inset(0 50% 0 0)` }}>
                      <img src={result.url} alt="Result" className="h-full w-full object-contain" />
                    </div>
                    <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white shadow-lg" />
                  </div>
                ) : (
                  <img
                    src={result.url}
                    alt="Result"
                    className="h-full w-full object-contain"
                    style={backgroundType === "none" ? undefined : {}}
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-[rgb(var(--muted-foreground))]">
                <Palette className="h-8 w-8" />
                <p className="text-sm">Upload an image to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 rounded-xl border bg-[rgb(var(--card))] p-6">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preserveShadows}
              onChange={(e) => setPreserveShadows(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Preserve Shadows</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={edgeRefinement}
              onChange={(e) => setEdgeRefinement(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Edge Refinement</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={highResolution}
              onChange={(e) => setHighResolution(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">High Resolution</span>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={handleRemoveBackground}
            disabled={!inputFile || isProcessing || modelLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-600 to-purple-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:from-primary-500 hover:to-purple-500 disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Remove Background
          </button>

          {result && (
            <>
              <button
                onClick={() => handleDownload("png")}
                className="inline-flex items-center gap-2 rounded-lg border bg-[rgb(var(--card))] px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[rgb(var(--muted))]"
              >
                <Download className="h-4 w-4" />
                PNG
              </button>
              <button
                onClick={() => handleDownload("webp")}
                className="inline-flex items-center gap-2 rounded-lg border bg-[rgb(var(--card))] px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[rgb(var(--muted))]"
              >
                <Download className="h-4 w-4" />
                WEBP
              </button>
              <button
                onClick={() => setShowCompare(!showCompare)}
                className="inline-flex items-center gap-2 rounded-lg border bg-[rgb(var(--card))] px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[rgb(var(--muted))]"
              >
                <Eye className="h-4 w-4" />
                {showCompare ? "Hide" : "Compare"}
              </button>
            </>
          )}
        </div>

        {/* Background Replacement */}
        <div className="mt-6 border-t pt-6">
          <h4 className="mb-3 text-sm font-semibold">Background Replacement</h4>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={backgroundType}
              onChange={(e) => setBackgroundType(e.target.value)}
              className="rounded-lg border bg-[rgb(var(--background))] px-3 py-2 text-sm"
            >
              <option value="none">Transparent</option>
              <option value="color">Solid Color</option>
              <option value="blur">Blur</option>
            </select>
            {backgroundType === "color" && (
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-9 w-9 cursor-pointer rounded-lg border"
              />
            )}
            <button
              onClick={handleReplaceBackground}
            disabled={!inputFile || isProcessing || modelLoading}
              className="inline-flex items-center gap-2 rounded-lg border bg-[rgb(var(--card))] px-4 py-2 text-sm font-medium transition-colors hover:bg-[rgb(var(--muted))] disabled:opacity-50"
            >
              Apply Background
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
