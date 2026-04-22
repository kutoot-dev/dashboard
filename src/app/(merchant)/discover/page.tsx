"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDiscoverPosts, togglePostLike } from "@/lib/api/services/discover.service";
import type { DiscoverPost } from "@/lib/types/discover";
import { cn } from "@/lib/utils/cn";

export default function DiscoverPage() {
  const [posts, setPosts] = useState<DiscoverPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts(pageNum = 1) {
    try {
      setLoading(true);
      const res = await getDiscoverPosts({ page: pageNum, limit: 10 });
      if (res.success && res.data) {
        const items = res.data.items ?? [];
        if (pageNum === 1) {
          setPosts(items);
        } else {
          setPosts((prev) => [...prev, ...items]);
        }
        setHasMore(res.data.pagination.page < res.data.pagination.total_pages);
        setPage(pageNum);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }

  async function handleLike(postId: number) {
    try {
      const res = await togglePostLike(postId);
      if (res.success && res.data) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, likes_count: res.data.likes_count } : p
          )
        );
      }
    } catch {
      // silent
    }
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-lg font-bold tracking-tight text-foreground">
            Discover
          </h1>
          <p className="font-mono text-xs text-muted-foreground">
            Platform news, tips, and community updates
          </p>
        </div>
      </div>

      {/* Posts feed */}
      {loading && posts.length === 0 ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-muted-foreground font-mono text-sm">No posts yet</p>
        </Card>
      ) : (
        <>
          {posts.map((post) => (
            <Card key={post.id} hover className="transition-all">
              {/* Pinned indicator */}
              {post.is_pinned && (
                <div className="flex items-center gap-1 mb-2">
                  <svg className="h-3 w-3 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v2h2a1 1 0 010 2h-1l-1 8a2 2 0 01-2 2H7a2 2 0 01-2-2L4 9H3a1 1 0 010-2h2V5z" />
                  </svg>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-accent">
                    Pinned
                  </span>
                </div>
              )}

              {/* Title */}
              <h2 className="font-semibold text-foreground mb-2 text-sm">
                {post.title}
              </h2>

              {/* Body preview */}
              <div
                className="text-xs text-muted-foreground leading-relaxed line-clamp-4 mb-3 prose prose-sm prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: post.body }}
              />

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-glass-border">
                <div className="flex items-center gap-3">
                  {/* Like button */}
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="font-mono text-[11px]">{post.likes_count}</span>
                  </button>
                  {/* Views */}
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="font-mono text-[11px]">{post.views_count}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {post.author}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(post.published_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>
          ))}

          {/* Load more */}
          {hasMore && (
            <button
              onClick={() => loadPosts(page + 1)}
              disabled={loading}
              className="glass-card-sm w-full py-3 text-center font-mono text-xs text-muted-foreground hover:text-accent transition-colors disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load more"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
