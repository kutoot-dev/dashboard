import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardsSkeletonProps {
  count?: number;
  className?: string;
}

export function StatCardsSkeleton({ count = 4, className }: StatCardsSkeletonProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="space-y-3 p-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-3 w-40" />
        </Card>
      ))}
    </div>
  );
}

interface TableRowsSkeletonProps {
  rows?: number;
  columns?: number;
  minWidth?: string;
}

export function TableRowsSkeleton({
  rows = 5,
  columns = 6,
  minWidth = "min-w-[600px]",
}: TableRowsSkeletonProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full text-sm", minWidth)}>
        <thead>
          <tr className="border-b border-border">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-2 py-2">
                <Skeleton className="h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border/50">
              {Array.from({ length: columns }).map((__, colIndex) => (
                <td key={colIndex} className="px-2 py-3">
                  <Skeleton className={cn("h-4", colIndex === 0 ? "w-28" : "w-20")} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface FeedListSkeletonProps {
  count?: number;
}

export function FeedListSkeleton({ count = 5 }: FeedListSkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border/70 bg-card/60 p-3">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-3 w-full" />
          <Skeleton className="mt-1 h-3 w-4/5" />
          <div className="mt-3 flex gap-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-14" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DetailPanelSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-3/5" />
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-2 h-3 w-full" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="mt-4 h-9 w-24 rounded-md" />
      <div className="space-y-2 border-t border-border pt-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton variant="rect" className="h-16" />
        <Skeleton variant="rect" className="h-16" />
      </div>
    </div>
  );
}

interface FormFieldsSkeletonProps {
  fields?: number;
}

export function FormFieldsSkeleton({ fields = 4 }: FormFieldsSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton variant="rect" className="h-10" />
        </div>
      ))}
      <Skeleton variant="rect" className="mt-2 h-10 w-full" />
    </div>
  );
}

interface CardGridSkeletonProps {
  count?: number;
  className?: string;
}

export function CardGridSkeleton({ count = 6, className }: CardGridSkeletonProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 md:grid-cols-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="deal-card-dark animate-pulse p-4 opacity-80">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton variant="rect" className="h-16" />
          <Skeleton className="mt-3 h-3 w-4/5" />
        </div>
      ))}
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <StatCardsSkeleton count={4} className="grid-cols-2 xl:grid-cols-4" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.85fr)]">
        <div className="space-y-4">
          <Skeleton variant="rect" className="h-[220px] sm:h-[320px]" />
          <Skeleton variant="rect" className="h-[360px] sm:h-[420px]" />
        </div>
        <div className="space-y-4">
          <Skeleton variant="rect" className="h-40" />
          <Skeleton variant="rect" className="h-44" />
          <Skeleton variant="rect" className="h-48" />
        </div>
      </div>
    </div>
  );
}

export function ProfileRowsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  );
}
