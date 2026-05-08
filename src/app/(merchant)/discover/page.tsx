"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addPostComment, getDiscoverPost, getDiscoverPosts, togglePostLike } from "@/lib/api/services/discover.service";
import { ApiError } from "@/lib/api/client";
import { useToastStore } from "@/lib/stores/toast.store";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All categories" },
  { value: "discover", label: "Discover" },
  { value: "academy", label: "Academy" },
];

export default function DiscoverPage() {
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [commentBody, setCommentBody] = useState("");

  const qc = useQueryClient();
  const pushToast = useToastStore((s) => s.push);

  const params = useMemo(() => {
    return {
      page,
      limit: 12,
      category: category === "all" ? undefined : category,
    };
  }, [category, page]);

  const postsQuery = useQuery({
    queryKey: ["discover-posts", params],
    queryFn: () => getDiscoverPosts(params),
    retry: false,
  });

  const detailQuery = useQuery({
    queryKey: ["discover-post", selectedPostId],
    queryFn: () => getDiscoverPost(selectedPostId as number),
    enabled: typeof selectedPostId === "number",
    retry: false,
  });

  const likeMutation = useMutation({
    mutationFn: (postId: number) => togglePostLike(postId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["discover-posts"] });
      if (selectedPostId) {
        qc.invalidateQueries({ queryKey: ["discover-post", selectedPostId] });
      }
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Unable to update like";
      pushToast({ title: "Like failed", description: message, variant: "error" });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (input: { postId: number; body: string }) => addPostComment(input.postId, input.body),
    onSuccess: () => {
      setCommentBody("");
      if (selectedPostId) {
        qc.invalidateQueries({ queryKey: ["discover-post", selectedPostId] });
      }
      pushToast({ title: "Comment posted", variant: "success" });
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Unable to post comment";
      pushToast({ title: "Comment failed", description: message, variant: "error" });
    },
  });

  const posts = postsQuery.data?.success ? postsQuery.data.data.items : [];
  const pagination = postsQuery.data?.success ? postsQuery.data.data.pagination : null;
  const selected = detailQuery.data?.success ? detailQuery.data.data : null;

  function submitComment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedPostId || !commentBody.trim()) return;
    commentMutation.mutate({ postId: selectedPostId, body: commentBody.trim() });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Discover" subtitle="Community posts, comments, and merchant engagement feed." />

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Feed</p>
            <div className="w-44">
              <Select
                options={CATEGORY_OPTIONS}
                value={category}
                onChange={(value) => {
                  setCategory(value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            {posts.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => setSelectedPostId(post.id)}
                className="w-full rounded-lg border border-border/70 bg-card/60 p-3 text-left transition-colors hover:bg-card-hover"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground">{post.title}</p>
                  {post.is_pinned && (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-mono text-accent">PINNED</span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.body}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                  <span>By {post.author}</span>
                  <span>{new Date(post.published_at || post.created_at).toLocaleDateString("en-IN")}</span>
                  <span>{post.views_count} views</span>
                  <span>{post.likes_count} likes</span>
                </div>
              </button>
            ))}

            {!postsQuery.isLoading && posts.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No posts found for this filter.</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= (pagination?.total_pages ?? 1)}
              onClick={() => setPage((p) => Math.min(pagination?.total_pages ?? 1, p + 1))}
            >
              Next
            </Button>
          </div>
        </Card>

        <Card className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Post details</p>

          {!selected && (
            <p className="py-10 text-center text-sm text-muted-foreground">Select a post to view full discussion.</p>
          )}

          {selected && (
            <>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-foreground">{selected.title}</h2>
                <p className="text-sm text-muted-foreground">By {selected.author}</p>
              </div>

              <p className="whitespace-pre-wrap text-sm text-foreground">{selected.body}</p>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => likeMutation.mutate(selected.id)}
                  loading={likeMutation.isPending}
                >
                  {selected.likes_count} Like
                </Button>
              </div>

              <div className="space-y-2 border-t border-border pt-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Comments ({selected.comments.length})
                </p>

                {selected.comments.length === 0 && (
                  <p className="text-sm text-muted-foreground">No comments yet.</p>
                )}

                {selected.comments.map((comment) => (
                  <div key={comment.id} className="rounded-md border border-border/70 p-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-foreground">{comment.author}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(comment.created_at).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-foreground">{comment.body}</p>
                  </div>
                ))}

                <form className="space-y-2" onSubmit={submitComment}>
                  <Input
                    label="Add comment"
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    placeholder="Write a comment"
                  />
                  <Button type="submit" size="sm" loading={commentMutation.isPending} disabled={!commentBody.trim()}>
                    Post comment
                  </Button>
                </form>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
