import type { Step, Table } from "../engine/types";

export type Tone = "info" | "key" | "warn" | "ok";

export type GraphSpec = {
  series: { expr: string; label?: string; color?: string; dashed?: boolean }[];
  xmin?: number;
  xmax?: number;
  ymin?: number;
  ymax?: number;
  asymptotes?: number[];
  hlines?: number[];
  area?: { expr: string; a: number; b: number };
  points?: { x: number; y: number; label?: string }[];
  paths?: { points: { x: number; y: number }[]; color?: string; dashed?: boolean }[];
  title?: string;
  caption?: string;
};

export type ExerciseSpec = {
  id: string;
  prompt: string;
  hint: string;
  solution: Step[];
  answer?: string;
  choices?: string[];
  correct?: number;
};

export type Block =
  | { type: "text"; body: string }
  | { type: "math"; tex: string; label?: string }
  | { type: "note"; body: string; title?: string; tone?: Tone }
  | { type: "steps"; steps: Step[]; title?: string }
  | { type: "graph"; spec: GraphSpec }
  | { type: "table"; table: Table; title?: string }
  | { type: "example"; title: string; problem: string; steps: Step[]; answer?: string; tag?: string }
  | { type: "exercise"; exercise: ExerciseSpec }
  | { type: "lab"; lab: "function" | "limit" | "derivative" | "integral" | "matrix" | "conic"; title?: string }
  | { type: "checklist"; items: string[] };

export type Lesson = {
  id: string;
  title: string;
  subtitle: string;
  minutes: number;
  level: "Básico" | "Intermedio" | "Avanzado";
  objectives: string[];
  blocks: Block[];
  keyFormulas?: string[];
};

export type Module = {
  id: string;
  title: string;
  short: string;
  description: string;
  icon: string;
  accent: "indigo" | "amber" | "teal";
  lessons: Lesson[];
};
