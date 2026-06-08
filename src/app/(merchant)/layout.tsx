"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { LegalReacceptGate } from "@/components/legal/legal-reaccept-gate";
import { MerchantPanelBasicDetailsGate } from "@/components/onboarding/merchant-panel-basic-details-gate";
import { useAuth } from "@/components/providers/auth-provider";
import { clearAuthSession } from "@/lib/api/services/auth.service";
import { isRouteAllowedForStoreRole } from "@/lib/utils/store-access";

interface MerchantLayoutProps {
  children: React.ReactNode;
}

export default function MerchantLayout({ children }: MerchantLayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      clearAuthSession();
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) {
      return;
    }

    if (!isRouteAllowedForStoreRole(pathname, user.store_role)) {
      router.replace("/transactions");
    }
  }, [isAuthenticated, isLoading, pathname, router, user]);

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
      <MerchantPanelBasicDetailsGate>
        <AppShell>{children}</AppShell>
      </MerchantPanelBasicDetailsGate>
    </LegalReacceptGate>
  );
}
