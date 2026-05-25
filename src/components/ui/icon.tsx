import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { cn } from "@/lib/utils/cn";

export interface IconProps {
  icon: IconDefinition;
  className?: string;
  title?: string;
}

/** Renders a Font Awesome icon with consistent sizing in the merchant panel. */
export function Icon({ icon, className, title }: IconProps) {
  return (
    <FontAwesomeIcon
      icon={icon}
      className={cn("inline-block shrink-0", className)}
      title={title}
    />
  );
}
