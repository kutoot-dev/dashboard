import publicApiClient from "../public-client";

export interface OpsHubPlan {
  id: number;
  name: string;
  slug: string;
  price_amount: number;
  price_cycle: string;
  commission_share_percentage: number;
  max_merchant_locations: number;
  description?: string | null;
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export async function listOpsHubPlans(): Promise<OpsHubPlan[]> {
  const res = await publicApiClient.get<ApiEnvelope<OpsHubPlan[]>>("/ops-hub/plans");
  const payload = res.data?.data ?? res.data;
  return Array.isArray(payload) ? payload : [];
}

export async function sendOpsHubInterestOtp(mobile: string): Promise<{ message: string }> {
  const res = await publicApiClient.post<ApiEnvelope<unknown>>("/ops-hub/interest/otp/send", {
    mobile,
  });
  return { message: res.data?.message ?? "OTP sent to your mobile number." };
}

export async function verifyOpsHubInterestOtp(
  mobile: string,
  otp: string,
): Promise<{ message: string }> {
  const res = await publicApiClient.post<ApiEnvelope<unknown>>("/ops-hub/interest/otp/verify", {
    mobile,
    otp,
  });
  return { message: res.data?.message ?? "Mobile number verified successfully." };
}

export async function submitOpsHubInterest(payload: {
  name: string;
  mobile: string;
  ops_hub_plan_id: number;
}): Promise<{ message: string; id?: number }> {
  const res = await publicApiClient.post<ApiEnvelope<{ id: number }>>("/ops-hub/interest", payload);
  return {
    message: res.data?.message ?? "Thank you for your interest. Our team will contact you shortly.",
    id: res.data?.data?.id,
  };
}
