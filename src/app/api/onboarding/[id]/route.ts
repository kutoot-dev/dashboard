/**
 * Route: GET  /api/onboarding/:id (get single application)
 *        PATCH /api/onboarding/:id (update draft / save progress)
 */
import { NextRequest, NextResponse } from "next/server";
import { MOCK_APPLICATIONS } from "@/lib/mock/onboarding";
import type { OnboardingApplication, WizardStepId } from "@/lib/types";

const applications: OnboardingApplication[] = [...MOCK_APPLICATIONS];

function makeResponse(data: unknown, status = 200) {
  return NextResponse.json(
    {
      success: status < 400,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        period_id: null,
        request_id: crypto.randomUUID(),
      },
      error: status >= 400 ? { code: "ERROR", message: String(data) } : null,
    },
    { status },
  );
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const app = applications.find((a) => a.application_id === id);
  if (!app) {
    return makeResponse("Application not found", 404);
  }
  return makeResponse(app);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const idx = applications.findIndex((a) => a.application_id === id);
    if (idx === -1) {
      return makeResponse("Application not found", 404);
    }

    const body = await request.json();
    const app = applications[idx];

    // Server-side commission validation
    if (body.commission_rate !== undefined && body.commission_rate !== null) {
      if (body.commission_rate < 2) {
        return makeResponse("Commission rate cannot be less than 2%", 400);
      }
      if (body.commission_rate > 15) {
        return makeResponse("Commission rate cannot exceed 15%", 400);
      }
    }

    // Server-side phone validation (prevent tampering)
    if (body.phone && body.phone !== app.phone && app.phone) {
      return makeResponse("Phone number cannot be changed after creation", 400);
    }

    // Merge the updates
    const updatedFields = [
      "current_step",
      "completed_steps",
      "exec_id",
      "exec_name",
      "exec_employee_code",
      "merchant_phone_verified",
      "phone",
      "owner_name",
      "shop_name",
      "sector_id",
      "sector_name",
      "locality",
      "city",
      "state",
      "pin_code",
      "storefront_photo_url",
      "storefront_photo_status",
      "gps_lat",
      "gps_long",
      "gps_accuracy",
      "commission_rate",
      "commission_model",
      "commission_tiers",
      "commission_agreed",
      "gst_number",
      "gst_status",
      "gst_business_name",
      "gst_business_address",
      "pan_number",
      "pan_status",
      "pan_holder_name",
      "aadhaar_number_masked",
      "bank_account_name",
      "bank_account_number",
      "bank_ifsc",
      "bank_name",
      "bank_branch_name",
      "bank_status",
      "penny_drop_status",
      "qr_serial",
      "qr_assigned",
      "qr_photo_url",
      "operating_hours_start",
      "operating_hours_end",
      "expected_monthly_volume",
      "terms_accepted",
      "privacy_accepted",
      "status",
      "last_modified_by",
    ] as const;

    for (const field of updatedFields) {
      if (body[field] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (app as any)[field] = body[field];
      }
    }

    app.updated_at = new Date().toISOString();

    // If submitting
    if (body.status === "pending_review" && !app.submitted_at) {
      app.submitted_at = new Date().toISOString();
    }

    // Add audit entry
    if (body.current_step) {
      app.audit_trail.push({
        timestamp: new Date().toISOString(),
        actor: body.last_modified_by || app.channel,
        actor_id: app.exec_id || app.phone || "unknown",
        step: body.current_step as WizardStepId,
        action: body.status === "pending_review" ? "submitted" : "draft_saved",
        details: null,
        gps_lat: body.gps_lat ?? null,
        gps_long: body.gps_long ?? null,
        device_fingerprint: body.device_fingerprint ?? null,
      });
    }

    applications[idx] = app;
    return makeResponse(app);
  } catch {
    return makeResponse("Internal server error", 500);
  }
}
