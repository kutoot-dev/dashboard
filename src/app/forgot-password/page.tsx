"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { KutootLogo } from "@/components/branding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestMerchantPasswordResetOtp, resetMerchantPasswordWithOtp } from "@/lib/api/services/auth.service";

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const [username, setUsername] = useState(searchParams.get("username") ?? "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSendOtp() {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setErrorMessage("Please enter your username.");
      setSuccessMessage(null);
      return;
    }

    setSendingOtp(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await requestMerchantPasswordResetOtp(trimmedUsername);

      if (response.success) {
        setSuccessMessage("OTP sent to your registered mobile number.");
        return;
      }

      setErrorMessage(response.error?.message ?? "Could not send OTP.");
    } catch {
      setErrorMessage("Could not send OTP.");
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setErrorMessage("Please enter your username.");
      setSuccessMessage(null);
      return;
    }

    if (!otp.trim()) {
      setErrorMessage("Please enter OTP.");
      setSuccessMessage(null);
      return;
    }

    if (!password || !confirmPassword) {
      setErrorMessage("Please enter and confirm your new password.");
      setSuccessMessage(null);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setSuccessMessage(null);
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await resetMerchantPasswordWithOtp({
        username: trimmedUsername,
        otp: otp.trim(),
        password,
        password_confirmation: confirmPassword,
      });

      if (response.success) {
        setSuccessMessage("Password reset successful. You can now login with your new password.");
        return;
      }

      setErrorMessage(response.error?.message ?? "Could not reset password.");
    } catch {
      setErrorMessage("Could not reset password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(1250px 540px at 12% 18%, rgba(139,92,246,0.34), transparent 58%), radial-gradient(1040px 500px at 88% 82%, rgba(255,111,97,0.26), transparent 52%), radial-gradient(940px 430px at 50% 100%, rgba(34,211,238,0.22), transparent 60%)",
        }}
      />

      <section className="glass-card relative z-10 w-full max-w-md border border-border/80 p-6 shadow-[0_24px_60px_rgba(5,8,28,0.38)] md:p-7">
        <div className="mb-6">
          <KutootLogo size="md" />
          <h1 className="font-display mt-4 text-xl font-semibold text-foreground">Reset Merchant Password</h1>
          <p className="mt-1 text-sm text-muted-foreground">Use username + mobile OTP to set a new password.</p>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input
            label="Username"
            placeholder="Enter username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={submitting || sendingOtp}
          />

          <Button type="button" variant="secondary" className="w-full" onClick={handleSendOtp} disabled={submitting || sendingOtp}>
            {sendingOtp ? "Sending OTP..." : "Send OTP"}
          </Button>

          <Input
            label="OTP"
            placeholder="Enter 6-digit OTP"
            autoComplete="one-time-code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            disabled={submitting}
          />

          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm new password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={submitting}
          />

          {successMessage && (
            <p className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-xs text-success">{successMessage}</p>
          )}

          {errorMessage && (
            <p className="rounded-md border border-loss/30 bg-loss/10 px-3 py-2 text-xs text-loss">{errorMessage}</p>
          )}

          <Button type="submit" className="w-full" loading={submitting}>
            {submitting ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Remembered your password?{" "}
          <Link href="/login" className="text-accent hover:text-accent/85 underline underline-offset-2">
            Back to login
          </Link>
        </p>
      </section>
    </main>
  );
}
