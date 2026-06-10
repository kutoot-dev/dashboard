import type { ApiResponse, PaginatedData } from "@/lib/types";
import type { DiscoverPost, DiscoverPostDetail, LikeToggleResult } from "@/lib/types/discover";
import apiClient from "../client";

export async function getDiscoverPosts(params?: { category?: string; page?: number; limit?: number }) {
  const res = await apiClient.get<ApiResponse<PaginatedData<DiscoverPost>>>("/discover", { params });
  return res.data;
}

export async function getDiscoverPost(id: number) {
  const res = await apiClient.get<ApiResponse<DiscoverPostDetail>>(`/discover/${id}`);
  return res.data;
}

export async function togglePostLike(postId: number) {
  const res = await apiClient.post<ApiResponse<LikeToggleResult>>(`/discover/${postId}/like`);
  return res.data;
}

export async function addPostComment(postId: number, body: string, parentId?: number) {
  const res = await apiClient.post<ApiResponse<{ id: number; body: string; author: string; branch_name?: string | null; parent_id: number | null; created_at: string }>>(`/discover/${postId}/comments`, {
    body,
    parent_id: parentId ?? null,
  });
  return res.data;
}
