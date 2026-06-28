"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CommunityShell } from "@/components/community/community-shell";
import { fetchCommunityConversations } from "@/lib/api/services/community.service";

export default function CommunityConversationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["community-conversations"],
    queryFn: fetchCommunityConversations,
  });

  return (
    <CommunityShell>
      <section className="rounded-3xl border border-white/12 bg-white/[0.08] p-6 backdrop-blur-xl">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-[#efff00]">CF-08 Inbox</p>
        <h1 className="mt-3 font-[var(--font-brand-display)] text-4xl font-extrabold uppercase text-white">One-to-one deals</h1>
      </section>
      <div className="mt-6 grid gap-4">
        {isLoading && <p className="text-white/60">Loading conversations...</p>}
        {(data ?? []).map((conversation) => (
          <Link key={conversation.id} href={`/community/conversations/${conversation.id}`} className="rounded-3xl border border-white/12 bg-white/[0.08] p-5 backdrop-blur-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ff5f00]">{conversation.post?.type}</p>
            <h2 className="mt-2 text-xl font-bold text-white">{conversation.post?.title || "Conversation"}</h2>
            <p className="mt-2 text-sm text-white/60">{conversation.latest_message?.body || "No messages yet"}</p>
          </Link>
        ))}
      </div>
    </CommunityShell>
  );
}
