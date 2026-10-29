import type { Step, Table } from "../engine/types";
import type { Block, ExerciseSpec, GraphSpec, Lesson, Tone } from "./types";

/** Paso abreviado para escribir contenido con menos ruido. */
export const s = (title: string, tex?: string, text?: string, depth = 0): Step => ({
  title,
  tex,
  text,
  depth,
});

export const text = (body: string): Block => ({ type: "text", body });

export const math = (tex: string, label?: string): Block => ({ type: "math", tex, label });

export const note = (body: string, opts: { title?: string; tone?: Tone } = {}): Block => ({
  type: "note",
  body,
  title: opts.title,
  tone: opts.tone ?? "info",
});

export const steps = (list: Step[], title?: string): Block => ({ type: "steps", steps: list, title });

export const graph = (spec: GraphSpec): Block => ({ type: "graph", spec });

export const table = (head: string[], rows: string[][], title?: string): Block => {
  const t: Table = { head, rows };
  return { type: "table", table: t, title };
};

export const example = (
  title: string,
  problem: string,
  list: Step[],
  answer?: string,
  tag = "Ejemplo resuelto",
): Block => ({ type: "example", title, problem, steps: list, answer, tag });

export const exercise = (spec: ExerciseSpec): Block => ({ type: "exercise", exercise: spec });

export const lab = (kind: "function" | "limit" | "derivative" | "integral" | "matrix" | "conic", title?: string): Block => ({
  type: "lab",
  lab: kind,
  title,
});

export const checklist = (items: string[]): Block => ({ type: "checklist", items });

export const lesson = (data: Lesson): Lesson => data;
