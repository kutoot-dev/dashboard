"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OtpInput } from "@/components/onboarding/otp-input";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { useSendOtp, useVerifyOtp, useVerifyExecutive } from "@/lib/hooks";
import {
  ONBOARDING_STRINGS,
  VALIDATION_RULES,
} from "@/lib/constants/onboarding";
import { onboardingService } from "@/lib/api/services";

type ResumeMode = "select" | "merchant" | "executive";
type MerchantStep = "phone" | "otp";

export default function ResumePage() {
  const router = useRouter();
  const [mode, setMode] = useState<ResumeMode>("select");
  const [merchantStep, setMerchantStep] = useState<MerchantStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();
  const verifyExec = useVerifyExecutive();
  const loadFromApplication = useOnboardingStore((s) => s.loadFromApplication);

  const handleSendOtp = () => {
    if (!VALIDATION_RULES.phone.pattern.test(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setError(null);
    sendOtp.mutate(phone, {
      onSuccess: () => setMerchantStep("otp"),
      onError: () => setError("Failed to send OTP. Try again."),
    });
  };

  const handleVerifyOtp = (otp: string) => {
    setError(null);
    verifyOtp.mutate(
      { phone, otp },
      {
        onSuccess: async () => {
          // Fetch the application for this phone
          await loadApplication(phone);
        },
        onError: () => setError("Invalid OTP. Try again."),
      },
    );
  };

  const handleExecResume = () => {
    if (!VALIDATION_RULES.employee_code.pattern.test(employeeCode)) {
      setError("Enter a valid employee code (4-8 alphanumeric).");
      return;
    }
    setError(null);
    verifyExec.mutate(employeeCode, {
      onSuccess: async (res) => {
        if (!res.data.valid) {
          setError(res.data.message || "Invalid employee code.");
          return;
        }
        // Fetch applications by executive — load most recent draft
        await loadApplicationByExec(res.data.exec_id || "");
      },
      onError: () => setError("Verification failed. Try again."),
    });
  };

  const loadApplication = async (phone: string) => {
    setLoading(true);
    try {
      const res = await onboardingService.listApplications({ phone, status: "draft" });
      const apps = res.data?.items || [];
      if (Array.isArray(apps) && apps.length > 0) {
        const app = apps[0];
        loadFromApplication({
          ...app,
          application_id: app.application_id,
          current_step: app.current_step,
        });
        router.push("/onboard");
      } else {
        setError("No draft application found for this number.");
      }
    } catch {
      setError("Failed to load application. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadApplicationByExec = async (execId: string) => {
    setLoading(true);
    try {
      const res = await onboardingService.listApplications({ exec_id: execId, status: "draft" });
      const apps = res.data?.items || [];
      if (Array.isArray(apps) && apps.length > 0) {
        const app = apps[0];
        loadFromApplication({
          ...app,
          application_id: app.application_id,
          current_step: app.current_step,
        });
        router.push("/onboard");
      } else {
        setError("No draft applications found for your account.");
      }
    } catch {
      setError("Failed to load application. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {ONBOARDING_STRINGS.RESUME_TITLE}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {ONBOARDING_STRINGS.RESUME_SUBTITLE}
        </p>
      </div>

      {mode === "select" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => setMode("merchant")}
            className="cursor-pointer rounded-lg border border-border bg-card hover:ring-1 hover:ring-accent transition-all p-6"
          >
            <div className="text-3xl mb-3">📱</div>
            <h3 className="font-semibold text-foreground">I am a Merchant</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Resume using your mobile number + OTP
            </p>
          </div>
          <div
            onClick={() => setMode("executive")}
            className="cursor-pointer rounded-lg border border-border bg-card hover:ring-1 hover:ring-accent transition-all p-6"
          >
            <div className="text-3xl mb-3">🪪</div>
            <h3 className="font-semibold text-foreground">
              I am a Field Executive
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Resume using your employee code
            </p>
          </div>
        </div>
      )}

      {mode === "merchant" && merchantStep === "phone" && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-foreground">Enter your mobile number</h3>
          <div className="flex gap-2">
            <div className="flex items-center px-3 bg-card border border-border rounded-md text-sm text-muted-foreground">
              +91
            </div>
            <Input
              placeholder="9876543210"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              maxLength={10}
              inputMode="numeric"
            />
          </div>
          {error && <p className="text-xs text-error">{error}</p>}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setMode("select")}>
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleSendOtp}
              loading={sendOtp.isPending}
            >
              Send OTP
            </Button>
          </div>
        </Card>
      )}

      {mode === "merchant" && merchantStep === "otp" && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-foreground">
            Enter OTP sent to +91 {phone}
          </h3>
          <OtpInput
            value={otp}
            onChange={(val) => {
              setOtp(val);
              if (val.length === 6) handleVerifyOtp(val);
            }}
            disabled={verifyOtp.isPending || loading}
          />
          {error && <p className="text-xs text-error">{error}</p>}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setMerchantStep("phone")}>
              Change Number
            </Button>
            {(verifyOtp.isPending || loading) && (
              <span className="text-xs text-muted-foreground self-center">
                Loading...
              </span>
            )}
          </div>
        </Card>
      )}

      {mode === "executive" && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-foreground">Enter your employee code</h3>
          <Input
            placeholder="KT1234"
            value={employeeCode}
            onChange={(e) =>
              setEmployeeCode(e.target.value.toUpperCase().slice(0, 8))
            }
            maxLength={8}
          />
          {error && <p className="text-xs text-error">{error}</p>}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setMode("select")}>
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleExecResume}
              loading={verifyExec.isPending || loading}
            >
              Resume
            </Button>
          </div>
        </Card>
      )}

      <div className="text-center">
        <button
          type="button"
          onClick={() => router.push("/onboard")}
          className="text-sm text-accent hover:underline"
        >
          Start a new application instead
        </button>
      </div>
    </div>
  );
}
