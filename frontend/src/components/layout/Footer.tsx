import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-[rgb(var(--background))]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold">Product</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/dashboard" className="text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">Dashboard</Link></li>
              <li><Link href="/api-docs" className="text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">API</Link></li>
              <li><Link href="/pricing" className="text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><span className="text-sm text-[rgb(var(--muted-foreground))]">About</span></li>
              <li><span className="text-sm text-[rgb(var(--muted-foreground))]">Blog</span></li>
              <li><span className="text-sm text-[rgb(var(--muted-foreground))]">Contact</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><span className="text-sm text-[rgb(var(--muted-foreground))]">Privacy</span></li>
              <li><span className="text-sm text-[rgb(var(--muted-foreground))]">Terms</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Powered by</h3>
            <ul className="mt-4 space-y-2">
              <li><span className="text-sm text-[rgb(var(--muted-foreground))]">BiRefNet + RMBG-2.0</span></li>
              <li><span className="text-sm text-[rgb(var(--muted-foreground))]">PyTorch + ONNX</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center">
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            &copy; {new Date().getFullYear()} RemoveAnything AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
