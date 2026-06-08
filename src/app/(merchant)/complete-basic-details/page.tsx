"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MerchantBasicDetails } from "@/components/onboarding/merchant-basic-details";
import { useAuth } from "@/components/providers/auth-provider";
import { getPanelBasicDetails } from "@/lib/api/services/merchant.service";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { useEffectiveBranchId } from "@/lib/hooks/use-effective-branch-id";

export default function CompleteBasicDetailsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const branchId = useEffectiveBranchId();
  const { updateFormData, reset } = useOnboardingStore();

  const detailsQuery = useQuery({
    queryKey: ["panel-basic-details", branchId],
    queryFn: () => getPanelBasicDetails(branchId!),
    enabled: Boolean(branchId),
  });

  useEffect(() => {
    if (!authLoading && user && !user.requires_basic_details) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const form = detailsQuery.data?.data?.form;
    if (!form) {
      return;
    }

    reset();
    updateFormData({
      channel: "merchant",
      legal_name: form.legal_name,
      shop_name: form.shop_name,
      sector_id: form.sector_id,
      sector_name: form.sector_name ?? "",
      owner_name: form.owner_name,
      owner_email: form.owner_email ?? "",
      owner_email_verified: form.owner_email_verified ?? false,
      phone: form.phone,
      merchant_phone_verified: true,
      merchant_otp_phone: form.merchant_otp_phone ?? form.phone,
      referral_code: form.referral_code ?? "",
      commission_rate: form.commission_rate,
      commission_model: "flat",
      minimum_commission_percentage: null,
      storefront_photo_url: form.storefront_photo_url ?? null,
      storefront_photo_urls: form.storefront_photo_urls ?? [],
      storefront_photo_status:
        form.storefront_photo_status === "uploaded" ? "uploaded" : "pending",
      locality: form.locality ?? "",
      city: form.city ?? "",
      state: form.state ?? "",
      pin_code: form.pin_code ?? "",
      gps_lat: form.gps_lat,
      gps_long: form.gps_long,
      gps_accuracy: form.gps_accuracy ?? null,
    });
  }, [detailsQuery.data, reset, updateFormData]);

  if (authLoading || detailsQuery.isLoading) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-2xl items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Loading your profile…</p>
      </main>
    );
  }

  if (!branchId) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-sm text-loss">No store linked to this account.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <MerchantBasicDetails
        mode="panel"
        branchId={branchId}
        onBack={() => router.push("/login")}
        onComplete={() => router.replace("/dashboard")}
      />
    </main>
  );
}
