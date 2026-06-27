import { Zap, Shield, Image, Layers, Download, Palette } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "AI-Powered",
    description: "Advanced AI detects and separates subjects from backgrounds with pixel-perfect precision.",
  },
  {
    icon: Shield,
    title: "High Quality",
    description: "Clean, natural edges with support for fine details like hair and fur.",
  },
  {
    icon: Image,
    title: "Instant Preview",
    description: "See the result immediately with side-by-side comparison to your original image.",
  },
  {
    icon: Layers,
    title: "Any Subject",
    description: "Works with people, products, animals, cars, and more.",
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
