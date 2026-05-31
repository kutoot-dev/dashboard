"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldWithInfo } from "./field-with-info";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { useVerifyExecutive } from "@/lib/hooks";
import { ONBOARDING_FIELDS } from "@/lib/constants/onboarding";
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
  const { formData, updateFormData, applicationId } = useOnboardingStore();
  const [employeeCode, setEmployeeCode] = useState(formData.exec_employee_code || "");
  const [error, setError] = useState("");

  const verifyExec = useVerifyExecutive();
  const channel = formData.channel;

  const handleChannelSelect = (ch: "merchant" | "field_executive") => {
    updateFormData({ channel: ch });
    setError("");
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
          <Button variant="primary" size="md" className="min-h-11" onClick={onNext}>
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}
