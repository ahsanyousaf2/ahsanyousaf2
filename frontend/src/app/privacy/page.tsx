export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-[rgb(var(--muted-foreground))]">Last updated: June 26, 2026</p>

      <div className="mt-8 space-y-6 text-[rgb(var(--muted-foreground))]">
        <section>
          <h2 className="text-xl font-semibold text-[rgb(var(--foreground))]">Data Processing</h2>
          <p className="mt-2">
            RemoveAnything AI processes all images entirely in your browser using client-side JavaScript.
            We do not upload, store, transmit, or process your images on any server. The AI model (U2Net)
            runs locally on your device via ONNX Runtime Web and WebAssembly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[rgb(var(--foreground))]">Information We Collect</h2>
          <p className="mt-2">
            We do not collect any personal information. Since all image processing occurs client-side,
            we never have access to your images or any data contained within them. Standard web analytics
            (page views) may be collected if you have granted consent.
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
          <h2 className="text-xl font-semibold text-[rgb(var(--foreground))]">Third-Party Services</h2>
          <p className="mt-2">
            This application is hosted on Vercel. The AI model is loaded from the Hugging Face CDN
            on first use and cached in your browser IndexedDB. No personal data is transmitted to
            either service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[rgb(var(--foreground))]">Contact</h2>
          <p className="mt-2">
            If you have questions about this privacy policy, please contact us at hello@removeanything.ai.
          </p>
        </section>
      </div>
    </div>
  );
}
