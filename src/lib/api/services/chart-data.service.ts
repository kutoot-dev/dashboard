import apiClient from "@/lib/api/client";

export type Resolution = "1" | "5" | "15" | "30" | "60" | "D" | "W" | "M";

export interface OhlcvBar {
  time: number;   // Unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface UdfHistoryResponse {
  s: "ok" | "no_data" | "error";
  t?: number[];
  o?: number[];
  h?: number[];
  l?: number[];
  c?: number[];
  v?: number[];
  nextTime?: number;
}

export async function fetchChartConfig() {
  const res = await apiClient.get<{
    supported_resolutions: string[];
    supports_group_request: boolean;
  }>("/chart-data/config");
  return res.data;
}

export type ChartMetric = "score" | "rank";

export async function fetchChartHistory(
  locationId: number,
  resolution: Resolution,
  from: number,
  to: number,
  countback?: number,
  metric: ChartMetric = "score",
): Promise<OhlcvBar[]> {
  const params: Record<string, string | number> = {
    symbol: `LOC_${locationId}`,
    resolution,
    from,
    to,
    metric,
  };
  if (countback !== undefined) params.countback = countback;

  const res = await apiClient.get<UdfHistoryResponse>("/chart-data/history", { params });
  const d = res.data;

  if (d.s !== "ok" || !d.t) return [];

  return d.t.map((time, i) => ({
    time,
    open:   d.o![i],
    high:   d.h![i],
    low:    d.l![i],
    close:  d.c![i],
    volume: d.v![i],
  }));
}
