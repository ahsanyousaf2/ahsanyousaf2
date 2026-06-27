"use client";

import { BackgroundRemover } from "@/components/features/BackgroundRemover";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Background Remover</h1>
        <p className="mt-2 text-[rgb(var(--muted-foreground))]">
          Upload an image and AI removes the background in seconds — entirely in your browser
        </p>
      </div>
      <BackgroundRemover />
    </div>
  );
}
