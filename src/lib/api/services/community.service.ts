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
