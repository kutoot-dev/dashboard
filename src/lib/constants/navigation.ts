/**
 * Constants: Navigation menu definitions
 *
 * Tab-based navigation for the merchant role.
 * Icons use Font Awesome (see @/lib/icons).
 */

import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { StorePivotRole, UserRole } from "@/lib/types/auth";
import { MERCHANT_DEALS_ENABLED } from "@/lib/constants/features";
import {
  faBookOpen,
  faBriefcase,
  faChartBar,
  faClipboardCheck,
  faComments,
  faGear,
  faHouse,
  faMoneyBillTransfer,
  faTag,
  faTags,
  faUsers,
  faWallet,
} from "@/lib/icons";

export interface NavItem {
  label: string;
  href: string;
  icon: IconDefinition;
}

const CORE_BRANCH_NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: faHouse,
  },
  {
    label: "Leaderboard",
    href: "/leaderboard",
    icon: faChartBar,
  },
  {
    label: "Discover",
    href: "/discover",
    icon: faComments,
  },
  {
    label: "Academy",
    href: "/academy",
    icon: faBookOpen,
  },
  {
    label: "Transactions",
    href: "/transactions",
    icon: faClipboardCheck,
  },
  {
    label: "Visitors",
    href: "/visitors",
    icon: faUsers,
  },
  {
    label: "Wallet",
    href: "/wallet",
    icon: faWallet,
  },
  {
    label: "Bonus Payout",
    href: "/payouts",
    icon: faMoneyBillTransfer,
  },
  {
    label: "Team",
    href: "/team",
    icon: faUsers,
  },
  {
    label: "Discount program",
    href: "/discount-program",
    icon: faTags,
  },
  {
    label: "Settings",
    href: "/store",
    icon: faGear,
  },
];

const DEALS_NAV_ITEM: NavItem = {
  label: "Deals",
  href: "/deals",
  icon: faTag,
};

/** Store team members (managers) — transactions and GST reports only. */
export const STORE_TEAM_MEMBER_NAV: NavItem[] = [
  {
    label: "Transactions",
    href: "/transactions",
    icon: faClipboardCheck,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: faChartBar,
  },
];

/** Branch tab navigation items */
export const BRANCH_NAV: NavItem[] = MERCHANT_DEALS_ENABLED
  ? [
      ...CORE_BRANCH_NAV.slice(0, 4),
      DEALS_NAV_ITEM,
      ...CORE_BRANCH_NAV.slice(4),
    ]
  : CORE_BRANCH_NAV;

export const OPS_HUB_PORTFOLIO_NAV: NavItem = {
  label: "Portfolio",
  href: "/portfolio",
  icon: faBriefcase,
};

/** Merchant nav; adds portfolio for operations hub. */
export function getMerchantNav(
  role: UserRole = "merchant",
  storeRole?: StorePivotRole,
): NavItem[] {
  if (role === "operations_hub") {
    return [OPS_HUB_PORTFOLIO_NAV, ...BRANCH_NAV];
  }
  if (storeRole === "manager") {
    return STORE_TEAM_MEMBER_NAV;
  }
  return BRANCH_NAV;
}

/** Branch tab navigation items for the current session. */
export function getBranchNav(): NavItem[] {
  return BRANCH_NAV;
}
