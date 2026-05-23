import type { UseQueryResult } from "@tanstack/react-query";

type QuerySkeletonInput<TData> = Pick<
  UseQueryResult<TData>,
  "isLoading" | "isFetching" | "data"
>;

/** True while the query has no data yet (initial load or new cache key). */
export function useQuerySkeleton<TData>(query: QuerySkeletonInput<TData>): boolean {
  return query.isLoading || (query.isFetching && query.data == null);
}
