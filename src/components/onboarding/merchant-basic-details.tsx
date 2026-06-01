"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FieldWithInfo } from "./field-with-info";
import { MultiPhotoCapture } from "./multi-photo-capture";
import { MapLocationPicker } from "./map-location-picker";
import { DuplicateAlert } from "./duplicate-alert";
import { OtpInput } from "./otp-input";
import { ApplicationStatusScreen } from "./application-status-screen";
import { LegalAcceptanceBlock } from "./legal-acceptance-block";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import {
  useCheckPhone,
  useCreateApplication,
  useMerchantCategories,
  useSendEmailOtp,
  useSendOtp,
  useUpdateApplication,
  useVerifyEmailOtp,
  useVerifyOtp,
} from "@/lib/hooks";
import { ONBOARDING_FIELDS, ONBOARDING_STRINGS, VALIDATION_RULES } from "@/lib/constants/onboarding";
import type { ApplicationStatus, OnboardingApplication, WizardStepId } from "@/lib/types";
import { useToastStore } from "@/lib/stores/toast.store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";

interface MerchantBasicDetailsProps {
  onBack: () => void;
  /** FE visit-only flows continue to review instead of submitting here. */
  onNext?: () => void;
}

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

function buildGoogleMapsUrl(lat: number, long: number): string {
  return `https://www.google.com/maps?q=${lat},${long}`;
}

