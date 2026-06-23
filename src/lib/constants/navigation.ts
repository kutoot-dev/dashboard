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
  faCircleInfo,
  faClipboardCheck,
  faComments,
  faGear,
  faHandshake,
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

export interface NavGroup {
  label: string;
  items: NavItem[];
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
    label: "Affiliate Program",
    href: "/affiliate-program",
    icon: faHandshake,
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

const PAYOUT_NAV_GROUP: NavGroup = {
  label: "Payouts",
  items: [
    {
      label: "Bonus Payout",
      href: "/payouts",
      icon: faMoneyBillTransfer,
    },
    {
      label: "How Payouts Work",
      href: "/payouts/guide",
      icon: faCircleInfo,
    },
  ],
};

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

function buildBranchNav(): NavItem[] {
  const base = MERCHANT_DEALS_ENABLED
    ? [
        ...CORE_BRANCH_NAV.slice(0, 4),
        DEALS_NAV_ITEM,
        ...CORE_BRANCH_NAV.slice(4),
      ]
    : [...CORE_BRANCH_NAV];

  const walletIndex = base.findIndex((item) => item.href === "/wallet");
  const insertAt = walletIndex >= 0 ? walletIndex + 1 : base.length;

  return [
    ...base.slice(0, insertAt),
    ...PAYOUT_NAV_GROUP.items,
    ...base.slice(insertAt),
  ];
}

/** Branch tab navigation items */
export const BRANCH_NAV: NavItem[] = buildBranchNav();

export function getBranchNavGroups(): NavGroup[] {
  const items = buildBranchNav();
  const payoutHrefs = new Set(PAYOUT_NAV_GROUP.items.map((item) => item.href));
  const beforePayout: NavItem[] = [];
  const afterPayout: NavItem[] = [];
  let reachedPayout = false;

  for (const item of items) {
    if (payoutHrefs.has(item.href)) {
      reachedPayout = true;
      continue;
    }

    if (!reachedPayout) {
      beforePayout.push(item);
    } else {
      afterPayout.push(item);
    }
  }

  const groups: NavGroup[] = [];

  if (beforePayout.length > 0) {
    groups.push({ label: "", items: beforePayout });
  }

  groups.push(PAYOUT_NAV_GROUP);

  if (afterPayout.length > 0) {
    groups.push({ label: "", items: afterPayout });
  }

  return groups;
}

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
  if (storeRole === "manager" || storeRole === "staff") {
    return STORE_TEAM_MEMBER_NAV;
  }
  return BRANCH_NAV;
}

/** Grouped merchant navigation for sidebar rendering. */
export function getMerchantNavGroups(
  role: UserRole = "merchant",
  storeRole?: StorePivotRole,
): NavGroup[] {
  if (role === "operations_hub") {
    return [
      { label: "", items: [OPS_HUB_PORTFOLIO_NAV] },
      ...getBranchNavGroups(),
    ];
  }
  if (storeRole === "manager" || storeRole === "staff") {
    return [{ label: "", items: STORE_TEAM_MEMBER_NAV }];
  }
  return getBranchNavGroups();
}

/** Branch tab navigation items for the current session. */
export function getBranchNav(): NavItem[] {
  return BRANCH_NAV;
}
