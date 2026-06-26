"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Image, Zap } from "lucide-react";
import { Features } from "@/components/features/Features";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 via-transparent to-transparent" />
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-[rgb(var(--muted))] px-4 py-1.5 text-sm">
              <Sparkles className="h-4 w-4 text-primary-500" />
              <span>Powered by AI — Runs 100% in Your Browser</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Remove Backgrounds with{" "}
              <span className="bg-gradient-to-r from-primary-500 to-purple-600 bg-clip-text text-transparent">
                AI Precision
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-[rgb(var(--muted-foreground))]">
               Professional-grade background removal that runs entirely in your browser.
              No uploads, no servers, 100% private. Your images never leave your device.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:from-primary-500 hover:to-purple-500"
              >
                Try It Free <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/api-docs"
                className="inline-flex items-center gap-2 rounded-xl border bg-[rgb(var(--card))] px-8 py-3.5 text-base font-semibold transition-colors hover:bg-[rgb(var(--muted))]"
              >
                API Docs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 rounded-2xl border bg-[rgb(var(--card))] p-8 md:grid-cols-4">
          {[
            { value: "99.9%", label: "Accuracy" },
            { value: "<500ms", label: "Avg Speed" },
            { value: "5", label: "AI Models" },
            { value: "20MB", label: "Max File Size" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-primary-500">{stat.value}</div>
              <div className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">Enterprise-Grade Features</h2>
          <p className="mt-4 text-[rgb(var(--muted-foreground))]">
            Everything you need for professional background removal
          </p>
        </div>
        <Features />
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-purple-700 px-8 py-16 text-center text-white">
          <div className="absolute inset-0 bg-grid-white/10 opacity-20" />
          <div className="relative">
            <h2 className="text-3xl font-bold">Ready to remove backgrounds?</h2>
            <p className="mt-4 text-lg opacity-90">
              Start for free. No credit card required.
            </p>
            <Link
              href="/dashboard"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-primary-700 transition-all hover:bg-white/90"
            >
              Go to Dashboard <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
