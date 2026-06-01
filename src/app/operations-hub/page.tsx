"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToastStore } from "@/lib/stores/toast.store";
import {
  listOpsHubPlans,
  sendOpsHubInterestOtp,
  submitOpsHubInterest,
  verifyOpsHubInterestOtp,
  type OpsHubPlan,
} from "@/lib/api/services/ops-hub-interest.service";
import { cn } from "@/lib/utils/cn";

const cardClass =
  "glass-card-transparent rounded-2xl p-5 sm:p-6 space-y-4 transition-shadow hover:shadow-lg";

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

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) {
      return response.data.message;
    }
  }

  return fallback;
}

export default function OperationsHubPage() {
  const pushToast = useToastStore((s) => s.push);
  const [plans, setPlans] = useState<OpsHubPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [planId, setPlanId] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const cleanMobile = useMemo(() => normalizeIndianMobileInput(mobile), [mobile]);

  useEffect(() => {
    let cancelled = false;

    listOpsHubPlans()
      .then((list) => {
        if (cancelled) return;
        setPlans(list);
        if (list[0]?.id) {
          setPlanId(String(list[0].id));
        }
      })
      .catch(() => {
        if (!cancelled) {
          pushToast({
            variant: "error",
            title: "Unable to load plans",
            description: "Please refresh and try again.",
          });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingPlans(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pushToast]);

  async function handleSendOtp() {
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      pushToast({
        variant: "error",
        title: "Invalid mobile number",
        description: "Enter a valid 10-digit Indian mobile number.",
      });
      return;
    }

    setSendingOtp(true);
    try {
      const res = await sendOpsHubInterestOtp(cleanMobile);
      setOtpSent(true);
      setMobileVerified(false);
      setOtp("");
      pushToast({
        variant: "success",
        title: "OTP sent",
        description: res.message,
      });
    } catch (error) {
      pushToast({
        variant: "error",
        title: "Could not send OTP",
        description: extractErrorMessage(error, "Please try again."),
      });
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifyOtp() {
    if (!otp || otp.length !== 6) {
      pushToast({
        variant: "error",
        title: "Invalid OTP",
        description: "Enter the 6-digit OTP sent to your mobile.",
      });
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await verifyOpsHubInterestOtp(cleanMobile, otp);
      setMobileVerified(true);
      pushToast({
        variant: "success",
        title: "Mobile verified",
        description: res.message,
      });
    } catch (error) {
      pushToast({
        variant: "error",
        title: "Verification failed",
        description: extractErrorMessage(error, "Invalid or expired OTP."),
      });
    } finally {
      setVerifyingOtp(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      pushToast({
        variant: "error",
        title: "Name required",
        description: "Enter your full name.",
      });
      return;
    }

    if (!mobileVerified) {
      pushToast({
        variant: "error",
        title: "Verify mobile",
        description: "Please verify your mobile number with OTP before submitting.",
      });
      return;
    }

    if (!planId) {
      pushToast({
        variant: "error",
        title: "Select a plan",
        description: "Choose the plan you are interested in.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitOpsHubInterest({
        name: name.trim(),
        mobile: cleanMobile,
        ops_hub_plan_id: Number(planId),
      });
      pushToast({
        variant: "success",
        title: "Interest submitted",
        description: res.message,
      });
      setName("");
      setMobile("");
      setOtp("");
      setOtpSent(false);
      setMobileVerified(false);
    } catch (error) {
      pushToast({
        variant: "error",
        title: "Submission failed",
        description: extractErrorMessage(error, "Please try again."),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Operations Hub
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Partner with Kutoot to manage a portfolio of merchant locations. Share your interest and
          our team will reach out.
        </p>
        <div className="mt-4 h-px w-16 bg-linear-to-r from-transparent via-primary to-transparent" />
      </div>

      <form onSubmit={handleSubmit} className={cn(cardClass)}>
        <div className="space-y-2">
          <label htmlFor="ops-hub-name" className="text-sm font-medium text-foreground">
            Full name
          </label>
          <Input
            id="ops-hub-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="min-h-11"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="ops-hub-mobile" className="text-sm font-medium text-foreground">
            Mobile number
          </label>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex shrink-0 items-center justify-center rounded-lg border border-border/80 bg-background/40 px-3 py-2.5 text-sm text-muted-foreground backdrop-blur-sm sm:py-2">
              +91
            </div>
            <Input
              id="ops-hub-mobile"
              value={cleanMobile}
              onChange={(e) => {
                setMobile(e.target.value);
                setOtpSent(false);
                setMobileVerified(false);
              }}
              placeholder="9876543210"
              maxLength={10}
              inputMode="numeric"
              required
              className="min-h-11 flex-1"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            type="button"
            variant="secondary"
            className="min-h-11 w-full sm:w-auto"
            onClick={handleSendOtp}
            loading={sendingOtp}
            disabled={cleanMobile.length !== 10 || mobileVerified}
          >
            Send OTP
          </Button>

          {otpSent && !mobileVerified ? (
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit OTP"
                inputMode="numeric"
                maxLength={6}
                className="min-h-11 flex-1"
              />
              <Button
                type="button"
                variant="primary"
                className="min-h-11 w-full sm:w-auto"
                onClick={handleVerifyOtp}
                loading={verifyingOtp}
              >
                Verify
              </Button>
            </div>
          ) : null}

          {mobileVerified ? (
            <span className="text-sm font-medium text-success">Mobile verified</span>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="ops-hub-plan" className="text-sm font-medium text-foreground">
            Plan interested in
          </label>
          <select
            id="ops-hub-plan"
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            disabled={loadingPlans || plans.length === 0}
            required
            className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
          >
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
                {plan.price_amount != null
                  ? ` — ₹${plan.price_amount}/${plan.price_cycle ?? "month"}`
                  : ""}
              </option>
            ))}
          </select>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="min-h-11 w-full sm:w-auto"
          loading={submitting}
          disabled={!mobileVerified || loadingPlans}
        >
          Submit interest
        </Button>
      </form>
    </div>
  );
}
