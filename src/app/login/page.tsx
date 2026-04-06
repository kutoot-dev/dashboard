"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { KutootLogo } from "@/components/branding";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { semanticClasses } from "@/lib/utils/colors";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setError(err instanceof Error ? err.message : "Login failed");
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
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function fillMerchant() {
    setEmail("merchant@kutoot.com");
    setPassword("password");
    setError(null);
    handleQuickAccess("merchant@kutoot.com", "password");
  }

  function fillAdmin() {
    setEmail("admin@kutoot.com");
    setPassword("password");
    setError(null);
    handleQuickAccess("admin@kutoot.com", "password");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <KutootLogo size="lg" />
          </div>
          <p className="mt-2 font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Merchant Performance Terminal
          </p>
          <div className="mt-4 mx-auto h-px w-16 bg-primary" />
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@kutoot.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <div className={`rounded-md border ${semanticClasses.error.border}/30 ${semanticClasses.error.bgLight} px-3 py-2 font-mono text-xs ${semanticClasses.error.text}`}>
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full bg-primary hover:bg-primary/90 text-white">
              Sign In
            </Button>
          </form>

          <div className="mt-4 border-t border-border pt-4">
            <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Quick Access
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="flex-1 font-mono text-xs"
                onClick={fillMerchant}
              >
                Merchant
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="flex-1 font-mono text-xs"
                onClick={fillAdmin}
              >
                Admin
              </Button>
            </div>
          </div>
        </Card>

        <p className="mt-4 text-center font-mono text-[10px] text-muted-foreground">
          v1.0.0 &middot; <span className="text-primary font-semibold">Powered by Kutoot</span>
        </p>
      </div>
    </div>
  );
}
