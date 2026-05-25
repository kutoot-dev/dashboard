type BadgeVariant = "gain" | "loss" | "neutral" | "warning" | "accent";

/** Razorpay-aligned payment status labels for merchant-facing UI. */
export const PAYMENT_STATUS_FILTERS = [
  { value: "all", label: "All payments" },
  { value: "paid", label: "Captured" },
  { value: "pending", label: "Awaiting payment" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export interface PaymentStatusDisplay {
  label: string;
  description: string;
  variant: BadgeVariant;
}

/**
 * Maps stored payment_status (synced from Razorpay webhooks) to merchant-friendly copy.
 * `completed` is shown like Razorpay `captured` — internal post-capture processing only.
 */
export function getPaymentStatusDisplay(status: string): PaymentStatusDisplay {
  switch (status.toLowerCase()) {
    case "pending":
      return {
        label: "Awaiting payment",
        description: "Payment not completed yet",
        variant: "warning",
      };
    case "paid":
    case "completed":
      return {
        label: "Payment captured",
        description: "Razorpay confirmed the payment",
        variant: "gain",
      };
    case "failed":
      return {
        label: "Payment failed",
        description: "Razorpay could not collect payment",
        variant: "loss",
      };
    case "refunded":
      return {
        label: "Refunded",
        description: "Amount returned to customer",
        variant: "neutral",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        description: "Order was cancelled before capture",
        variant: "neutral",
      };
    default:
      return {
        label: status.replace(/_/g, " "),
        description: "Payment status from Razorpay",
        variant: "neutral",
      };
  }
}
