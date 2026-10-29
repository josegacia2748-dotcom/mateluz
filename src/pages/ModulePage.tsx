import { Footer } from "../components/Layout";
import { findModule } from "../content";
import { href } from "../lib/router";
import { useProgress } from "../lib/progress";
import { NotFound } from "./NotFound";

export function ModulePage({ moduleId }: { moduleId: string }) {
  const module = findModule(moduleId);
  const progress = useProgress();
  if (!module) return <NotFound />;

  const done = module.lessons.filter((lesson) => progress.completed.includes(lesson.id)).length;
  const pct = Math.round((done / module.lessons.length) * 100);
  const next = module.lessons.find((lesson) => !progress.completed.includes(lesson.id)) ?? module.lessons[0];

  return (
    <>
      <div className="crumbs">
        <a href={href("/")}>Inicio</a>
        <span className="sep">/</span>
        <span>{module.title}</span>
      </div>

      <div className="page-head">
        <div className="eyebrow">Módulo · {module.lessons.length} lecciones</div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <span className="module-icon" aria-hidden="true" style={{ background: `var(--${module.accent}-soft)`, color: `var(--${module.accent})`, width: 56, height: 56, fontSize: 26 }}>
            {module.icon}
          </span>
          <h1 style={{ margin: 0 }}>{module.title}</h1>
        </div>
        <p className="lead" style={{ marginTop: 12 }}>{module.description}</p>
        <div className="lesson-meta">
          <span className="badge indigo">{module.lessons.reduce((sum, lesson) => sum + lesson.minutes, 0)} minutos</span>
          <span className="badge">{done}/{module.lessons.length} completadas</span>
          <span className="badge teal">{module.lessons.reduce((sum, lesson) => sum + lesson.blocks.filter((b) => b.type === "exercise").length, 0)} ejercicios</span>
        </div>
        <div className="progress-track" style={{ maxWidth: 360, marginTop: 16 }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="section-head">
        <div>
          <h2>Lecciones</h2>
          <p>En orden sugerido. Podés entrar a cualquiera, pero cada una usa lo anterior.</p>
        </div>
        <a className="btn primary small" href={href(`/leccion/${module.id}/${next.id}`)}>
          {done ? "Continuar →" : "Empezar →"}
        </a>
      </div>

      <div className="lesson-list">
        {module.lessons.map((lesson, index) => {
          const isDone = progress.completed.includes(lesson.id);
          return (
            <a key={lesson.id} className={`lesson-row${isDone ? " done" : ""}`} href={href(`/leccion/${module.id}/${lesson.id}`)}>
              <span className="num" aria-hidden="true">{isDone ? "✓" : String(index + 1).padStart(2, "0")}</span>
              <span style={{ minWidth: 0 }}>
                <span className="l-title">{lesson.title}</span>
                <span className="l-sub" style={{ display: "block" }}>{lesson.subtitle}</span>
              </span>
              <span className="l-meta">
                <span className="badge">{lesson.minutes} min</span>
                <span className={`badge ${lesson.level === "Avanzado" ? "amber" : lesson.level === "Intermedio" ? "teal" : "indigo"}`}>{lesson.level}</span>
              </span>
            </a>
          );
        })}
      </div>

      <div className="callout info" style={{ marginTop: 26 }}>
        <span className="co-icon">i</span>
        <div>
          <b className="co-title">Cómo aprovechar el módulo</b>
          <p>
            Leé los objetivos antes de empezar, resolvé el ejemplo con lápiz y papel y recién después mirá
            el desarrollo. Al final, usá el laboratorio para probar casos propios y marcá la lección como
            completada solo si podés explicar el procedimiento sin mirar.
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
}
