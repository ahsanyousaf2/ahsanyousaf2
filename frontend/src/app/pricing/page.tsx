"use client";

import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for trying out the service",
    features: ["5 images/month", "PNG download", "Basic quality", "Max 5MB per image"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    description: "For creators and small teams",
    features: [
      "500 images/month",
      "PNG & WEBP download",
      "High resolution export",
      "Edge refinement",
      "Background replacement",
      "Batch processing (up to 10)",
      "API access",
    ],
    cta: "Subscribe",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    description: "For businesses and high volume",
    features: [
      "10,000 images/month",
      "All formats",
      "Original resolution",
      "Priority processing",
      "SLA guarantee",
      "Custom models",
      "Dedicated support",
      "On-premise deployment",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
        <p className="mt-4 text-lg text-[rgb(var(--muted-foreground))]">
          Choose the plan that fits your needs
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border bg-[rgb(var(--card))] p-8 ${
              plan.popular
                ? "border-primary-500 shadow-lg shadow-primary-500/10"
                : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary-600 to-purple-600 px-4 py-1 text-xs font-semibold text-white">
                Most Popular
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">{plan.description}</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-sm text-[rgb(var(--muted-foreground))]">/month</span>
            </div>
            <ul className="mb-8 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button
              className={`w-full rounded-xl py-3 text-sm font-semibold transition-all ${
                plan.popular
                  ? "bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg hover:from-primary-500 hover:to-purple-500"
                  : "border bg-[rgb(var(--background))] hover:bg-[rgb(var(--muted))]"
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
