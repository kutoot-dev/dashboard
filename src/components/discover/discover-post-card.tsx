"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComment,
  faEye,
  faHeart,
  faPaperPlane,
  faThumbtack,
} from "@fortawesome/free-solid-svg-icons";
import { addPostComment, getDiscoverPost, togglePostLike } from "@/lib/api/services/discover.service";
import { ApiError } from "@/lib/api/client";
import { useToastStore } from "@/lib/stores/toast.store";
import type { DiscoverPost, DiscoverPostDetail } from "@/lib/types/discover";
import { formatTimeAgo } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { KutootIcon } from "@/components/branding";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const KUTOOT_TEAM_AUTHOR = "Kutoot Team";

function isKutootTeamAuthor(name: string): boolean {
  return name.trim().toLowerCase() === KUTOOT_TEAM_AUTHOR.toLowerCase();
}

function KutootTeamAvatar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-card-solid p-1 shadow-md ring-1 ring-border/60",
        className,
      )}
      aria-hidden
    >
      <KutootIcon size="sm" className="h-full w-full object-contain" />
    </div>
  );
}

function PostAuthorAvatar({
  author,
  className,
  variant = "post",
}: {
  author: string;
  className?: string;
  variant?: "post" | "comment";
}) {
  if (isKutootTeamAuthor(author)) {
    return <KutootTeamAvatar className={className} />;
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold",
        variant === "post"
          ? "bg-gradient-to-br from-primary/90 to-secondary/90 text-sm text-white shadow-md"
          : "bg-primary/20 text-[10px] text-primary",
        className,
      )}
      aria-hidden
    >
      {authorInitials(author)}
    </div>
  );
}

function authorInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "K"
  );
}

function categoryLabel(category: DiscoverPost["category"]): string {
  return category === "academy" ? "Academy" : "Discover";
}

interface DiscoverPostCardProps {
  post: DiscoverPost;
}

export function DiscoverPostCard({ post }: DiscoverPostCardProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [liked, setLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);

  const qc = useQueryClient();
  const pushToast = useToastStore((s) => s.push);

  const detailQuery = useQuery({
    queryKey: ["discover-post", post.id],
    queryFn: () => getDiscoverPost(post.id),
    enabled: commentsOpen,
    retry: false,
  });

  const detail: DiscoverPostDetail | null = detailQuery.data?.success ? detailQuery.data.data : null;
  const comments = detail?.comments ?? [];

  const likeMutation = useMutation({
    mutationFn: () => togglePostLike(post.id),
    onSuccess: (res) => {
      if (res.success) {
        setLiked(res.data.liked);
        setLikesCount(res.data.likes_count);
      }
      qc.invalidateQueries({ queryKey: ["discover-posts"] });
      qc.invalidateQueries({ queryKey: ["discover-post", post.id] });
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Unable to update like";
      pushToast({ title: "Like failed", description: message, variant: "error" });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (body: string) => addPostComment(post.id, body),
    onSuccess: () => {
      setCommentBody("");
      qc.invalidateQueries({ queryKey: ["discover-post", post.id] });
      qc.invalidateQueries({ queryKey: ["discover-posts"] });
      pushToast({ title: "Comment posted", variant: "success" });
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Unable to post comment";
      pushToast({ title: "Comment failed", description: message, variant: "error" });
    },
  });

  const timestamp = post.published_at || post.created_at;

  function submitComment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!commentBody.trim()) return;
    commentMutation.mutate(commentBody.trim());
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-border/80 bg-card-solid shadow-[0_12px_28px_rgba(8,13,34,0.12)]">
      <header className="flex items-start gap-3 px-4 pt-4">
        <PostAuthorAvatar author={post.author} className="h-11 w-11 text-sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="truncate font-semibold text-foreground">{post.author}</p>
            <span className="text-xs text-muted-foreground">·</span>
            <time className="text-xs text-muted-foreground" dateTime={timestamp}>
              {formatTimeAgo(timestamp)}
            </time>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {categoryLabel(post.category)}
            </span>
            {post.is_pinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent">
                <FontAwesomeIcon icon={faThumbtack} className="h-2.5 w-2.5" />
                Pinned
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="space-y-3 px-4 pb-3 pt-3">
        {post.title && <h2 className="text-base font-semibold leading-snug text-foreground">{post.title}</h2>}

        {post.cover_url && (
          <div className="-mx-4 overflow-hidden border-y border-border/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.cover_url} alt="" className="max-h-[420px] w-full object-cover" />
          </div>
        )}

        <div
          className="prose prose-sm max-w-none text-foreground prose-p:my-2 prose-headings:my-2 prose-ul:my-2 prose-li:my-0 dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />
      </div>

      <div className="flex items-center justify-between border-t border-border/70 px-4 py-2.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => likeMutation.mutate()}
            disabled={likeMutation.isPending}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors",
              liked ? "text-secondary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            aria-pressed={liked}
            aria-label={liked ? "Unlike post" : "Like post"}
          >
            <FontAwesomeIcon icon={faHeart} className={cn("h-4 w-4", liked && "scale-110")} />
            <span>{likesCount}</span>
          </button>
          <button
            type="button"
            onClick={() => setCommentsOpen((open) => !open)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors",
              commentsOpen
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            aria-expanded={commentsOpen}
          >
            <FontAwesomeIcon icon={faComment} className="h-4 w-4" />
            <span>{detail?.comments.length ?? post.comments_count}</span>
          </button>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <FontAwesomeIcon icon={faEye} className="h-3.5 w-3.5" />
          {post.views_count}
        </span>
      </div>

      {commentsOpen && (
        <div className="border-t border-border/70 bg-muted/30 px-4 py-3">
          {detailQuery.isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          )}

          {!detailQuery.isLoading && comments.length === 0 && (
            <p className="py-2 text-center text-sm text-muted-foreground">No comments yet. Start the conversation.</p>
          )}

          <ul className="space-y-2">
            {comments.map((comment) => (
              <li key={comment.id} className="flex gap-2">
                <PostAuthorAvatar author={comment.author} variant="comment" className="mt-0.5 h-8 w-8" />
                <div className="min-w-0 flex-1 rounded-2xl bg-card-solid px-3 py-2 shadow-sm">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-xs font-semibold text-foreground">{comment.author}</span>
                    <time className="text-[10px] text-muted-foreground">{formatTimeAgo(comment.created_at)}</time>
                  </div>
                  <p className="mt-0.5 text-sm text-foreground">{comment.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <form className="mt-3 flex gap-2" onSubmit={submitComment}>
            <input
              type="text"
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Add a comment…"
              className="min-w-0 flex-1 rounded-full border border-border/80 bg-background px-4 py-2 text-sm text-foreground outline-none ring-primary/30 placeholder:text-muted-foreground focus:ring-2"
            />
            <Button
              type="submit"
              size="sm"
              className="shrink-0 rounded-full px-3"
              loading={commentMutation.isPending}
              disabled={!commentBody.trim()}
              aria-label="Post comment"
            >
              <FontAwesomeIcon icon={faPaperPlane} className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      )}
    </article>
  );
}
