import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold">Terms of Service</h1>
      <p className="mt-2 text-[rgb(var(--muted-foreground))]">Last updated: June 26, 2026</p>

      <div className="mt-8 space-y-6 text-[rgb(var(--muted-foreground))]">
        <section>
          <h2 className="text-xl font-semibold text-[rgb(var(--foreground))]">Acceptance of Terms</h2>
          <p className="mt-2">
            By using RemoveAnything AI, you agree to these terms of service. If you do not agree,
            please do not use the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[rgb(var(--foreground))]">Use of Service</h2>
          <p className="mt-2">
            RemoveAnything AI is provided free of charge for personal and commercial use. You may use
            the background removal tool for any lawful purpose. The service processes images entirely
            client-side, and we do not store or access your uploaded content.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[rgb(var(--foreground))]">Intellectual Property</h2>
          <p className="mt-2">
            You retain all rights to your images and their processed outputs. The background removal
            technology (MediaPipe Selfie Segmenter) is open-source and used under
            their respective licenses.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[rgb(var(--foreground))]">Limitation of Liability</h2>
          <p className="mt-2">
            RemoveAnything AI is provided &quot;as is&quot; without warranty of any kind. We are not liable for
            any damages arising from the use or inability to use the service. The AI model may not
            produce perfect results for all images.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[rgb(var(--foreground))]">Changes to Terms</h2>
          <p className="mt-2">
            We reserve the right to update these terms at any time. Changes will be posted on this page
            with an updated date.
          </p>
        </section>
      </div>

      <div className="mt-12 text-center">
        <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:from-primary-500 hover:to-purple-500">
          Remove Background Now <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
