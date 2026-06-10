import type { AuthUser, StorePivotRole } from "@/lib/types/auth";

/** Store team members (manager/staff) — limited to transactions and GST reports. */
export function isStoreTeamMember(user: AuthUser | null | undefined): boolean {
  return (
    user?.role === "merchant" &&
    (user?.store_role === "manager" || user?.store_role === "staff")
  );
}

export function isStoreOwner(user: AuthUser | null | undefined): boolean {
  if (!user || user.role !== "merchant") return false;
  return !user.store_role || user.store_role === "owner";
}

/** Routes a store team member may open in the merchant panel. */
export const STORE_TEAM_MEMBER_ROUTES = ["/transactions", "/reports"] as const;

export function isRouteAllowedForStoreRole(
  pathname: string,
  storeRole?: StorePivotRole,
): boolean {
  if (storeRole !== "manager" && storeRole !== "staff") {
    return true;
  }

  return STORE_TEAM_MEMBER_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function defaultHomeForUser(user: AuthUser | null | undefined): string {
  if (isStoreTeamMember(user)) {
    return "/transactions";
  }
  return "/dashboard";
}
