"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneNumberInput } from "@/components/ui/phone-number-input";
import { FieldWithInfo } from "./field-with-info";
import { OtpInput } from "./otp-input";
import { DuplicateAlert } from "./duplicate-alert";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { useCheckPhone, useSendOtp, useVerifyExecutive, useVerifyOtp } from "@/lib/hooks";
import { ONBOARDING_FIELDS, VALIDATION_RULES } from "@/lib/constants/onboarding";
import { useToastStore } from "@/lib/stores/toast.store";
import type { ApplicationStatus } from "@/lib/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faCircleCheck,
  faStore,
} from "@fortawesome/free-solid-svg-icons";

const OTP_COUNTDOWN_SECONDS = 60;

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

interface StepIdentityProps {
  onNext: () => void;
}

export function StepIdentity({ onNext }: StepIdentityProps) {
  const {
    formData,
    updateFormData,
    applicationId,
    phoneCheckResult,
    setPhoneCheckResult,
  } = useOnboardingStore();
  const pushToast = useToastStore((s) => s.push);
  const [employeeCode, setEmployeeCode] = useState(formData.exec_employee_code || "");
  const [error, setError] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpMessage, setPhoneOtpMessage] = useState("");
  const [phoneSecondsLeft, setPhoneSecondsLeft] = useState(0);
  const phoneIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const verifyExec = useVerifyExecutive();
  const checkPhone = useCheckPhone();
  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();
  const channel = formData.channel;

  useEffect(() => {
    return () => {
      if (phoneIntervalRef.current) {
        clearInterval(phoneIntervalRef.current);
      }
    };
  }, []);

  const startPhoneCountdown = (seconds: number) => {
    if (phoneIntervalRef.current) {
      clearInterval(phoneIntervalRef.current);
    }
    setPhoneSecondsLeft(seconds);
    phoneIntervalRef.current = setInterval(() => {
      setPhoneSecondsLeft((prev) => {
        if (prev <= 1) {
          if (phoneIntervalRef.current) clearInterval(phoneIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleChannelSelect = (ch: "merchant" | "field_executive") => {
    updateFormData({ channel: ch });
    setError("");
  };

  const handlePhoneChange = useCallback(
    (value: string) => {
      const clean = normalizeIndianMobileInput(value);
      updateFormData({
        phone: clean,
        merchant_phone_verified: false,
      });
      setPhoneOtp("");
      setPhoneOtpSent(false);
      setPhoneOtpMessage("");

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
    },
    [checkPhone, setPhoneCheckResult, updateFormData],
  );

  const handleSendPhoneOtp = async () => {
    const phone = formData.phone;
    if (!VALIDATION_RULES.phone.pattern.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number starting with 6-9.");
      return;
    }
    if (phoneCheckResult?.exists && !applicationId) {
      pushToast({
        variant: "warning",
        title: "Application already exists",
        description: "Use resume onboarding to continue this application.",
      });
      return;
    }

    setPhoneOtp("");
    try {
      const res = await sendOtp.mutateAsync(phone);
      if (res.data.sent) {
        setPhoneOtpSent(true);
        updateFormData({ merchant_otp_phone: phone });
        startPhoneCountdown(OTP_COUNTDOWN_SECONDS);
        pushToast({
          variant: "success",
          title: "OTP sent",
          description: "Enter the OTP sent to your mobile number.",
        });
        setError("");
      }
    } catch {
      setPhoneOtpMessage("Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (phoneOtp.length !== 6) {
      setPhoneOtpMessage("Enter 6-digit OTP.");
      return;
    }
    try {
      const res = await verifyOtp.mutateAsync({ phone: formData.phone, otp: phoneOtp });
      if (res.data.verified) {
        updateFormData({
          merchant_phone_verified: true,
          merchant_otp_phone: formData.phone,
        });
        setPhoneOtpSent(false);
        setPhoneOtp("");
        setPhoneOtpMessage("");
        pushToast({
          variant: "success",
          title: "Mobile verified",
          description: "Your phone number has been verified.",
        });
      }
    } catch {
      setPhoneOtpMessage("Invalid or expired OTP.");
    }
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

  const handleMerchantContinue = () => {
    if (!VALIDATION_RULES.phone.pattern.test(formData.phone)) {
      setError("Enter a valid 10-digit Indian mobile number starting with 6-9.");
      return;
    }
    if (!formData.merchant_phone_verified) {
      setError("Please verify your mobile number via OTP before continuing.");
      return;
    }
    if (phoneCheckResult?.exists && !applicationId) {
      pushToast({
        variant: "warning",
        title: "Application already exists",
        description: "Use resume onboarding to continue this application.",
      });
      return;
    }
    setError("");
    onNext();
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

      {channel === "merchant" && (
        <div className="space-y-4 pt-2">
          {applicationId && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
              <p className="text-sm text-foreground">
                You are resuming an existing application. Continue to proceed.
              </p>
            </div>
          )}

          <FieldWithInfo fieldInfo={ONBOARDING_FIELDS.phone} required error={error}>
            <div className="space-y-3">
              <PhoneNumberInput
                placeholder="9876543210"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                maxLength={10}
                disabled={formData.merchant_phone_verified}
                verified={formData.merchant_phone_verified}
              />

              {!formData.merchant_phone_verified && (
                <>
                  {!phoneOtpSent ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleSendPhoneOtp}
                      loading={sendOtp.isPending}
                      disabled={formData.phone.length !== 10 || !!phoneCheckResult?.exists}
                    >
                      Send Phone OTP
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">
                        OTP sent to +91 {formData.phone.slice(0, 2)}XXXXXX
                        {formData.phone.slice(8)}.
                      </p>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <OtpInput
                          value={phoneOtp}
                          onChange={(value) =>
                            setPhoneOtp(value.replace(/\D/g, "").slice(0, 6))
                          }
                          disabled={verifyOtp.isPending}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="primary"
                          size="md"
                          className="w-full sm:w-auto"
                          onClick={handleVerifyPhoneOtp}
                          loading={verifyOtp.isPending}
                          disabled={phoneOtp.length !== 6}
                        >
                          Verify
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleSendPhoneOtp}
                        loading={sendOtp.isPending}
                        disabled={phoneSecondsLeft > 0}
                      >
                        {phoneSecondsLeft > 0
                          ? `Resend in ${Math.floor(phoneSecondsLeft / 60)}:${String(phoneSecondsLeft % 60).padStart(2, "0")}`
                          : "Resend OTP"}
                      </Button>
                    </div>
                  )}
                  {phoneOtpMessage && (
                    <p className="text-xs text-muted-foreground">{phoneOtpMessage}</p>
                  )}
                </>
              )}

              {formData.merchant_phone_verified && (
                <p className="text-xs text-success flex items-center gap-1">
                  <FontAwesomeIcon icon={faCircleCheck} className="w-3 h-3" />
                  Mobile number verified
                </p>
              )}
            </div>
          </FieldWithInfo>

          {phoneCheckResult?.exists && !applicationId && (
            <DuplicateAlert
              status={
                phoneCheckResult.status as
                  | "active_merchant"
                  | "existing_lead"
                  | "already_submitted"
                  | "existing_fe_visit"
              }
              applicationId={phoneCheckResult.application_id}
              applicationStatus={phoneCheckResult.status as ApplicationStatus}
              message={phoneCheckResult.message}
              onResume={() => {
                const params = new URLSearchParams({ from: "identity" });
                if (formData.phone?.length === 10) {
                  params.set("phone", formData.phone);
                }
                window.location.href = `/onboard/resume?${params.toString()}`;
              }}
            />
          )}

          <Button
            variant="primary"
            size="md"
            className="min-h-11"
            onClick={handleMerchantContinue}
            disabled={!formData.merchant_phone_verified || (!!phoneCheckResult?.exists && !applicationId)}
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}
