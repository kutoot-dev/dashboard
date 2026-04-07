import { Skeleton } from "@/components/ui/skeleton";

export default function AnalysisLoading() {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      {/* Tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-32 rounded-md" />
        ))}
      </div>
      {/* Chart */}
      <Skeleton variant="rect" className="h-[400px]" />
      {/* Table */}
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
