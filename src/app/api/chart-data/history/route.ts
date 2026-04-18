import { NextRequest, NextResponse } from "next/server";
import { authHeaders, backendUrl } from "@/lib/api/server/proxy";

type Resolution = "1" | "5" | "15" | "30" | "60" | "D" | "W" | "M";

type UdfHistoryResponse = {
  s: "ok" | "no_data" | "error";
  t?: number[];
  o?: number[];
  h?: number[];
  l?: number[];
  c?: number[];
  v?: number[];
  nextTime?: number;
};

const STEP_SECONDS: Record<Resolution, number> = {
  "1": 60,
  "5": 5 * 60,
  "15": 15 * 60,
  "30": 30 * 60,
  "60": 60 * 60,
  D: 24 * 60 * 60,
  W: 7 * 24 * 60 * 60,
  M: 30 * 24 * 60 * 60,
};

function parseLocationId(symbol: string): number {
  const match = /^LOC_(\d+)$/i.exec(symbol);
  if (!match) return 0;
  return Number(match[1] ?? 0);
}

function isResolution(value: string): value is Resolution {
  return value in STEP_SECONDS;
}

function simulateHistory(
  locationId: number,
  resolution: Resolution,
  from: number,
  to: number,
): UdfHistoryResponse {
  const step = STEP_SECONDS[resolution];
  if (!Number.isFinite(step) || to <= from) {
    return { s: "no_data" };
  }

  const t: number[] = [];
  const o: number[] = [];
  const h: number[] = [];
  const l: number[] = [];
  const c: number[] = [];
  const v: number[] = [];

  let seed = (locationId + 1) * 7919 + 104729;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  let price = 48 + locationId * 0.7 + rand() * 8;

  const alignedFrom = Math.floor(from / step) * step;
  for (let ts = alignedFrom; ts <= to; ts += step) {
    const drift = (rand() - 0.48) * 1.8;
    const open = price;
    const close = Math.max(1, open + drift);
    const spread = 0.2 + rand() * 0.9;
    const high = Math.max(open, close) + spread;
    const low = Math.max(0.2, Math.min(open, close) - spread * (0.65 + rand() * 0.35));
    const volume = Math.max(5, Math.floor(120 + rand() * 320 + Math.abs(drift) * 180));

    t.push(ts);
    o.push(Number(open.toFixed(4)));
    h.push(Number(high.toFixed(4)));
    l.push(Number(low.toFixed(4)));
    c.push(Number(close.toFixed(4)));
    v.push(volume);

    price = close;
  }

  if (t.length === 0) return { s: "no_data" };

  return { s: "ok", t, o, h, l, c, v };
}

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const symbol = search.get("symbol") ?? "LOC_0";
  const resolutionRaw = search.get("resolution") ?? "5";
  const now = Math.floor(Date.now() / 1000);
  const to = Number(search.get("to") ?? now);
  const from = Number(search.get("from") ?? to - 12 * 60 * 60);

  const resolution: Resolution = isResolution(resolutionRaw) ? resolutionRaw : "5";
  const locationId = parseLocationId(symbol);

  try {
    const qs = request.nextUrl.search;
    const upstream = await fetch(backendUrl(`/chart-data/history${qs}`), {
      headers: await authHeaders(),
      cache: "no-store",
    });

    if (upstream.ok) {
      const payload = (await upstream.json()) as UdfHistoryResponse;
      if (payload.s === "ok" && payload.t && payload.t.length > 0) {
        return NextResponse.json(payload);
      }
    }

    return NextResponse.json(simulateHistory(locationId, resolution, from, to));
  } catch {
    return NextResponse.json(simulateHistory(locationId, resolution, from, to));
  }
}
