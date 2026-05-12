import type { Metadata } from "next";
import Link from "next/link";
import { KutootLogo } from "@/components/branding";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Merchant Onboarding — Kutoot",
  description: "Join Kutoot and start accepting digital payments",
};

export default function OnboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 bg-background" />
      <div className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-35">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-secondary/26 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/24 blur-3xl" />
      </div>

      <header className="glass-topbar sticky top-0 z-30 border-b border-border/70">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <KutootLogo size="sm" className="max-h-7 w-auto max-w-[min(100%,11rem)]" />
          <span className="hidden text-xs font-semibold tracking-wide text-muted-foreground sm:block">
            Merchant Onboarding
          </span>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6">
        {children}
      </main>

      <footer className="relative z-10 mt-auto border-t border-border/70 py-5">
        <div className="mx-auto max-w-3xl px-4 text-center text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} Kutoot. All rights reserved. •{" "}
          <Link
            href="/privacy-policy"
            className="text-accent underline-offset-2 transition-colors hover:text-accent/90 hover:underline"
          >
            Privacy Policy
          </Link>{" "}
          •{" "}
          <Link
            href="/merchant-terms"
            className="text-accent underline-offset-2 transition-colors hover:text-accent/90 hover:underline"
          >
            Merchant Terms
          </Link>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}
