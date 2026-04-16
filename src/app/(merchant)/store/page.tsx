"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
import { getStoreProfile, updateStoreProfile, type UpdateStorePayload } from "@/lib/api/services/merchant.service";

const TIME_OPTS = Array.from({ length: 19 }, (_, i) => {
  const h = i + 6; // 06:00 – 24:00
  const label = h < 24 ? `${String(h).padStart(2, "0")}:00` : "00:00";
  return { value: label, label };
});

export default function StorePage() {
  const { user } = useAuth();
  const branchId = user?.branch_id ?? "";
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["store-profile", branchId],
    queryFn: () => getStoreProfile(branchId),
    enabled: !!branchId,
    select: (res) => res.data,
  });

  const [form, setForm] = useState<UpdateStorePayload>({});
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        store_email: profile.store_email ?? "",
        owner_name: profile.owner_name ?? "",
        owner_mobile_whatsapp: profile.owner_mobile_whatsapp ?? "",
        operating_hours_start: profile.operating_hours_start ?? "09:00",
        operating_hours_end: profile.operating_hours_end ?? "21:00",
      });
    }
  }, [profile]);

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: (payload: UpdateStorePayload) => updateStoreProfile(branchId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["store-profile", branchId] });
      setSaved(true);
      setError(null);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err: Error) => setError(err.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    save(form);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="STORE PROFILE" subtitle="Manage your store details" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="STORE PROFILE" subtitle="Manage your store details" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Read-only info */}
        <Card className="p-4 space-y-3">
          <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">Store Info</h2>
          <InfoRow label="Store Name" value={profile?.name} />
          <InfoRow label="Category" value={profile?.category} />
          <InfoRow label="City" value={profile?.city} />
          <InfoRow label="State" value={profile?.state} />
          <InfoRow label="PIN Code" value={profile?.pin_code} />
        </Card>

        {/* Read-only financial */}
        <Card className="p-4 space-y-3">
          <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">Financial (Admin Only)</h2>
          <InfoRow label="GST Number" value={profile?.gst_number} masked />
          <InfoRow label="PAN Number" value={profile?.pan_number} masked />
          <InfoRow label="Commission" value={profile?.commission_percentage != null ? `${profile.commission_percentage}%` : undefined} />
          <p className="text-xs text-muted-foreground mt-2">Contact support to update financial details.</p>
        </Card>

        {/* Editable form */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Edit Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Owner Name"
                value={form.owner_name ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, owner_name: e.target.value }))}
              />
              <Input
                label="WhatsApp / Mobile"
                type="tel"
                maxLength={10}
                value={form.owner_mobile_whatsapp ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, owner_mobile_whatsapp: e.target.value }))}
              />
              <Input
                label="Store Email"
                type="email"
                value={form.store_email ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, store_email: e.target.value }))}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Opens At</label>
                  <select
                    className="h-9 rounded-md border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                    value={form.operating_hours_start ?? "09:00"}
                    onChange={(e) => setForm((p) => ({ ...p, operating_hours_start: e.target.value }))}
                  >
                    {TIME_OPTS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Closes At</label>
                  <select
                    className="h-9 rounded-md border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                    value={form.operating_hours_end ?? "21:00"}
                    onChange={(e) => setForm((p) => ({ ...p, operating_hours_end: e.target.value }))}
                  >
                    {TIME_OPTS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              {error && <p className="text-xs text-destructive font-mono">{error}</p>}
              {saved && <p className="text-xs text-green-500 font-mono">Saved successfully.</p>}

              <Button type="submit" loading={saving} className="w-full bg-primary hover:bg-primary/90 text-white">
                Save Changes
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, masked }: { label: string; value?: string | null; masked?: boolean }) {
  const display = value
    ? masked
      ? `${value.slice(0, 4)}${"*".repeat(Math.max(0, value.length - 4))}`
      : value
    : "—";

  return (
    <div className="flex justify-between items-center py-1 border-b border-border/50">
      <span className="text-xs text-muted-foreground font-mono">{label}</span>
      <span className={cn("text-xs font-semibold font-mono", !value && "text-muted-foreground")}>{display}</span>
    </div>
  );
}
