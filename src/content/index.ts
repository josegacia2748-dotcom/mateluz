import type { Lesson, Module } from "./types";
import { geometria } from "./geometria";
import { analitica } from "./analitica";
import { algebra } from "./algebra";
import { funciones } from "./funciones";
import { limites } from "./limites";
import { derivadas } from "./derivadas";
import { integrales } from "./integrales";
import { avanzado } from "./avanzado";
import { examen } from "./examen";

export const modules: Module[] = [
  geometria,
  analitica,
  algebra,
  funciones,
  limites,
  derivadas,
  integrales,
  avanzado,
  examen,
];

export type LessonRef = {
  module: Module;
  lesson: Lesson;
  index: number;
};

export const allLessons: LessonRef[] = modules.flatMap((module) =>
  module.lessons.map((lesson, index) => ({ module, lesson, index })),
);

export function findModule(id: string): Module | undefined {
  return modules.find((m) => m.id === id);
}

export function findLesson(moduleId: string, lessonId: string): LessonRef | undefined {
  const module = findModule(moduleId);
  if (!module) return undefined;
  const index = module.lessons.findIndex((l) => l.id === lessonId);
  if (index < 0) return undefined;
  return { module, lesson: module.lessons[index], index };
}

export function lessonNeighbours(ref: LessonRef): { prev?: LessonRef; next?: LessonRef } {
  const flat = allLessons.findIndex(
    (item) => item.module.id === ref.module.id && item.lesson.id === ref.lesson.id,
  );
  return { prev: flat > 0 ? allLessons[flat - 1] : undefined, next: flat < allLessons.length - 1 ? allLessons[flat + 1] : undefined };
}

export const stats = {
  modules: modules.length,
  lessons: allLessons.length,
  minutes: allLessons.reduce((sum, item) => sum + item.lesson.minutes, 0),
  exercises: allLessons.reduce(
    (sum, item) => sum + item.lesson.blocks.filter((b) => b.type === "exercise").length,
    0,
  ),
};

export type SearchHit = {
  module: Module;
  lesson: Lesson;
  score: number;
  snippet: string;
};

function plain(value: string): string {
  return value
    .replace(/\$[^$]*\$/g, " ")
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/[*_`#>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function blockText(lesson: Lesson): string {
  return lesson.blocks
    .map((block) => {
      if (block.type === "text" || block.type === "note") return plain(block.body);
      if (block.type === "example") return `${block.title} ${plain(block.problem)}`;
      if (block.type === "exercise") return `${plain(block.exercise.prompt)} ${block.exercise.hint}`;
      if (block.type === "math") return block.label ?? "";
      if (block.type === "table") return block.table.rows.flat().join(" ");
      return "";
    })
    .join(" ");
}

export function search(query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const hits: SearchHit[] = [];

  for (const ref of allLessons) {
    const title = `${ref.lesson.title} ${ref.lesson.subtitle} ${ref.module.title}`.toLowerCase();
    const body = blockText(ref.lesson).toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (title.includes(term)) score += 8;
      if (body.includes(term)) score += 2;
      if (ref.lesson.objectives.join(" ").toLowerCase().includes(term)) score += 3;
    }
    if (score === 0) continue;
    const pos = body.indexOf(terms[0]);
    const start = Math.max(0, pos - 60);
    const snippet = body.slice(start, start + 180).trim();
    hits.push({ module: ref.module, lesson: ref.lesson, score, snippet: pos >= 0 ? `…${snippet}…` : ref.lesson.subtitle });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, 20);
}
