"use client";

import { useQuery } from "@tanstack/react-query";
import communityApiClient from "@/lib/api/community-client";
import { CommunityShell } from "@/components/community/community-shell";

async function fetchLiveRewardLeaderboard(): Promise<unknown> {
  const response = await communityApiClient.get("/leaderboards/live-reward");
  return response.data.data;
}

export default function CommunityLeaderboardsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["community-live-reward-leaderboard"],
    queryFn: fetchLiveRewardLeaderboard,
  });

  const rows = Array.isArray(data) ? data : ((data as { rankings?: unknown[] } | undefined)?.rankings ?? []);

  return (
    <CommunityShell>
      <section className="rounded-3xl border border-white/12 bg-white/[0.08] p-6 backdrop-blur-xl">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-[#efff00]">CF-11 Leaderboards</p>
        <h1 className="mt-3 font-[var(--font-brand-display)] text-4xl font-extrabold uppercase text-white">Live Reward Teams</h1>
      </section>
      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-white/60">Loading leaderboard...</p>}
        {rows.map((row, index) => {
          const item = row as { team_name?: string; team?: { name?: string }; stamps?: number; stamps_count?: number };
          return (
            <div key={index} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.08] p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#efff00] font-extrabold text-black">#{index + 1}</span>
              <p className="flex-1 font-bold text-white">{item.team_name || item.team?.name || "Team"}</p>
              <p className="text-[#efff00]">{item.stamps ?? item.stamps_count ?? 0} stamps</p>
            </div>
          );
        })}
      </div>
    </CommunityShell>
  );
}
