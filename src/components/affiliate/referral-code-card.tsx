import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ReferralCodeCardProps {
  referralCode: string | null;
  referralLink: string | null;
  isLoading: boolean;
  disabled: boolean;
  onRegenerate: () => void;
  onCopyCode: () => void;
  onCopyLink: () => void;
  onShare: () => void;
}

export function ReferralCodeCard({
  referralCode,
  referralLink,
  isLoading,
  disabled,
  onRegenerate,
  onCopyCode,
  onCopyLink,
  onShare,
}: ReferralCodeCardProps) {
  return (
    <Card className="space-y-4 border border-border/70 bg-card/75 p-5">
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Referral code
        </p>
        <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-foreground">
          {isLoading ? "..." : (referralCode ?? "--")}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Share your referral code and link to invite new merchants.
        </p>
      </div>

      <div className="rounded-xl border border-border/65 bg-background/35 p-3">
        <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          Referral link
        </p>
        <p className="mt-2 break-all text-sm text-foreground">{referralLink ?? "--"}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onRegenerate} disabled={disabled}>
          Regenerate
        </Button>
        <Button type="button" variant="secondary" onClick={onCopyCode} disabled={disabled || !referralCode}>
          Copy code
        </Button>
        <Button type="button" variant="secondary" onClick={onCopyLink} disabled={disabled || !referralLink}>
          Copy link
        </Button>
        <Button type="button" onClick={onShare} disabled={disabled || !referralLink || !referralCode}>
          Share
        </Button>
      </div>
    </Card>
  );
}
