/**
 * Route: GET /api/leaderboard
 *
 * BACKEND SPEC: Compute ranked leaderboard using RANK() OVER (ORDER BY
 *   composite_index_score DESC) with joins to merchants, sectors, locations.
 *   Support filtering by period_id, city_tier, state.
 *   Paginate with OFFSET/LIMIT. Cache per period (scores are immutable once closed).
 */
import { NextRequest, NextResponse } from "next/server";
import { computeLeaderboard } from "@/lib/mock/leaderboard";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10)),
    );
    const cityTier = searchParams.get("city_tier") || undefined;
    const state = searchParams.get("state") || undefined;
    const startDate = searchParams.get("start_date") || undefined;
    const endDate = searchParams.get("end_date") || undefined;

    let entries = computeLeaderboard(undefined, undefined, undefined, startDate, endDate);

    // Apply city_tier filter
    if (cityTier) {
      entries = entries.filter((e) => e.city_tier === cityTier);
    }

    // Apply state filter
    if (state) {
      entries = entries.filter(
        (e) => e.state.toLowerCase() === state.toLowerCase(),
      );
    }

    const total = entries.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedEntries = entries.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        items: paginatedEntries,
        pagination: {
          page,
          limit,
          total,
          total_pages: totalPages,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        period_id: null,
        request_id: crypto.randomUUID(),
      },
      error: null,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        data: null,
        meta: {
          timestamp: new Date().toISOString(),
          period_id: null,
          request_id: crypto.randomUUID(),
        },
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch leaderboard",
        },
      },
      { status: 500 },
    );
  }
}
