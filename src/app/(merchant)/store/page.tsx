"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getStoreProfile, updateStoreProfile, type UpdateStorePayload } from "@/lib/api/services/merchant.service";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/components/providers/auth-provider";
import { useToastStore } from "@/lib/stores/toast.store";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EditableStoreForm {
  store_email: string;
  owner_name: string;
  owner_mobile_whatsapp: string;
  operating_hours_start: string;
  operating_hours_end: string;
}

export default function StorePage() {
  const { user } = useAuth();
  const branchId = user?.branch_id ?? "";
  const pushToast = useToastStore((s) => s.push);

  const [form, setForm] = useState<EditableStoreForm>({
    store_email: "",
    owner_name: "",
    owner_mobile_whatsapp: "",
    operating_hours_start: "",
    operating_hours_end: "",
  });

  const storeQuery = useQuery({
    queryKey: ["store-profile", branchId],
    queryFn: () => getStoreProfile(branchId),
    enabled: Boolean(branchId),
    retry: false,
  });

  useEffect(() => {
    if (!storeQuery.data?.success) return;

    const profile = storeQuery.data.data;
    setForm({
      store_email: profile.store_email ?? "",
      owner_name: profile.owner_name ?? "",
      owner_mobile_whatsapp: profile.owner_mobile_whatsapp ?? "",
      operating_hours_start: profile.operating_hours_start ?? "",
      operating_hours_end: profile.operating_hours_end ?? "",
    });
  }, [storeQuery.data]);

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateStorePayload) => updateStoreProfile(branchId, payload),
    onSuccess: () => {
      storeQuery.refetch();
      pushToast({ title: "Store profile updated", variant: "success" });
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Unable to update store profile";
      pushToast({ title: "Update failed", description: message, variant: "error" });
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    updateMutation.mutate({
      store_email: form.store_email || undefined,
      owner_name: form.owner_name || undefined,
      owner_mobile_whatsapp: form.owner_mobile_whatsapp || undefined,
      operating_hours_start: form.operating_hours_start || undefined,
      operating_hours_end: form.operating_hours_end || undefined,
    });
  }

  const profile = storeQuery.data?.success ? storeQuery.data.data : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Store Settings"
        subtitle="Manage branch profile details used across merchant listings and invoices."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Editable details</p>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <Input
              label="Store email"
              type="email"
              value={form.store_email}
              onChange={(e) => setForm((prev) => ({ ...prev, store_email: e.target.value }))}
            />
            <Input
              label="Owner name"
              value={form.owner_name}
              onChange={(e) => setForm((prev) => ({ ...prev, owner_name: e.target.value }))}
            />
            <Input
              label="Owner WhatsApp mobile"
              value={form.owner_mobile_whatsapp}
              onChange={(e) => setForm((prev) => ({ ...prev, owner_mobile_whatsapp: e.target.value }))}
            />

            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="Operating start"
                type="time"
                value={form.operating_hours_start}
                onChange={(e) => setForm((prev) => ({ ...prev, operating_hours_start: e.target.value }))}
              />
              <Input
                label="Operating end"
                type="time"
                value={form.operating_hours_end}
                onChange={(e) => setForm((prev) => ({ ...prev, operating_hours_end: e.target.value }))}
              />
            </div>

            <Button type="submit" className="w-full" loading={updateMutation.isPending}>
              Save profile
            </Button>
          </form>
        </Card>

        <Card className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Read-only compliance data</p>

          {!profile && storeQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Loading profile...</p>
          )}

          {profile && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Store name</span>
                <span className="font-medium text-foreground">{profile.name || "--"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Address</span>
                <span className="text-right font-medium text-foreground">{profile.address || "--"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">City / State</span>
                <span className="font-medium text-foreground">
                  {[profile.city, profile.state].filter(Boolean).join(", ") || "--"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">PIN code</span>
                <span className="font-medium text-foreground">{profile.pin_code || "--"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">GST number</span>
                <span className="font-medium text-foreground">{profile.gst_number || "--"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">PAN number</span>
                <span className="font-medium text-foreground">{profile.pan_number || "--"}</span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
