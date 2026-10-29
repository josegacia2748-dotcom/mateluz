import { allLessons, modules, stats } from "../content";
import { Footer } from "../components/Layout";
import { href } from "../lib/router";
import { useProgress } from "../lib/progress";

export function Home() {
  const progress = useProgress();
  const last = allLessons.find((item) => item.lesson.id === progress.lastLesson);
  const next = allLessons.find((item) => !progress.completed.includes(item.lesson.id)) ?? allLessons[0];
  const done = progress.completed.length;

  return (
    <>
      <section className="hero">
        <div className="eyebrow">Facultad de Ingeniería · Universidad del Zulia</div>
        <h1>La matemática de ingeniería, explicada sin saltarse ningún paso.</h1>
        <p className="lead">
          Geometría, álgebra lineal, funciones, límites, derivadas, integrales y cálculo avanzado.
          Cada procedimiento está descompuesto paso a paso, con gráficas interactivas, pistas y
          problemas de examen de la facultad.
        </p>
        <div className="btn-row">
          <a className="btn primary" href={href(last ? `/leccion/${last.module.id}/${last.lesson.id}` : `/leccion/${next.module.id}/${next.lesson.id}`)}>
            {last ? "Continuar donde quedé →" : "Empezar por el principio →"}
          </a>
          <a className="btn" href={href("/labs")}>Abrir laboratorios</a>
          <a className="btn ghost" href={href(`/modulo/${next.module.id}`)}>Ver ruta sugerida</a>
        </div>
        <div className="hero-stats">
          <div className="hero-stat"><b>{stats.modules}</b><span>MÓDULOS</span></div>
          <div className="hero-stat"><b>{stats.lessons}</b><span>LECCIONES</span></div>
          <div className="hero-stat"><b>{stats.exercises}</b><span>EJERCICIOS</span></div>
          <div className="hero-stat"><b>{done}</b><span>COMPLETADAS</span></div>
        </div>
      </section>

      <div className="section-head">
        <div>
          <h2>Módulos de estudio</h2>
          <p>Una ruta continua, desde los axiomas hasta las ecuaciones diferenciales.</p>
        </div>
        <span className="badge indigo">{Math.round(stats.minutes / 60)} h de contenido</span>
      </div>

      <div className="module-grid">
        {modules.map((module, index) => {
          const completed = module.lessons.filter((lesson) => progress.completed.includes(lesson.id)).length;
          return (
            <a key={module.id} className="card module-card" href={href(`/modulo/${module.id}`)}>
              <div className="mod-top">
                <span className={`module-icon ${module.accent}`} aria-hidden="true" style={{ background: `var(--${module.accent}-soft)`, color: `var(--${module.accent})` }}>
                  {module.icon}
                </span>
                <span className="badge">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
              <div className="module-meta">
                <span>{module.lessons.length} lecciones</span>
                <span>{module.lessons.reduce((sum, lesson) => sum + lesson.minutes, 0)} min</span>
                <span style={{ marginLeft: "auto", color: completed ? "var(--ok)" : undefined }}>
                  {completed ? `✓ ${completed}/${module.lessons.length}` : "empezar"}
                </span>
              </div>
            </a>
          );
        })}
      </div>

      <div className="section-head">
        <div>
          <h2>Cómo está pensado MateLUZ</h2>
          <p>No es un formulario de respuestas: es un tutor que muestra el razonamiento.</p>
        </div>
      </div>

      <div className="split">
        <div className="card quick-card">
          <h3>Cuatro principios didácticos</h3>
          <div className="chips">
            <span className="chip">① Cero pasos omitidos</span>
            <span className="chip">② Gráfica antes que fórmula</span>
            <span className="chip">③ Pista antes que solución</span>
            <span className="chip">④ Problemas de facultad</span>
          </div>
          <p className="small muted" style={{ margin: 0 }}>
            Cada ejemplo se puede resolver en modo guiado: ves un paso, intentás anticipar el siguiente y
            recién después lo revelás. Los laboratorios recalculan todo mientras escribís, para que puedas
            experimentar con tus propias funciones, matrices y cónicas.
          </p>
          <div className="btn-row">
            <a className="btn primary small" href={href("/modulo/limites")}>Ver un ejemplo de límites</a>
            <a className="btn small" href={href("/modulo/algebra")}>Álgebra lineal aplicada</a>
          </div>
        </div>
        <div className="card quick-card">
          <h3>Ruta sugerida</h3>
          <div className="lesson-list">
            {[
              ["geometria", "geometria-axiomas"],
              ["funciones", "funciones-concepto"],
              ["limites", "limites-concepto"],
              ["derivadas", "derivadas-definicion"],
              ["integrales", "integrales-antiderivada"],
            ].map(([moduleId, lessonId], i) => {
              const ref = allLessons.find((item) => item.module.id === moduleId && item.lesson.id === lessonId);
              if (!ref) return null;
              return (
                <a key={lessonId} className="lesson-row" href={href(`/leccion/${moduleId}/${lessonId}`)}>
                  <span className="num">{i + 1}</span>
                  <span>
                    <span className="l-title">{ref.lesson.title}</span>
                    <span className="l-sub" style={{ display: "block" }}>{ref.module.short} · {ref.lesson.minutes} min</span>
                  </span>
                  <span className="l-meta"><span className="badge">{ref.lesson.level}</span></span>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="section-head">
        <div>
          <h2>Laboratorios interactivos</h2>
          <p>Seis entornos para experimentar: funciones, límites, derivadas, integrales, matrices y cónicas.</p>
        </div>
        <a className="btn small" href={href("/labs")}>Abrir todos →</a>
      </div>
      <div className="module-grid">
        {[
          ["function", "Funciones", "Dominio, rango, asíntotas y extremos."],
          ["limit", "Límites", "Sustitución, factorización y L'Hôpital."],
          ["derivative", "Derivadas", "Traza la tangente y desglosa la cadena."],
          ["integral", "Integrales", "Antiderivada, área y Simpson."],
          ["matrix", "Matrices", "Determinante, RREF e inversa exacta."],
          ["conic", "Cónicas", "Clasifica y visualiza focos y ejes."],
        ].map(([kind, title, desc]) => (
          <a key={kind} className="card module-card" href={href(`/labs?lab=${kind}`)}>
            <div className="mod-top">
              <span className="module-icon" aria-hidden="true">🧪</span>
              <span className="badge teal">lab</span>
            </div>
            <h3 style={{ fontSize: 19 }}>{title}</h3>
            <p>{desc}</p>
          </a>
        ))}
      </div>

      <Footer />
    </>
  );
}
