import { Skeleton } from "@/components/ui/skeleton";

export default function ForceMajeureLoading() {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      {/* Active Events */}
      <Skeleton className="h-3 w-28" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} variant="rect" className="h-36" />
        ))}
      </div>
      {/* Past Events */}
      <Skeleton className="h-3 w-24" />
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8" />
          ))}
        </div>
      </div>
    </div>
  );
}
