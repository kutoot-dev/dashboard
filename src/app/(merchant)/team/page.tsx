"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/auth-provider";
import {
  addManager,
  listManagers,
  removeManager,
  type AssignableStoreRole,
  type StoreTeamMember,
} from "@/lib/api/services/managers.service";

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  manager: "Manager",
  staff: "Staff",
};

export default function TeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<StoreTeamMember[]>([]);
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<AssignableStoreRole>("manager");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isOpsHub = user?.role === "operations_hub";
  const isOwner = user?.store_role === "owner" || isOpsHub;
  const canViewTeam = isOwner;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listManagers();
      if (res.success && Array.isArray(res.data)) {
        setMembers(res.data);
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
    if (canViewTeam) {
      void load();
    } else {
      setLoading(false);
    }
  }, [canViewTeam, load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await addManager({
        mobile,
        name: name.trim() || undefined,
        role,
      });
      if (res.success) {
        setMobile("");
        setName("");
        setRole("manager");
        await load();
      } else {
        setError(res.error?.message ?? "Could not add team member.");
      }
    } catch {
      setError("Could not add team member.");
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
        setError(res.error?.message ?? "Could not remove team member.");
      }
    } catch {
      setError("Could not remove team member.");
    }
  }

  if (!canViewTeam) {
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
          Add team members by mobile number. Each person has their own login account (user profile),
          separate from the store&apos;s merchant profile. Assign a store role per member.
        </p>
      </div>

      {error ? <p className="text-xs text-error">{error}</p> : null}

      {isOwner ? (
        <form onSubmit={handleAdd} className="glass-card space-y-3 rounded-xl border border-border/80 p-4">
          <h2 className="text-sm font-semibold">Add team member</h2>
          <Input
            label="Mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="10-digit mobile"
          />
          <Input
            label="Account name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Personal login name"
          />
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-foreground">Store role</span>
            <select
              className="w-full rounded-lg border border-border/80 bg-background px-3 py-2 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value as AssignableStoreRole)}
            >
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>
          </label>
          <Button type="submit" loading={submitting} disabled={mobile.length !== 10}>
            Add member
          </Button>
        </form>
      ) : null}

      <div className="glass-card rounded-xl border border-border/80 p-4">
        <h2 className="mb-3 text-sm font-semibold">Team</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No team members yet.</p>
        ) : (
          <ul className="space-y-2">
            {members.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">{m.name}</p>
                  <p className="text-muted-foreground">{m.mobile}</p>
                  <p className="text-xs text-muted-foreground">
                    {ROLE_LABELS[m.role] ?? m.role}
                  </p>
                </div>
                {isOwner && m.role !== "owner" ? (
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
