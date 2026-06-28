"use client";

import { FormEvent, useState } from "react";
import { useCommunityAuth } from "@/components/providers/community-auth-provider";

export default function CommunityLoginPage() {
  const { sendOtp, verifyOtp } = useCommunityAuth();
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!otpSent) {
        await sendOtp(identifier);
        setOtpSent(true);
      } else {
        await verifyOtp(identifier, otp);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#8b5cf633,transparent_40%),#131313] p-6">
      <section className="w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-8 shadow-[0_0_60px_rgba(139,92,246,0.25)] backdrop-blur-xl">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.35em] text-[#efff00]">
          CF-01 Community Login
        </p>
        <h1 className="font-[var(--font-brand-display)] text-4xl font-extrabold uppercase leading-none text-white">
          Enter the Live Feed
        </h1>
        <p className="mt-4 text-sm text-white/70">
          Login as a Kutoot user to post updates, polls, marketplace listings, and earn team stamps.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
              Mobile or Email
            </span>
            <input
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              required
              className="mt-2 w-full border-0 border-b border-white/30 bg-transparent px-1 py-3 text-white outline-none focus:border-[#8b5cf6]"
              placeholder="9000000000"
            />
          </label>

          {otpSent && (
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                OTP
              </span>
              <input
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                required
                inputMode="numeric"
                className="mt-2 w-full border-0 border-b border-white/30 bg-transparent px-1 py-3 text-white outline-none focus:border-[#8b5cf6]"
                placeholder="123456"
              />
            </label>
          )}

          {error && (
            <p className="rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#efff00] px-6 py-4 font-bold uppercase tracking-[0.18em] text-black shadow-[6px_6px_0_#8b5cf6] transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? "Please wait..." : otpSent ? "Verify OTP" : "Send OTP"}
          </button>
        </form>
      </section>
    </main>
  );
}
