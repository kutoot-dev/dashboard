"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Button } from "@/components/ui/button";
import { FieldWithInfo } from "./field-with-info";
import { PhotoCapture } from "./photo-capture";
import { MapLocationPicker } from "./map-location-picker";
import { DuplicateAlert } from "./duplicate-alert";
import { OtpInput } from "./otp-input";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import {
  useCheckPhone,
  useCities,
  useMerchantCategories,
  useSendEmailOtp,
  useStates,
  useVerifyEmailOtp,
} from "@/lib/hooks";
import {
  ONBOARDING_FIELDS,
  VALIDATION_RULES,
  VOLUME_RANGES,
} from "@/lib/constants/onboarding";
import type { ApplicationStatus } from "@/lib/types";
import { useToastStore } from "@/lib/stores/toast.store";
import { resolveAddressFromCoords } from "@/lib/utils/resolve-address-from-coords";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

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
  const router = useRouter();
  const { formData, updateFormData, phoneCheckResult, setPhoneCheckResult } =
    useOnboardingStore();
  const pushToast = useToastStore((s) => s.push);
  const checkPhone = useCheckPhone();
  const sendEmailOtp = useSendEmailOtp();
  const verifyEmailOtp = useVerifyEmailOtp();
  const [errors, setErrors] = useState<Record<string, string>>({});
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
    if (!isFeVisitOnly && !formData.storefront_photo_url) {
      e.storefront_photo = "Shop storefront photo is mandatory.";
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

  const handleNext = () => {
    if (validate()) {
      onNext();
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

  const goResume = useCallback(() => {
    const params = new URLSearchParams({ from: "basic_details" });
    if (formData.phone?.length === 10) {
      params.set("phone", formData.phone);
    }
    router.push(`/onboard/resume?${params.toString()}`);
  }, [formData.phone, router]);

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
            updateFormData({
              sector_id: v,
              sector_name: opt?.name || "",
              minimum_commission_percentage:
                opt?.minimum_commission_percentage ?? null,
            });
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

      {/* Storefront Photo — optional for FE visit-only, required otherwise */}
      <PhotoCapture
        label="Store / Business Photo"
        value={formData.storefront_photo_url}
        onChange={(url) =>
          updateFormData({
            storefront_photo_url: url,
            storefront_photo_status: url ? "uploaded" : "pending",
          })
        }
        onLocationCaptured={(coords) => {
          void handleLocationCaptured(coords);
        }}
        required={!isFeVisitOnly}
        error={errors.storefront_photo}
        hint={
          isFeVisitOnly
            ? "Optional for visit records. Use your phone camera at the shop."
            : "Take a live photo of the shop front using your device camera. Enable location access for GPS stamp."
        }
        hideUpload
        useDeviceCamera
      />

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={handleNext}
        >
          Save & Continue
        </Button>
      </div>
    </div>
  );
}
