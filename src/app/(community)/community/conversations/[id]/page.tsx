"use client";

import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CommunityShell } from "@/components/community/community-shell";
import {
  fetchCommunityMessages,
  sendCommunityMessage,
} from "@/lib/api/services/community.service";

export default function CommunityConversationDetailPage() {
  const params = useParams<{ id: string }>();
  const [body, setBody] = useState("");
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["community-messages", params.id],
    queryFn: () => fetchCommunityMessages(params.id),
  });
  const mutation = useMutation({
    mutationFn: () => sendCommunityMessage(params.id, body),
    onSuccess: () => {
      setBody("");
      queryClient.invalidateQueries({ queryKey: ["community-messages", params.id] });
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <CommunityShell>
      <section className="rounded-3xl border border-white/12 bg-white/[0.08] p-6 backdrop-blur-xl">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-[#efff00]">CF-08 Chat</p>
        <h1 className="mt-3 font-[var(--font-brand-display)] text-4xl font-extrabold uppercase text-white">Conversation</h1>
      </section>
      <div className="mt-6 min-h-[50vh] space-y-3 rounded-3xl border border-white/12 bg-black/20 p-5">
        {(query.data ?? []).slice().reverse().map((message) => (
          <div key={message.id} className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#efff00]">{message.sender?.name || "User"}</p>
            <p className="mt-2 text-white">{message.body}</p>
          </div>
        ))}
      </div>
      <form onSubmit={submit} className="mt-4 flex gap-3">
        <input value={body} onChange={(event) => setBody(event.target.value)} className="flex-1 rounded-full bg-white/10 px-5 py-4 text-white outline-none" placeholder="Type your message" required />
        <button className="rounded-full bg-[#efff00] px-6 py-4 font-bold uppercase text-black">Send</button>
      </form>
    </CommunityShell>
  );
}
