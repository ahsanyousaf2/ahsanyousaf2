import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";

const posts = [
  {
    title: "How Client-Side AI Background Removal Works",
    excerpt: "A technical deep-dive into running U2Net image segmentation in the browser using ONNX Runtime Web and WebAssembly.",
    date: "June 25, 2026",
    slug: "client-side-ai-background-removal",
  },
  {
    title: "U2Net vs Traditional Background Removal: A Comparison",
    excerpt: "Why deep learning models like U2Net outperform chroma key and color-based background removal methods.",
    date: "June 20, 2026",
    slug: "u2net-vs-traditional",
  },
];

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold">Blog</h1>
      <p className="mt-4 text-lg text-[rgb(var(--muted-foreground))]">
        Articles about AI background removal, browser-based ML, and more.
      </p>

      <div className="mt-12 space-y-6">
        {posts.map((post) => (
          <article key={post.slug} className="rounded-xl border bg-[rgb(var(--card))] p-6 transition-all hover:border-primary-500/50">
            <div className="flex items-center gap-2 text-sm text-[rgb(var(--muted-foreground))]">
              <Calendar className="h-4 w-4" />
              {post.date}
            </div>
            <h2 className="mt-2 text-xl font-semibold">{post.title}</h2>
            <p className="mt-2 text-[rgb(var(--muted-foreground))]">{post.excerpt}</p>
            <div className="mt-4">
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-500">
                Read More <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:from-primary-500 hover:to-purple-500">
          Remove Background Now <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
