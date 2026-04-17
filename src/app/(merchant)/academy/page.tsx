"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAcademyLessons, getAcademyLesson } from "@/lib/api/services/academy.service";
import type { AcademyLessonSummary, AcademyLessonDetail, LessonDifficulty, LessonCategory } from "@/lib/types/academy";
import { cn } from "@/lib/utils/cn";

const DIFFICULTY_COLORS: Record<LessonDifficulty, string> = {
  beginner: "text-gain bg-gain/10 border-gain/20",
  intermediate: "text-warning bg-warning/10 border-warning/20",
  advanced: "text-loss bg-loss/10 border-loss/20",
};

const CATEGORY_LABELS: Record<LessonCategory, string> = {
  scoring: "Scoring",
  discounts: "Discounts",
  commission: "Commission",
  ohlc: "OHLC Charts",
  ranking: "Rankings",
  general: "General",
};

export default function AcademyPage() {
  const [lessons, setLessons] = useState<AcademyLessonSummary[]>([]);
  const [selected, setSelected] = useState<AcademyLessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadLessons();
  }, []);

  async function loadLessons() {
    try {
      setLoading(true);
      const res = await getAcademyLessons();
      if (res.success && res.data) {
        setLessons(res.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function openLesson(slug: string) {
    try {
      setDetailLoading(true);
      const res = await getAcademyLesson(slug);
      if (res.success && res.data) {
        setSelected(res.data);
      }
    } catch {
      // silent
    } finally {
      setDetailLoading(false);
    }
  }

  const filteredLessons = filter === "all"
    ? lessons
    : lessons.filter((l) => l.difficulty === filter || l.category === filter);

  // Detail view
  if (selected) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-accent transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to lessons
        </button>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <span className={cn(
              "rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase",
              DIFFICULTY_COLORS[selected.difficulty]
            )}>
              {selected.difficulty}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground uppercase">
              {CATEGORY_LABELS[selected.category] ?? selected.category}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              · {selected.read_time_minutes} min read
            </span>
          </div>

          <h1 className="text-xl font-bold text-foreground mb-4">
            {selected.title}
          </h1>

          {selected.video_url && (
            <div className="mb-4 aspect-video rounded-lg overflow-hidden glass-card-sm">
              <iframe
                src={selected.video_url}
                className="w-full h-full"
                allowFullScreen
                title={selected.title}
              />
            </div>
          )}

          <div
            className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed text-foreground/90"
            dangerouslySetInnerHTML={{ __html: selected.body }}
          />
        </Card>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-mono text-lg font-bold tracking-tight text-foreground">
          Academy
        </h1>
        <p className="font-mono text-xs text-muted-foreground">
          Learn how the scoring, ranking, and reward systems work
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {["all", "beginner", "intermediate", "advanced"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-3 py-1 font-mono text-[11px] transition-all",
              filter === f
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-glass-border bg-glass-bg text-muted-foreground hover:text-foreground"
            )}
          >
            {f === "all" ? "All Levels" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Lessons grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : filteredLessons.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-muted-foreground font-mono text-sm">No lessons found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLessons.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => openLesson(lesson.slug)}
              disabled={detailLoading}
              className="text-left transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            >
              <Card hover className="h-full">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(
                    "rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase",
                    DIFFICULTY_COLORS[lesson.difficulty]
                  )}>
                    {lesson.difficulty}
                  </span>
                  <span className="font-mono text-[9px] text-muted-foreground uppercase">
                    {CATEGORY_LABELS[lesson.category] ?? lesson.category}
                  </span>
                </div>

                <h3 className="font-semibold text-sm text-foreground mb-1">
                  {lesson.title}
                </h3>

                <div className="flex items-center gap-2 mt-auto">
                  <svg className="h-3 w-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {lesson.read_time_minutes} min read
                  </span>
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
