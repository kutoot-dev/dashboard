import { NextRequest, NextResponse } from "next/server";
import { authHeaders, backendUrl } from "@/lib/api/server/proxy";

export async function GET(request: NextRequest) {
  try {
    const qs = request.nextUrl.search;
    const upstream = await fetch(backendUrl(`/chart-data/history${qs}`), {
      headers: await authHeaders(),
      cache: "no-store",
    });

    if (upstream.ok) {
      const payload = await upstream.json();
      return NextResponse.json(payload);
    }

    return NextResponse.json({ s: "no_data" });
  } catch {
    return NextResponse.json({ s: "no_data" });
  }
}
