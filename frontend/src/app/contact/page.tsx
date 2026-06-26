"use client";

import { useState } from "react";
import { Mail, MessageSquare, Send, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold">Contact Us</h1>
      <p className="mt-4 text-lg text-[rgb(var(--muted-foreground))]">
        Have questions or feedback? We would love to hear from you.
      </p>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-500/10">
              <Mail className="h-5 w-5 text-primary-500" />
            </div>
            <div>
              <h3 className="font-semibold">Email</h3>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">hello@removeanything.ai</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-500/10">
              <MessageSquare className="h-5 w-5 text-primary-500" />
            </div>
            <div>
              <h3 className="font-semibold">GitHub</h3>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">Open an issue on our GitHub repository</p>
            </div>
          </div>
        </div>

        <div>
          {submitted ? (
            <div className="rounded-xl border border-green-500/50 bg-green-500/10 p-6 text-center">
              <p className="font-semibold text-green-600 dark:text-green-400">Message sent!</p>
              <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">We will get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input type="text" required className="mt-1 w-full rounded-lg border bg-[rgb(var(--background))] px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input type="email" required className="mt-1 w-full rounded-lg border bg-[rgb(var(--background))] px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium">Message</label>
                <textarea required rows={4} className="mt-1 w-full rounded-lg border bg-[rgb(var(--background))] px-3 py-2 text-sm" />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-600 to-purple-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:from-primary-500 hover:to-purple-500">
                <Send className="h-4 w-4" />
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:from-primary-500 hover:to-purple-500">
          Try It Free <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
