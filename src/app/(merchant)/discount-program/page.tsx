"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDiscountProgram,
  saveDiscountProgram,
} from "@/lib/api/services/merchant.service";
import {
  DiscountProgramFields,
  serializeDiscountProgramPayload,
  toDiscountProgramFormState,
  type DiscountProgramFormState,
} from "@/components/discount-program/discount-program-fields";
import { useEffectiveBranchId } from "@/lib/hooks/use-effective-branch-id";
import { useToastStore } from "@/lib/stores/toast.store";
import { ApiError } from "@/lib/api/client";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileRowsSkeleton } from "@/components/ui/loading-skeletons";
import { useQuerySkeleton } from "@/lib/hooks/use-query-skeleton";

export default function DiscountProgramPage() {
  const branchId = useEffectiveBranchId();
  const qc = useQueryClient();
  const pushToast = useToastStore((s) => s.push);

  const [form, setForm] = useState<DiscountProgramFormState | null>(null);

  const programQuery = useQuery({
    queryKey: ["discount-program", branchId],
    queryFn: () => getDiscountProgram(branchId),
    enabled: Boolean(branchId),
    retry: false,
  });

  const settings = programQuery.data?.success ? programQuery.data.data : null;
  const showSkeleton = useQuerySkeleton(programQuery);

  useEffect(() => {
    if (settings) {
      setForm(toDiscountProgramFormState(settings));
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: () => saveDiscountProgram(branchId, serializeDiscountProgramPayload(form!)),
    onSuccess: (res) => {
      if (!res.success) {
        pushToast({ variant: "error", title: "Unable to save discount program." });
        return;
      }

      qc.setQueryData(["discount-program", branchId], res);
      setForm(toDiscountProgramFormState(res.data));
      pushToast({ variant: "success", title: "Discount program saved." });
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "Unable to save discount program.";
      pushToast({ variant: "error", title: message });
    },
  });

  const policyCap = settings?.policy_max_discount_percentage;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Discount program"
        subtitle="Configure bill-pay discounts funded by your store. These reduce your settlement — Kutoot does not pay for them."
      />

      {showSkeleton && (
        <Card className="p-4">
          <ProfileRowsSkeleton rows={8} />
        </Card>
      )}

      {!showSkeleton && programQuery.isError && (
        <Card className="p-4 text-sm text-muted-foreground">
          Unable to load discount program settings. Please refresh the page.
        </Card>
      )}

      {!showSkeleton && form && (
        <>
          <DiscountProgramFields
            value={form}
            onChange={setForm}
            policyCap={policyCap}
          />

          <div className="flex justify-end">
            <Button
              type="button"
              loading={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
              disabled={!branchId}
            >
              Save discount program
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
