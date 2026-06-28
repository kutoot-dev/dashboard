"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CommunityShell } from "@/components/community/community-shell";
import {
  boostCommunityPost,
  commentCommunityPost,
  fetchCommunityPost,
  likeCommunityPost,
  reportCommunityPost,
  startCommunityConversation,
  voteCommunityPoll,
} from "@/lib/api/services/community.service";

export default function CommunityPostDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [reportReason, setReportReason] = useState("spam");
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  const query = useQuery({
    queryKey: ["community-post", params.id],
    queryFn: () => fetchCommunityPost(params.id),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["community-post", params.id] });
  const likeMutation = useMutation({ mutationFn: () => likeCommunityPost(params.id), onSuccess: invalidate });
  const commentMutation = useMutation({
    mutationFn: () => commentCommunityPost(params.id, comment),
    onSuccess: () => {
      setComment("");
      invalidate();
    },
  });
  const reportMutation = useMutation({ mutationFn: () => reportCommunityPost(params.id, reportReason), onSuccess: invalidate });
  const voteMutation = useMutation({ mutationFn: () => voteCommunityPoll(params.id, selectedOptions), onSuccess: invalidate });
  const boostMutation = useMutation({ mutationFn: () => boostCommunityPost(params.id), onSuccess: invalidate });
  const chatMutation = useMutation({
    mutationFn: () => startCommunityConversation(params.id),
    onSuccess: (conversation) => router.push(`/community/conversations/${conversation.id}`),
  });

  const post = query.data;

  return (
    <CommunityShell>
      {!post ? (
        <p className="text-white/60">Loading post...</p>
      ) : (
        <article className="rounded-3xl border border-white/12 bg-white/[0.08] p-6 backdrop-blur-xl">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-[#efff00]">
            CF-03 Post Detail
          </p>
          <h1 className="mt-3 font-[var(--font-brand-display)] text-4xl font-extrabold uppercase text-white">
            {post.title || "Untitled"}
          </h1>
          <p className="mt-4 whitespace-pre-wrap text-white/75">{post.body}</p>

          {post.poll && (
            <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="font-bold text-white">{post.poll.question}</p>
              <div className="mt-3 grid gap-2">
                {post.poll.options.map((option) => (
                  <label key={option.id} className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
                    <input
                      type={post.poll?.allow_multiple ? "checkbox" : "radio"}
                      name="poll"
                      onChange={(event) => {
                        setSelectedOptions((current) =>
                          post.poll?.allow_multiple
                            ? event.target.checked
                              ? [...current, option.id]
                              : current.filter((id) => id !== option.id)
                            : [option.id],
                        );
                      }}
                    />
                    <span>{option.label}</span>
                    <span className="ml-auto text-white/50">{option.votes_count}</span>
                  </label>
                ))}
              </div>
              <button onClick={() => voteMutation.mutate()} className="mt-4 rounded-full bg-[#efff00] px-5 py-3 text-xs font-bold uppercase text-black">
                CF-05 Vote
              </button>
            </section>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => likeMutation.mutate()} className="rounded-full bg-[#8b5cf6] px-5 py-3 text-xs font-bold uppercase text-white">
              {post.liked_by_me ? "Unlike" : "Like"} ({post.counts.likes})
            </button>
            {(post.type === "marketplace" || post.type === "service_request") && (
              <button onClick={() => chatMutation.mutate()} className="rounded-full bg-[#ff5f00] px-5 py-3 text-xs font-bold uppercase text-black">
                {post.type === "marketplace" ? "CF-06 Chat" : "CF-07 Chat"}
              </button>
            )}
            {(post.type === "marketplace" || post.type === "event") && (
              <button onClick={() => boostMutation.mutate()} className="rounded-full bg-[#efff00] px-5 py-3 text-xs font-bold uppercase text-black">
                CF-09 Boost
              </button>
            )}
          </div>

          <section className="mt-8 grid gap-4 md:grid-cols-2">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                commentMutation.mutate();
              }}
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-white/60">Comment</p>
              <textarea value={comment} onChange={(event) => setComment(event.target.value)} className="min-h-28 w-full rounded-xl bg-white/10 p-3 text-white outline-none" required />
              <button className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase text-black">Post Comment</button>
            </form>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                reportMutation.mutate();
              }}
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-white/60">Report</p>
              <select value={reportReason} onChange={(event) => setReportReason(event.target.value)} className="w-full rounded-xl bg-black/40 p-3 text-white">
                <option value="spam">Spam</option>
                <option value="misbehavior">Misbehavior</option>
                <option value="illegal">Illegal</option>
                <option value="unsafe">Unsafe</option>
                <option value="other">Other</option>
              </select>
              <button className="mt-3 rounded-full bg-red-400 px-4 py-2 text-xs font-bold uppercase text-black">Send Report</button>
            </form>
          </section>
        </article>
      )}
    </CommunityShell>
  );
}
