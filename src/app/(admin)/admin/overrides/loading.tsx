import { Skeleton } from "@/components/ui/skeleton";

export default function OverridesLoading() {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <Skeleton className="h-9 w-full max-w-sm" />
      <Skeleton className="h-3 w-28" />
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8" />
          ))}
        </div>
      </div>
      <Skeleton variant="rect" className="h-32" />
    </div>
  );
}
