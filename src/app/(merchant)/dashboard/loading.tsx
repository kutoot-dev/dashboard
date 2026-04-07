import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Skeleton className="h-7 w-32" />
          <Skeleton className="mt-2 h-4 w-60" />
        </div>
        <Skeleton className="h-9 w-40 rounded-md" />
      </div>
      {/* KMI Chart */}
      <Skeleton variant="rect" className="h-[220px]" />
      {/* Top Row Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4">
            <Skeleton className="mb-2 h-3 w-20" />
            <Skeleton className="h-10 w-24" />
          </div>
        ))}
      </div>
      {/* Score History Chart */}
      <Skeleton variant="rect" className="h-[420px]" />
      {/* Volume Chart */}
      <Skeleton variant="rect" className="h-[160px]" />
      {/* Parameter Meters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4">
            <Skeleton className="mb-2 h-3 w-24" />
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="mt-2 h-3 w-16" />
          </div>
        ))}
      </div>
      {/* Improvement Card */}
      <Skeleton variant="rect" className="h-48" />
    </div>
  );
}
