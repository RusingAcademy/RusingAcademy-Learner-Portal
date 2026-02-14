/**
 * useUndoRedo — Section-level undo/redo history hook for the Visual Editor
 * 
 * Maintains a history stack of section snapshots, allowing:
 * - Undo (Ctrl+Z): revert to previous state
 * - Redo (Ctrl+Y / Ctrl+Shift+Z): restore undone state
 * - Push: record a new snapshot after each edit
 * - Clear: reset history (e.g., when switching pages)
 * 
 * The hook manages serialized snapshots to avoid reference issues.
 * Max history depth is configurable (default: 50 entries).
 */
import { useState, useCallback, useRef, useEffect } from "react";

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface UndoRedoActions<T> {
  /** Push a new state onto the history stack */
  push: (state: T) => void;
  /** Undo to the previous state */
  undo: () => T | null;
  /** Redo to the next state */
  redo: () => T | null;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Clear all history and set a new initial state */
  reset: (initialState: T) => void;
  /** Number of undo steps available */
  undoCount: number;
  /** Number of redo steps available */
  redoCount: number;
}

export function useUndoRedo<T>(
  initialState: T,
  maxHistory: number = 50
): [T, UndoRedoActions<T>] {
  const [state, setState] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const push = useCallback((newState: T) => {
    setState((prev) => {
      // Don't push if the state hasn't changed
      const prevJson = JSON.stringify(prev.present);
      const newJson = JSON.stringify(newState);
      if (prevJson === newJson) return prev;

      const newPast = [...prev.past, prev.present];
      // Trim history if it exceeds max
      if (newPast.length > maxHistory) {
        newPast.splice(0, newPast.length - maxHistory);
      }
      return {
        past: newPast,
        present: newState,
        future: [], // Clear future on new action
      };
    });
  }, [maxHistory]);

  const undo = useCallback((): T | null => {
    let result: T | null = null;
    setState((prev) => {
      if (prev.past.length === 0) return prev;
      const newPast = [...prev.past];
      const previous = newPast.pop()!;
      result = previous;
      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
    return result;
  }, []);

  const redo = useCallback((): T | null => {
    let result: T | null = null;
    setState((prev) => {
      if (prev.future.length === 0) return prev;
      const newFuture = [...prev.future];
      const next = newFuture.shift()!;
      result = next;
      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
    return result;
  }, []);

  const reset = useCallback((newInitial: T) => {
    setState({
      past: [],
      present: newInitial,
      future: [],
    });
  }, []);

  return [
    state.present,
    {
      push,
      undo,
      redo,
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
      reset,
      undoCount: state.past.length,
      redoCount: state.future.length,
    },
  ];
}

/**
 * useUndoRedoKeyboard — Attaches Ctrl+Z / Ctrl+Y keyboard shortcuts
 * to the undo/redo actions. Should be called once in the Visual Editor.
 */
export function useUndoRedoKeyboard(
  onUndo: () => void,
  onRedo: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea/contenteditable
      const target = e.target as HTMLElement;
      const isEditable = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      
      // For TipTap editors, let TipTap handle its own undo/redo
      if (isEditable && target.closest(".tiptap")) return;

      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        onUndo();
      } else if (isCtrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        onRedo();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onUndo, onRedo, enabled]);
}
