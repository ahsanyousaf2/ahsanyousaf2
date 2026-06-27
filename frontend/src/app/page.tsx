"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Image, Zap, Shield, Download, CheckCircle } from "lucide-react";

const stats = [
  { value: "99.8%", label: "Accuracy Rate" },
  { value: "<2s", label: "Processing Speed" },
  { value: "100%", label: "Free to Use" },
  { value: "20MB", label: "Max File Size" },
];

const features = [
  {
    icon: Image,
    title: "AI-Powered Segmentation",
    desc: "Advanced AI detects and separates subjects from backgrounds with pixel-perfect precision.",
  },
  {
    icon: Zap,
    title: "Fast Processing",
    desc: "Results in seconds. Upload your image and get a transparent PNG instantly.",
  },
  {
    icon: Shield,
    title: "No Signup Required",
    desc: "No accounts, no credit cards, no limits. Just upload and download.",
  },
  {
    icon: Download,
    title: "Full Quality Output",
    desc: "Export transparent PNGs at original resolution with crisp, clean edges.",
  },
  {
    icon: CheckCircle,
    title: "Works on Any Subject",
    desc: "People, products, animals, cars — handles all types of foreground subjects.",
  },
  {
    icon: Sparkles,
    title: "Background Replacement",
    desc: "Swap backgrounds with solid colors, blur effects, or keep it transparent.",
  },
];

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 via-transparent to-transparent" />
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-[rgb(var(--muted))] px-4 py-1.5 text-sm">
              <Sparkles className="h-4 w-4 text-primary-500" />
              <span>Free AI Background Removal — No Signup Needed</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Remove Image Backgrounds{" "}
              <span className="bg-gradient-to-r from-primary-500 to-purple-600 bg-clip-text text-transparent">
                Instantly & Free
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-[rgb(var(--muted-foreground))]">
              Professional-grade AI background removal. Fast, free, and no signup required.
              Just upload your image and download the result.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:from-primary-500 hover:to-purple-500"
              >
                Remove Background Now <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border bg-[rgb(var(--card))] px-8 py-3.5 text-base font-semibold transition-colors hover:bg-[rgb(var(--muted))]"
              >
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 rounded-2xl border bg-[rgb(var(--card))] p-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-primary-500">{stat.value}</div>
              <div className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="mt-4 text-[rgb(var(--muted-foreground))]">
            Three simple steps to remove backgrounds from any image
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { step: "1", title: "Upload Image", desc: "Select any image from your device. Supports JPG, PNG, and WEBP formats up to 20MB." },
            { step: "2", title: "AI Processing", desc: "Our AI analyzes the image and separates the subject from the background with precision." },
            { step: "3", title: "Download Result", desc: "Get your image with a transparent background as a high-quality PNG file." },
          ].map((item) => (
            <div key={item.step} className="rounded-xl border bg-[rgb(var(--card))] p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-500/10 text-lg font-bold text-primary-500">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">Features</h2>
          <p className="mt-4 text-[rgb(var(--muted-foreground))]">
            Everything you need for professional background removal
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border bg-[rgb(var(--card))] p-6">
              <f.icon className="mb-3 h-6 w-6 text-primary-500" />
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-purple-700 px-8 py-16 text-center text-white">
          <div className="absolute inset-0 bg-grid-white/10 opacity-20" />
          <div className="relative">
            <h2 className="text-3xl font-bold">Ready to remove backgrounds?</h2>
            <p className="mt-4 text-lg opacity-90">
              No signup, no credit card, no limits. Start removing backgrounds right now.
            </p>
            <Link
              href="/dashboard"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-primary-700 transition-all hover:bg-white/90"
            >
              Try It Free <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
