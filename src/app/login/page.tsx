"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KutootLogo } from "@/components/branding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/auth-provider";

const TEST_LOGIN_USERNAME = "demo";
const TEST_LOGIN_PASSWORD = "Kutoot@123";

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      return;
    }

    await signIn(username.trim(), password);
  }

  async function handleTestLogin() {
    setUsername(TEST_LOGIN_USERNAME);
    setPassword(TEST_LOGIN_PASSWORD);
    await signIn(TEST_LOGIN_USERNAME, TEST_LOGIN_PASSWORD);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(1200px 500px at 15% 20%, rgba(174,30,63,0.2), transparent 55%), radial-gradient(1000px 450px at 85% 80%, rgba(234,107,30,0.18), transparent 50%)",
        }}
      />

      <section className="glass-card relative z-10 w-full max-w-md p-6 md:p-7">
        <div className="mb-6">
          <KutootLogo size="md" />
          <h1 className="mt-4 font-mono text-lg font-semibold text-foreground">Merchant Panel Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">Use your merchant username and password to continue.</p>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
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

          {error && (
            <p className="rounded-md border border-loss/30 bg-loss/10 px-3 py-2 text-xs text-loss">{error}</p>
          )}

          <Button type="button" variant="secondary" className="w-full" onClick={handleTestLogin} disabled={submitting}>
            Login with Test Credentials
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Test account: <span className="font-mono">{TEST_LOGIN_USERNAME}</span>
          </p>

          <Button type="submit" className="w-full" loading={submitting}>
            {submitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>

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
