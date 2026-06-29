"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  EligibleStore,
  RewardSubmission,
  RewardTask,
  RewardTaskField,
  fetchEligibleReviewStores,
  submitRewardTask,
} from "@/lib/api/services/community.service";

type FieldValue = string | number | string[];

const REVIEW_TASKS = new Set(["merchant_review", "specific_merchant_review", "unreviewed_approved_store_review"]);

function fieldsForTask(task: RewardTask): RewardTaskField[] {
  const schema = task.input_schema;
  const configured = Array.isArray(schema) ? schema : schema?.fields;
  if (configured?.length) return configured;

  if (REVIEW_TASKS.has(task.task_type)) {
    return [
      { name: "merchant_location_id", label: "Approved store", type: "merchant_selector", required: true },
      { name: "rating", label: "Rating", type: "rating", required: true },
      { name: "body", label: "Review", type: "textarea", required: true, placeholder: "Share your real store experience" },
    ];
  }

  if (task.task_type === "quiz") {
    return [{ name: "answers", label: "Answers", type: "textarea", required: true, placeholder: "{\"q1\":\"a\"}" }];
  }

  if (task.task_type === "poll") {
    return [{ name: "option_id", label: "Option", type: "select", required: true, options: [] }];
  }

  return [{ name: "proof_text", label: "Proof note", type: "textarea", required: false }];
}

function parseValue(field: RewardTaskField, value: string): FieldValue {
  if (field.type === "number" || field.type === "rating" || field.type === "merchant_selector") {
    return value === "" ? "" : Number(value);
  }
  return value;
}

function storeLabel(store: EligibleStore): string {
  return `${store.store_name || store.branch_name}${store.locality ? ` · ${store.locality}` : ""}${store.city ? `, ${store.city}` : ""}`;
}

export function RewardTaskFlashCard({
  rewardId,
  task,
  onSubmitted,
}: {
  rewardId: number;
  task: RewardTask;
  onSubmitted?: (submission: RewardSubmission) => void;
}) {
  const fields = useMemo(() => fieldsForTask(task), [task]);
  const isReviewTask = REVIEW_TASKS.has(task.task_type);
  const [values, setValues] = useState<Record<string, FieldValue>>({});
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [clientError, setClientError] = useState<string | null>(null);
  const [result, setResult] = useState<RewardSubmission | null>(null);

  const { data: stores = [] } = useQuery({
    queryKey: ["eligible-review-stores"],
    queryFn: () => fetchEligibleReviewStores(),
    enabled: isReviewTask,
  });

  const mutation = useMutation({
    mutationFn: () => {
      const payload = { ...values };
      const proofText = typeof payload.proof_text === "string" ? payload.proof_text : undefined;
      delete payload.proof_text;
      return submitRewardTask(rewardId, task.id, payload, proofText, proofFiles);
    },
    onSuccess: (submission) => {
      setResult(submission);
      onSubmitted?.(submission);
    },
    onError: (error) => {
      setClientError(error instanceof Error ? error.message : "Could not submit task.");
    },
  });

  function updateField(field: RewardTaskField, value: string) {
    setValues((prev) => ({ ...prev, [field.name]: parseValue(field, value) }));
  }

  function updateFiles(event: ChangeEvent<HTMLInputElement>) {
    setProofFiles(Array.from(event.target.files ?? []).slice(0, 6));
  }

  function validate(): string | null {
    for (const field of fields) {
      if (!field.required) continue;
      const value = values[field.name];
      if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
        return `${field.label} is required.`;
      }
    }
    return null;
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = validate();
    setClientError(error);
    if (!error) mutation.mutate();
  }

  return (
    <article className="rounded-3xl border border-white/15 bg-white/[0.08] p-5 shadow-[8px_8px_0_rgba(139,92,246,0.35)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#efff00]">{task.task_type.replace(/_/g, " ")}</p>
          <h2 className="mt-2 text-2xl font-extrabold uppercase text-white">{task.name}</h2>
          {task.description ? <p className="mt-2 text-sm text-white/65">{task.description}</p> : null}
        </div>
        <span className="rounded-full bg-[#efff00] px-3 py-1 text-sm font-extrabold text-black">+{task.stamps}</span>
      </div>

      <form onSubmit={submit} className="mt-5 space-y-4">
        {fields.map((field) => (
          <label key={field.name} className="block">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">
              {field.label}
              {field.required ? " *" : ""}
            </span>
            {field.type === "textarea" ? (
              <textarea
                value={String(values[field.name] ?? "")}
                onChange={(event) => updateField(field, event.target.value)}
                placeholder={field.placeholder}
                className="mt-2 min-h-28 w-full rounded-2xl border border-white/15 bg-black/20 p-3 text-white outline-none focus:border-[#efff00]"
              />
            ) : field.type === "select" ? (
              <select
                value={String(values[field.name] ?? "")}
                onChange={(event) => updateField(field, event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/15 bg-black/30 p-3 text-white outline-none focus:border-[#efff00]"
              >
                <option value="">Choose</option>
                {(field.options ?? []).map((option) => (
                  <option key={String(option.value)} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === "merchant_selector" ? (
              <select
                value={String(values[field.name] ?? "")}
                onChange={(event) => updateField(field, event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/15 bg-black/30 p-3 text-white outline-none focus:border-[#efff00]"
              >
                <option value="">Choose an approved unreviewed store</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {storeLabel(store)}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type === "rating" || field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                min={field.type === "rating" ? 1 : undefined}
                max={field.type === "rating" ? 5 : undefined}
                value={String(values[field.name] ?? "")}
                onChange={(event) => updateField(field, event.target.value)}
                placeholder={field.placeholder}
                className="mt-2 w-full rounded-2xl border border-white/15 bg-black/20 p-3 text-white outline-none focus:border-[#efff00]"
              />
            )}
          </label>
        ))}

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">Proof media</span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            onChange={updateFiles}
            className="mt-2 w-full rounded-2xl border border-dashed border-white/20 bg-black/20 p-3 text-sm text-white"
          />
          <span className="mt-1 block text-xs text-white/45">Up to 6 files. Stored in S3.</span>
        </label>

        {clientError ? <p className="rounded-2xl border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">{clientError}</p> : null}
        {result ? (
          <p className="rounded-2xl border border-[#efff00]/40 bg-[#efff00]/10 p-3 text-sm font-bold text-[#efff00]">
            {result.status === "approved"
              ? `Verified. ${result.stamps_awarded} stamps awarded.`
              : `Submitted for review. Status: ${result.status}.`}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-full bg-[#efff00] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.16em] text-black shadow-[5px_5px_0_#8b5cf6] disabled:opacity-60"
        >
          {mutation.isPending ? "Submitting..." : task.requires_review ? "Submit task" : "Validate and earn"}
        </button>
      </form>
    </article>
  );
}
