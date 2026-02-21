/**
 * useCmsData — Hook to fetch CMS data with fallback to hardcoded courseData
 * 
 * Strategy: Try CMS database first. If CMS returns data, use it.
 * If CMS is empty or fails, fall back to the hardcoded courseData.ts / lessonContent.ts.
 * This ensures zero downtime during the transition from static to dynamic content.
 */
import { trpc } from "@/lib/trpc";
import { programs, getProgramById, getTotalStats, type Program as ProgramId } from "@/data/courseData";
import { getLessonContent } from "@/data/lessonContent";
import { useMemo } from "react";

// Types that match the existing courseData interfaces
export interface CmsLesson {
  id: string;
  title: string;
  titleFr: string;
  duration: string;
  xpReward: number;
}

export interface CmsModule {
  id: number;
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  badgeUrl: string;
  quizPassing: number;
  lessons: CmsLesson[];
}

export interface CmsPath {
  id: string;
  number: string;
  title: string;
  titleFr: string;
  subtitle: string;
  subtitleFr: string;
  cefrLevel: string;
  color: string;
  coverUrl: string;
  badgeUrl: string;
  totalLessons: number;
  modules: CmsModule[];
}

export interface CmsProgramData {
  id: string;
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  icon: string;
  color: string;
  paths: CmsPath[];
}

/** Transform CMS database rows into the shape expected by existing components */
function transformCmsProgram(cmsData: any): CmsProgramData {
  return {
    id: cmsData.slug,
    title: cmsData.title,
    titleFr: cmsData.titleFr || cmsData.title,
    description: cmsData.description || "",
    descriptionFr: cmsData.descriptionFr || "",
    icon: cmsData.icon || "school",
    color: cmsData.color || "#008090",
    paths: (cmsData.paths || []).map((p: any) => ({
      id: p.slug,
      number: p.number,
      title: p.title,
      titleFr: p.titleFr || p.title,
      subtitle: p.subtitle || "",
      subtitleFr: p.subtitleFr || "",
      cefrLevel: p.cefrLevel,
      color: p.color || "#008090",
      coverUrl: p.coverUrl || "",
      badgeUrl: p.badgeUrl || "",
      totalLessons: (p.modules || []).reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0),
      modules: (p.modules || []).map((m: any, idx: number) => ({
        id: idx + 1,
        title: m.title,
        titleFr: m.titleFr || m.title,
        description: m.description || "",
        descriptionFr: m.descriptionFr || "",
        badgeUrl: m.badgeUrl || "",
        quizPassing: m.quizPassingScore || 70,
        lessons: (m.lessons || []).map((l: any) => ({
          id: l.lessonNumber,
          title: l.title,
          titleFr: l.titleFr || l.title,
          duration: l.duration || "30 min",
          xpReward: l.xpReward || 100,
        })),
      })),
    })),
  };
}

/** Hook: Get all programs (for ProgramSelect page) */
export function useCmsPrograms() {
  const cmsQuery = trpc.cms.public.listPrograms.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // Cache for 5 min
    retry: 1,
  });

  const data = useMemo(() => {
    if (cmsQuery.data && cmsQuery.data.length > 0) {
      // CMS has data — but we still need the full tree for each program
      // For the program list, we just need basic info
      return { source: "cms" as const, programs: cmsQuery.data };
    }
    // Fallback to hardcoded data
    return { source: "static" as const, programs: null };
  }, [cmsQuery.data]);

  return {
    ...data,
    isLoading: cmsQuery.isLoading,
    staticPrograms: programs,
    getStaticStats: getTotalStats,
  };
}

/** Hook: Get a single program with full tree (for PathList page) */
export function useCmsProgram(programId: string) {
  const cmsQuery = trpc.cms.public.getProgram.useQuery(
    { slug: programId },
    { staleTime: 5 * 60 * 1000, retry: 1 }
  );

  const statsQuery = trpc.cms.public.getProgramStats.useQuery(
    { slug: programId },
    { staleTime: 5 * 60 * 1000, retry: 1 }
  );

  const data = useMemo(() => {
    if (cmsQuery.data) {
      return {
        source: "cms" as const,
        program: transformCmsProgram(cmsQuery.data),
      };
    }
    // Fallback
    const staticProg = getProgramById(programId as ProgramId);
    return {
      source: "static" as const,
      program: staticProg ? {
        ...staticProg,
        paths: staticProg.paths.map(p => ({
          ...p,
          subtitleFr: p.subtitleFr || p.subtitle,
        })),
      } as unknown as CmsProgramData : null,
    };
  }, [cmsQuery.data, programId]);

  return {
    ...data,
    stats: statsQuery.data,
    isLoading: cmsQuery.isLoading,
  };
}

/** Hook: Get lesson content from CMS (for LessonViewer) */
export function useCmsLesson(programId: string, lessonNumber: string) {
  const cmsQuery = trpc.cms.public.getLesson.useQuery(
    { programSlug: programId, lessonNumber },
    { staleTime: 5 * 60 * 1000, retry: 1, enabled: !!programId && !!lessonNumber }
  );

  const data = useMemo(() => {
    if (cmsQuery.data?.lesson) {
      const lesson = cmsQuery.data.lesson;
      // Transform slots into the format expected by LessonViewer
      const slotMap: Record<string, any> = {};
      for (const slot of lesson.slots || []) {
        slotMap[slot.slotType] = {
          title: slot.title,
          titleFr: slot.titleFr,
          content: slot.content,
          contentFr: slot.contentFr,
          quiz: null, // Quiz is separate
        };
      }

      // Attach quiz data to the quiz slot
      if (lesson.quizzes?.length > 0) {
        const quiz = lesson.quizzes[0];
        slotMap.quiz = {
          ...slotMap.quiz,
          quiz: {
            title: quiz.title,
            questions: (quiz.questions || []).map((q: any) => ({
              question: q.question,
              type: q.questionType === "fill_in_blank" ? "fill-in-blank" : "multiple-choice",
              options: q.options ? (typeof q.options === "string" ? JSON.parse(q.options) : q.options) : [],
              answer: q.correctAnswer,
              feedback: q.feedback || "",
            })),
          },
        };
      }

      return {
        source: "cms" as const,
        lessonContent: slotMap,
      };
    }
    // Fallback
    const staticContent = getLessonContent(lessonNumber, programId);
    return {
      source: "static" as const,
      lessonContent: staticContent || null,
    };
  }, [cmsQuery.data, programId, lessonNumber]);

  return {
    ...data,
    isLoading: cmsQuery.isLoading,
    cmsLessonMeta: cmsQuery.data,
  };
}
