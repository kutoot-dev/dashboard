import communityApiClient from "@/lib/api/community-client";
import type {
  ApiEnvelope,
  CommunityConversation,
  CommunityMessage,
  CommunityPost,
} from "@/lib/types/community";

export interface Paginated<T> {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export async function fetchCommunityFeed(params?: Record<string, string | number | boolean | undefined>): Promise<Paginated<CommunityPost>> {
  const response = await communityApiClient.get<ApiEnvelope<CommunityPost[]> & { meta?: Paginated<CommunityPost>["meta"] }>(
    "/community/feed",
    { params },
  );
  return { data: response.data.data, meta: response.data.meta };
}

export async function fetchCommunityPost(id: string | number): Promise<CommunityPost> {
  const response = await communityApiClient.get<ApiEnvelope<CommunityPost>>(`/community/posts/${id}`);
  return response.data.data;
}

export async function createCommunityPost(formData: FormData): Promise<CommunityPost> {
  const response = await communityApiClient.post<ApiEnvelope<CommunityPost>>("/community/posts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
}

export async function likeCommunityPost(id: string | number): Promise<{ liked: boolean; like_count: number }> {
  const response = await communityApiClient.post<ApiEnvelope<{ liked: boolean; like_count: number }>>(
    `/community/posts/${id}/like`,
  );
  return response.data.data;
}

export async function commentCommunityPost(id: string | number, body: string): Promise<unknown> {
  const response = await communityApiClient.post<ApiEnvelope<unknown>>(`/community/posts/${id}/comments`, { body });
  return response.data.data;
}

export async function reportCommunityPost(id: string | number, reason: string, details?: string): Promise<unknown> {
  const response = await communityApiClient.post<ApiEnvelope<unknown>>(`/community/posts/${id}/report`, {
    reason,
    details,
  });
  return response.data.data;
}

export async function voteCommunityPoll(id: string | number, optionIds: number[]): Promise<unknown> {
  const response = await communityApiClient.post<ApiEnvelope<unknown>>(`/community/posts/${id}/poll/vote`, {
    option_ids: optionIds,
  });
  return response.data.data;
}

export async function boostCommunityPost(id: string | number): Promise<CommunityPost> {
  const response = await communityApiClient.post<ApiEnvelope<CommunityPost>>(`/community/posts/${id}/boost`);
  return response.data.data;
}

export async function startCommunityConversation(postId: string | number): Promise<CommunityConversation> {
  const response = await communityApiClient.post<ApiEnvelope<CommunityConversation>>(
    `/community/posts/${postId}/conversations`,
  );
  return response.data.data;
}

export async function fetchCommunityConversations(): Promise<CommunityConversation[]> {
  const response = await communityApiClient.get<ApiEnvelope<CommunityConversation[]>>("/community/conversations");
  return response.data.data;
}

export async function fetchCommunityMessages(conversationId: string | number): Promise<CommunityMessage[]> {
  const response = await communityApiClient.get<ApiEnvelope<CommunityMessage[]>>(
    `/community/conversations/${conversationId}/messages`,
  );
  return response.data.data;
}

export async function sendCommunityMessage(conversationId: string | number, body: string): Promise<CommunityMessage> {
  const response = await communityApiClient.post<ApiEnvelope<CommunityMessage>>(
    `/community/conversations/${conversationId}/messages`,
    { body },
  );
  return response.data.data;
}

export async function fetchCommunityStampActivity(): Promise<unknown> {
  const response = await communityApiClient.get<ApiEnvelope<unknown>>("/community/my-stamps-activity");
  return response.data.data;
}

export type RewardTaskFieldOption = {
  label: string;
  value: string | number;
};

export type RewardTaskField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "phone" | "email" | "number" | "select" | "multiselect" | "rating" | "date" | "file" | "merchant_selector";
  required?: boolean;
  placeholder?: string;
  options?: RewardTaskFieldOption[];
};

export type RewardTask = {
  id: number;
  reward_id: number;
  name: string;
  description?: string | null;
  task_type: string;
  verification_mode: string;
  input_schema?: RewardTaskField[] | { fields?: RewardTaskField[] };
  requires_review: boolean;
  stamps: number;
  media?: { id: number; url: string; thumb_url?: string | null; mime_type?: string | null }[];
};

export type Reward = {
  id: number;
  name: string;
  description?: string | null;
  status: string;
  worth_value?: string | number;
  remaining_seconds?: number | null;
  stamps_left?: number;
  tasks?: RewardTask[];
};

export type RewardSubmission = {
  id: number;
  status: string;
  stamps_awarded: number;
  verification_score?: number;
  auto_verification_result?: Record<string, unknown> | null;
  rejection_reason?: string | null;
};

export type EligibleStore = {
  id: number;
  branch_name: string;
  store_name?: string | null;
  merchant_name?: string | null;
  locality?: string | null;
  city?: string | null;
  state?: string | null;
};

export type RewardMediaCard = {
  id: number;
  file_name: string;
  mime_type?: string | null;
  size: number;
  size_mb: number;
  url: string;
  thumb_url?: string | null;
  uploaded_at?: string | null;
  submission?: {
    id: number;
    status: string;
    reward?: { id: number; name: string } | null;
    task?: { id: number; name: string; task_type?: string | null } | null;
    team?: { id: number; name: string } | null;
    user?: { id: number; name: string } | null;
  } | null;
};

export async function fetchLiveReward(): Promise<Reward | null> {
  const response = await communityApiClient.get<ApiEnvelope<Reward | null>>("/rewards/live");
  return response.data.data;
}

export async function joinReward(rewardId: number): Promise<unknown> {
  const response = await communityApiClient.post<ApiEnvelope<unknown>>(`/rewards/${rewardId}/join`);
  return response.data.data;
}

export async function fetchRewardSubmissions(rewardId: number): Promise<RewardSubmission[]> {
  const response = await communityApiClient.get<ApiEnvelope<RewardSubmission[]>>(`/rewards/${rewardId}/my-submissions`);
  return response.data.data;
}

function appendPayload(formData: FormData, prefix: string, value: unknown): void {
  if (value === undefined || value === null || value === "") return;
  if (value instanceof File) {
    formData.append(prefix, value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => appendPayload(formData, `${prefix}[${index}]`, item));
    return;
  }
  if (typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([key, item]) => appendPayload(formData, `${prefix}[${key}]`, item));
    return;
  }
  formData.append(prefix, String(value));
}

