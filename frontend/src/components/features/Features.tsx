import { Zap, Shield, Image, Layers, Download, Palette } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "AI-Powered",
    description: "Powered by BiRefNet + RMBG-2.0 with multi-stage edge refinement for professional results.",
  },
  {
    icon: Shield,
    title: "High Quality",
    description: "Preserve hair strands, fur details, and transparent objects with alpha matting.",
  },
  {
    icon: Image,
    title: "Batch Processing",
    description: "Process multiple images simultaneously with our batch API endpoint.",
  },
  {
    icon: Layers,
    title: "Edge Refinement",
    description: "Multi-stage pipeline with anti-halo correction and hair detail enhancement.",
  },
  {
    icon: Palette,
    title: "Background Replace",
    description: "Replace with solid colors, gradients, images, or blur effects.",
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
