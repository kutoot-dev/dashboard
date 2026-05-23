"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface DashboardReferralCardProps {
  referralCode: string | null;
  referralShareUrl: string | null;
  onOpenReferral: () => void;
  onCopyLink: () => void;
  className?: string;
}

export function DashboardReferralCard({
  referralCode,
  referralShareUrl,
  onOpenReferral,
  onCopyLink,
  className,
}: DashboardReferralCardProps) {
  return (
    <Card
      role="link"
      tabIndex={0}
      onClick={onOpenReferral}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenReferral();
        }
      }}
      className={cn(
        "cursor-pointer border border-primary/25 bg-card/75 p-4 transition-colors hover:border-accent/45 hover:bg-card/80",
        className,
      )}
    >
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        Merchant referral
      </p>
      <p className="mt-1 text-lg font-semibold text-foreground">{referralCode ?? "--"}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Share your code with nearby merchants. Tap this card for your full referral center.
      </p>
      {referralShareUrl && (
        <p className="mt-2 break-all text-[11px] text-muted-foreground">{referralShareUrl}</p>
      )}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onCopyLink();
          }}
          className="min-h-10 w-full rounded-md border border-accent/35 bg-accent/12 px-3 py-2 text-xs font-medium text-accent transition-colors touch-manipulation hover:bg-accent/20 active:bg-accent/25 sm:w-auto"
        >
          Copy link
        </button>
        {referralShareUrl && (
          <a
            href={referralShareUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="inline-flex min-h-10 w-full items-center justify-center rounded-md border border-border/70 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors touch-manipulation hover:text-foreground sm:w-auto"
          >
            Open link
          </a>
        )}
        <span className="inline-flex min-h-10 w-full items-center justify-center rounded-md border border-dashed border-border/70 px-3 py-2 text-xs font-medium text-muted-foreground sm:w-auto">
          More info
        </span>
      </div>
    </Card>
  );
}
