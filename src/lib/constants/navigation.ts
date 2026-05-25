/**
 * Constants: Navigation menu definitions
 *
 * Tab-based navigation for the merchant role.
 * Icons use Font Awesome (see @/lib/icons).
 */

import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBookOpen,
  faChartBar,
  faClipboardCheck,
  faComments,
  faFlask,
  faGear,
  faHouse,
  faMoneyBillTransfer,
  faTag,
  faUsers,
} from "@/lib/icons";

export interface NavItem {
  label: string;
  href: string;
  icon: IconDefinition;
}

/** Branch tab navigation items */
export const BRANCH_NAV: NavItem[] = [
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
    label: "Deals",
    href: "/deals",
    icon: faTag,
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
    label: "Bonus Payout",
    href: "/payouts",
    icon: faMoneyBillTransfer,
  },
  {
    label: "Settings",
    href: "/store",
    icon: faGear,
  },
];

/** Demo-only: scoring / payout engine lab */
export const DEMO_SCORING_ENGINE_NAV: NavItem = {
  label: "Score Engine",
  href: "/scoring-engine",
  icon: faFlask,
};

/** Branch nav; appends demo lab link when `isTest` is true. */
export function getBranchNav(isTest = false): NavItem[] {
  if (!isTest) {
    return BRANCH_NAV;
  }

  const payoutIndex = BRANCH_NAV.findIndex((item) => item.href === "/payouts");
  if (payoutIndex === -1) {
    return [...BRANCH_NAV, DEMO_SCORING_ENGINE_NAV];
  }

  return [
    ...BRANCH_NAV.slice(0, payoutIndex + 1),
    DEMO_SCORING_ENGINE_NAV,
    ...BRANCH_NAV.slice(payoutIndex + 1),
  ];
}
