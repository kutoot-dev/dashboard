export interface MerchantReferralShareLinks {
  referralCode: string | null;
  referralShareUrl: string | null;
  referralIosAppUrl: string | null;
  referralAndroidAppUrl: string | null;
}

export function toAbsoluteShareUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (typeof window === "undefined") return url;

  return `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function buildMerchantReferralShareMessage(links: MerchantReferralShareLinks): string | null {
  const { referralCode, referralShareUrl, referralIosAppUrl, referralAndroidAppUrl } = links;
  if (!referralCode) return null;

  const lines = [
    `Join Kutoot Business with my referral code: ${referralCode}`,
    referralShareUrl ? `Download: ${referralShareUrl}` : null,
    referralIosAppUrl ? `iOS: ${referralIosAppUrl}` : null,
    referralAndroidAppUrl ? `Android: ${referralAndroidAppUrl}` : null,
  ].filter(Boolean);

  return lines.length > 1 ? lines.join("\n") : null;
}
