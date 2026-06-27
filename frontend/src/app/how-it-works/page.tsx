import { Upload, Cpu, Download } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    icon: Upload,
    title: "1. Upload Your Image",
    desc: "Select any image from your device (JPG, PNG, or WEBP, up to 20MB). Our system accepts standard image formats and prepares them for processing.",
  },
  {
    icon: Cpu,
    title: "2. AI Removes the Background",
    desc: "Our AI-powered service analyzes the image, identifies the foreground subject, and removes the background with pixel-level precision.",
  },
  {
    icon: Download,
    title: "3. Download the Result",
    desc: "Get a high-quality PNG with a transparent background, ready to use in your projects.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold">How It Works</h1>
        <p className="mt-4 text-lg text-[rgb(var(--muted-foreground))]">
          AI-powered background removal in three simple steps.
        </p>
      </div>

      <div className="space-y-12">
        {steps.map((step) => (
          <div key={step.title} className="flex flex-col items-center gap-4 text-center md:flex-row md:items-start md:text-left">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600">
              <step.icon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{step.title}</h2>
              <p className="mt-2 text-[rgb(var(--muted-foreground))]">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl border bg-[rgb(var(--card))] p-8">
        <h2 className="text-xl font-semibold">Guidelines</h2>
        <ul className="mt-4 space-y-3 text-sm text-[rgb(var(--muted-foreground))]">
          <li><strong className="text-[rgb(var(--foreground))]">Supported formats:</strong> JPG, PNG, WEBP</li>
          <li><strong className="text-[rgb(var(--foreground))]">Max file size:</strong> 20MB per image</li>
          <li><strong className="text-[rgb(var(--foreground))]">Output:</strong> Transparent PNG — ready to use</li>
          <li><strong className="text-[rgb(var(--foreground))]">Best results:</strong> Images with a clear foreground subject against a contrasting background</li>
        </ul>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:from-primary-500 hover:to-purple-500"
        >
          Try It Now
        </Link>
      </div>
    </div>
  );
}
