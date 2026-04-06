/**
 * Utility: className merge helper
 * Combines clsx and tailwind-merge for conditional + conflict-free class names.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
