"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CommunityShell } from "@/components/community/community-shell";
import {
  deleteRewardMedia,
  fetchRewardMediaGallery,
  fetchRewardMediaStorage,
} from "@/lib/api/services/community.service";

export default function CommunityRewardMediaPage() {
  const queryClient = useQueryClient();
  const { data: storage } = useQuery({
    queryKey: ["reward-media-storage"],
    queryFn: fetchRewardMediaStorage,
  });
  const { data: media = [], isLoading } = useQuery({
    queryKey: ["reward-media-gallery"],
    queryFn: fetchRewardMediaGallery,
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => deleteRewardMedia(id, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reward-media-gallery"] });
      void queryClient.invalidateQueries({ queryKey: ["reward-media-storage"] });
    },
  });

  function removeMedia(id: number) {
    const reason = window.prompt("Reason for deleting this S3 media object?");
    if (reason === null) return;
    deleteMutation.mutate({ id, reason });
  }

  return (
    <CommunityShell>
      <section className="rounded-3xl border border-white/12 bg-white/[0.08] p-6 backdrop-blur-xl">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-[#efff00]">Reward S3 Gallery</p>
        <h1 className="mt-3 font-[var(--font-brand-display)] text-4xl font-extrabold uppercase text-white md:text-6xl">
          Task media review
        </h1>
        <p className="mt-3 text-white/70">
          Review proof media stored in S3, track storage usage, and remove objects after review with an audit trail.
        </p>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/12 bg-white/[0.08] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">Storage used</p>
          <p className="mt-2 text-3xl font-extrabold text-[#efff00]">{storage?.total_mb ?? 0} MB</p>
        </div>
        <div className="rounded-3xl border border-white/12 bg-white/[0.08] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">Files</p>
          <p className="mt-2 text-3xl font-extrabold text-white">{storage?.files_count ?? 0}</p>
        </div>
        <div className="rounded-3xl border border-white/12 bg-white/[0.08] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">Deletion</p>
          <p className="mt-2 text-sm text-white/70">Deletes remove S3 objects and keep audit records.</p>
        </div>
      </div>

      {isLoading ? <p className="mt-6 text-white/60">Loading media...</p> : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {media.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-3xl border border-white/12 bg-white/[0.08]">
            <a href={item.url} target="_blank" rel="noreferrer" className="block bg-black/30">
              {item.mime_type?.startsWith("video/") ? (
                <video src={item.url} controls className="h-72 w-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.thumb_url || item.url} alt={item.file_name} className="h-72 w-full object-cover" />
              )}
            </a>
            <div className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold text-white">{item.file_name}</h2>
                  <p className="mt-1 text-xs text-white/55">
                    {item.size_mb} MB · {item.mime_type || "file"} · {item.uploaded_at ? new Date(item.uploaded_at).toLocaleString() : "No date"}
                  </p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase text-white/70">
                  {item.submission?.status || "submission"}
                </span>
              </div>
              <div className="rounded-2xl bg-black/20 p-3 text-sm text-white/65">
                <p>{item.submission?.reward?.name || "Reward"}</p>
                <p>{item.submission?.task?.name || "Task"}</p>
                <p>{item.submission?.user?.name || "User"} · {item.submission?.team?.name || "Team"}</p>
              </div>
              <button
                onClick={() => removeMedia(item.id)}
                disabled={deleteMutation.isPending}
                className="rounded-full border border-red-300/40 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-red-200 disabled:opacity-60"
              >
                Remove from S3
              </button>
            </div>
          </article>
        ))}
      </div>
    </CommunityShell>
  );
}
