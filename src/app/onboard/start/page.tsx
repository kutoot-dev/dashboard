"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCheckPhone } from "@/lib/hooks";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { cn } from "@/lib/utils/cn";

const cardClass =
  "glass-card-transparent rounded-2xl p-5 sm:p-6 space-y-4 transition-shadow hover:shadow-lg";

export default function OnboardStartPage() {
  const router = useRouter();
  const checkPhone = useCheckPhone();
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [existsMessage, setExistsMessage] = useState<string | null>(null);
  const [existingAppId, setExistingAppId] = useState<string | null>(null);

  const reset = useOnboardingStore((s) => s.reset);
  const updateFormData = useOnboardingStore((s) => s.updateFormData);

  const cleanPhone = useMemo(
    () => mobile.replace(/\D/g, "").slice(0, 10),
    [mobile],
  );
  const referralCode = useMemo(() => {
    if (typeof window === "undefined") return "";
    return (new URLSearchParams(window.location.search).get("referral_code") ?? "")
      .trim()
      .toUpperCase();
  }, []);

  const proceedToNewApplication = () => {
    reset();
    updateFormData({ phone: cleanPhone });
    const params = new URLSearchParams({ mode: "new" });
    if (referralCode) params.set("referral_code", referralCode);
    router.push(`/onboard?${params.toString()}`);
  };

  const goResume = () => {
    const params = new URLSearchParams({ from: "start" });
    if (cleanPhone.length === 10) params.set("phone", cleanPhone);
    if (referralCode) params.set("referral_code", referralCode);
    router.push(`/onboard/resume?${params.toString()}`);
  };

  const startNew = () => {
    if (cleanPhone.length !== 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    setError(null);
    setExistsMessage(null);
    setExistingAppId(null);

    checkPhone.mutate(cleanPhone, {
      onSuccess: (res) => {
        if (res.data.exists) {
          setExistsMessage(res.data.message || "An application already exists for this mobile number.");
          setExistingAppId(res.data.application_id ?? null);
          return;
        }

        proceedToNewApplication();
      },
      onError: () => setError("Failed to verify mobile number. Please try again."),
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Start Onboarding
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Choose whether you want to create a new application or resume an existing one.
        </p>
        <div className="mt-4 h-px w-16 bg-linear-to-r from-transparent via-primary to-transparent" />
      </div>

      <div className={cn(cardClass)}>
        <h3 className="font-semibold text-foreground">New Application</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Mobile number is unique across applications. We will first verify your number.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <div className="flex shrink-0 items-center justify-center rounded-lg border border-border/80 bg-background/40 px-3 py-2.5 text-sm text-muted-foreground backdrop-blur-sm sm:py-2">
            +91
          </div>
          <Input
            placeholder="9876543210"
            value={cleanPhone}
            onChange={(e) => setMobile(e.target.value)}
            maxLength={10}
            inputMode="numeric"
            className="min-h-11 flex-1"
          />
        </div>

        {error && <p className="text-xs text-error">{error}</p>}

        {existsMessage && (
          <div className="rounded-lg border border-warning/40 bg-warning/5 px-3 py-2.5">
            <p className="text-xs text-foreground">{existsMessage}</p>
            {existingAppId && (
              <p className="mt-1 text-xs text-muted-foreground">
                Application ID: <span className="font-mono">{existingAppId}</span>
              </p>
            )}
            <button
              type="button"
              className="mt-2 text-xs font-medium text-primary underline underline-offset-2"
              onClick={goResume}
            >
              Resume existing application
            </button>
            <button
              type="button"
              className="mt-2 block text-xs font-medium text-accent underline underline-offset-2"
              onClick={proceedToNewApplication}
            >
              Continue with a new application (Field Executive)
            </button>
          </div>
        )}

        <Button
          variant="primary"
          className="mt-1 min-h-11 w-full sm:w-auto"
          onClick={startNew}
          loading={checkPhone.isPending}
        >
          Continue with New Application
        </Button>
      </div>

      <div className={cn(cardClass)}>
        <h3 className="font-semibold text-foreground">Resume Existing Application</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">
          If you have already started or submitted an application, continue from where you left off.
        </p>
        <Button variant="ghost" className="min-h-11 w-full sm:w-auto" onClick={goResume}>
          Resume Application
        </Button>
      </div>
    </div>
  );
}
