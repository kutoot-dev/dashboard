import { Skeleton } from "@/components/ui/skeleton";

export default function PayoutsLoading() {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="mt-2 h-4 w-56" />
      </div>
      {/* Reward Pool Card */}
      <Skeleton variant="rect" className="h-28" />
      {/* Top Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4">
            <Skeleton className="mb-2 h-3 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
      {/* Payout Chart */}
      <Skeleton variant="rect" className="h-[200px]" />
      {/* Reward History Table */}
      <Skeleton className="h-3 w-28" />
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8" />
          ))}
        </div>
      </div>
    </div>
  );
}
