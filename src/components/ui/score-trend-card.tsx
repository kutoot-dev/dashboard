"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { fetchChartHistory, type Resolution } from "@/lib/api/services/chart-data.service";

interface ScoreTrendCardProps {
  branchId: number;
}

const RESOLUTION_OPTIONS: { value: Resolution; label: string }[] = [
  { value: "1", label: "1 min" },
  { value: "5", label: "5 min" },
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
  { value: "60", label: "60 min" },
];

function getTodayRangeUnix(): { from: number; to: number } {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return {
    from: Math.floor(start.getTime() / 1000),
    to: Math.floor(now.getTime() / 1000),
  };
}

export function ScoreTrendCard({ branchId }: ScoreTrendCardProps) {
  const [resolution, setResolution] = useState<Resolution>("1");

  const { data, isLoading } = useQuery({
    queryKey: ["branch-score-trend", branchId, "today", resolution],
    queryFn: () => {
      const range = getTodayRangeUnix();
      return fetchChartHistory(branchId, resolution, range.from, range.to, undefined, "score");
    },
    enabled: Number.isFinite(branchId) && branchId > 0,
    refetchInterval: 30_000,
  });

  const trendData = useMemo(
    () =>
      (data ?? []).map((bar) => ({
        time: new Date(bar.time * 1000).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        score: Number(bar.close.toFixed(4)),
      })),
    [data],
  );

  const delta =
    trendData.length > 1
      ? Number((trendData[trendData.length - 1].score - trendData[0].score).toFixed(4))
      : 0;

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Score Trend
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Intraday movement from today's real merchant-location score ticks.
          </p>
        </div>
        <Badge variant={delta >= 0 ? "gain" : "loss"}>{delta.toFixed(4)}</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={resolution}
          onChange={(value) => setResolution(value as Resolution)}
          options={RESOLUTION_OPTIONS}
          className="w-28"
        />
      </div>

      <div style={{ width: "100%", height: 260, minWidth: 0, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={20} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={48} domain={["auto", "auto"]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="score"
              stroke={delta >= 0 ? "#10b981" : "#ef4444"}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {!isLoading && trendData.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No score ticks found for today yet. Please check again shortly.
        </p>
      )}
    </Card>
  );
}
