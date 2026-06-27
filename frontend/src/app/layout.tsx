import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RemoveAnything AI - Free AI Background Removal",
  description: "Remove backgrounds from images in your browser. 100% private — your images never leave your device. Fast, free, and no signup.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              var theme = localStorage.getItem('theme');
              var dark = theme ? theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (dark) document.documentElement.classList.add('dark');
            } catch(e) {}
          `,
        }} />
        <script type="importmap" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          imports: {
            "onnxruntime-web": "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/ort.bundle.min.mjs",
            "onnxruntime-web/webgpu": "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/ort.webgpu.bundle.min.mjs",
            "onnxruntime-web/wasm": "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/ort.wasm.bundle.min.mjs",
          },
        })}} />
      </head>
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
