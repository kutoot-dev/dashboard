"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useEffectiveBranchId } from "@/lib/hooks/use-effective-branch-id";
import {
  useAuthToken,
  useTransactionStream,
} from "@/lib/hooks/use-transaction-stream";

/**
 * Subscribes to Reverb for the active merchant location on every authenticated page.
 */
export function TransactionStreamWatcher() {
  const { isAuthenticated } = useAuth();
  const branchId = useEffectiveBranchId();
  const authToken = useAuthToken(isAuthenticated);

  const { connected, configured } = useTransactionStream(
    isAuthenticated ? branchId : "",
    isAuthenticated ? authToken : null,
  );

  if (process.env.NODE_ENV === "development" && isAuthenticated && branchId && !configured) {
    console.warn(
      "[Reverb] NEXT_PUBLIC_REVERB_APP_KEY is missing — transaction popover disabled. Copy REVERB_APP_KEY from kutoot/.env into merchant-panel/.env.local",
    );
  }

  if (process.env.NODE_ENV === "development" && isAuthenticated && branchId && configured && !connected) {
    // Logged once subscription succeeds or on error in the hook.
  }

  return null;
}
