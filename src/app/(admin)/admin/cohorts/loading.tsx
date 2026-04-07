import { Skeleton } from "@/components/ui/skeleton";

export default function CohortsLoading() {
  return (
    <div className="space-y-4">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Skeleton className="h-7 w-40" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-40 rounded-md" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rect" className="h-52" />
        ))}
      </div>
    </div>
  );
}
