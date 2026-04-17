/** Types for Academy lessons */

export type LessonDifficulty = "beginner" | "intermediate" | "advanced";

export type LessonCategory =
  | "scoring"
  | "discounts"
  | "commission"
  | "ohlc"
  | "ranking"
  | "general";

export interface AcademyLessonSummary {
  id: number;
  title: string;
  slug: string;
  category: LessonCategory;
  difficulty: LessonDifficulty;
  sort_order: number;
  read_time_minutes: number;
}

export interface AcademyLessonDetail extends AcademyLessonSummary {
  body: string;
  video_url: string | null;
}
