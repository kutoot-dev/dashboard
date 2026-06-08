import type { AuthUser } from "@/lib/types";

/** Whether the Score Engine page is available for this session. */
export function canAccessScoringEngine(user: AuthUser | null | undefined): boolean {
  if (!user) {
    return false;
  }

  if (user.scoring_engine_enabled !== undefined) {
    return Boolean(user.scoring_engine_enabled);
  }

  return Boolean(user.is_test);
}
