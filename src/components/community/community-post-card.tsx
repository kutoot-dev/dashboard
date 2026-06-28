"use client";

import Link from "next/link";
import type { CommunityPost } from "@/lib/types/community";

const typeLabels: Record<CommunityPost["type"], string> = {
  update: "Local Update",
  safety_alert: "Safety Alert",
  poll: "Poll",
  service_request: "Service",
  marketplace: "Market",
  event: "Event",
};

export function CommunityPostCard({ post }: { post: CommunityPost }) {
  return (
    <article className="rounded-3xl border border-white/12 bg-white/[0.08] p-5 shadow-[0_0_30px_rgba(139,92,246,0.12)] backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="rounded-full bg-[#ff5f00] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-black">
            {typeLabels[post.type]}
          </span>
          {post.is_boosted && (
            <span className="ml-2 rounded-full bg-[#efff00] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-black">
              Boosted
            </span>
          )}
        </div>
        <p className="text-xs text-white/50">{post.created_at ? new Date(post.created_at).toLocaleString() : ""}</p>
      </div>

      <Link href={`/community/posts/${post.id}`} className="mt-4 block">
        <h2 className="font-[var(--font-brand-display)] text-2xl font-extrabold uppercase text-white">
          {post.title || "Untitled post"}
        </h2>
        {post.body && <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/70">{post.body}</p>}
      </Link>

      {post.media?.[0]?.thumb_url && (
        <div
          aria-label="Post media preview"
          className="mt-4 h-52 w-full rounded-2xl bg-cover bg-center"
          style={{ backgroundImage: `url(${post.media[0].thumb_url})` }}
        />
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.12em] text-white/60">
        <span>{post.counts.likes} likes</span>
        <span>{post.counts.comments} comments</span>
        <span>{post.counts.views} views</span>
        {post.team?.name && <span className="text-[#efff00]">Team {post.team.name}</span>}
      </div>
    </article>
  );
}
