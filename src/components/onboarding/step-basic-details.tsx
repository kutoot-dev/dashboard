"use client";

import { MerchantBasicDetails } from "./merchant-basic-details";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Button } from "@/components/ui/button";
import { FieldWithInfo } from "./field-with-info";
import { MultiPhotoCapture } from "./multi-photo-capture";
import { MapLocationPicker } from "./map-location-picker";
import { DuplicateAlert } from "./duplicate-alert";
import { OtpInput } from "./otp-input";
import { ApplicationStatusScreen } from "./application-status-screen";
import {
  useCheckPhone,
  useCities,
  useCreateApplication,
  useMerchantCategories,
  useSendEmailOtp,
  useStates,
  useUpdateApplication,
  useVerifyEmailOtp,
} from "@/lib/hooks";
import {
  ONBOARDING_FIELDS,
  VALIDATION_RULES,
  VOLUME_RANGES,
} from "@/lib/constants/onboarding";
import type { ApplicationStatus, OnboardingApplication, WizardStepId } from "@/lib/types";
import { useToastStore } from "@/lib/stores/toast.store";
import { resolveAddressFromCoords } from "@/lib/utils/resolve-address-from-coords";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

interface StepBasicDetailsProps {
  onNext: () => void;
  onBack: () => void;
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

export function StepBasicDetails({ onNext, onBack }: StepBasicDetailsProps) {
  const { formData } = useOnboardingStore();

  if (formData.channel === "merchant") {
    return <MerchantBasicDetails onBack={onBack} />;
  }

  return <FieldExecutiveBasicDetails onNext={onNext} onBack={onBack} />;
}

function buildGoogleMapsUrl(lat: number, long: number): string {
  return `https://www.google.com/maps?q=${lat},${long}`;
}

function FieldExecutiveBasicDetails({ onNext, onBack }: StepBasicDetailsProps) {
  const router = useRouter();
  const {
    formData,
    updateFormData,
    phoneCheckResult,
    setPhoneCheckResult,
    applicationId,
    setApplicationId,
    completeStep,
  } = useOnboardingStore();
  const pushToast = useToastStore((s) => s.push);
  const checkPhone = useCheckPhone();
  const sendEmailOtp = useSendEmailOtp();
  const verifyEmailOtp = useVerifyEmailOtp();
  const createApp = useCreateApplication();
  const updateApp = useUpdateApplication();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submittedApplicationId, setSubmittedApplicationId] = useState<string | null>(null);
  const [gpsStatus, setGpsStatus] = useState<string>("");
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [selectedStateId, setSelectedStateId] = useState<string>("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpMessage, setEmailOtpMessage] = useState("");

  // FE visiting a non-interested (or any non-onboarding) merchant → relaxed rules
  const isFeVisitOnly =
    formData.channel === "field_executive" &&
    formData.visit_outcome !== "interested" &&
    formData.visit_outcome !== null;
  const showReferralField =
    formData.channel === "merchant" ||
    (formData.channel === "field_executive" && formData.visit_outcome === "interested");

  // Debounced phone check
  const handlePhoneChange = useCallback(
    (value: string) => {
      const clean = normalizeIndianMobileInput(value);
      updateFormData({ phone: clean });

      if (formData.channel !== "field_executive") {
        return;
      }

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
    [checkPhone, formData.channel, setPhoneCheckResult, updateFormData],
  );

  const { states } = useStates();

  const applyResolvedAddress = useCallback(
    (resolved: {
      pin_code?: string;
      state?: string;
      city?: string;
      locality?: string;
      state_id?: number | null;
    }) => {
      const patch: {
        pin_code?: string;
        state?: string;
        city?: string;
        locality?: string;
      } = {};

      if (resolved.pin_code) {
        patch.pin_code = resolved.pin_code;
      }
      if (resolved.state) {
        patch.state = resolved.state;
      }
      if (resolved.city) {
        patch.city = resolved.city;
      }
      if (resolved.locality && !formData.locality.trim()) {
        patch.locality = resolved.locality;
      }

      if (Object.keys(patch).length > 0) {
        updateFormData(patch);
      }

      if (resolved.state_id != null) {
        setSelectedStateId(String(resolved.state_id));
      } else if (resolved.state) {
        const match = states.find(
          (s) => s.name.toLowerCase() === resolved.state!.toLowerCase(),
        );
        if (match) {
          setSelectedStateId(String(match.id));
        }
      }

      setErrors((prev) => {
        const next = { ...prev };
        delete next.pin_code;
        delete next.state;
        delete next.city;
        delete next.locality;
        return next;
      });
    },
    [formData.locality, states, updateFormData],
  );

  const handleLocationCaptured = useCallback(
    async (coords: { lat: number; long: number; accuracy?: number }) => {
      updateFormData({
        gps_lat: coords.lat,
        gps_long: coords.long,
        ...(coords.accuracy != null ? { gps_accuracy: coords.accuracy } : {}),
      });
      setGpsStatus("Location captured. Resolving address...");
      setIsResolvingAddress(true);

      const resolved = await resolveAddressFromCoords(coords.lat, coords.long);
      setIsResolvingAddress(false);

      if (resolved) {
        applyResolvedAddress(resolved);
        setGpsStatus("Location and address captured from coordinates.");
      } else {
        setGpsStatus(
          "Location captured. Could not auto-fill address — enter state, city, and PIN manually.",
        );
      }

      setErrors((prev) => {
        const next = { ...prev };
        delete next.gps;
        return next;
      });
    },
    [applyResolvedAddress, updateFormData],
  );

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    const legalName = formData.legal_name ?? "";
    const ownerName = formData.owner_name ?? "";
    const shopName = formData.shop_name ?? "";
    const pinCode = formData.pin_code ?? "";

    // Phone: required for merchant / FE-interested; optional for FE visit-only flows
    if (!isFeVisitOnly) {
      if (!VALIDATION_RULES.phone.pattern.test(formData.phone)) {
        e.phone = "Enter a valid 10-digit Indian mobile number starting with 6-9.";
      }
    } else if (formData.phone && !VALIDATION_RULES.phone.pattern.test(formData.phone)) {
      e.phone = "If entered, must be a valid 10-digit number starting with 6-9.";
    }

    // Owner name: required for merchant / FE-interested; optional for FE visit-only flows
    if (!isFeVisitOnly) {
      if (
        ownerName.length < 2 ||
        !VALIDATION_RULES.owner_name.pattern.test(ownerName)
      ) {
        e.owner_name = "Enter a valid name (letters and spaces only, min 2 chars).";
      }
    } else if (
      ownerName &&
      !VALIDATION_RULES.owner_name.pattern.test(ownerName)
    ) {
      e.owner_name = "If entered, must contain only letters and spaces.";
    }

    if (!isFeVisitOnly) {
      if (legalName.trim().length < 2) {
        e.legal_name = "Legal name must be at least 2 characters.";
      }
    }

    if (shopName.length < 2) {
      e.shop_name = "Shop name must be at least 2 characters.";
    }
    if (!formData.sector_id) {
      e.sector = "Select a business category.";
    }
    if (!formData.locality) {
      e.locality = "Enter your shop locality.";
    }
    if (!VALIDATION_RULES.pin_code.pattern.test(pinCode)) {
      e.pin_code = "Enter a valid 6-digit PIN code.";
    }
    if (!formData.city) {
      e.city = "City is required.";
    }
    if (!formData.state) {
      e.state = "State is required.";
    }
    if (formData.referral_code && !/^(ML-\d+|\d+)$/i.test(formData.referral_code.trim())) {
      e.referral_code = "If provided, referral code must be in format ML-000123 (or numeric location id).";
    }
    if (formData.gps_lat == null || formData.gps_long == null) {
      e.gps = "Select map location to capture latitude and longitude.";
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
    // Storefront photo: required only for interested / merchant flows
    const hasStorefrontPhotos =
      formData.storefront_photo_urls.length > 0 || !!formData.storefront_photo_url;
    if (!isFeVisitOnly && !hasStorefrontPhotos) {
      e.storefront_photo = "At least one shop storefront photo is mandatory.";
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

  const handleContinue = () => {
    if (!validate()) return;

    if (isFeVisitOnly) {
      onNext();
      return;
    }

    const googleMapsLink =
      formData.gps_lat != null && formData.gps_long != null
        ? buildGoogleMapsUrl(formData.gps_lat, formData.gps_long)
        : undefined;

    const payload = {
      channel: "field_executive" as const,
      submitted_by: "field_executive" as const,
      exec_id: formData.exec_id,
      exec_employee_code: formData.exec_employee_code,
      visit_outcome: formData.visit_outcome,
      phone: formData.phone,
      owner_name: formData.owner_name,
      legal_name: formData.legal_name.trim() || undefined,
      gst_business_name: formData.legal_name.trim() || undefined,
      email: formData.owner_email || null,
      email_verified: formData.owner_email ? formData.owner_email_verified : false,
      shop_name: formData.shop_name.trim(),
      door_no: formData.door_no || null,
      shop_no: formData.shop_no || null,
      year_of_establishment: formData.year_of_establishment || null,
      business_ownership_type: formData.business_ownership_type || null,
      sector_id: formData.sector_id,
      sector_name: formData.sector_name,
      locality: formData.locality,
      city: formData.city,
      state: formData.state,
      pin_code: formData.pin_code,
      branch_name: formData.branch_name || null,
      referral_code: formData.referral_code.trim() || undefined,
      storefront_photo_url: formData.storefront_photo_url,
      storefront_photo_urls: formData.storefront_photo_urls,
      gps_lat: formData.gps_lat,
      gps_long: formData.gps_long,
      gps_accuracy: formData.gps_accuracy,
      google_maps_link: googleMapsLink,
      operating_hours_start: formData.operating_hours_start || undefined,
      operating_hours_end: formData.operating_hours_end || undefined,
      expected_monthly_volume: formData.expected_monthly_volume || undefined,
      stage: "submitted" as const,
      status: "pending_review" as ApplicationStatus,
      current_step: "basic_details" as WizardStepId,
    };

    const onSuccess = (appId: string) => {
      setApplicationId(appId);
      completeStep("basic_details");
      setSubmittedApplicationId(appId);
      setSubmitted(true);
      pushToast({
        variant: "success",
        title: "Application submitted",
        description: "The merchant application has been submitted for review.",
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
              description: "Could not submit the application. Please try again.",
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
            description: "Could not submit the application. Please try again.",
          });
        },
      });
    }
  };

  const selectedState =
    states.find((s) => String(s.id) === selectedStateId) ??
    states.find((s) => s.name === formData.state) ??
    null;
  const {
    cities,
    isLoading: citiesLoading,
    isError: citiesError,
  } = useCities(selectedState?.id ?? null);
  const {
    categories: merchantCategories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useMerchantCategories();

  const sectorSelectOptions = merchantCategories.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));
  const cityOptions = cities;
  const selectedStateValue =
    selectedStateId ||
    (states.find((s) => s.name === formData.state)?.id != null
      ? String(states.find((s) => s.name === formData.state)?.id)
      : "");

