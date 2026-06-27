import { Zap, Shield, Image, Layers, Download } from "lucide-react";

const features = [
  {
    icon: Image,
    title: "Upload",
    description: "Select any JPG, PNG, or WEBP image from your device.",
  },
  {
    icon: Zap,
    title: "AI Processing",
    description: "Our AI automatically detects the subject and removes the background.",
  },
  {
    icon: Download,
    title: "Download",
    description: "Get a transparent PNG — ready for your projects.",
  },
  {
    icon: Layers,
    title: "Any Subject",
    description: "Works with people, products, animals, cars, and more.",
  },
  {
    icon: Shield,
    title: "No Signup",
    description: "No accounts, no credit cards, no limits. Just upload and download.",
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
