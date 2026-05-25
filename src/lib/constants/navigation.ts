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
