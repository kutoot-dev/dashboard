"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCheckPhone } from "@/lib/hooks";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";

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

  const goResume = () => {
    const query = cleanPhone.length === 10 ? `?from=start&phone=${cleanPhone}` : "?from=start";
    router.push(`/onboard/resume${query}`);
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

        reset();
        updateFormData({ phone: cleanPhone });
        router.push("/onboard?mode=new");
      },
      onError: () => setError("Failed to verify mobile number. Please try again."),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Start Onboarding</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose whether you want to create a new application or resume an existing one.
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <h3 className="font-semibold text-foreground">New Application</h3>
        <p className="text-xs text-muted-foreground">
          Mobile number is unique across applications. We will first verify your number.
        </p>
        <div className="flex gap-2">
          <div className="flex items-center px-3 bg-card border border-border rounded-md text-sm text-muted-foreground">
            +91
          </div>
          <Input
            placeholder="9876543210"
            value={cleanPhone}
            onChange={(e) => setMobile(e.target.value)}
            maxLength={10}
            inputMode="numeric"
          />
        </div>

        {error && <p className="text-xs text-error">{error}</p>}

        {existsMessage && (
          <div className="rounded-md border border-warning/40 bg-warning/5 px-3 py-2">
            <p className="text-xs text-foreground">{existsMessage}</p>
            {existingAppId && (
              <p className="text-xs text-muted-foreground mt-1">
                Application ID: <span className="font-mono">{existingAppId}</span>
              </p>
            )}
            <button
              type="button"
              className="mt-2 text-xs text-primary underline"
              onClick={goResume}
            >
              Resume existing application
            </button>
          </div>
        )}

        <Button
          variant="primary"
          onClick={startNew}
          loading={checkPhone.isPending}
        >
          Continue with New Application
        </Button>
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="font-semibold text-foreground">Resume Existing Application</h3>
        <p className="text-xs text-muted-foreground">
          If you have already started or submitted an application, continue from where you left off.
        </p>
        <Button variant="ghost" onClick={goResume}>
          Resume Application
        </Button>
      </Card>
    </div>
  );
}
