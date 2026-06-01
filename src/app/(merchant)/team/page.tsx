"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/auth-provider";
import {
  addManager,
  listManagers,
  removeManager,
  type StoreManager,
} from "@/lib/api/services/managers.service";

export default function TeamPage() {
  const { user } = useAuth();
  const [managers, setManagers] = useState<StoreManager[]>([]);
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isOwner = user?.store_role === "owner";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listManagers();
      if (res.success && Array.isArray(res.data)) {
        setManagers(res.data);
      } else {
        setError(res.error?.message ?? "Could not load team.");
      }
    } catch {
      setError("Could not load team.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOwner || user?.store_role === "manager") {
      void load();
    } else {
      setLoading(false);
    }
  }, [isOwner, user?.store_role, load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await addManager({ mobile, name: name.trim() || undefined });
      if (res.success) {
        setMobile("");
        setName("");
        await load();
      } else {
        setError(res.error?.message ?? "Could not add manager.");
      }
    } catch {
      setError("Could not add manager.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: number) {
    setError(null);
    try {
      const res = await removeManager(id);
      if (res.success) {
        await load();
      } else {
        setError(res.error?.message ?? "Could not remove manager.");
      }
    } catch {
      setError("Could not remove manager.");
    }
  }

  if (!isOwner && user?.store_role !== "manager") {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">You do not have access to team management.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-foreground">Store team</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add store managers by mobile number. They can log in with OTP (no password required).
        </p>
      </div>

      {error ? <p className="text-xs text-error">{error}</p> : null}

      {isOwner ? (
        <form onSubmit={handleAdd} className="glass-card space-y-3 rounded-xl border border-border/80 p-4">
          <h2 className="text-sm font-semibold">Add store manager</h2>
          <Input
            label="Mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="10-digit mobile"
          />
          <Input
            label="Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Manager name"
          />
          <Button type="submit" loading={submitting} disabled={mobile.length !== 10}>
            Add manager
          </Button>
        </form>
      ) : null}

      <div className="glass-card rounded-xl border border-border/80 p-4">
        <h2 className="mb-3 text-sm font-semibold">Managers</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : managers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No managers added yet.</p>
        ) : (
          <ul className="space-y-2">
            {managers.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">{m.name}</p>
                  <p className="text-muted-foreground">{m.mobile}</p>
                </div>
                {isOwner ? (
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleRemove(m.id)}>
                    Remove
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
