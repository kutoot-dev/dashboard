"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KutootLogo } from "@/components/branding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/auth-provider";

const DEMO_MERCHANT_USERNAME = "demo";
const DEMO_OPS_HUB_USERNAME = "demo-ops";
const DEMO_LOGIN_PASSWORD = "Kutoot@123";

type LoginMode = "password" | "otp";

export default function LoginPage() {
  const { login, loginWithOtp, sendLoginOtp, isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<LoginMode>("password");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(user?.requires_basic_details ? "/complete-basic-details" : "/dashboard");
    }
  }, [isAuthenticated, isLoading, router, user?.requires_basic_details]);

  async function signIn(resolvedUsername: string, resolvedPassword: string) {
    setSubmitting(true);
    setError(null);

    try {
      await login(resolvedUsername, resolvedPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      return;
    }

    await signIn(username.trim(), password);
  }

  async function handleSendOtp() {
    if (!/^\d{10}$/.test(mobile)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await sendLoginOtp(mobile);
      setOtpSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send OTP.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await loginWithOtp(mobile, otp);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDemoMerchantLogin() {
    setMode("password");
    setUsername(DEMO_MERCHANT_USERNAME);
    setPassword(DEMO_LOGIN_PASSWORD);
    await signIn(DEMO_MERCHANT_USERNAME, DEMO_LOGIN_PASSWORD);
  }

  async function handleDemoOpsHubLogin() {
    setMode("password");
    setUsername(DEMO_OPS_HUB_USERNAME);
    setPassword(DEMO_LOGIN_PASSWORD);
    await signIn(DEMO_OPS_HUB_USERNAME, DEMO_LOGIN_PASSWORD);
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

      <section className="relative z-10 w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-[0_24px_60px_rgba(5,8,24,0.38)] md:p-7">
        <div className="mb-6">
          <KutootLogo size="md" />
          <h1 className="font-display mt-4 text-xl font-semibold text-foreground">Merchant Panel Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "password"
              ? "Use your merchant username and password to continue."
              : "Store owners and managers can sign in with mobile OTP."}
          </p>
        </div>

        <div className="mb-4 flex gap-2 rounded-lg border border-border/70 p-1">
          <button
            type="button"
            className={`flex-1 rounded-md px-3 py-2 text-xs font-medium ${
              mode === "password" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
            onClick={() => {
              setMode("password");
              setError(null);
            }}
          >
            Username & password
          </button>
          <button
            type="button"
            className={`flex-1 rounded-md px-3 py-2 text-xs font-medium ${
              mode === "otp" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
            onClick={() => {
              setMode("otp");
              setError(null);
              setOtpSent(false);
            }}
          >
            Mobile OTP
          </button>
        </div>

        {mode === "password" ? (
          <form className="space-y-3" onSubmit={handlePasswordSubmit}>
            <Input
              label="Username"
              placeholder="Enter username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={submitting}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />

            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-xs text-accent hover:text-accent/85 underline underline-offset-2"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <p className="rounded-md border border-loss/30 bg-loss/10 px-3 py-2 text-xs text-loss">{error}</p>
            )}

            <div className="grid gap-2 sm:grid-cols-2">
              <Button type="button" variant="secondary" className="w-full" onClick={handleDemoMerchantLogin} disabled={submitting}>
                Demo Merchant
              </Button>
              <Button type="button" variant="secondary" className="w-full" onClick={handleDemoOpsHubLogin} disabled={submitting}>
                Demo Ops Hub
              </Button>
            </div>

            <Button type="submit" className="w-full" loading={submitting}>
              {submitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        ) : (
          <form className="space-y-3" onSubmit={handleOtpSubmit}>
            <Input
              label="Mobile number"
              placeholder="10-digit mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              disabled={submitting}
            />

            {!otpSent ? (
              <Button type="button" className="w-full" onClick={handleSendOtp} loading={submitting} disabled={mobile.length !== 10}>
                Send OTP
              </Button>
            ) : (
              <>
                <Input
                  label="OTP"
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  disabled={submitting}
                />
                <Button type="submit" className="w-full" loading={submitting} disabled={otp.length !== 6}>
                  Verify & sign in
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={handleSendOtp} disabled={submitting}>
                  Resend OTP
                </Button>
              </>
            )}

            {error && (
              <p className="rounded-md border border-loss/30 bg-loss/10 px-3 py-2 text-xs text-loss">{error}</p>
            )}
          </form>
        )}

        <p className="mt-4 text-center text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link href="/merchant-terms" className="text-accent hover:text-accent/85 underline underline-offset-2">
            Terms and Conditions
          </Link>
          {", "}
          <Link href="/privacy-policy" className="text-accent hover:text-accent/85 underline underline-offset-2">
            Privacy Policy
          </Link>
          {" and "}
          <Link href="/data-policy" className="text-accent hover:text-accent/85 underline underline-offset-2">
            Data Policy
          </Link>
          .
        </p>

        <div className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
          <p>New merchant onboarding:</p>
          <Link href="/onboard/start" className="mt-1 inline-flex font-mono text-accent hover:text-accent/85">
            Start Application
          </Link>
        </div>
      </section>
    </main>
  );
}
