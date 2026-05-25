"use client";



import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { getAcademyLesson, getAcademyLessons } from "@/lib/api/services/academy.service";

import { PageHeader } from "@/components/layout/page-header";

import { Card } from "@/components/ui/card";

import { Select } from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";

import { DetailPanelSkeleton, FeedListSkeleton } from "@/components/ui/loading-skeletons";

import { useQuerySkeleton } from "@/lib/hooks/use-query-skeleton";



const DIFFICULTY_OPTIONS = [

  { value: "all", label: "All levels" },

  { value: "beginner", label: "Beginner" },

  { value: "intermediate", label: "Intermediate" },

  { value: "advanced", label: "Advanced" },

];



function capitalizeLabel(value: string): string {

  if (!value) return value;

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

}



function difficultyVariant(level: string) {

  if (level === "advanced") return "warning" as const;

  if (level === "intermediate") return "accent" as const;

  return "gain" as const;

}



export default function AcademyPage() {

  const [difficulty, setDifficulty] = useState("all");

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);



  const params = useMemo(() => {

    return {

      difficulty: difficulty === "all" ? undefined : difficulty,

    };

  }, [difficulty]);



  const lessonsQuery = useQuery({

    queryKey: ["academy-lessons", params],

    queryFn: () => getAcademyLessons(params),

    retry: false,

  });



  const lessons = lessonsQuery.data?.success ? lessonsQuery.data.data : [];



  const detailQuery = useQuery({

    queryKey: ["academy-lesson", selectedSlug],

    queryFn: () => getAcademyLesson(selectedSlug as string),

    enabled: Boolean(selectedSlug),

    retry: false,

  });



  const selectedLesson = detailQuery.data?.success ? detailQuery.data.data : null;

  const showLessonsSkeleton = useQuerySkeleton(lessonsQuery);

  const showDetailSkeleton = useQuerySkeleton(detailQuery);



  return (

    <div className="space-y-6">

      <PageHeader title="Academy" subtitle="Practical lessons for scoring, rankings, discounts, and operations." />



      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">

        <Card className="space-y-3">

          <div className="flex flex-wrap items-center justify-between gap-2">

            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Lessons</p>

            <div className="w-36">

              <Select options={DIFFICULTY_OPTIONS} value={difficulty} onChange={setDifficulty} />

            </div>

          </div>



          <div className="space-y-2">

            {showLessonsSkeleton && <FeedListSkeleton count={6} />}



            {!showLessonsSkeleton &&

              lessons.map((lesson) => (

              <button

                key={lesson.id}

                type="button"

                onClick={() => setSelectedSlug(lesson.slug)}

                className="w-full rounded-lg border border-border/70 bg-card/60 p-3 text-left transition-colors hover:bg-card-hover"

              >

                <div className="flex items-center justify-between gap-2">

                  <p className="font-medium text-foreground">{lesson.title}</p>

                  <Badge variant={difficultyVariant(lesson.difficulty)}>

                    {capitalizeLabel(lesson.difficulty)}

                  </Badge>

                </div>

                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">

                  <span>{capitalizeLabel(lesson.category)}</span>

                  <span>{lesson.read_time_minutes} min read</span>

                </div>

              </button>

            ))}



            {!showLessonsSkeleton && lessons.length === 0 && (

              <p className="py-8 text-center text-sm text-muted-foreground">No lessons found for this filter.</p>

            )}

          </div>

        </Card>



        <Card className="space-y-3">

          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Lesson detail</p>



          {showDetailSkeleton && <DetailPanelSkeleton />}



          {!showDetailSkeleton && !selectedLesson && (

            <p className="py-10 text-center text-sm text-muted-foreground">Select a lesson to open full content.</p>

          )}



          {!showDetailSkeleton && selectedLesson && (

            <>

              <div className="space-y-1 border-b border-border pb-3">

                <h2 className="text-lg font-semibold text-foreground">{selectedLesson.title}</h2>

                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">

                  <span>{capitalizeLabel(selectedLesson.category)}</span>

                  <span>•</span>

                  <span>{selectedLesson.read_time_minutes} min</span>

                  <span>•</span>

                  <span>{capitalizeLabel(selectedLesson.difficulty)}</span>

                </div>

              </div>



              <article className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground dark:prose-invert">

                {selectedLesson.body}

              </article>



              {selectedLesson.video_url && (

                <a

                  href={selectedLesson.video_url}

                  target="_blank"

                  rel="noreferrer"

                  className="inline-flex text-sm text-accent transition-colors hover:text-accent/80"

                >

                  Watch related video

                </a>

              )}

            </>

          )}

        </Card>

      </div>

    </div>

  );

}


