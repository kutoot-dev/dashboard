import { Skeleton } from "@/components/ui/skeleton";

export default function PayoutsLoading() {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      {/* Controls */}
      <div className="rounded-lg border border-border bg-card p-4">
        <Skeleton className="mb-3 h-3 w-36" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9" />
          ))}
        </div>
      </div>
      {/* Results placeholder */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="rect" className="h-24" />
        ))}
      </div>
      <Skeleton variant="rect" className="h-[200px]" />
    </div>
  );
}
