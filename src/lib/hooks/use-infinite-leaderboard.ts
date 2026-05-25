import { useInfiniteQuery } from "@tanstack/react-query";
import type { LeaderboardFilters, LeaderboardData } from "@/lib/types";
import { getLeaderboard } from "@/lib/api/services/leaderboard.service";

const PAGE_SIZE = 20;

export function useInfiniteLeaderboard(
  filters: Omit<LeaderboardFilters, "page"> = {},
) {
  return useInfiniteQuery({
    queryKey: ["leaderboard", "infinite", filters],
    queryFn: ({ pageParam }) =>
      getLeaderboard({
        ...filters,
        page: pageParam,
        limit: filters.limit ?? PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.success) return undefined;
      const { page, total_pages } = lastPage.data.pagination;
      return page < total_pages ? page + 1 : undefined;
    },
    select: (data) => ({
      pages: data.pages.map((page) => page.data),
      pageParams: data.pageParams,
    }),
  });
}

export function flattenLeaderboardPages(
  pages: LeaderboardData[] | undefined,
): LeaderboardData["items"] {
  return pages?.flatMap((page) => page.items) ?? [];
}

export function latestLeaderboardMeta(pages: LeaderboardData[] | undefined) {
  const last = pages?.[pages.length - 1];
  return {
    pagination: last?.pagination,
    filters: last?.filters,
    my_entry: last?.my_entry ?? null,
  };
}
