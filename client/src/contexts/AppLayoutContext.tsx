/**
 * AppLayoutContext
 *
 * Provides a simple boolean flag so child pages can detect whether they
 * are rendered inside the unified AppLayout shell.
 *
 * When `isInsideAppLayout === true`, pages should suppress their own
 * Header / Footer / page-level wrappers and render only the content area.
 */
import { createContext, useContext, type ReactNode } from "react";

interface AppLayoutContextValue {
  isInsideAppLayout: boolean;
}

const AppLayoutContext = createContext<AppLayoutContextValue>({
  isInsideAppLayout: false,
});

export function AppLayoutProvider({ children }: { children: ReactNode }) {
  return (
    <AppLayoutContext.Provider value={{ isInsideAppLayout: true }}>
      {children}
    </AppLayoutContext.Provider>
  );
}

export function useAppLayout() {
  return useContext(AppLayoutContext);
}
