import { Zap, Shield, Globe } from "lucide-react";
import Link from "next/link";

const values = [
  {
    icon: Zap,
    title: "Privacy First",
    desc: "All processing happens in your browser. Your images never touch a server or leave your device.",
  },
  {
    icon: Shield,
    title: "Free for Everyone",
    desc: "No hidden costs, no API keys, no credit cards. Background removal should be accessible to all.",
  },
  {
    icon: Globe,
    title: "Built with Open Source",
    desc: "Powered by the U2Net model and Xenova Transformers, running on ONNX Runtime Web via WebAssembly.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold">About RemoveAnything AI</h1>
      <p className="mt-4 text-lg text-[rgb(var(--muted-foreground))]">
        We believe removing image backgrounds should be instant, private, and free for everyone.
      </p>

      <div className="mt-12 space-y-8 text-[rgb(var(--muted-foreground))]">
        <p>
          RemoveAnything AI is a client-side background removal tool that runs entirely in your browser.
          Unlike other services that upload your images to remote servers, our AI model (U2Net) runs locally
          using ONNX Runtime Web and WebAssembly. Your images never leave your computer.
        </p>
        <p>
          The project was built to demonstrate that modern deep learning models can run efficiently in the
          browser without sacrificing quality or speed. By leveraging the Xenova Transformers library and
          WebAssembly-optimized ONNX runtime, we deliver production-grade background removal with zero
          server costs.
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
