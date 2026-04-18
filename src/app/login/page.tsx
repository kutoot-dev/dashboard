"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { KutootLogo } from "@/components/branding";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { semanticClasses } from "@/lib/utils/colors";
import { LOGIN, COMMON } from "@/lib/constants/strings";

const DEMO_ACCOUNTS = [
  { label: "Kutoot Demo Store", email: "demo@kutoot.test" },
];

const DEMO_PASSWORD = "Kutoot@123";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : LOGIN.ERROR_DEFAULT);
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickAccess(quickEmail: string) {
    setError(null);
    setLoading(true);
    try {
      await login(quickEmail, DEMO_PASSWORD);
    } catch (err) {
      setError(err instanceof Error ? err.message : LOGIN.ERROR_DEFAULT);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-background" />
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <KutootLogo size="lg" />
          </div>
          <p className="mt-2 font-mono text-xs tracking-widest text-muted-foreground uppercase">
            {LOGIN.TITLE}
          </p>
          <div className="mt-4 mx-auto h-px w-16 bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>

        {/* Login card — glass */}
        <div className="glass-card p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={LOGIN.EMAIL_LABEL}
              type="email"
              placeholder={LOGIN.EMAIL_PLACEHOLDER}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-xs font-medium text-muted-foreground">
                  {LOGIN.PASSWORD_LABEL}
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-[11px] font-medium text-primary hover:underline"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder={LOGIN.PASSWORD_PLACEHOLDER}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className={`rounded-md border ${semanticClasses.error.border}/30 ${semanticClasses.error.bgLight} px-3 py-2 font-mono text-xs ${semanticClasses.error.text}`}>
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full bg-primary hover:bg-primary/90 text-white">
              {LOGIN.SIGN_IN}
            </Button>
          </form>

          {/* Quick access demo accounts */}
          <div className="mt-6 border-t border-glass-border pt-4">
            <p className="mb-3 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {LOGIN.QUICK_ACCESS}
            </p>

            <p className="mb-1.5 font-mono text-[10px] text-accent uppercase tracking-wider">Demo Merchant</p>
            <div className="grid grid-cols-1 gap-1.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickAccess(acc.email)}
                  disabled={loading}
                  className="glass-card-sm flex items-center gap-2 px-3 py-2 text-left transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[10px] font-bold text-accent">
                    {acc.label.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs text-foreground">{acc.label}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{acc.email}</p>
                  </div>
                  <svg className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>

            <p className="mt-3 text-center font-mono text-[10px] text-muted-foreground">
              Seed the demo merchant with <span className="text-accent">php artisan demo:seed</span>. Password: <span className="text-accent">{DEMO_PASSWORD}</span>
            </p>
          </div>
        </div>

        <p className="mt-4 text-center font-mono text-[10px] text-muted-foreground">
          {COMMON.VERSION} &middot; <span className="text-primary font-semibold">{COMMON.POWERED_BY}</span>
        </p>
      </div>
    </div>
  );
}
