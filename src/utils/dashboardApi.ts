export type {
  AffiliateAnalytics,
  AffiliateBankDetails,
  AffiliateBankDetailsInput,
  AffiliatePayoutItem,
  AffiliatePayouts,
  AffiliateProfile,
  AffiliateReferralLink,
  AffiliateRegistrationState,
  AffiliateRegistrationStatus,
} from "@/lib/api/services/affiliate.service";

export {
  getAffiliateAnalytics,
  getAffiliatePayouts,
  getAffiliateProfile,
  getAffiliateProfileStatus,
  getAffiliateReferralLink,
  registerAffiliateProgram,
  requestAffiliateWithdraw,
  updateAffiliateBankDetails,
} from "@/lib/api/services/affiliate.service";
