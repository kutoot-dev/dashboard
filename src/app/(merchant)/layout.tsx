"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { LegalReacceptGate } from "@/components/legal/legal-reaccept-gate";
import { useAuth } from "@/components/providers/auth-provider";
import { clearAuthSession } from "@/lib/api/services/auth.service";

interface MerchantLayoutProps {
  children: React.ReactNode;
}

export default function MerchantLayout({ children }: MerchantLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      clearAuthSession();
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="glass-card w-full max-w-sm p-6 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {isLoading ? "Loading merchant workspace" : "Redirecting to login"}
          </p>
          <p className="mt-2 text-sm text-foreground">Please wait...</p>
        </div>
      </main>
    );
  }

  return (
    <LegalReacceptGate>
      <AppShell>{children}</AppShell>
    </LegalReacceptGate>
  );
}