export async function submitRewardTask(
  rewardId: number,
  taskId: number,
  payload: Record<string, unknown>,
  proofText?: string,
  proofFiles?: File[],
): Promise<RewardSubmission> {
  const formData = new FormData();
  if (proofText) formData.append("proof_text", proofText);
  Object.entries(payload).forEach(([key, value]) => appendPayload(formData, `payload[${key}]`, value));
  (proofFiles ?? []).forEach((file) => formData.append("proof[]", file));

  const response = await communityApiClient.post<ApiEnvelope<RewardSubmission>>(
    `/rewards/${rewardId}/tasks/${taskId}/submit`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data.data;
}

export async function fetchEligibleReviewStores(search?: string): Promise<EligibleStore[]> {
  const response = await communityApiClient.get<ApiEnvelope<{ items: EligibleStore[] }>>(
    "/merchant-locations/review-eligible",
    { params: { search: search || undefined } },
  );
  return response.data.data.items;
}

export async function fetchRewardMediaGallery(): Promise<RewardMediaCard[]> {
  const response = await communityApiClient.get<ApiEnvelope<{ items: RewardMediaCard[] }>>("/reward-task-media");
  return response.data.data.items;
}

export async function fetchRewardMediaStorage(): Promise<{ total_bytes: number; total_mb: number; files_count: number }> {
  const response = await communityApiClient.get<ApiEnvelope<{ total_bytes: number; total_mb: number; files_count: number }>>("/reward-task-media/storage");
  return response.data.data;
}

export async function deleteRewardMedia(mediaId: number, reason?: string): Promise<void> {
  await communityApiClient.delete(`/reward-task-media/${mediaId}`, { data: { reason } });
}
