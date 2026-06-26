"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  currentImage?: string | null;
  onClear?: () => void;
}

export function ImageUploader({ onImageSelect, currentImage, onClear }: ImageUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onImageSelect(acceptedFiles[0]);
      }
    },
    [onImageSelect]
  );

  const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  if (currentImage) {
    return (
      <div className="relative">
        <img
          src={currentImage}
          alt="Uploaded"
          className="h-full w-full rounded-xl object-contain"
        />
        {onClear && (
          <button
            onClick={onClear}
            className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
          >
            <X size={16} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "dropzone-gradient group relative flex h-full min-h-[300px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all",
        isDragAccept && "border-primary-500 bg-primary-500/5",
        isDragReject && "border-red-500 bg-red-500/5",
        !isDragActive && "border-[rgb(var(--border))] hover:border-primary-400"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-primary-500/20 to-purple-600/20 p-4">
          <Upload className="h-8 w-8 text-primary-500" />
        </div>
        <div>
          <p className="text-lg font-semibold">
            Drop your image here
          </p>
          <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
            or click to browse &bull; JPG, PNG, WEBP up to 20MB
          </p>
        </div>
      </div>
    </div>
  );
}
