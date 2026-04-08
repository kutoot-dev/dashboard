"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldWithInfo } from "./field-with-info";
import { OtpInput } from "./otp-input";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { useVerifyExecutive, useSendOtp, useVerifyOtp } from "@/lib/hooks";
import { ONBOARDING_FIELDS } from "@/lib/constants/onboarding";

interface StepIdentityProps {
  onNext: () => void;
}

export function StepIdentity({ onNext }: StepIdentityProps) {
  const { formData, updateFormData } = useOnboardingStore();
  const [employeeCode, setEmployeeCode] = useState(formData.exec_employee_code || "");
  const [otpPhone, setOtpPhone] = useState(formData.merchant_otp_phone || "");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

  const verifyExec = useVerifyExecutive();
  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  const channel = formData.channel;

  const handleChannelSelect = (ch: "merchant" | "field_executive") => {
    updateFormData({ channel: ch });
    setError("");
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
    try {
      const res = await sendOtp.mutateAsync(otpPhone);
      if (res.data.sent) {
        setOtpSent(true);
        updateFormData({ merchant_otp_phone: otpPhone });
      } else {
        setError(res.data.message);
      }
    } catch {
      setError("Failed to send OTP. Try again.");
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
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
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
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
              </svg>
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
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Verified: {formData.exec_name}
            </div>
          )}
        </div>
      )}

      {/* Merchant: OTP Verification */}
      {channel === "merchant" && (
        <div className="space-y-4 pt-2">
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
                  onChange={(e) =>
                    setOtpPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  maxLength={10}
                  inputMode="numeric"
                  className="flex-1"
                />
                <Button
                  variant="primary"
                  size="md"
                  loading={sendOtp.isPending}
                  onClick={handleSendOtp}
                  disabled={otpPhone.length !== 10}
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
              <div className="flex gap-2">
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
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    setError("");
                  }}
                >
                  Change Number
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Dev hint: Use OTP <span className="font-mono">123456</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
