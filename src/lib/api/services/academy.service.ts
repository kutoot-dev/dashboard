import type { ApiResponse } from "@/lib/types";
import type { AcademyLessonSummary, AcademyLessonDetail } from "@/lib/types/academy";
import apiClient from "../client";

export async function getAcademyLessons(params?: { category?: string; difficulty?: string }) {
  const res = await apiClient.get<ApiResponse<AcademyLessonSummary[]>>("/academy", { params });
  return res.data;
}

export async function getAcademyLesson(slug: string) {
  const res = await apiClient.get<ApiResponse<AcademyLessonDetail>>(`/academy/${slug}`);
  return res.data;
}
