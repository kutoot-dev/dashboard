"use client";

import { useState } from "react";
import { useLeaderboard } from "@/lib/hooks/use-leaderboard";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatScore, formatScoreChange } from "@/lib/utils/format";

export default function LeaderboardPage() {
  const [page, setPage] = useState(1);
  const [minTxn, setMinTxn] = useState(10);

  const query = useLeaderboard({
    page,
    limit: 20,
    min_successful_transactions: minTxn,
  });

  const data = query.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rankings"
        subtitle="Branch leaderboard with daily successful-transaction eligibility."
      />

      <Card className="flex flex-wrap items-end gap-3">
        <div className="w-52">
          <Input
            label="Min successful tx/day"
            type="number"
            min="1"
            max="1000"
            value={minTxn}
            onChange={(e) => {
              const value = Math.max(1, Math.min(1000, Number(e.target.value) || 10));
              setMinTxn(value);
              setPage(1);
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Eligibility now: at least {data?.eligibility?.minimum_successful_transactions ?? minTxn} paid/completed transactions per day.
        </p>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-2 py-2">Rank</th>
                <th className="px-2 py-2">Business</th>
                <th className="px-2 py-2">Sector</th>
                <th className="px-2 py-2">Score</th>
                <th className="px-2 py-2">Change</th>
                <th className="px-2 py-2">Successful tx</th>
                <th className="px-2 py-2">Eligibility</th>
              </tr>
            </thead>
            <tbody>
              {data?.items?.map((row) => (
                <tr key={`${row.branch_id}-${row.rank}-${row.period_date ?? "current"}`} className="border-b border-border/60 align-top">
                  <td className="px-2 py-3 font-mono text-foreground">#{row.rank}</td>
                  <td className="px-2 py-3">
                    <p className="font-medium text-foreground">{row.business_name}</p>
                    <p className="text-xs text-muted-foreground">{row.city_name}, {row.state}</p>
                  </td>
                  <td className="px-2 py-3 text-muted-foreground">{row.sector_name}</td>
                  <td className="px-2 py-3 font-mono text-foreground">{formatScore(row.composite_score)}</td>
                  <td className="px-2 py-3 font-mono text-muted-foreground">{formatScoreChange(row.score_change)}</td>
                  <td className="px-2 py-3 font-mono text-foreground">{row.successful_transactions ?? 0}</td>
                  <td className="px-2 py-3">
                    <span className={row.meets_minimum_transactions ? "text-gain" : "text-loss"}>
                      {row.meets_minimum_transactions ? "Eligible" : "Not eligible"}
                    </span>
                  </td>
                </tr>
              ))}

              {!query.isLoading && (!data?.items || data.items.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-2 py-8 text-center text-sm text-muted-foreground">
                    No leaderboard entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {data?.pagination.total ?? 0} branches
          </p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= (data?.pagination.total_pages ?? 1)}
              onClick={() => setPage((p) => Math.min(data?.pagination.total_pages ?? 1, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
