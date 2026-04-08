/**
 * Route: POST /api/onboarding (create application)
 *        GET  /api/onboarding (list applications)
 *
 * BACKEND SPEC: INSERT INTO onboarding_applications (...) / SELECT * FROM ...
 */
import { NextRequest, NextResponse } from "next/server";
import { MOCK_APPLICATIONS, toApplicationSummary } from "@/lib/mock/onboarding";
import type { OnboardingApplication } from "@/lib/types";

// In-memory store for mock (shared across requests in dev)
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

// Rate limit tracking (simple in-memory)
const submitTracker = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: NextRequest) {
  try {
    // Simple rate limit: 5 submissions per IP per hour
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const tracker = submitTracker.get(ip);
    if (tracker && tracker.resetAt > now && tracker.count >= 5) {
      return makeResponse("Too many submissions. Try again later.", 429);
    }
    if (!tracker || tracker.resetAt <= now) {
      submitTracker.set(ip, { count: 1, resetAt: now + 3600000 });
    } else {
      tracker.count++;
    }

    const body = await request.json();

    // Honeypot check
    if (body.website_url) {
      // Silent reject — appear successful to not tip off bot
      return makeResponse({ application_id: "KT-FAKE-0000", status: "draft" });
    }

    // Time-on-form check
    if (body.start_time) {
      const elapsed = (now - new Date(body.start_time).getTime()) / 1000;
      if (elapsed < 30) {
        return makeResponse("Submission too fast. Please try again.", 400);
      }
    }

    // Generate application ID
    const seq = applications.length + 1;
    const appId = `KT-2026-${String(seq).padStart(4, "0")}`;

    const newApp: OnboardingApplication = {
      application_id: appId,
      status: "draft",
      channel: body.channel || "merchant",
      current_step: body.current_step || "identity",
      completed_steps: body.completed_steps || [],
      exec_id: body.exec_id || null,
      exec_name: body.exec_name || null,
      exec_employee_code: body.exec_employee_code || null,
      merchant_phone_verified: body.merchant_phone_verified || false,
      phone: body.phone || "",
      owner_name: body.owner_name || "",
      shop_name: body.shop_name || "",
      sector_id: body.sector_id || "",
      sector_name: body.sector_name || "",
      locality: body.locality || "",
      city: body.city || "",
      state: body.state || "",
      pin_code: body.pin_code || "",
      storefront_photo_url: body.storefront_photo_url || null,
      storefront_photo_status: body.storefront_photo_url ? "uploaded" : "pending",
      gps_lat: body.gps_lat ?? null,
      gps_long: body.gps_long ?? null,
      gps_accuracy: body.gps_accuracy ?? null,
      commission_rate: body.commission_rate ?? null,
      commission_model: body.commission_model ?? null,
      commission_tiers: body.commission_tiers ?? null,
      commission_agreed: body.commission_agreed ?? false,
      gst_number: body.gst_number ?? null,
      gst_status: "not_started",
      gst_business_name: null,
      gst_business_address: null,
      gst_doc_photo_url: body.gst_doc_photo_url ?? null,
      pan_number: body.pan_number ?? null,
      pan_status: "not_started",
      pan_holder_name: null,
      pan_doc_photo_url: body.pan_doc_photo_url ?? null,
      aadhaar_number_masked: body.aadhaar_number_masked ?? null,
      aadhaar_doc_photo_url: body.aadhaar_doc_photo_url ?? null,
      bank_account_name: body.bank_account_name ?? null,
      bank_account_number: body.bank_account_number ?? null,
      bank_ifsc: body.bank_ifsc ?? null,
      bank_name: null,
      bank_branch_name: null,
      bank_status: "not_started",
      penny_drop_status: "not_started",
      qr_serial: body.qr_serial ?? null,
      qr_assigned: false,
      qr_photo_url: body.qr_photo_url ?? null,
      operating_hours_start: body.operating_hours_start ?? null,
      operating_hours_end: body.operating_hours_end ?? null,
      expected_monthly_volume: body.expected_monthly_volume ?? null,
      terms_accepted: body.terms_accepted ?? false,
      privacy_accepted: body.privacy_accepted ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      submitted_at: null,
      last_modified_by: body.channel || "merchant",
      submitted_by: body.channel || "merchant",
      device_fingerprint: body.device_fingerprint ?? null,
      start_time: body.start_time || new Date().toISOString(),
      visit_outcome: body.visit_outcome ?? null,
      visit_notes: body.visit_notes ?? null,
      follow_up_schedules: body.follow_up_schedules ?? [],
      audit_trail: [
        {
          timestamp: new Date().toISOString(),
          actor: body.channel || "merchant",
          actor_id: body.exec_id || body.phone || "unknown",
          step: "identity",
          action: "step_entered",
          details: "Application created",
          gps_lat: body.gps_lat ?? null,
          gps_long: body.gps_long ?? null,
          device_fingerprint: body.device_fingerprint ?? null,
        },
      ],
    };

    applications.push(newApp);
    return makeResponse(newApp, 201);
  } catch {
    return makeResponse("Internal server error", 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const execId = searchParams.get("exec_id");
    const phone = searchParams.get("phone");

    let filtered = applications;

    if (status) {
      filtered = filtered.filter((a) => a.status === status);
    }
    if (execId) {
      filtered = filtered.filter((a) => a.exec_id === execId);
    }
    if (phone) {
      filtered = filtered.filter((a) => a.phone === phone);
    }

    const summaries = filtered.map(toApplicationSummary);

    return makeResponse({
      items: summaries,
      pagination: {
        page: 1,
        limit: 50,
        total: summaries.length,
        total_pages: 1,
      },
    });
  } catch {
    return makeResponse("Internal server error", 500);
  }
}
