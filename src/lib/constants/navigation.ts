/**
 * Constants: Navigation menu definitions
 *
 * Tab-based navigation for the merchant role.
 * Icons are SVG path data rendered inline in the tab bar.
 */

export interface NavItem {
  label: string;
  href: string;
  /** SVG path d attribute for the icon (24x24 viewBox) */
  icon: string;
}

/** Branch tab navigation items */
export const BRANCH_NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1",
  },
  {
    label: "Leaderboard",
    href: "/leaderboard",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    label: "Analysis",
    href: "/discover",
    icon: "M3 3v18h18M7 13l3-3 3 2 4-5",
  },
  {
    label: "Deals",
    href: "/deals",
    icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z",
  },
  {
    label: "Transactions",
    href: "/transactions",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  },
  {
    label: "Visitors",
    href: "/visitors",
    icon: "M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m2-2a4 4 0 100-8 4 4 0 000 8zm6 0a4 4 0 100-8 4 4 0 000 8z",
  },
  {
    label: "Payouts",
    href: "/payouts",
    icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    label: "Settings",
    href: "/store",
    icon: "M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 4a7.94 7.94 0 00-.34-2.3l2.03-1.58-2-3.46-2.45.98A8.2 8.2 0 0016.2 4l-.37-2.6h-4l-.37 2.6a8.2 8.2 0 00-1.98.64L6.99 3.66l-2 3.46 2.03 1.58A7.94 7.94 0 007 12c0 .79.12 1.55.34 2.3l-2.03 1.58 2 3.46 2.45-.98c.61.29 1.28.5 1.98.64l.37 2.6h4l.37-2.6c.7-.14 1.37-.35 1.98-.64l2.45.98 2-3.46-2.03-1.58c.22-.75.34-1.51.34-2.3z",
  },
];

