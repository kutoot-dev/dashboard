"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldWithInfo } from "./field-with-info";
import { OtpInput } from "./otp-input";
import { DuplicateAlert } from "./duplicate-alert";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { useCheckPhone, useVerifyExecutive, useSendOtp, useVerifyOtp } from "@/lib/hooks";
import { ONBOARDING_FIELDS } from "@/lib/constants/onboarding";
import { useToastStore } from "@/lib/stores/toast.store";
import type { ApplicationStatus } from "@/lib/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faCircleCheck,
  faStore,
} from "@fortawesome/free-solid-svg-icons";

interface StepIdentityProps {
  onNext: () => void;
}

function normalizeIndianMobileInput(value: string): string {
  let digits = value.replace(/\D/g, "");

  if (digits.length > 10 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }

  if (digits.length > 10) {
    digits = digits.slice(-10);
  }

  return digits;
}

export function StepIdentity({ onNext }: StepIdentityProps) {
  const router = useRouter();
  const {
    formData,
    updateFormData,
    phoneCheckResult,
    setPhoneCheckResult,
  } = useOnboardingStore();
  const pushToast = useToastStore((s) => s.push);
  const [employeeCode, setEmployeeCode] = useState(formData.exec_employee_code || "");
  const [otpPhone, setOtpPhone] = useState(formData.merchant_otp_phone || "");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const verifyExec = useVerifyExecutive();
  const checkPhone = useCheckPhone();
  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startCountdown = (seconds: number) => {
    setSecondsLeft(seconds);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const channel = formData.channel;

  const goResume = () => {
    const params = new URLSearchParams({ from: "identity" });
    if (otpPhone.length === 10) {
      params.set("phone", otpPhone);
    }
    router.push(`/onboard/resume?${params.toString()}`);
  };

  const handleChannelSelect = (ch: "merchant" | "field_executive") => {
    updateFormData({ channel: ch });
    if (ch !== "merchant") {
      setPhoneCheckResult(null);
      setOtpSent(false);
      setOtp("");
    }
    setError("");
  };

  const handleMerchantPhoneChange = (raw: string) => {
    const clean = normalizeIndianMobileInput(raw);
    setOtpPhone(clean);
    setError("");

    if (clean.length !== 10) {
      setPhoneCheckResult(null);
      return;
    }

    checkPhone.mutate(clean, {
      onSuccess: (res) => {
        setPhoneCheckResult(
          res.data.exists
            ? {
                exists: true,
                status: res.data.status,
                application_id: res.data.application_id,
                visiting_exec_name: res.data.visiting_exec_name ?? null,
                message: res.data.message,
              }
            : null,
        );
      },
    });
  };

  const handleVerifyExecutive = async () => {
    setError("");
    const normalizedEmployeeCode = employeeCode.trim();
    if (normalizedEmployeeCode.length < 4) {
      setError("Enter a valid employee code (4-8 alphanumeric).");
      return;
    }
    try {
      const res = await verifyExec.mutateAsync(normalizedEmployeeCode);
      if (res.data.valid) {
        updateFormData({
          exec_id: res.data.exec_id,
          exec_name: res.data.exec_name,
          exec_employee_code: normalizedEmployeeCode,
        });
        onNext();
      } else {
        setError(res.data.message);
      }
    } catch {
      setError("Verification failed. Please try again.");
    }
  };

  const handleSendOtp = async () => {
    setError("");
    if (!/^[6-9]\d{9}$/.test(otpPhone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      pushToast({
        variant: "error",
        title: "Invalid phone number",
        description: "Enter a valid 10-digit Indian mobile number.",
      });
      return;
    }
    if (phoneCheckResult?.exists) {
      setError("This mobile number already has an application. Use resume to continue or view status.");
      pushToast({
        variant: "warning",
        title: "Application already exists",
        description: "Use resume onboarding to continue this application or check its current status.",
      });
      return;
    }
    setOtp("");
    try {
      const res = await sendOtp.mutateAsync(otpPhone);
      if (res.data.sent) {
        setOtpSent(true);
        updateFormData({ merchant_otp_phone: otpPhone });
        startCountdown(res.data.expires_in_seconds || 300);
        pushToast({
          variant: "success",
          title: "OTP sent",
          description: "Enter the latest OTP to continue.",
        });
      } else {
        setError(res.data.message);
      }
    } catch {
      setError("Failed to send OTP. Try again.");
      pushToast({
        variant: "error",
        title: "Failed to send OTP",
        description: "Please try again in a moment.",
      });
    }
  };

  const handleResendOtp = async () => {
    if (secondsLeft > 0) return;
    setOtp("");
    setError("");
    try {
      const res = await sendOtp.mutateAsync(otpPhone);
      if (res.data.sent) {
        startCountdown(res.data.expires_in_seconds || 300);
        pushToast({
          variant: "success",
          title: "New OTP sent",
          description: "Previous OTP has been cleared. Enter the new OTP.",
        });
      } else {
        setError(res.data.message);
      }
    } catch {
      setError("Failed to resend OTP. Try again.");
      pushToast({
        variant: "error",
        title: "Failed to resend OTP",
        description: "Please try again in a moment.",
      });
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP.");
      pushToast({
        variant: "error",
        title: "Invalid OTP",
        description: "Enter a valid 6-digit OTP.",
      });
      return;
    }
    try {
      const res = await verifyOtp.mutateAsync({ phone: otpPhone, otp });
      if (res.data.verified) {
        updateFormData({
          merchant_phone_verified: true,
          merchant_otp_phone: otpPhone,
          phone: otpPhone,
        });
        onNext();
      } else {
        setError(res.data.message);
      }
    } catch {
      setError("OTP verification failed. Try again.");
      pushToast({
        variant: "error",
        title: "OTP verification failed",
        description: "Invalid or expired OTP. Request a new code and retry.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">
          How are you filling this form?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select your role to proceed with the appropriate verification.
        </p>
      </div>

      {/* Channel selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => handleChannelSelect("merchant")}
          className={cn(
            "p-4 rounded-lg border-2 text-left transition-all",
            channel === "merchant"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/40",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                channel === "merchant"
                  ? "bg-primary text-white"
                  : "bg-card border border-border text-muted-foreground",
              )}
            >
              <FontAwesomeIcon icon={faStore} className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">I am a Merchant</p>
              <p className="text-xs text-muted-foreground">
                Register my own business
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleChannelSelect("field_executive")}
          className={cn(
            "p-4 rounded-lg border-2 text-left transition-all",
            channel === "field_executive"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/40",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                channel === "field_executive"
                  ? "bg-primary text-white"
                  : "bg-card border border-border text-muted-foreground",
              )}
            >
              <FontAwesomeIcon icon={faBriefcase} className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                I am a Field Executive
              </p>
              <p className="text-xs text-muted-foreground">
                Registering on behalf of a merchant
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Field Executive: Employee Code */}
      {channel === "field_executive" && (
        <div className="space-y-4 pt-2">
          <FieldWithInfo
            fieldInfo={ONBOARDING_FIELDS.employee_code}
            required
            error={error}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                placeholder={ONBOARDING_FIELDS.employee_code.placeholder}
                value={employeeCode}
                onChange={(e) =>
                  setEmployeeCode(
                    e.target.value
                      .replace(/[^a-zA-Z0-9]/g, "")
                      .slice(0, 8),
                  )
                }
                maxLength={8}
                className="min-h-11 flex-1"
              />
              <Button
                variant="primary"
                size="md"
                className="min-h-11 w-full sm:w-auto"
                loading={verifyExec.isPending}
                onClick={handleVerifyExecutive}
                disabled={employeeCode.length < 4}
              >
                Verify
              </Button>
            </div>
          </FieldWithInfo>
          {formData.exec_name && (
            <div className="flex items-center gap-2 text-sm text-success">
              <FontAwesomeIcon icon={faCircleCheck} className="w-4 h-4" />
              Verified: {formData.exec_name}
            </div>
          )}
        </div>
      )}

      {/* Merchant: OTP Verification */}
      {channel === "merchant" && (
        <div className="space-y-4 pt-2">
          {phoneCheckResult?.exists && (
            <DuplicateAlert
              status={phoneCheckResult.status as "active_merchant" | "existing_lead" | "already_submitted" | "existing_fe_visit"}
              applicationId={phoneCheckResult.application_id}
              applicationStatus={phoneCheckResult.status as ApplicationStatus}
              message={phoneCheckResult.message}
              onResume={goResume}
            />
          )}

          {!otpSent ? (
            <FieldWithInfo
              fieldInfo={ONBOARDING_FIELDS.phone}
              required
              error={error}
            >
              <div className="space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex min-h-11 w-full shrink-0 items-center justify-center rounded-lg border border-border/80 bg-background/40 px-3 py-2 text-sm text-muted-foreground backdrop-blur-sm sm:w-auto">
                    +91
                  </div>
                  <Input
                    placeholder="9876543210"
                    value={otpPhone}
                    onChange={(e) => handleMerchantPhoneChange(e.target.value)}
                    maxLength={10}
                    inputMode="numeric"
                    className="min-h-11 flex-1"
                  />
                  <Button
                    variant="primary"
                    size="md"
                    className="min-h-11 w-full sm:w-auto"
                    loading={sendOtp.isPending}
                    onClick={handleSendOtp}
                    disabled={otpPhone.length !== 10 || !!phoneCheckResult?.exists}
                  >
                    Send OTP
                  </Button>
                </div>
                {checkPhone.isPending && otpPhone.length === 10 && (
                  <p className="text-xs text-muted-foreground">Checking...</p>
                )}
              </div>
            </FieldWithInfo>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                OTP sent to +91 {otpPhone.slice(0, 2)}XXXXXX{otpPhone.slice(8)}.
                Enter the 6-digit code below.
              </p>
              <OtpInput
                value={otp}
                onChange={setOtp}
                error={error}
                disabled={verifyOtp.isPending}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="md"
                  loading={verifyOtp.isPending}
                  onClick={handleVerifyOtp}
                  disabled={otp.length !== 6}
                >
                  Verify OTP
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={handleResendOtp}
                  loading={sendOtp.isPending}
                  disabled={secondsLeft > 0}
                >
                  {secondsLeft > 0
                    ? `Resend in ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`
                    : "Resend OTP"}
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    setError("");
                    setSecondsLeft(0);
                    if (intervalRef.current) clearInterval(intervalRef.current);
                  }}
                >
                  Change Number
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
