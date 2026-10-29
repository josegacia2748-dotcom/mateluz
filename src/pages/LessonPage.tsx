import { useEffect, useMemo, useState } from "react";
import { BlockView } from "../components/BlockRenderer";
import { Footer } from "../components/Layout";
import { Math } from "../components/Math";
import { findLesson, lessonNeighbours } from "../content";
import { href } from "../lib/router";
import { progressStore, useProgress } from "../lib/progress";
import { NotFound } from "./NotFound";

const TOC_LABEL: Record<string, string> = {
  text: "Texto",
  math: "Fórmula",
  note: "Nota clave",
  steps: "Pasos",
  graph: "Gráfica",
  table: "Tabla",
  example: "Ejemplo",
  exercise: "Ejercicio",
  lab: "Laboratorio",
  checklist: "Checklist",
};

export function LessonPage({ moduleId, lessonId }: { moduleId: string; lessonId: string }) {
  const ref = findLesson(moduleId, lessonId);
  const progress = useProgress();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (ref) progressStore.setLastLesson(ref.lesson.id);
  }, [ref]);

  const toc = useMemo(() => {
    if (!ref) return [];
    return ref.lesson.blocks.map((block, index) => {
      let label = TOC_LABEL[block.type] ?? block.type;
      if (block.type === "example") label = block.title;
      if (block.type === "note" && block.title) label = block.title;
      if (block.type === "table" && block.title) label = block.title;
      if (block.type === "graph" && block.spec.title) label = block.spec.title;
      if (block.type === "lab" && block.title) label = block.title;
      return { id: `bloque-${index}`, label };
    });
  }, [ref]);

  if (!ref) return <NotFound />;
  const { module, lesson } = ref;
  const { prev, next } = lessonNeighbours(ref);
  const isDone = progress.completed.includes(lesson.id);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="lesson-layout">
      <article className="lesson-body">
        <div className="crumbs">
          <a href={href("/")}>Inicio</a>
          <span className="sep">/</span>
          <a href={href(`/modulo/${module.id}`)}>{module.short}</a>
          <span className="sep">/</span>
          <span>Lección {ref.index + 1}</span>
        </div>

        <header className="lesson-head">
          <div className="eyebrow">{module.title}</div>
          <h1>{lesson.title}</h1>
          <p className="lead" style={{ marginBottom: 0 }}>{lesson.subtitle}</p>
          <div className="lesson-meta">
            <span className="badge indigo">{lesson.minutes} min</span>
            <span className={`badge ${lesson.level === "Avanzado" ? "amber" : lesson.level === "Intermedio" ? "teal" : "indigo"}`}>{lesson.level}</span>
            <span className="badge">{ref.index + 1} de {module.lessons.length}</span>
            {isDone ? <span className="badge ok">✓ completada</span> : null}
          </div>
        </header>

        <section className="objectives">
          <h4>Al terminar vas a poder</h4>
          <ul>
            {lesson.objectives.map((objective, i) => (
              <li key={i}>{objective}</li>
            ))}
          </ul>
        </section>

        {lesson.blocks.map((block, index) => (
          <BlockView key={index} block={block} index={index} />
        ))}

        {lesson.keyFormulas?.length ? (
          <section className="block">
            <h2>Fórmulas clave</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {lesson.keyFormulas.map((formula, i) => (
                <div className="formula-card" key={i}>
                  <Math tex={formula} block />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div className="card card-pad" style={{ marginTop: 26, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <strong style={{ fontSize: 14 }}>{isDone ? "Lección completada" : "¿Ya podés explicarlo sin mirar?"}</strong>
            <p className="small muted" style={{ margin: "4px 0 0" }}>
              Marcar la lección actualiza tu progreso y la ruta sugerida.
            </p>
          </div>
          <button type="button" className={`btn ${isDone ? "" : "primary"}`} onClick={() => progressStore.toggle(lesson.id)}>
            {isDone ? "✓ Completada (desmarcar)" : "Marcar como completada"}
          </button>
        </div>

        <nav className="lesson-nav" aria-label="Navegación entre lecciones">
          {prev ? (
            <a href={href(`/leccion/${prev.module.id}/${prev.lesson.id}`)}>
              <span className="dir">← Anterior</span>
              <span className="ttl" style={{ display: "block" }}>{prev.lesson.title}</span>
            </a>
          ) : <span />}
          {next ? (
            <a href={href(`/leccion/${next.module.id}/${next.lesson.id}`)} style={{ textAlign: "right" }}>
              <span className="dir">Siguiente →</span>
              <span className="ttl" style={{ display: "block" }}>{next.lesson.title}</span>
            </a>
          ) : <span />}
        </nav>

        <Footer />
      </article>

      <aside className="lesson-aside">
        <div className="card toc">
          <h4>En esta lección</h4>
          {toc.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={active === i ? "active" : ""}
              onClick={() => {
                setActive(i);
                scrollTo(item.id);
              }}
              style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", borderLeft: "2px solid transparent", cursor: "pointer", font: "inherit", color: "inherit" }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="card card-pad" style={{ padding: 16 }}>
          <div className="small muted" style={{ marginBottom: 6 }}>Progreso del módulo</div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${(module.lessons.filter((l) => progress.completed.includes(l.id)).length / module.lessons.length) * 100}%` }} />
          </div>
          <div className="small muted" style={{ marginTop: 8 }}>
            {module.lessons.filter((l) => progress.completed.includes(l.id)).length} de {module.lessons.length} lecciones
          </div>
        </div>
      </aside>
    </div>
  );
}
