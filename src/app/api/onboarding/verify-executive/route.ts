/**
 * Route: POST /api/onboarding/verify-executive
 * Verify field executive employee code.
 */
import { NextRequest, NextResponse } from "next/server";
import { MOCK_EXECUTIVES } from "@/lib/mock/onboarding";
import type { ExecutiveVerifyResult } from "@/lib/types";

const verifyTracker = new Map<string, { count: number; resetAt: number }>();

function makeResponse(data: unknown, status = 200) {
  return NextResponse.json(
    {
      success: status < 400,
      data,
      meta: { timestamp: new Date().toISOString(), period_id: null, request_id: crypto.randomUUID() },
      error: status >= 400 ? { code: "ERROR", message: String(data) } : null,
    },
    { status },
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = String(body.employee_code || "").trim().toUpperCase();

    // Rate limit: 5 per code per hour
    const now = Date.now();
    const key = `code:${code}`;
    const tracker = verifyTracker.get(key);
    if (tracker && tracker.resetAt > now && tracker.count >= 5) {
      return makeResponse("Too many attempts for this code. Try again later.", 429);
    }
    if (!tracker || tracker.resetAt <= now) {
      verifyTracker.set(key, { count: 1, resetAt: now + 3600000 });
    } else {
      tracker.count++;
    }

    if (!code || code.length < 4 || code.length > 8) {
      const result: ExecutiveVerifyResult = {
        valid: false,
        exec_id: null,
        exec_name: null,
        message: "Invalid employee code format. Must be 4-8 alphanumeric characters.",
      };
      return makeResponse(result);
    }

    const exec = MOCK_EXECUTIVES.find(
      (e) => e.employee_code.toUpperCase() === code && e.is_active,
    );

    const result: ExecutiveVerifyResult = exec
      ? {
          valid: true,
          exec_id: exec.exec_id,
          exec_name: exec.name,
          message: `Verified: ${exec.name} (${exec.region})`,
        }
      : {
          valid: false,
          exec_id: null,
          exec_name: null,
          message: "Employee code not found or account is inactive.",
        };

    return makeResponse(result);
  } catch {
    return makeResponse("Internal server error", 500);
  }
}
