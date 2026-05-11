import { cn } from "@/lib/utils/cn";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className={cn("font-display text-2xl font-bold tracking-tight text-foreground")}>
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
