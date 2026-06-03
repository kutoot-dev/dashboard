"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

const ALLOWED_WITHOUT_BASIC_DETAILS = ["/complete-basic-details"];

/**
 * Redirect merchants who must complete panel basic details before using the workspace.
 */
export function MerchantPanelBasicDetailsGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const mustComplete =
    user?.role === "merchant" && Boolean(user.requires_basic_details);

  useEffect(() => {
    if (isLoading || !mustComplete) {
      return;
    }

    const allowed = ALLOWED_WITHOUT_BASIC_DETAILS.some((route) =>
      pathname.startsWith(route),
    );

    if (!allowed) {
      router.replace("/complete-basic-details");
    }
  }, [isLoading, mustComplete, pathname, router]);

  if (isLoading) {
    return null;
  }

  if (mustComplete && !ALLOWED_WITHOUT_BASIC_DETAILS.some((r) => pathname.startsWith(r))) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="glass-card w-full max-w-sm p-6 text-center">
          <p className="text-sm text-muted-foreground">Redirecting to complete your profile…</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
