"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { CommunityShell } from "@/components/community/community-shell";
import { createCommunityPost } from "@/lib/api/services/community.service";

export default function CreateCommunityPostPage() {
  const router = useRouter();
  const [type, setType] = useState("update");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [pollOptions, setPollOptions] = useState("Yes\nNo");
  const [price, setPrice] = useState("");
  const [eventAt, setEventAt] = useState("");
  const [location, setLocation] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");

  const mutation = useMutation({
    mutationFn: createCommunityPost,
    onSuccess: (post) => router.push(`/community/posts/${post.id}`),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData();
    form.set("type", type);
    form.set("title", title);
    form.set("body", body);
    tags.split(",").map((tag) => tag.trim()).filter(Boolean).forEach((tag, index) => form.append(`tags[${index}]`, tag));

    if (type === "poll") {
      form.set("poll[question]", title || "Community poll");
      pollOptions.split("\n").map((option) => option.trim()).filter(Boolean).forEach((option, index) => form.append(`poll[options][${index}]`, option));
    }
    if (type === "event") {
      form.set("event[event_at]", eventAt);
      form.set("event[location]", location);
    }
    if (type === "marketplace") {
      form.set("marketplace[price]", price);
      form.set("marketplace[currency]", "INR");
    }
    if (type === "service_request") {
      form.set("service_request[budget_min]", budgetMin);
      form.set("service_request[budget_max]", budgetMax);
      form.set("service_request[currency]", "INR");
    }

    const input = event.currentTarget.elements.namedItem("media") as HTMLInputElement | null;
    Array.from(input?.files ?? []).forEach((file) => form.append("media[]", file));
    mutation.mutate(form);
  }

  return (
    <CommunityShell>
      <section className="rounded-3xl border border-white/12 bg-white/[0.08] p-6 backdrop-blur-xl">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-[#efff00]">CF-04 Create Post</p>
        <h1 className="mt-3 font-[var(--font-brand-display)] text-4xl font-extrabold uppercase text-white">Start an action</h1>
        <form onSubmit={submit} className="mt-8 grid gap-5">
          <select value={type} onChange={(event) => setType(event.target.value)} className="rounded-2xl bg-black/40 p-4 text-white">
            <option value="update">Local Update</option>
            <option value="safety_alert">Safety Alert</option>
            <option value="poll">Poll</option>
            <option value="event">Event</option>
            <option value="marketplace">Marketplace</option>
            <option value="service_request">Service Request</option>
          </select>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" className="rounded-2xl bg-white/10 p-4 text-white outline-none" />
          <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="What is happening?" className="min-h-36 rounded-2xl bg-white/10 p-4 text-white outline-none" />
          <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Tags, comma separated: rain, news, alert" className="rounded-2xl bg-white/10 p-4 text-white outline-none" />
          <input name="media" type="file" multiple className="rounded-2xl bg-white/10 p-4 text-white" />

          {type === "poll" && <textarea value={pollOptions} onChange={(event) => setPollOptions(event.target.value)} className="min-h-28 rounded-2xl bg-white/10 p-4 text-white outline-none" placeholder="One poll option per line" />}
          {type === "event" && (
            <div className="grid gap-4 md:grid-cols-2">
              <input type="datetime-local" value={eventAt} onChange={(event) => setEventAt(event.target.value)} className="rounded-2xl bg-white/10 p-4 text-white outline-none" />
              <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Event location" className="rounded-2xl bg-white/10 p-4 text-white outline-none" />
            </div>
          )}
          {type === "marketplace" && <input value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Price" className="rounded-2xl bg-white/10 p-4 text-white outline-none" />}
          {type === "service_request" && (
            <div className="grid gap-4 md:grid-cols-2">
              <input value={budgetMin} onChange={(event) => setBudgetMin(event.target.value)} placeholder="Budget min" className="rounded-2xl bg-white/10 p-4 text-white outline-none" />
              <input value={budgetMax} onChange={(event) => setBudgetMax(event.target.value)} placeholder="Budget max" className="rounded-2xl bg-white/10 p-4 text-white outline-none" />
            </div>
          )}

          <button className="rounded-full bg-[#efff00] px-6 py-4 font-bold uppercase tracking-[0.18em] text-black shadow-[6px_6px_0_#8b5cf6]">
            {mutation.isPending ? "Posting..." : "Publish"}
          </button>
        </form>
      </section>
    </CommunityShell>
  );
}
