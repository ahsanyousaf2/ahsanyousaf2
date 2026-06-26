import { Zap, Shield, Image, Layers, Download, Palette } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "AI-Powered",
    description: "Powered by U2Net deep learning model with contrast-enhanced edge refinement for professional results.",
  },
  {
    icon: Shield,
    title: "High Quality",
    description: "Preserve hair strands and fine details with smart mask sharpening and feathering.",
  },
  {
    icon: Image,
    title: "Instant Preview",
    description: "See the result immediately with side-by-side comparison to your original image.",
  },
  {
    icon: Layers,
    title: "Edge Refinement",
    description: "Automatic anti-halo correction and detail enhancement for clean, natural edges.",
  },
  {
    icon: Palette,
    title: "Background Replace",
    description: "Replace with solid colors, blur effects, or keep it transparent.",
  },
  {
    icon: Download,
    title: "Multiple Formats",
    description: "Download as transparent PNG or WEBP at original resolution.",
  },
];

export function Features() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="group rounded-xl border bg-[rgb(var(--card))] p-6 transition-all hover:border-primary-500/50 hover:shadow-lg"
        >
          <div className="mb-4 inline-flex rounded-lg bg-gradient-to-br from-primary-500/10 to-purple-600/10 p-3">
            <feature.icon className="h-6 w-6 text-primary-500" />
          </div>
          <h3 className="mb-2 font-semibold">{feature.title}</h3>
          <p className="text-sm leading-relaxed text-[rgb(var(--muted-foreground))]">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
}
