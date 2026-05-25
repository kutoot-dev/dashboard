"use client";

import { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getDiscoverPosts } from "@/lib/api/services/discover.service";
import { PageHeader } from "@/components/layout/page-header";
import { DiscoverPostCard } from "@/components/discover/discover-post-card";
import { DiscoverFeedSkeleton } from "@/components/discover/discover-feed-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 10;

export default function DiscoverPage() {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const postsQuery = useInfiniteQuery({
    queryKey: ["discover-posts"],
    queryFn: ({ pageParam }) =>
      getDiscoverPosts({
        page: pageParam,
        limit: PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.success) return undefined;
      const { page, total_pages } = lastPage.data.pagination;
      return page < total_pages ? page + 1 : undefined;
    },
    retry: false,
  });

  const posts = useMemo(
    () => postsQuery.data?.pages.flatMap((page) => (page.success ? page.data.items : [])) ?? [],
    [postsQuery.data],
  );

  const showInitialSkeleton = postsQuery.isPending || (postsQuery.isFetching && postsQuery.data == null);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) {
          void postsQuery.fetchNextPage();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [postsQuery.hasNextPage, postsQuery.isFetchingNextPage, postsQuery.fetchNextPage]);

  return (
    <div className="space-y-6">
      <PageHeader title="Discover" subtitle="Updates, tips, and conversations from the Kutoot community." />

      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        {showInitialSkeleton && <DiscoverFeedSkeleton count={3} />}

        {!showInitialSkeleton && posts.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border/80 py-16 text-center text-sm text-muted-foreground">
            No posts yet. Check back soon for updates from Kutoot.
          </p>
        )}

        {!showInitialSkeleton &&
          posts.map((post) => (
            <DiscoverPostCard key={post.id} post={post} />
          ))}

        {!showInitialSkeleton && posts.length > 0 && (
          <div ref={loadMoreRef} className="flex flex-col items-center gap-3 pb-6 pt-1">
            {postsQuery.isFetchingNextPage && (
              <div className="w-full overflow-hidden rounded-2xl border border-border/80 bg-card-solid p-4 shadow-sm">
                <div className="flex gap-3">
                  <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="mt-4 h-5 w-3/4" />
                <Skeleton className="mt-3 h-24 w-full rounded-xl" />
              </div>
            )}
            {!postsQuery.hasNextPage && !postsQuery.isFetchingNextPage && (
              <p className="text-xs text-muted-foreground">You&apos;re all caught up</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
