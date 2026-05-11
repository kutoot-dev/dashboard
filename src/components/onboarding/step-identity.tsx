"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldWithInfo } from "./field-with-info";
import { OtpInput } from "./otp-input";
import { DuplicateAlert } from "./duplicate-alert";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { useCheckPhone, useVerifyExecutive, useSendOtp, useVerifyOtp } from "@/lib/hooks";
import { ONBOARDING_FIELDS } from "@/lib/constants/onboarding";
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

export function StepIdentity({ onNext }: StepIdentityProps) {
  const {
    formData,
    updateFormData,
    phoneCheckResult,
    setPhoneCheckResult,
  } = useOnboardingStore();
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
    const clean = raw.replace(/\D/g, "").slice(0, 10);
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
    try {
      const res = await verifyExec.mutateAsync(employeeCode);
      if (res.data.valid) {
        updateFormData({
          exec_id: res.data.exec_id,
          exec_name: res.data.exec_name,
          exec_employee_code: employeeCode.toUpperCase(),
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
      return;
    }
    if (phoneCheckResult?.exists) {
      setError("This mobile number already has an application. Resume the existing application.");
      return;
    }
    try {
      const res = await sendOtp.mutateAsync(otpPhone);
      if (res.data.sent) {
        setOtpSent(true);
        updateFormData({ merchant_otp_phone: otpPhone });
        startCountdown(res.data.expires_in_seconds || 300);
      } else {
        setError(res.data.message);
      }
    } catch {
      setError("Failed to send OTP. Try again.");
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
      } else {
        setError(res.data.message);
      }
    } catch {
      setError("Failed to resend OTP. Try again.");
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP.");
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
            <div className="flex gap-2">
              <Input
                placeholder={ONBOARDING_FIELDS.employee_code.placeholder}
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
                maxLength={8}
                className="flex-1 uppercase"
              />
              <Button
                variant="primary"
                size="md"
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
            />
          )}

          {!otpSent ? (
            <FieldWithInfo
              fieldInfo={ONBOARDING_FIELDS.phone}
              required
              error={error}
            >
              <div className="flex gap-2">
                <div className="flex items-center gap-1 px-3 bg-card border border-border rounded-md text-sm text-muted-foreground">
                  +91
                </div>
                <Input
                  placeholder="9876543210"
                  value={otpPhone}
                  onChange={(e) => handleMerchantPhoneChange(e.target.value)}
                  maxLength={10}
                  inputMode="numeric"
                  className="flex-1"
                />
                {checkPhone.isPending && otpPhone.length === 10 && (
                  <div className="flex items-center px-2 text-xs text-muted-foreground">
                    Checking...
                  </div>
                )}
                <Button
                  variant="primary"
                  size="md"
                  loading={sendOtp.isPending}
                  onClick={handleSendOtp}
                  disabled={otpPhone.length !== 10 || !!phoneCheckResult?.exists}
                >
                  Send OTP
                </Button>
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
