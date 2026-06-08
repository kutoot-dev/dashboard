import Image from "next/image";
import { cn } from "@/lib/utils/cn";

/**
 * KutootLogo - Full horizontal logo (text + icon)
 * Used in headers, login pages, and prominent placements
 */

interface KutootLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function KutootLogo({ size = "md", className }: KutootLogoProps) {
  const sizeMap = {
    sm: {
      className: "h-6 w-auto",
      width: 164,
      height: 36,
    },
    md: {
      className: "h-8 w-auto",
      width: 220,
      height: 48,
    },
    lg: {
      className: "h-12 w-auto",
      width: 286,
      height: 62,
    },
  };

  const logoSize = sizeMap[size];

  return (
    <Image
      src="/full-logo.png"
      alt="Kutoot"
      width={logoSize.width}
      height={logoSize.height}
      priority={size === "lg"}
      className={cn(logoSize.className, className)}
    />
  );
}

/**
 * KutootIcon - Icon only (the X/cross mark)
 * Used in small spaces, favicons, and sidebar marks
 */

interface KutootIconProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function KutootIcon({ size = "md", className }: KutootIconProps) {
  const sizeMap = {
    sm: {
      className: "h-4 w-4",
      width: 16,
      height: 16,
    },
    md: {
      className: "h-6 w-6",
      width: 24,
      height: 24,
    },
    lg: {
      className: "h-8 w-8",
      width: 32,
      height: 32,
    },
    xl: {
      className: "h-12 w-12",
      width: 48,
      height: 48,
    },
  };

  const iconSize = sizeMap[size];

  return (
    <Image
      src="/k-logo.svg"
      alt="Kutoot"
      width={iconSize.width}
      height={iconSize.height}
      className={cn(iconSize.className, className)}
    />
  );
}
