"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CommunityShell } from "@/components/community/community-shell";
import { RewardTaskFlashCard } from "@/components/community/reward-task-flash-card";
import { fetchLiveReward, joinReward } from "@/lib/api/services/community.service";

export default function CommunityRewardsPage() {
  const queryClient = useQueryClient();
  const { data: reward, isLoading } = useQuery({
    queryKey: ["community-live-reward"],
    queryFn: fetchLiveReward,
  });

  const joinMutation = useMutation({
    mutationFn: () => (reward ? joinReward(reward.id) : Promise.resolve()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["community-live-reward"] }),
  });

  return (
    <CommunityShell>
      <section className="rounded-3xl border border-white/12 bg-white/[0.08] p-6 backdrop-blur-xl">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-[#efff00]">CF-09 Reward Flash Cards</p>
        <h1 className="mt-3 font-[var(--font-brand-display)] text-4xl font-extrabold uppercase text-white md:text-6xl">
          Complete tasks. Earn stamps.
        </h1>
        <p className="mt-3 max-w-2xl text-white/70">
          Fill review, onboarding, quiz, poll, and proof tasks directly on each card. Auto-verified cards award stamps instantly.
        </p>
      </section>

      {isLoading ? <p className="mt-6 text-white/60">Loading live reward...</p> : null}

      {!isLoading && !reward ? (
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.08] p-6 text-white/70">No live reward right now.</div>
      ) : null}

      {reward ? (
        <>
          <section className="mt-6 rounded-3xl border border-[#efff00]/25 bg-[#efff00]/10 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#efff00]">Live Reward</p>
                <h2 className="mt-2 text-3xl font-extrabold uppercase text-white">{reward.name}</h2>
                {reward.description ? <p className="mt-2 text-white/70">{reward.description}</p> : null}
                <p className="mt-3 text-sm text-white/60">
                  {reward.stamps_left ?? 0} stamps left
                  {reward.remaining_seconds ? ` · ${Math.ceil(reward.remaining_seconds / 3600)} hours remaining` : ""}
                </p>
              </div>
              <button
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending}
                className="rounded-full bg-[#efff00] px-6 py-3 text-sm font-extrabold uppercase tracking-[0.16em] text-black shadow-[5px_5px_0_#8b5cf6] disabled:opacity-60"
              >
                {joinMutation.isPending ? "Joining..." : "Join reward"}
              </button>
            </div>
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {(reward.tasks ?? []).map((task) => (
              <RewardTaskFlashCard
                key={task.id}
                rewardId={reward.id}
                task={task}
                onSubmitted={() => {
                  void queryClient.invalidateQueries({ queryKey: ["community-live-reward"] });
                  void queryClient.invalidateQueries({ queryKey: ["community-stamp-activity"] });
                }}
              />
            ))}
          </div>
        </>
      ) : null}
    </CommunityShell>
  );
}