export function MerchantBasicDetails({ onBack, onNext }: MerchantBasicDetailsProps) {
  const router = useRouter();
  const {
    formData,
    updateFormData,
    applicationId,
    setApplicationId,
    phoneCheckResult,
    setPhoneCheckResult,
    completeStep,
  } = useOnboardingStore();
  const isFieldExecutive = formData.channel === "field_executive";
  const isFeVisitOnly =
    isFieldExecutive &&
    formData.visit_outcome !== "interested" &&
    formData.visit_outcome !== null;
  const pushToast = useToastStore((s) => s.push);
  const checkPhone = useCheckPhone();
  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();
  const sendEmailOtp = useSendEmailOtp();
  const verifyEmailOtp = useVerifyEmailOtp();
  const createApp = useCreateApplication();
  const updateApp = useUpdateApplication();
  const {
    categories: merchantCategories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useMerchantCategories();

  const sectorSelectOptions = merchantCategories.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submittedApplicationId, setSubmittedApplicationId] = useState<string | null>(null);
  const [legalComplete, setLegalComplete] = useState(false);
  const draftCreateStarted = useRef(false);

  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpMessage, setPhoneOtpMessage] = useState("");
  const [phoneSecondsLeft, setPhoneSecondsLeft] = useState(0);

  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpMessage, setEmailOtpMessage] = useState("");
  const [commissionInput, setCommissionInput] = useState(
    formData.commission_rate?.toString() || "",
  );

  const selectedCategory = useMemo(
    () => merchantCategories.find((c) => String(c.id) === formData.sector_id),
    [merchantCategories, formData.sector_id],
  );
  const categoryMinCommission = useMemo(() => {
    const rawFromApplication = formData.minimum_commission_percentage;
    const raw =
      rawFromApplication != null
        ? rawFromApplication
        : selectedCategory?.minimum_commission_percentage;
    if (raw == null || Number.isNaN(Number(raw))) {
      return VALIDATION_RULES.commission_rate.min;
    }
    return Math.max(VALIDATION_RULES.commission_rate.min, Number(raw));
  }, [formData.minimum_commission_percentage, selectedCategory]);

  useEffect(() => {
    if (formData.commission_model !== "flat") {
      updateFormData({ commission_model: "flat" });
    }
  }, [formData.commission_model, updateFormData]);

  useEffect(() => {
    if (applicationId || isFeVisitOnly || draftCreateStarted.current) {
      return;
    }

    const canCreateDraft =
      isFieldExecutive ||
      (formData.phone?.length === 10 && formData.merchant_phone_verified);

    if (!canCreateDraft || !formData.channel) {
      return;
    }

    draftCreateStarted.current = true;

    createApp.mutate(
      {
        channel: formData.channel,
        phone: formData.phone || undefined,
        owner_name: formData.owner_name || undefined,
        shop_name: formData.shop_name || undefined,
        exec_id: formData.exec_id || undefined,
        exec_employee_code: formData.exec_employee_code || undefined,
        visit_outcome: formData.visit_outcome || undefined,
        stage: "in_progress",
        current_step: "basic_details",
      } as Partial<OnboardingApplication>,
      {
        onSuccess: (res) => {
          const id = res.data?.application_id;
          if (id) {
            setApplicationId(id);
          } else {
            draftCreateStarted.current = false;
          }
        },
        onError: () => {
          draftCreateStarted.current = false;
        },
      },
    );
  }, [
    applicationId,
    createApp,
    formData.channel,
    formData.exec_employee_code,
    formData.exec_id,
    formData.merchant_phone_verified,
    formData.owner_name,
    formData.phone,
    formData.shop_name,
    formData.visit_outcome,
    isFeVisitOnly,
    isFieldExecutive,
    setApplicationId,
  ]);

  useEffect(() => {
    if (isFeVisitOnly) {
      return;
    }
    const current = formData.commission_rate;
    if (current === null) {
      updateFormData({ commission_rate: categoryMinCommission });
      setCommissionInput(categoryMinCommission.toString());
      return;
    }
    if (current < categoryMinCommission) {
      updateFormData({ commission_rate: categoryMinCommission });
      setCommissionInput(categoryMinCommission.toString());
    }
  }, [
    categoryMinCommission,
    formData.commission_rate,
    isFeVisitOnly,
    updateFormData,
  ]);

  useEffect(() => {
    setCommissionInput(formData.commission_rate?.toString() || "");
  }, [formData.commission_rate]);

  const handleRateInputChange = (value: string) => {
    setCommissionInput(value);

    const num = parseFloat(value);
    if (value === "" || value === ".") {
      updateFormData({ commission_rate: null });
      return;
    }

    if (!isNaN(num)) {
      const clamped = Math.min(
        VALIDATION_RULES.commission_rate.max,
        Math.max(categoryMinCommission, num),
      );
      updateFormData({ commission_rate: clamped });
    }
  };

  const handleRateSliderChange = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return;
    }

    const clamped = Math.min(
      VALIDATION_RULES.commission_rate.max,
      Math.max(categoryMinCommission, num),
    );
    setCommissionInput(clamped.toString());
    updateFormData({ commission_rate: clamped });
    setErrors((prev) => {
      if (!prev.commission_rate) return prev;
      const next = { ...prev };
      delete next.commission_rate;
      return next;
    });
  };

  const [gpsStatus, setGpsStatus] = useState<string>("");

  const phoneIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (phoneIntervalRef.current) clearInterval(phoneIntervalRef.current);
    };
  }, []);

  const startPhoneCountdown = (seconds: number) => {
    setPhoneSecondsLeft(seconds);
    if (phoneIntervalRef.current) clearInterval(phoneIntervalRef.current);
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

      if (clean.length === 10) {
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
      } else {
        setPhoneCheckResult(null);
      }
    },
    [checkPhone, setPhoneCheckResult, updateFormData],
  );

  const handleSendPhoneOtp = async () => {
    const phone = formData.phone;
    if (!VALIDATION_RULES.phone.pattern.test(phone)) {
      setErrors((prev) => ({
        ...prev,
        phone: "Enter a valid 10-digit Indian mobile number starting with 6-9.",
      }));
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
        setErrors((prev) => {
          const next = { ...prev };
          delete next.phone;
          return next;
        });
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

  const handleSendEmailOtp = async () => {
    const email = formData.owner_email.trim().toLowerCase();
    if (!email) {
      setErrors((prev) => ({ ...prev, owner_email: "Enter an email address to send OTP." }));
      return;
    }
    setEmailOtp("");
    try {
      const res = await sendEmailOtp.mutateAsync(email);
      if (res.data.sent) {
        setEmailOtpSent(true);
        setEmailOtpMessage("OTP sent to email.");
        setErrors((prev) => {
          const next = { ...prev };
          delete next.owner_email;
          return next;
        });
      }
    } catch {
      setEmailOtpMessage("Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyEmailOtp = async () => {
    const email = formData.owner_email.trim().toLowerCase();
    if (emailOtp.length !== 6) {
      setEmailOtpMessage("Enter 6-digit OTP.");
      return;
    }
    try {
      const res = await verifyEmailOtp.mutateAsync({ email, otp: emailOtp });
      if (res.data.verified) {
        updateFormData({ owner_email_verified: true, owner_email: email });
        setEmailOtpSent(false);
        setEmailOtp("");
        setEmailOtpMessage("");
        pushToast({
          variant: "success",
          title: "Email verified",
          description: "Your email has been verified.",
        });
      }
    } catch {
      setEmailOtpMessage("Invalid or expired OTP.");
    }
  };

  const handleLocationCaptured = useCallback(
    (coords: { lat: number; long: number; accuracy?: number }) => {
      updateFormData({
        gps_lat: coords.lat,
        gps_long: coords.long,
        ...(coords.accuracy != null ? { gps_accuracy: coords.accuracy } : {}),
      });
      setGpsStatus("Location coordinates captured.");
      setErrors((prev) => {
        const next = { ...prev };
        delete next.gps;
        return next;
      });
    },
    [updateFormData],
  );

  const pickCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus("Geolocation not supported on this device.");
      return;
    }
    setGpsStatus("Fetching current location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleLocationCaptured({
          lat: Number(pos.coords.latitude.toFixed(6)),
          long: Number(pos.coords.longitude.toFixed(6)),
          accuracy: Number(pos.coords.accuracy.toFixed(2)),
        });
      },
      () => {
        setGpsStatus("Unable to capture location. Please enable location access.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [handleLocationCaptured]);

  const updateStorefrontPhotos = useCallback(
    (urls: string[]) => {
      updateFormData({
        storefront_photo_urls: urls,
        storefront_photo_url: urls[0] ?? null,
        storefront_photo_status: urls.length > 0 ? "uploaded" : "pending",
      });
      if (urls.length > 0) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.storefront_photo;
          return next;
        });
      }
    },
    [updateFormData],
  );

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!formData.legal_name || formData.legal_name.trim().length < 2) {
      e.legal_name = "Legal name must be at least 2 characters.";
    }
    if (!formData.shop_name || formData.shop_name.trim().length < 2) {
      e.shop_name = "Display name must be at least 2 characters.";
    }
    if (!formData.sector_id) {
      e.sector = "Select a business category.";
    }
    if (
      !formData.owner_name ||
      formData.owner_name.length < 2 ||
      !VALIDATION_RULES.owner_name.pattern.test(formData.owner_name)
    ) {
      e.owner_name = "Enter a valid owner name (letters and spaces only, min 2 chars).";
    }
    if (!VALIDATION_RULES.phone.pattern.test(formData.phone)) {
      e.phone = "Enter a valid 10-digit Indian mobile number starting with 6-9.";
    } else if (!formData.merchant_phone_verified) {
      e.phone = "Please verify your mobile number via OTP.";
    }

    const email = formData.owner_email.trim();
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        e.owner_email = "Enter a valid email address.";
      } else if (!formData.owner_email_verified) {
        e.owner_email = "Please verify email via OTP.";
      }
    }

    const hasPhotos =
      formData.storefront_photo_urls.length > 0 || !!formData.storefront_photo_url;
    if (!hasPhotos) {
      e.storefront_photo = "At least one storefront photo is mandatory.";
    }
    if (formData.gps_lat == null || formData.gps_long == null) {
      e.gps = "Select location on map or use current location to capture latitude and longitude.";
    }
    if (formData.referral_code && !/^(ML-\d+|\d+)$/i.test(formData.referral_code.trim())) {
      e.referral_code =
        "If provided, referral code must be in format ML-000123 (or numeric location id).";
    }

    if (!isFeVisitOnly) {
      if (
        formData.commission_rate === null ||
        formData.commission_rate < categoryMinCommission
      ) {
        e.commission_rate = `Commission rate must be at least ${categoryMinCommission.toFixed(2)}% for this category.`;
      } else if (formData.commission_rate > VALIDATION_RULES.commission_rate.max) {
        e.commission_rate = ONBOARDING_STRINGS.COMMISSION_MAX_ERROR;
      }
      if (!legalComplete) {
        e.legal = "Please read and accept all required legal agreements.";
      }
    }

    if (Object.keys(e).length > 0) {
      const firstMessage = Object.values(e)[0] ?? "Please review the highlighted fields.";
      pushToast({
        variant: "error",
        title: "Please fix form errors",
        description: firstMessage,
      });
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (isFeVisitOnly) {
      completeStep("basic_details");
      onNext?.();
      return;
    }

    const googleMapsLink =
      formData.gps_lat != null && formData.gps_long != null
        ? buildGoogleMapsUrl(formData.gps_lat, formData.gps_long)
        : undefined;

    const sharedPayload = {
      phone: formData.phone,
      owner_name: formData.owner_name,
      email: formData.owner_email || null,
      email_verified: formData.owner_email ? formData.owner_email_verified : false,
      legal_name: formData.legal_name.trim(),
      gst_business_name: formData.legal_name.trim(),
      shop_name: formData.shop_name.trim(),
      sector_id: formData.sector_id,
      sector_name: formData.sector_name,
      storefront_photo_url: formData.storefront_photo_url,
      storefront_photo_urls: formData.storefront_photo_urls,
      gps_lat: formData.gps_lat,
      gps_long: formData.gps_long,
      gps_accuracy: formData.gps_accuracy,
      google_maps_link: googleMapsLink,
      referral_code: formData.referral_code.trim() || undefined,
      commission_rate: formData.commission_rate ?? undefined,
      commission_model: "flat" as const,
      minimum_commission_percentage: formData.minimum_commission_percentage ?? undefined,
      stage: "submitted" as const,
      status: "pending_review" as ApplicationStatus,
      current_step: "basic_details" as WizardStepId,
    };

    const payload = isFieldExecutive
      ? {
          ...sharedPayload,
          channel: "field_executive" as const,
          submitted_by: "field_executive" as const,
          exec_id: formData.exec_id,
          exec_employee_code: formData.exec_employee_code,
          visit_outcome: formData.visit_outcome,
        }
      : {
          ...sharedPayload,
          channel: "merchant" as const,
          submitted_by: "merchant" as const,
        };

    const onSuccess = (appId: string) => {
      setApplicationId(appId);
      completeStep("basic_details");
      setSubmittedApplicationId(appId);
      setSubmitted(true);
      pushToast({
        variant: "success",
        title: "Application submitted",
        description: isFieldExecutive
          ? "The merchant application has been submitted for review."
          : "Your merchant application has been submitted for review.",
      });
    };

    if (applicationId) {
      updateApp.mutate(
        { id: applicationId, data: payload as Partial<OnboardingApplication> },
        {
          onSuccess: () => onSuccess(applicationId),
          onError: () => {
            pushToast({
              variant: "error",
              title: "Submission failed",
              description: "Could not submit your application. Please try again.",
            });
          },
        },
      );
    } else {
      createApp.mutate(payload as Partial<OnboardingApplication>, {
        onSuccess: (res) => {
          const appId = res.data?.application_id;
          if (appId) {
            onSuccess(appId);
          } else {
            setSubmitted(true);
          }
        },
        onError: () => {
          pushToast({
            variant: "error",
            title: "Submission failed",
            description: "Could not submit your application. Please try again.",
          });
        },
      });
    }
  };

  const goResume = useCallback(() => {
    const params = new URLSearchParams({ from: "basic_details" });
    if (formData.phone?.length === 10) {
      params.set("phone", formData.phone);
    }
    router.push(`/onboard/resume?${params.toString()}`);
  }, [formData.phone, router]);

  const mapsUrl =
    formData.gps_lat != null && formData.gps_long != null
      ? buildGoogleMapsUrl(formData.gps_lat, formData.gps_long)
      : null;

  if (submitted) {
    if (submittedApplicationId) {
      return (
        <ApplicationStatusScreen
          applicationId={submittedApplicationId}
          phone={formData.phone ?? null}
        />
      );
    }

    return (
      <div className="space-y-4 py-12 text-center">
        <div className="text-5xl text-success">
          <FontAwesomeIcon icon={faCircleCheck} />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Application Submitted</h2>
        <p className="mx-auto max-w-md text-muted-foreground">
          {isFieldExecutive
            ? "The merchant application has been submitted. Our team will review it and get back to you."
            : "Your application has been submitted. Our team will review it and get back to you."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Basic Details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us about your business. Phone number is mandatory; email is optional but must be
          verified if provided.
        </p>
      </div>

      <FieldWithInfo
        fieldInfo={ONBOARDING_FIELDS.legal_name}
        required
        error={errors.legal_name}
      >
        <Input
          placeholder={ONBOARDING_FIELDS.legal_name.placeholder}
          value={formData.legal_name}
          onChange={(e) => updateFormData({ legal_name: e.target.value })}
          maxLength={255}
        />
      </FieldWithInfo>

      <FieldWithInfo
        fieldInfo={ONBOARDING_FIELDS.display_name}
        required
        error={errors.shop_name}
      >
        <Input
          placeholder={ONBOARDING_FIELDS.display_name.placeholder}
          value={formData.shop_name}
          onChange={(e) => updateFormData({ shop_name: e.target.value })}
          maxLength={150}
        />
      </FieldWithInfo>

      <FieldWithInfo fieldInfo={ONBOARDING_FIELDS.sector} required error={errors.sector}>
        {categoriesError && (
          <p className="mb-2 text-sm text-destructive">
            Could not load business categories. Check your connection and refresh the page.
          </p>
        )}
        <Select
          options={sectorSelectOptions}
          value={formData.sector_id != null ? String(formData.sector_id) : ""}
          onChange={(v) => {
            const opt = merchantCategories.find((c) => String(c.id) === v);
            const categoryMin =
              opt?.minimum_commission_percentage != null
                ? Number(opt.minimum_commission_percentage)
                : null;
            const patch: Parameters<typeof updateFormData>[0] = {
              sector_id: v,
              sector_name: opt?.name || "",
              minimum_commission_percentage: opt?.minimum_commission_percentage ?? null,
            };
            if (
              categoryMin != null &&
              !Number.isNaN(categoryMin) &&
              (formData.commission_rate == null || formData.commission_rate < categoryMin)
            ) {
              patch.commission_rate = categoryMin;
            }
            updateFormData(patch);
            setCommissionInput(
              String(
                patch.commission_rate ??
                  formData.commission_rate ??
                  categoryMin ??
                  categoryMinCommission,
              ),
            );
            setErrors((prev) => {
              const next = { ...prev };
              delete next.sector;
              return next;
            });
          }}
          placeholder={categoriesLoading ? "Loading categories…" : "Select category..."}
          disabled={categoriesLoading || categoriesError || sectorSelectOptions.length === 0}
        />
      </FieldWithInfo>

      {!isFeVisitOnly && (
        <FieldWithInfo
          fieldInfo={ONBOARDING_FIELDS.commission_rate}
          required
          error={errors.commission_rate}
        >
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {selectedCategory ? (
                <>
                  For{" "}
                  <span className="font-medium text-foreground">{selectedCategory.name}</span>, the
                  minimum commission is{" "}
                  <span className="font-medium text-foreground">
                    {categoryMinCommission.toFixed(2)}%
                  </span>
                  . Adjust using the slider below.
                </>
              ) : (
                "Select a business category above to set your commission rate."
              )}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <p className="text-sm text-muted-foreground">
                Category minimum:{" "}
                <span className="font-medium text-foreground">
                  {categoryMinCommission.toFixed(2)}%
                </span>
              </p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder={categoryMinCommission.toFixed(2)}
                  value={commissionInput}
                  onChange={(e) => handleRateInputChange(e.target.value)}
                  min={categoryMinCommission}
                  max={VALIDATION_RULES.commission_rate.max}
                  step={0.01}
                  className="w-32"
                  disabled={!formData.sector_id}
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <input
              type="range"
              min={categoryMinCommission}
              max={VALIDATION_RULES.commission_rate.max}
              step={0.25}
              value={formData.commission_rate ?? categoryMinCommission}
              onChange={(e) => handleRateSliderChange(e.target.value)}
              className="w-full accent-accent disabled:opacity-50"
              aria-label="Commission rate percentage"
              disabled={!formData.sector_id}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{categoryMinCommission.toFixed(2)}%</span>
              <span>{VALIDATION_RULES.commission_rate.max.toFixed(2)}%</span>
            </div>
            {formData.commission_rate != null && formData.commission_rate > 0 && (
              <div className="mt-2 rounded-md border border-border bg-card p-3">
                <p className="text-sm text-muted-foreground">On a ₹1,000 transaction:</p>
                <div className="mt-1 flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground">
                      Kutoot fee: ₹{((1000 * formData.commission_rate) / 100).toFixed(2)}
                    </span>
                    <span className="text-sm text-foreground">
                      GST (18%): ₹
                      {(((1000 * formData.commission_rate) / 100) * 0.18).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-end border-t border-border pt-1">
                    <span className="text-sm text-success">
                      Merchant receives: ₹
                      {(1000 - ((1000 * formData.commission_rate) / 100) * 1.18).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </FieldWithInfo>
      )}

      <FieldWithInfo
        fieldInfo={ONBOARDING_FIELDS.owner_name}
        required
        error={errors.owner_name}
      >
        <Input
          placeholder={ONBOARDING_FIELDS.owner_name.placeholder}
          value={formData.owner_name}
          onChange={(e) => updateFormData({ owner_name: e.target.value })}
          maxLength={100}
        />
      </FieldWithInfo>

      <FieldWithInfo fieldInfo={ONBOARDING_FIELDS.referral_code} error={errors.referral_code}>
        <Input
          placeholder={ONBOARDING_FIELDS.referral_code.placeholder}
          value={formData.referral_code}
          onChange={(e) =>
            updateFormData({
              referral_code: e.target.value.trim().toUpperCase(),
            })
          }
          maxLength={16}
        />
      </FieldWithInfo>

      <FieldWithInfo fieldInfo={ONBOARDING_FIELDS.phone} required error={errors.phone}>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex shrink-0 items-center justify-center rounded-lg border border-border/80 bg-background/40 px-3 py-2 text-sm text-muted-foreground backdrop-blur-sm">
              +91
            </div>
            <Input
              placeholder="9876543210"
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              maxLength={10}
              inputMode="numeric"
              className="flex-1"
              disabled={formData.merchant_phone_verified}
            />
            {formData.merchant_phone_verified && (
              <span className="text-xs font-medium text-success">Verified</span>
            )}
          </div>

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
          onResume={goResume}
        />
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Email <span className="text-xs text-muted-foreground">(optional)</span>
        </label>
        <Input
          placeholder="merchant@example.com"
          value={formData.owner_email ?? ""}
          onChange={(e) => {
            updateFormData({
              owner_email: e.target.value,
              owner_email_verified: false,
            });
            setEmailOtp("");
            setEmailOtpSent(false);
            setEmailOtpMessage("");
          }}
          disabled={!!formData.owner_email_verified}
        />
        {formData.owner_email && !formData.owner_email_verified && (
          <>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleSendEmailOtp}
                loading={sendEmailOtp.isPending}
              >
                {emailOtpSent ? "Resend Email OTP" : "Send Email OTP"}
              </Button>
            </div>
            {emailOtpSent && (
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end">
                <OtpInput
                  value={emailOtp}
                  onChange={(value) => setEmailOtp(value.replace(/\D/g, "").slice(0, 6))}
                  disabled={verifyEmailOtp.isPending}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto"
                  onClick={handleVerifyEmailOtp}
                  loading={verifyEmailOtp.isPending}
                  disabled={emailOtp.length !== 6}
                >
                  Verify
                </Button>
              </div>
            )}
          </>
        )}
        {formData.owner_email_verified && (
          <p className="mt-1 text-xs text-success">Email verified.</p>
        )}
        {(errors.owner_email || emailOtpMessage) && (
          <p
            className={`mt-1 text-xs leading-5 ${errors.owner_email ? "text-error" : "text-muted-foreground"}`}
          >
            {errors.owner_email ?? emailOtpMessage}
          </p>
        )}
      </div>

      <div className="space-y-2 rounded-lg border border-border p-3">
        <p className="text-sm font-medium text-foreground">
          Shop Location <span className="text-error">*</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Pick your shop location on the map or fetch coordinates from your current location.
        </p>
        <MapLocationPicker
          value={
            formData.gps_lat != null && formData.gps_long != null
              ? { lat: formData.gps_lat, long: formData.gps_long }
              : null
          }
          onSelect={(coords) => {
            handleLocationCaptured(coords);
          }}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input value={formData.gps_lat ?? ""} readOnly placeholder="Latitude" />
          <Input value={formData.gps_long ?? ""} readOnly placeholder="Longitude" />
        </div>
        <Button type="button" variant="secondary" onClick={pickCurrentLocation}>
          Use Current Location
        </Button>
        {gpsStatus && <p className="text-xs text-muted-foreground">{gpsStatus}</p>}
        {errors.gps && <p className="text-xs text-error">{errors.gps}</p>}
      </div>

      <MultiPhotoCapture
        label="Storefront Photos"
        values={formData.storefront_photo_urls}
        onChange={updateStorefrontPhotos}
        onLocationCaptured={(coords) => {
          if (formData.gps_lat == null || formData.gps_long == null) {
            handleLocationCaptured(coords);
          }
        }}
        required
        error={errors.storefront_photo}
        hint="Take or upload photos of your shop front. You can add up to 5 images. Photos are stored securely after submission."
        useDeviceCamera
      />

      {mapsUrl && formData.gps_lat != null && formData.gps_long != null && (
        <div className="rounded-lg border border-border bg-card/50 p-3 space-y-2">
          <p className="text-sm font-medium text-foreground">Google Maps Link</p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-sm text-primary hover:underline"
          >
            Open in Google Maps
          </a>
        </div>
      )}

      {!isFeVisitOnly && (
        <>
          <LegalAcceptanceBlock
            applicationId={applicationId}
            onCompletenessChange={setLegalComplete}
          />
          {errors.legal ? <p className="text-xs text-error">{errors.legal}</p> : null}
        </>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={createApp.isPending || updateApp.isPending}
        >
          {isFeVisitOnly ? "Save & Continue" : "Submit Application"}
        </Button>
      </div>
    </div>
  );
}
