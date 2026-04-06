/**
 * Color utilities and semantic color mappings
 */

export const colors = {
  // Brand colors
  primary: "#AE1E3F",
  secondary: "#EA6B1E",
  accent: "#EBC500",
  dark: "#3B322B",

  // Semantic colors (light mode)
  light: {
    success: "#16a34a",
    error: "#dc2626",
    warning: "#d97706",
    info: "#0ea5e9",
    gain: "#16a34a",
    loss: "#dc2626",
  },

  // Semantic colors (dark mode)
  dark: {
    success: "#22c55e",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#06b6d4",
    gain: "#22c55e",
    loss: "#ef4444",
  },
};

/**
 * Get semantic color based on theme
 */
export function getSemanticColor(
  semantic: "success" | "error" | "warning" | "info" | "gain" | "loss",
  isDark: boolean = true
) {
  const theme = isDark ? colors.dark : colors.light;
  return theme[semantic] || theme.info;
}

/**
 * Tailwind class utilities for semantic colors
 */
export const semanticClasses = {
  success: {
    bg: "bg-success",
    text: "text-success",
    border: "border-success",
    bgLight: "bg-success/10",
    bgSoft: "bg-success/5",
  },
  error: {
    bg: "bg-error",
    text: "text-error",
    border: "border-error",
    bgLight: "bg-error/10",
    bgSoft: "bg-error/5",
  },
  warning: {
    bg: "bg-warning",
    text: "text-warning",
    border: "border-warning",
    bgLight: "bg-warning/10",
    bgSoft: "bg-warning/5",
  },
  info: {
    bg: "bg-info",
    text: "text-info",
    border: "border-info",
    bgLight: "bg-info/10",
    bgSoft: "bg-info/5",
  },
};
