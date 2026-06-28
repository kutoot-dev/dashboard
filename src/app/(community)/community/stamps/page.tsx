"use client";

import { useQuery } from "@tanstack/react-query";
import { CommunityShell } from "@/components/community/community-shell";
import { fetchCommunityStampActivity } from "@/lib/api/services/community.service";

export default function CommunityStampsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["community-stamp-activity"],
    queryFn: fetchCommunityStampActivity,
  });

  const payload = data as
    | {
        summary?: { team_id: number; reward_id: number; stamps: number }[];
        activity?: { id: number; action: string; stamps_awarded: number; counted_at: string; post?: { title?: string } }[];
      }
    | undefined;

  return (
    <CommunityShell>
      <section className="rounded-3xl border border-white/12 bg-white/[0.08] p-6 backdrop-blur-xl">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-[#efff00]">CF-10 Stamps History</p>
        <h1 className="mt-3 font-[var(--font-brand-display)] text-4xl font-extrabold uppercase text-white">Your team reward trail</h1>
      </section>
      {isLoading ? (
        <p className="mt-6 text-white/60">Loading stamps...</p>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
          <aside className="rounded-3xl border border-white/12 bg-white/[0.08] p-5 backdrop-blur-xl">
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-white/60">Totals</h2>
            <div className="mt-4 space-y-3">
              {(payload?.summary ?? []).map((row) => (
                <div key={`${row.team_id}-${row.reward_id}`} className="rounded-2xl bg-black/20 p-4">
                  <p className="text-3xl font-extrabold text-[#efff00]">{row.stamps}</p>
                  <p className="text-xs uppercase text-white/60">Team {row.team_id} · Reward {row.reward_id}</p>
                </div>
              ))}
            </div>
          </aside>
          <section className="space-y-3">
            {(payload?.activity ?? []).map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.08] p-4">
                <p className="font-bold text-white">{item.action.replace(/_/g, " ")}</p>
                <p className="text-sm text-white/60">{item.post?.title || "Community activity"}</p>
                <p className="mt-2 text-[#efff00]">+{item.stamps_awarded} stamps</p>
              </div>
            ))}
          </section>
        </div>
      )}
    </CommunityShell>
  );
}
