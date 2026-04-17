"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { KutootLogo } from "@/components/branding";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { semanticClasses } from "@/lib/utils/colors";
import { LOGIN, COMMON } from "@/lib/constants/strings";

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
      // auth-provider handles redirect based on role
    } catch (err) {
      setError(err instanceof Error ? err.message : LOGIN.ERROR_DEFAULT);
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickAccess(quickEmail: string, quickPassword: string) {
    setError(null);
    setLoading(true);
    try {
      await login(quickEmail, quickPassword);
      // auth-provider handles redirect based on role
    } catch (err) {
      setError(err instanceof Error ? err.message : LOGIN.ERROR_DEFAULT);
    } finally {
      setLoading(false);
    }
  }

  function fillBranch() {
    setEmail("haldirams.chandni-chowk@kutoot.com");
    setPassword("Test@1234");
    setError(null);
    handleQuickAccess("haldirams.chandni-chowk@kutoot.com", "Test@1234");
  }

  function fillHO() {
    setEmail("bikanervala@kutoot.com");
    setPassword("Test@1234");
    setError(null);
    handleQuickAccess("bikanervala@kutoot.com", "Test@1234");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <KutootLogo size="lg" />
          </div>
          <p className="mt-2 font-mono text-xs tracking-widest text-muted-foreground uppercase">
            {LOGIN.TITLE}
          </p>
          <div className="mt-4 mx-auto h-px w-16 bg-primary" />
        </div>

        <Card className="p-6">
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

          <div className="mt-4 border-t border-border pt-4">
            <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {LOGIN.QUICK_ACCESS}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="flex-1 font-mono text-xs"
                onClick={fillBranch}
              >
                {LOGIN.QUICK_BRANCH}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="flex-1 font-mono text-xs"
                onClick={fillHO}
              >
                {LOGIN.QUICK_HO}
              </Button>
            </div>
            <p className="mt-3 text-center font-mono text-[10px] text-muted-foreground">
              Branch: haldirams.chandni-chowk@kutoot.com / Test@1234 · HO: bikanervala@kutoot.com / Test@1234
            </p>
            <p className="mt-1 text-center font-mono text-[10px] text-muted-foreground">
              Admin login is only on Kutoot Filament at /admin
            </p>
          </div>
        </Card>

        <p className="mt-4 text-center font-mono text-[10px] text-muted-foreground">
          {COMMON.VERSION} &middot; <span className="text-primary font-semibold">{COMMON.POWERED_BY}</span>
        </p>
      </div>
    </div>
  );
}
