import { Skeleton } from "@/components/ui/skeleton";

export function DiscoverFeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-border/80 bg-card-solid p-4 shadow-[0_12px_28px_rgba(8,13,34,0.12)]"
        >
          <div className="flex gap-3">
            <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="mt-4 h-5 w-3/4" />
          <Skeleton className="mt-3 h-32 w-full rounded-xl" />
          <div className="mt-4 flex gap-4 border-t border-border/70 pt-3">
            <Skeleton className="h-8 w-14 rounded-lg" />
            <Skeleton className="h-8 w-14 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
