import { Zap, Shield, Globe } from "lucide-react";
import Link from "next/link";

const values = [
  {
    icon: Zap,
    title: "Fast & Simple",
    desc: "Upload an image, get a transparent PNG in seconds. No complex tools or learning curve.",
  },
  {
    icon: Shield,
    title: "Free for Everyone",
    desc: "No hidden costs, no credit cards, no signup. Background removal should be accessible to all.",
  },
  {
    icon: Globe,
    title: "Powered by AI",
    desc: "Advanced AI technology delivers high-quality, production-grade background removal on any subject.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold">About RemoveAnything AI</h1>
      <p className="mt-4 text-lg text-[rgb(var(--muted-foreground))]">
        We believe removing image backgrounds should be instant, free, and available to everyone.
      </p>

      <div className="mt-12 space-y-8 text-[rgb(var(--muted-foreground))]">
        <p>
          RemoveAnything AI makes background removal effortless. Upload any image — a product photo,
          a portrait, a pet picture — and get a clean transparent-background PNG in seconds.
        </p>
        <p>
          Our AI technology delivers professional-grade results without
          requiring expensive software or technical skills. No signup, no credit card, no limits.
          Just upload and download.
        </p>
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-3">
        {values.map((v) => (
          <div key={v.title} className="rounded-xl border bg-[rgb(var(--card))] p-6 text-center">
            <v.icon className="mx-auto mb-3 h-8 w-8 text-primary-500" />
            <h3 className="font-semibold">{v.title}</h3>
            <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-3 text-base font-semibold text-white shadow-lg transition-all hover:from-primary-500 hover:to-purple-500"
        >
          Try It Free
        </Link>
      </div>
    </div>
  );
}
