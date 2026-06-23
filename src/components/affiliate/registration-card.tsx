import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface RegistrationCardProps {
  isRegistered: boolean;
  status: string;
  isLoading: boolean;
  isRegistering: boolean;
  canRegister: boolean;
  onRegister: () => void;
}

function toTitleCase(value: string): string {
  return value
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export function RegistrationCard({
  isRegistered,
  status,
  isLoading,
  isRegistering,
  canRegister,
  onRegister,
}: RegistrationCardProps) {
  const statusLabel = status ? toTitleCase(status) : isRegistered ? "Active" : "Not Registered";

  return (
    <Card className="border border-primary/25 bg-card/75 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Registration status
          </p>
          <h2 className="mt-2 text-lg font-semibold text-foreground">
            Affiliate Program
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Register to unlock referral tracking, affiliate payouts, and bank-based settlements.
          </p>
        </div>
        <Badge variant={isRegistered ? "gain" : "warning"}>{statusLabel}</Badge>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={onRegister}
          disabled={isRegistered || !canRegister || isLoading}
          loading={isRegistering}
        >
          {isRegistered ? "Registered" : "Register now"}
        </Button>
        {!isRegistered && !canRegister ? (
          <p className="text-xs text-warning">Registration is currently unavailable.</p>
        ) : null}
      </div>
    </Card>
  );
}
