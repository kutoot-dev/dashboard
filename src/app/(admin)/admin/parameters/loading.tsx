import { Skeleton } from "@/components/ui/skeleton";

export default function ParametersLoading() {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-8" />
          ))}
        </div>
      </div>
    </div>
  );
}
