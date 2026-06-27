import Link from "next/link";

const APP_VERSION = "8";

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
              <li><Link href="/how-it-works" className="text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">How It Works</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/about" className="text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">About</Link></li>
              <li><Link href="/blog" className="text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">Blog</Link></li>
              <li><Link href="/contact" className="text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/privacy" className="text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">Privacy</Link></li>
              <li><Link href="/terms" className="text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">Terms</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Tech</h3>
            <ul className="mt-4 space-y-2">
              <li><span className="text-sm text-[rgb(var(--muted-foreground))]">Powered by remove.bg API</span></li>
              <li><span className="text-sm text-[rgb(var(--muted-foreground))]">AI Background Removal</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center">
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            &copy; {new Date().getFullYear()} RemoveAnything AI. All rights reserved.
          </p>
          <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))] opacity-60">
            v{APP_VERSION}
          </p>
        </div>
      </div>
    </footer>
  );
}
