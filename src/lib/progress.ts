import { useSyncExternalStore } from "react";

export type ExerciseState = "ok" | "review";

export type Progress = {
  completed: string[];
  exercises: Record<string, ExerciseState>;
  theme: "light" | "dark";
  lastLesson?: string;
};

const KEY = "mateluz:v1";

const empty: Progress = { completed: [], exercises: {}, theme: "light" };

function load(): Progress {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      exercises: parsed.exercises && typeof parsed.exercises === "object" ? parsed.exercises : {},
      theme: parsed.theme === "dark" ? "dark" : "light",
      lastLesson: typeof parsed.lastLesson === "string" ? parsed.lastLesson : undefined,
    };
  } catch {
    return empty;
  }
}

let state: Progress = load();
const listeners = new Set<() => void>();

function commit(next: Progress) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* almacenamiento no disponible */
  }
  listeners.forEach((l) => l());
}

export const progressStore = {
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  getSnapshot() {
    return state;
  },
  isComplete(id: string) {
    return state.completed.includes(id);
  },
  markComplete(id: string) {
    if (state.completed.includes(id)) return;
    commit({ ...state, completed: [...state.completed, id], lastLesson: id });
  },
  unmark(id: string) {
    commit({ ...state, completed: state.completed.filter((x) => x !== id) });
  },
  toggle(id: string) {
    if (state.completed.includes(id)) this.unmark(id);
    else this.markComplete(id);
  },
  setExercise(id: string, value: ExerciseState) {
    commit({ ...state, exercises: { ...state.exercises, [id]: value } });
  },
  setLastLesson(id: string) {
    if (state.lastLesson === id) return;
    commit({ ...state, lastLesson: id });
  },
  setTheme(theme: "light" | "dark") {
    commit({ ...state, theme });
  },
  toggleTheme() {
    commit({ ...state, theme: state.theme === "dark" ? "light" : "dark" });
  },
  reset() {
    commit({ ...empty, theme: state.theme });
  },
};

export function useProgress(): Progress {
  return useSyncExternalStore(
    progressStore.subscribe,
    progressStore.getSnapshot,
    progressStore.getSnapshot,
  );
}
