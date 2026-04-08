import type { Metadata } from "next";

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
    <div className="min-h-screen bg-background">
      {/* Minimal public header — no sidebar/AppShell */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface px-4 py-3">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm">
              K
            </div>
            <span className="text-lg font-bold text-foreground">Kutoot</span>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:block">
            Merchant Onboarding
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>

      <footer className="border-t border-border py-4 mt-8">
        <div className="mx-auto max-w-2xl px-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Kutoot. All rights reserved. •{" "}
          <span className="text-accent cursor-pointer">Privacy Policy</span> •{" "}
          <span className="text-accent cursor-pointer">Terms of Service</span>
        </div>
      </footer>
    </div>
  );
}
