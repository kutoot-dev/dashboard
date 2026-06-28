"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CommunityShell } from "@/components/community/community-shell";
import { CommunityPostCard } from "@/components/community/community-post-card";
import { fetchCommunityFeed } from "@/lib/api/services/community.service";

const types = [
  { value: "", label: "All" },
  { value: "update", label: "Updates" },
  { value: "safety_alert", label: "Safety" },
  { value: "poll", label: "Polls" },
  { value: "marketplace", label: "Market" },
  { value: "event", label: "Events" },
  { value: "service_request", label: "Services" },
];

export default function CommunityFeedPage() {
  const [tab, setTab] = useState<"all" | "mine">("all");
  const [type, setType] = useState("");

  const params = useMemo(() => ({ tab, type: type || undefined }), [tab, type]);
  const { data, isLoading } = useQuery({
    queryKey: ["community-feed", params],
    queryFn: () => fetchCommunityFeed(params),
  });

  return (
    <CommunityShell>
      <section className="mb-8 rounded-3xl border border-white/12 bg-white/[0.08] p-6 backdrop-blur-xl">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-[#efff00]">CF-02 Live Community Feed</p>
        <h1 className="mt-3 font-[var(--font-brand-display)] text-4xl font-extrabold uppercase text-white md:text-6xl">
          All users. One feed. Team stamps.
        </h1>
        <p className="mt-3 max-w-2xl text-white/70">
          Post updates, alerts, polls, events, marketplace listings, and service requests. Every useful action can earn stamps for your team.
        </p>
      </section>

      <div className="mb-6 flex flex-wrap gap-3">
        {(["all", "mine"] as const).map((nextTab) => (
          <button
            key={nextTab}
            onClick={() => setTab(nextTab)}
            className={`rounded-full px-5 py-3 text-xs font-extrabold uppercase tracking-[0.16em] ${tab === nextTab ? "bg-[#efff00] text-black shadow-[4px_4px_0_#8b5cf6]" : "border border-white/15 text-white/70"}`}
          >
            {nextTab === "all" ? "All Feed" : "My Posts"}
          </button>
        ))}
      </div>

      <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
        {types.map((item) => (
          <button
            key={item.value || "all"}
            onClick={() => setType(item.value)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] ${type === item.value ? "bg-[#8b5cf6] text-white" : "bg-white/10 text-white/70"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-white/60">Loading feed...</p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {(data?.data ?? []).map((post) => (
            <CommunityPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </CommunityShell>
  );
}