  const pickCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus("Geolocation not supported on this device.");
      return;
    }
    setGpsStatus("Fetching current location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void handleLocationCaptured({
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

  const goResume = useCallback(() => {
    const params = new URLSearchParams({ from: "basic_details" });
    if (formData.phone?.length === 10) {
      params.set("phone", formData.phone);
    }
    router.push(`/onboard/resume?${params.toString()}`);
  }, [formData.phone, router]);

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
          The merchant application has been submitted. Our team will review it and get back to you.
        </p>
      </div>
    );
  }

  const handleSendEmailOtp = async () => {
    const email = formData.owner_email.trim().toLowerCase();
    if (!email) {
      setErrors((prev) => ({ ...prev, owner_email: "Email is required to send OTP." }));
      pushToast({
        variant: "error",
        title: "Email required",
        description: "Enter a valid email address before sending OTP.",
      });
      return;
    }
    setEmailOtp("");
    try {
      const res = await sendEmailOtp.mutateAsync(email);
      if (res.data.sent) {
        setEmailOtpSent(true);
        setEmailOtpMessage("OTP sent to email.");
        pushToast({
          variant: "success",
          title: "Onboarding email OTP sent",
          description: "Enter the new OTP to verify this email.",
        });
        setErrors((prev) => {
          const next = { ...prev };
          delete next.owner_email;
          return next;
        });
      }
    } catch {
      setEmailOtpMessage("Failed to send OTP. Please try again.");
      pushToast({
        variant: "error",
        title: "OTP send failed",
        description: "Unable to send email OTP right now. Please retry.",
      });
    }
  };

  const handleVerifyEmailOtp = async () => {
    const email = formData.owner_email.trim().toLowerCase();
    if (emailOtp.length !== 6) {
      setEmailOtpMessage("Enter 6-digit OTP.");
      pushToast({
        variant: "error",
        title: "Invalid OTP",
        description: "Enter a valid 6-digit OTP.",
      });
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
          description: "You can continue onboarding.",
        });
        setErrors((prev) => {
          const next = { ...prev };
          delete next.owner_email;
          return next;
        });
      }
    } catch {
      setEmailOtpMessage("Invalid or expired OTP.");
      pushToast({
        variant: "error",
        title: "OTP verification failed",
        description: "Invalid or expired OTP. Request a new code and try again.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Basic Details</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isFeVisitOnly
            ? "Capture basic shop details for the visit record. Phone and owner name are optional."
            : "Tell us about your shop and business. All fields marked with * are mandatory."}
        </p>
      </div>

      {/* Phone Number */}
      <FieldWithInfo
        fieldInfo={ONBOARDING_FIELDS.phone}
        required={!isFeVisitOnly}
        error={errors.phone}
      >
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
            disabled={formData.channel === "merchant"}
            className="flex-1"
          />
          {formData.channel === "field_executive" && checkPhone.isPending && (
            <div className="flex items-center px-2 text-xs text-muted-foreground">
              Checking...
            </div>
          )}
        </div>
        {formData.channel === "merchant" && formData.merchant_phone_verified && (
          <p className="mt-1 text-xs text-success">Mobile number verified in identity step.</p>
        )}
      </FieldWithInfo>

      {/* Duplicate alert */}
      {formData.channel === "field_executive" && phoneCheckResult?.exists && (
        <DuplicateAlert
          status={phoneCheckResult.status as "active_merchant" | "existing_lead" | "already_submitted" | "existing_fe_visit"}
          applicationId={phoneCheckResult.application_id}
          applicationStatus={phoneCheckResult.status as ApplicationStatus}
          message={phoneCheckResult.message}
          onResume={goResume}
        />
      )}

      {/* FE duplicate visit warning */}
      {formData.channel === "field_executive" &&
        phoneCheckResult?.status === "existing_fe_visit" && (
          <div className="rounded-lg border border-warning/40 bg-warning/5 p-4">
            <div className="flex gap-3">
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  className="h-5 w-5 shrink-0 text-warning mt-0.5"
                />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Another field executive already visited this store
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {phoneCheckResult.visiting_exec_name
                    ? `This merchant was visited by ${phoneCheckResult.visiting_exec_name}.`
                    : "A previous visit record exists for this number."}{" "}
                  You can still continue if this is a new field visit and submit another application.
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Owner Name */}
      <FieldWithInfo
        fieldInfo={ONBOARDING_FIELDS.owner_name}
        required={!isFeVisitOnly}
        error={errors.owner_name}
      >
        <Input
          placeholder={ONBOARDING_FIELDS.owner_name.placeholder}
          value={formData.owner_name}
          onChange={(e) => updateFormData({ owner_name: e.target.value })}
          maxLength={100}
        />
      </FieldWithInfo>

      <FieldWithInfo
        fieldInfo={ONBOARDING_FIELDS.legal_name}
        required={!isFeVisitOnly}
        error={errors.legal_name}
      >
        <Input
          placeholder={ONBOARDING_FIELDS.legal_name.placeholder}
          value={formData.legal_name}
          onChange={(e) => updateFormData({ legal_name: e.target.value })}
          maxLength={255}
        />
      </FieldWithInfo>

      {showReferralField && (
        <FieldWithInfo
          fieldInfo={ONBOARDING_FIELDS.referral_code}
          error={errors.referral_code}
        >
          <Input
            placeholder={ONBOARDING_FIELDS.referral_code.placeholder}
            value={formData.referral_code}
            onChange={(e) =>
              updateFormData({
                referral_code: e.target.value.trim(),
              })
            }
            maxLength={16}
          />
        </FieldWithInfo>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Email <span className="text-xs text-muted-foreground">(optional, single email)</span>
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
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {!formData.owner_email_verified ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleSendEmailOtp}
              loading={sendEmailOtp.isPending}
              disabled={!formData.owner_email}
            >
              {emailOtpSent ? "Resend OTP" : "Send Email OTP"}
            </Button>
          ) : null}
        </div>
        {emailOtpSent && !formData.owner_email_verified && (
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
        {(errors.owner_email || emailOtpMessage) && (
          <p
            className={`mt-1 wrap-break-word text-xs leading-5 ${errors.owner_email ? "text-error" : "text-muted-foreground"}`}
          >
            {errors.owner_email ?? emailOtpMessage}
          </p>
        )}
      </div>

      {/* Shop Name */}
      <FieldWithInfo fieldInfo={ONBOARDING_FIELDS.shop_name} required error={errors.shop_name}>
        <Input
          placeholder={ONBOARDING_FIELDS.shop_name.placeholder}
          value={formData.shop_name}
          onChange={(e) => updateFormData({ shop_name: e.target.value })}
          maxLength={150}
        />
      </FieldWithInfo>

      {/* Sector / merchant category (from API) */}
      <FieldWithInfo fieldInfo={ONBOARDING_FIELDS.sector} required error={errors.sector}>
        {categoriesError && (
          <p className="text-sm text-destructive mb-2">
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
              minimum_commission_percentage:
                opt?.minimum_commission_percentage ?? null,
            };
            if (
              categoryMin != null &&
              !Number.isNaN(categoryMin) &&
              formData.commission_rate != null &&
              formData.commission_rate < categoryMin
            ) {
              patch.commission_rate = categoryMin;
            }
            updateFormData(patch);
          }}
          placeholder={categoriesLoading ? "Loading categories…" : "Select category..."}
          disabled={categoriesLoading || categoriesError || sectorSelectOptions.length === 0}
        />
      </FieldWithInfo>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Year of Establishment</label>
          <Input
            type="number"
            min="1900"
            max={String(new Date().getFullYear())}
            placeholder="2018"
            value={formData.year_of_establishment ?? ""}
            onChange={(e) => updateFormData({ year_of_establishment: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Business Ownership Type</label>
          <Select
            options={[
              { value: "proprietorship", label: "Proprietorship" },
              { value: "partnership", label: "Partnership" },
              { value: "llp", label: "LLP" },
              { value: "private_limited", label: "Private Limited" },
              { value: "public_limited", label: "Public Limited" },
              { value: "unregistered", label: "Unregistered / Other" },
            ]}
            value={formData.business_ownership_type ?? ""}
            onChange={(value) => updateFormData({ business_ownership_type: value })}
            placeholder="Select ownership type..."
          />
        </div>
      </div>

      {/* Locality */}
      <FieldWithInfo fieldInfo={ONBOARDING_FIELDS.locality} required error={errors.locality}>
        <Input
          placeholder={ONBOARDING_FIELDS.locality.placeholder}
          value={formData.locality}
          onChange={(e) => updateFormData({ locality: e.target.value })}
        />
      </FieldWithInfo>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Door No</label>
          <Input
            placeholder="12/3"
            value={formData.door_no ?? ""}
            onChange={(e) => updateFormData({ door_no: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Shop No</label>
          <Input
            placeholder="S-14"
            value={formData.shop_no ?? ""}
            onChange={(e) => updateFormData({ shop_no: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2 rounded-lg border border-border p-3">
        <p className="text-sm font-medium text-foreground">Shop Operating Hours</p>
        <p className="text-xs text-muted-foreground">
          Add the regular opening and closing times for this shop.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Opening Time</label>
            <Input
              type="time"
              value={formData.operating_hours_start ?? ""}
              onChange={(e) =>
                updateFormData({
                  operating_hours_start: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Closing Time</label>
            <Input
              type="time"
              value={formData.operating_hours_end ?? ""}
              onChange={(e) =>
                updateFormData({
                  operating_hours_end: e.target.value,
                })
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Expected Monthly Volume <span className="text-xs text-muted-foreground">(optional)</span>
        </label>
        <Select
          options={VOLUME_RANGES}
          value={formData.expected_monthly_volume ?? ""}
          onChange={(value) => updateFormData({ expected_monthly_volume: value })}
          placeholder="Select expected volume..."
        />
        {errors.expected_monthly_volume && (
          <p className="text-xs text-error">{errors.expected_monthly_volume}</p>
        )}
      </div>

      {/* PIN / State / City */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldWithInfo fieldInfo={ONBOARDING_FIELDS.pin_code} required error={errors.pin_code}>
          <Input
            placeholder="560034"
            value={formData.pin_code}
            onChange={(e) =>
              updateFormData({
                pin_code: e.target.value.replace(/\D/g, "").slice(0, 6),
              })
            }
            maxLength={6}
            inputMode="numeric"
          />
        </FieldWithInfo>
        <FieldWithInfo fieldInfo={ONBOARDING_FIELDS.state} required error={errors.state}>
          <SearchableSelect
            options={states.map((s) => ({ value: String(s.id), label: s.name }))}
            value={selectedStateValue}
            onChange={(v) => {
              const state = states.find((s) => String(s.id) === v);
              setSelectedStateId(v);
              updateFormData({ state: state?.name ?? "", city: "" });
            }}
            placeholder="Select state..."
            noResultsText="No states found"
          />
        </FieldWithInfo>
      </div>

      <FieldWithInfo fieldInfo={ONBOARDING_FIELDS.city} required error={errors.city}>
        {citiesError && (
          <p className="text-xs text-destructive mb-2">
            Could not load cities for selected state.
          </p>
        )}
        <SearchableSelect
          options={cityOptions.map((city) => ({ value: city, label: city }))}
          value={formData.city}
          onChange={(v) => updateFormData({ city: v })}
          placeholder={
            !selectedState
              ? "Select state first"
              : citiesLoading
                ? "Loading cities..."
                : "Select city..."
          }
          disabled={!selectedState || citiesLoading || citiesError}
          noResultsText="No cities found"
        />
      </FieldWithInfo>

      <div className="space-y-2 rounded-lg border border-border p-3">
        <p className="text-sm font-medium text-foreground">
          Map Location <span className="text-error">*</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Select visually from map or capture your current location.
        </p>
        <MapLocationPicker
          value={
            formData.gps_lat != null && formData.gps_long != null
              ? { lat: formData.gps_lat, long: formData.gps_long }
              : null
          }
          onSelect={(coords) => {
            void handleLocationCaptured(coords);
          }}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input value={formData.gps_lat ?? ""} readOnly placeholder="Latitude" />
          <Input value={formData.gps_long ?? ""} readOnly placeholder="Longitude" />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={pickCurrentLocation}
          disabled={isResolvingAddress}
        >
          Current Location
        </Button>
        {gpsStatus && (
          <p className="text-xs text-muted-foreground">
            {isResolvingAddress ? "Resolving address from coordinates…" : gpsStatus}
          </p>
        )}
        {errors.gps && <p className="text-xs text-error">{errors.gps}</p>}
      </div>

      {/* Branch / outlet name (optional, helpful when the merchant runs multiple outlets) */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Branch / Outlet Name <span className="text-xs text-muted-foreground">(optional)</span>
        </label>
        <Input
          placeholder="Koramangala Outlet"
          value={formData.branch_name}
          onChange={(e) => updateFormData({ branch_name: e.target.value })}
        />
      </div>

      {/* Storefront Photos — optional for FE visit-only, required otherwise */}
      <MultiPhotoCapture
        label="Store / Business Photos"
        values={formData.storefront_photo_urls}
        onChange={updateStorefrontPhotos}
        onLocationCaptured={(coords) => {
          if (formData.gps_lat == null || formData.gps_long == null) {
            void handleLocationCaptured(coords);
          }
        }}
        required={!isFeVisitOnly}
        error={errors.storefront_photo}
        hint={
          isFeVisitOnly
            ? "Optional for visit records. You can add up to 5 photos using your phone camera."
            : "Take live photos of the shop front. You can add up to 5 images."
        }
        useDeviceCamera
      />

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={handleContinue}
          loading={createApp.isPending || updateApp.isPending}
        >
          {isFeVisitOnly ? "Save & Continue" : "Submit Application"}
        </Button>
      </div>
    </div>
  );
}
