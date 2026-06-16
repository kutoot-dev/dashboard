"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PhoneNumberInput } from "@/components/ui/phone-number-input";
import { FieldWithInfo } from "./field-with-info";
import { OtpInput } from "./otp-input";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { useSendOtp, useVerifyOtp } from "@/lib/hooks";
import { hydrateOnboardingFromPhone } from "@/lib/onboarding/hydrate-onboarding-application";
import { ONBOARDING_FIELDS, VALIDATION_RULES } from "@/lib/constants/onboarding";
import { useToastStore } from "@/lib/stores/toast.store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";

const OTP_COUNTDOWN_SECONDS = 120;

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

interface StepMobileVerifyProps {
  onNext: () => void;
}

export function StepMobileVerify({ onNext }: StepMobileVerifyProps) {
  const { formData, updateFormData } = useOnboardingStore();
  const applicationId = useOnboardingStore((s) => s.applicationId);
  const channel = useOnboardingStore((s) => s.formData.channel);
  const pushToast = useToastStore((s) => s.push);
  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  const [error, setError] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpMessage, setPhoneOtpMessage] = useState("");
  const [phoneSecondsLeft, setPhoneSecondsLeft] = useState(0);
  const phoneIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      setError("");
    },
    [updateFormData],
  );

  const handleSendPhoneOtp = async () => {
    const phone = formData.phone;
    if (!VALIDATION_RULES.phone.pattern.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number starting with 6-9.");
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
        const mode = new URLSearchParams(window.location.search).get("mode");
        // In explicit new onboarding, do not hydrate by phone after OTP verify.
        // Hydration can pick an older draft for this phone and overwrite the
        // just-verified local state back to false.
        const shouldHydrateFromPhone =
          channel === "merchant" && mode !== "new" && Boolean(applicationId);
        if (shouldHydrateFromPhone) {
          void hydrateOnboardingFromPhone(formData.phone, { preserveCurrentStep: true });
        }
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

  const handleContinue = () => {
    if (!VALIDATION_RULES.phone.pattern.test(formData.phone)) {
      setError("Enter a valid 10-digit Indian mobile number starting with 6-9.");
      return;
    }
    if (!formData.merchant_phone_verified) {
      setError("Please verify your mobile number via OTP before continuing.");
      return;
    }
    setError("");
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Verify Mobile Number</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We will send a one-time code to confirm this number belongs to you.
        </p>
      </div>

      <FieldWithInfo fieldInfo={ONBOARDING_FIELDS.phone} required showTooltip={false} error={error}>
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
                  disabled={formData.phone.length !== 10}
                >
                  Send OTP
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    OTP sent to +91 {formData.phone.slice(0, 2)}XXXXXX{formData.phone.slice(8)}.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <OtpInput
                      value={phoneOtp}
                      onChange={(value) => setPhoneOtp(value.replace(/\D/g, "").slice(0, 6))}
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
            <p className="flex items-center gap-1 text-xs text-success">
              <FontAwesomeIcon icon={faCircleCheck} className="h-3 w-3" />
              Mobile number verified
            </p>
          )}
        </div>
      </FieldWithInfo>

      <div className="flex justify-end pt-4">
        <Button variant="primary" onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
