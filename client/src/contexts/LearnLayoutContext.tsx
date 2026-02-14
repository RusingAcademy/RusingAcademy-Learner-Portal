/**
 * LearnLayoutContext
 *
 * Provides context so child pages (e.g. LessonViewer) can detect whether they
 * are rendered inside the immersive LearnLayout shell.
 *
 * When `isInsideLearnLayout === true`, LessonViewer should suppress its own
 * top bar, sidebar, and bottom navigation — those are provided by LearnLayout.
 *
 * Also exposes the course slug and navigation helpers so the child doesn't
 * need to duplicate that logic.
 */
import { createContext, useContext, type ReactNode } from "react";

interface LearnLayoutContextValue {
  isInsideLearnLayout: boolean;
  /** Course slug from the URL, used for building navigation links */
  courseSlug: string;
  /** Navigate to a specific lesson within the learn portal */
  navigateToLesson: (lessonId: number) => void;
  /** Mark current lesson complete (triggers LearnLayout progress refresh) */
  onLessonComplete?: () => void;
}

const LearnLayoutContext = createContext<LearnLayoutContextValue>({
  isInsideLearnLayout: false,
  courseSlug: "",
  navigateToLesson: () => {},
});

export function LearnLayoutProvider({
  children,
  courseSlug,
  navigateToLesson,
  onLessonComplete,
}: {
  children: ReactNode;
  courseSlug: string;
  navigateToLesson: (lessonId: number) => void;
  onLessonComplete?: () => void;
}) {
  return (
    <LearnLayoutContext.Provider
      value={{
        isInsideLearnLayout: true,
        courseSlug,
        navigateToLesson,
        onLessonComplete,
      }}
    >
      {children}
    </LearnLayoutContext.Provider>
  );
}

export function useLearnLayout() {
  return useContext(LearnLayoutContext);
}
