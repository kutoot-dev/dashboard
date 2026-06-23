import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VALIDATION_RULES } from "@/lib/constants/onboarding";
import type {
  AffiliateBankDetails,
  AffiliateBankDetailsInput,
} from "@/lib/api/services/affiliate.service";

interface BankDetailsCardProps {
  bankDetails: AffiliateBankDetails | null;
  disabled?: boolean;
  isSaving: boolean;
  onSave: (payload: AffiliateBankDetailsInput) => Promise<void>;
}

interface BankFormState {
  bank_account_name: string;
  bank_name: string;
  bank_branch_name: string;
  account_number: string;
  ifsc_code: string;
  upi_id: string;
}

const EMPTY_FORM: BankFormState = {
  bank_account_name: "",
  bank_name: "",
  bank_branch_name: "",
  account_number: "",
  ifsc_code: "",
  upi_id: "",
};

function toFormState(value: AffiliateBankDetails | null): BankFormState {
  if (!value) return EMPTY_FORM;
  return {
    bank_account_name: value.bank_account_name ?? "",
    bank_name: value.bank_name ?? "",
    bank_branch_name: value.bank_branch_name ?? "",
    account_number: value.account_number ?? "",
    ifsc_code: value.ifsc_code ?? "",
    upi_id: value.upi_id ?? "",
  };
}

export function BankDetailsCard({
  bankDetails,
  disabled = false,
  isSaving,
  onSave,
}: BankDetailsCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<BankFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.bank_account_name.trim()) {
      nextErrors.bank_account_name = "Account holder name is required.";
    }
    if (!form.bank_name.trim()) {
      nextErrors.bank_name = "Bank name is required.";
    }
    if (!form.bank_branch_name.trim()) {
      nextErrors.bank_branch_name = "Branch name is required.";
    }
    if (!VALIDATION_RULES.bank_account_number.pattern.test(form.account_number)) {
      nextErrors.account_number = "Enter a valid account number (9-18 digits).";
    }
    const ifsc = form.ifsc_code.toUpperCase();
    if (!VALIDATION_RULES.bank_ifsc.pattern.test(ifsc)) {
      nextErrors.ifsc_code = "Enter a valid IFSC code.";
    }
    const upiId = form.upi_id.trim().toLowerCase();
    if (upiId && !VALIDATION_RULES.upi_id.pattern.test(upiId)) {
      nextErrors.upi_id = "Enter a valid UPI ID (e.g. name@bank).";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const setField = (field: keyof BankFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSave = async () => {
    setSubmitError(null);
    if (!validate()) return;

    try {
      await onSave({
        bank_account_name: form.bank_account_name.trim(),
        bank_name: form.bank_name.trim(),
        bank_branch_name: form.bank_branch_name.trim(),
        account_number: form.account_number.trim(),
        ifsc_code: form.ifsc_code.trim().toUpperCase(),
        upi_id: form.upi_id.trim() ? form.upi_id.trim().toLowerCase() : undefined,
      });
      setIsEditing(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update bank details.";
      setSubmitError(message);
    }
  };

  const hasBankDetails = Boolean(
    bankDetails &&
      (bankDetails.bank_account_name ||
        bankDetails.bank_name ||
        bankDetails.account_number ||
        bankDetails.ifsc_code),
  );

  return (
    <Card className="border border-border/70 bg-card/75 p-5">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Bank details
          </p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">Payout account</h2>
        </div>
        {!isEditing ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setForm(toFormState(bankDetails));
              setErrors({});
              setSubmitError(null);
              setIsEditing(true);
            }}
            disabled={disabled}
          >
            {hasBankDetails ? "Edit" : "Add details"}
          </Button>
        ) : null}
      </div>

      {!isEditing ? (
        hasBankDetails ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow label="Account holder" value={bankDetails?.bank_account_name} />
            <InfoRow label="Bank name" value={bankDetails?.bank_name} />
            <InfoRow label="Branch" value={bankDetails?.bank_branch_name} />
            <InfoRow label="Account number" value={bankDetails?.account_number} />
            <InfoRow label="IFSC" value={bankDetails?.ifsc_code} />
            <InfoRow label="UPI" value={bankDetails?.upi_id ?? "--"} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No bank details added yet.
          </p>
        )
      ) : (
        <div className="space-y-3">
          <Input
            label="Account holder name"
            value={form.bank_account_name}
            onChange={(event) => setField("bank_account_name", event.target.value)}
            placeholder="Enter account holder name"
          />
          {errors.bank_account_name ? (
            <p className="-mt-2 text-xs text-loss">{errors.bank_account_name}</p>
          ) : null}

          <Input
            label="Bank name"
            value={form.bank_name}
            onChange={(event) => setField("bank_name", event.target.value)}
            placeholder="Enter bank name"
          />
          {errors.bank_name ? (
            <p className="-mt-2 text-xs text-loss">{errors.bank_name}</p>
          ) : null}

          <Input
            label="Branch name"
            value={form.bank_branch_name}
            onChange={(event) => setField("bank_branch_name", event.target.value)}
            placeholder="Enter branch name"
          />
          {errors.bank_branch_name ? (
            <p className="-mt-2 text-xs text-loss">{errors.bank_branch_name}</p>
          ) : null}

          <Input
            label="Account number"
            value={form.account_number}
            onChange={(event) =>
              setField("account_number", event.target.value.replace(/[^\d]/g, ""))
            }
            placeholder="9-18 digit account number"
            inputMode="numeric"
          />
          {errors.account_number ? (
            <p className="-mt-2 text-xs text-loss">{errors.account_number}</p>
          ) : null}

          <Input
            label="IFSC code"
            value={form.ifsc_code}
            onChange={(event) =>
              setField("ifsc_code", event.target.value.toUpperCase())
            }
            placeholder="e.g. HDFC0001234"
            maxLength={11}
          />
          {errors.ifsc_code ? (
            <p className="-mt-2 text-xs text-loss">{errors.ifsc_code}</p>
          ) : null}

          <Input
            label="UPI ID (optional)"
            value={form.upi_id}
            onChange={(event) => setField("upi_id", event.target.value)}
            placeholder="e.g. name@bank"
          />
          {errors.upi_id ? <p className="-mt-2 text-xs text-loss">{errors.upi_id}</p> : null}

          {submitError ? <p className="text-xs text-loss">{submitError}</p> : null}

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void handleSave()} loading={isSaving}>
              Save details
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                setForm(toFormState(bankDetails));
                setErrors({});
                setSubmitError(null);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-xl border border-border/65 bg-background/35 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value || "--"}</p>
    </div>
  );
}
