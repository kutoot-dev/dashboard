/**
 * Route: POST /api/onboarding/verify-bank
 * Verify bank account via penny drop (mocked).
 * Non-blocking: failure results in pending_recheck.
 */
import { NextRequest, NextResponse } from "next/server";
import type { BankVerifyResult } from "@/lib/types";

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

// IFSC → Bank name lookup (mock)
const IFSC_BANKS: Record<string, { bank: string; branch: string }> = {
  SBIN: { bank: "State Bank of India", branch: "Main Branch" },
  HDFC: { bank: "HDFC Bank", branch: "City Branch" },
  ICIC: { bank: "ICICI Bank", branch: "Metro Branch" },
  BARB: { bank: "Bank of Baroda", branch: "Local Branch" },
  PUNB: { bank: "Punjab National Bank", branch: "PNB Branch" },
  KKBK: { bank: "Kotak Mahindra Bank", branch: "Kotak Branch" },
  UTIB: { bank: "Axis Bank", branch: "Axis Branch" },
  IDFB: { bank: "IDFC First Bank", branch: "IDFC Branch" },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ifsc = String(body.ifsc || "").trim().toUpperCase();
    const accountNumber = String(body.account_number || "").trim();
    const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;

    if (!ifsc || !ifscPattern.test(ifsc)) {
      const result: BankVerifyResult = {
        valid: false,
        bank_name: null,
        branch_name: null,
        penny_drop_status: "failed",
        message: "Invalid IFSC format. Expected: SBIN0001234",
      };
      return makeResponse(result);
    }

    if (!accountNumber || accountNumber.length < 9 || accountNumber.length > 18) {
      const result: BankVerifyResult = {
        valid: false,
        bank_name: null,
        branch_name: null,
        penny_drop_status: "failed",
        message: "Invalid account number. Must be 9-18 digits.",
      };
      return makeResponse(result);
    }

    const bankCode = ifsc.substring(0, 4);
    const bankInfo = IFSC_BANKS[bankCode];

    // Simulate 10% failure
    if (Math.random() < 0.1) {
      const result: BankVerifyResult = {
        valid: false,
        bank_name: bankInfo?.bank || null,
        branch_name: bankInfo?.branch || null,
        penny_drop_status: "pending",
        message:
          "Bank verification pending. ₹1 test deposit will be retried. Your onboarding will proceed.",
      };
      return makeResponse(result);
    }

    const result: BankVerifyResult = {
      valid: true,
      bank_name: bankInfo?.bank || "Unknown Bank",
      branch_name: bankInfo?.branch || "Branch",
      penny_drop_status: "success",
      message: "Bank account verified successfully via ₹1 penny drop.",
    };
    return makeResponse(result);
  } catch {
    const result: BankVerifyResult = {
      valid: false,
      bank_name: null,
      branch_name: null,
      penny_drop_status: "pending",
      message:
        "Bank verification service error. Will be retried. Your onboarding continues.",
    };
    return makeResponse(result);
  }
}
