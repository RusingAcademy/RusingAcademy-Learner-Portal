/**
 * LearnLessonPage — Wraps LessonViewer inside the immersive LearnLayout shell.
 *
 * Route: /learn/:slug/lessons/:lessonId
 *
 * This page renders LessonViewer as a child of LearnLayout, so:
 * - LearnLayout provides the top bar, sidebar, AI panel, and bottom nav
 * - LessonViewer detects `isInsideLearnLayout` and renders only its content area
 *   (no duplicate top bar, sidebar, or bottom nav)
 */
import LearnLayout from "@/components/LearnLayout";
import LessonViewer from "./LessonViewer";

export default function LearnLessonPage() {
  return (
    <LearnLayout>
      <LessonViewer />
    </LearnLayout>
  );
}
