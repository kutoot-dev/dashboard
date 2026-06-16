"use client";

import { PageHeader } from "@/components/layout/page-header";
import { PayoutGuideContent } from "@/components/payouts/payout-guide-content";
import { PAYOUTS } from "@/lib/constants/strings";

export default function PayoutGuidePage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader title={PAYOUTS.GUIDE_TITLE} subtitle={PAYOUTS.GUIDE_SUBTITLE} />
      <PayoutGuideContent />
    </div>
  );
}
