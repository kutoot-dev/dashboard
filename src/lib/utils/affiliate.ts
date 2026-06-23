export interface AffiliateSharePayload {
  referralCode: string | null;
  referralLink: string | null;
}

export function toAbsoluteAffiliateUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (typeof window === "undefined") return url;
  return `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function buildAffiliateShareMessage(payload: AffiliateSharePayload): string | null {
  if (!payload.referralCode || !payload.referralLink) return null;
  return `Join Kutoot using my affiliate code ${payload.referralCode}. Register here: ${payload.referralLink}`;
}
