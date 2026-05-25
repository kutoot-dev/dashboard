type BadgeVariant = "gain" | "loss" | "neutral" | "warning" | "accent";

export type PaymentStatusFilterValue =
  | (typeof PAYMENT_STATUS_FILTERS)[number]["value"];

/** Payment gateway status filters for merchant-facing UI. */
export const PAYMENT_STATUS_FILTERS = [
  { value: "all", label: "All payments" },
  { value: "paid", label: "Captured" },
  { value: "pending", label: "Awaiting payment" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export interface PaymentStatusGuideEntry {
  value: PaymentStatusFilterValue;
  label: string;
  /** Gateway event label (technical reference for support) */
  gatewayEvent: string;
  summary: string;
  detail: string;
  /** What this means for the merchant branch */
  forMerchant: string;
  variant: BadgeVariant;
}

/** Full reference for filters and table badges — synced from payment gateway webhooks. */
export const PAYMENT_STATUS_GUIDE: PaymentStatusGuideEntry[] = [
  {
    value: "all",
    label: "All payments",
    gatewayEvent: "Any status",
    summary: "Every transaction in your date range, regardless of payment outcome.",
    detail:
      "Includes successful checkouts, payments still in progress, failures, refunds, and cancellations. Use this when reconciling totals or exporting a full ledger.",
    forMerchant:
      "Settlement and GST summary cards still respect your other filters (date, search). Switch to a specific status when you only want successful or problem payments.",
    variant: "neutral",
  },
  {
    value: "paid",
    label: "Captured",
    gatewayEvent: "Payment captured",
    summary: "Customer paid successfully — the payment gateway confirmed the money was collected.",
    detail:
      "The gateway sent a payment captured notification. Kutoot marks the transaction as paid (and may later mark it completed after coupon redemption or stamp logic finishes). These count as successful transactions in rankings and reports.",
    forMerchant:
      "These are the payments that matter for revenue, settlement, and invoices. The Captured filter includes both paid and completed rows so nothing successful is missed.",
    variant: "gain",
  },
  {
    value: "pending",
    label: "Awaiting payment",
    gatewayEvent: "Order created / payment not completed",
    summary: "Checkout started but the payment gateway has not confirmed payment yet.",
    detail:
      "The customer opened checkout or the order was created, but payment captured has not arrived. The payment may still complete, expire, or fail depending on what the customer does next.",
    forMerchant:
      "Do not treat these as settled revenue. They may disappear from this list once the customer pays (Captured) or if the gateway reports a failure.",
    variant: "warning",
  },
  {
    value: "failed",
    label: "Failed",
    gatewayEvent: "Payment failed",
    summary: "The payment gateway could not collect payment from the customer.",
    detail:
      "Typical causes: card declined, UPI timeout, insufficient balance, or customer closed checkout without paying. Kutoot updates status when the gateway sends a failed payment event while the transaction was still pending.",
    forMerchant:
      "No customer charge and no merchant settlement for these rows. The coupon or offer was not successfully redeemed unless your staff handled it another way.",
    variant: "loss",
  },
  {
    value: "refunded",
    label: "Refunded",
    gatewayEvent: "Refund created",
    summary: "Money was returned to the customer after a successful capture.",
    detail:
      "The payment gateway processed a refund against the original payment. Kutoot records this when the refund notification is received. The original payment may have been captured earlier.",
    forMerchant:
      "Adjust your expectations for net revenue and support queries — the customer received money back. Invoices and exports still show the row for audit purposes.",
    variant: "neutral",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    gatewayEvent: "Order cancelled before capture",
    summary: "Payment was stopped or voided before the gateway captured funds.",
    detail:
      "The order did not complete as a successful charge — for example checkout abandoned in a cancellable state or an explicit cancellation before capture. This is different from Failed (an attempt that the gateway rejected).",
    forMerchant:
      "No settlement from these transactions. Use this filter to separate abandoned checkouts from hard payment failures.",
    variant: "neutral",
  },
];

export interface PaymentStatusDisplay {
  label: string;
  description: string;
  detail: string;
  variant: BadgeVariant;
}

export function getPaymentStatusGuide(
  value: PaymentStatusFilterValue,
): PaymentStatusGuideEntry {
  return (
    PAYMENT_STATUS_GUIDE.find((entry) => entry.value === value) ?? PAYMENT_STATUS_GUIDE[0]
  );
}

/**
 * Maps stored payment_status (synced from payment gateway webhooks) to merchant-friendly copy.
 * `completed` is shown like captured — internal post-capture processing only.
 */
export function getPaymentStatusDisplay(status: string): PaymentStatusDisplay {
  switch (status.toLowerCase()) {
    case "pending":
      return {
        label: "Awaiting payment",
        description: "Checkout open — payment not captured yet",
        detail:
          "The payment gateway has not confirmed capture yet. The customer may still pay or the attempt may fail.",
        variant: "warning",
      };
    case "paid":
      return {
        label: "Payment captured",
        description: "Payment gateway confirmed successful payment",
        detail:
          "Funds were collected. Coupon redemption and settlement follow Kutoot’s normal flow.",
        variant: "gain",
      };
    case "completed":
      return {
        label: "Payment captured",
        description: "Captured and fully processed in Kutoot",
        detail:
          "Same as Captured for you: the gateway already collected payment; Kutoot finished post-payment steps (e.g. stamps or redemption).",
        variant: "gain",
      };
    case "failed":
      return {
        label: "Payment failed",
        description: "Payment gateway reported a failed payment",
        detail:
          "No successful charge. Common reasons: declined card, UPI timeout, or customer did not complete checkout.",
        variant: "loss",
      };
    case "refunded":
      return {
        label: "Refunded",
        description: "Refund issued — money returned to customer",
        detail:
          "A refund was issued after capture. Original transaction remains visible for records.",
        variant: "neutral",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        description: "Order cancelled before capture",
        detail:
          "No capture occurred. Different from Failed: payment was not rejected after an attempt to pay.",
        variant: "neutral",
      };
    default:
      return {
        label: status.replace(/_/g, " "),
        description: "Status reported from the payment gateway",
        detail: "Contact support if this status is unclear for a specific transaction.",
        variant: "neutral",
      };
  }
}
