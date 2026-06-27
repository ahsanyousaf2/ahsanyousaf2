import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-[rgb(var(--muted-foreground))]">Last updated: June 27, 2026</p>

      <div className="mt-8 space-y-6 text-[rgb(var(--muted-foreground))]">
        <section>
          <h2 className="text-xl font-semibold text-[rgb(var(--foreground))]">Data Processing</h2>
          <p className="mt-2">
            When you upload an image, it is sent to our server for AI background removal processing.
            Once processing is complete, the result is returned to your browser.
            We do not permanently store your images on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[rgb(var(--foreground))]">Third-Party Services</h2>
          <p className="mt-2">
            This application is hosted on Vercel. Standard Vercel server logs may record
            anonymized request data (timestamps, paths, status codes) but not image contents.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[rgb(var(--foreground))]">Information We Collect</h2>
          <p className="mt-2">
            We do not collect personal information, store uploaded images, or track individual users.
            Standard web analytics (page views) may be collected if you have granted consent via your
            browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[rgb(var(--foreground))]">Cookies</h2>
          <p className="mt-2">
            We use only essential cookies for theme preference storage (dark/light mode). No tracking
            or third-party cookies are used. You can disable cookies in your browser settings, though
            this may affect theme persistence.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[rgb(var(--foreground))]">Data Retention</h2>
          <p className="mt-2">
            Uploaded images are temporarily held in memory during processing and are not written to
            disk. Processed results are sent back to your browser and are not retained on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[rgb(var(--foreground))]">Contact</h2>
          <p className="mt-2">
            If you have questions about this privacy policy, please contact us at hello@removeanything.ai.
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
