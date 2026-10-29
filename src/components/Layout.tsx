import { useEffect, useState, type ReactNode } from "react";
import { allLessons, modules, stats } from "../content";
import { href, navigate, useRoute } from "../lib/router";
import { progressStore, useProgress } from "../lib/progress";

function Brand() {
  return (
    <a className="sidebar-brand" href={href("/")} style={{ textDecoration: "none", color: "inherit" }}>
      <span className="brand-mark" aria-hidden="true">∫</span>
      <span>
        <span className="brand-name">
          Mate<b>LUZ</b>
        </span>
        <span className="brand-sub">Ingeniería · LUZ</span>
      </span>
    </a>
  );
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const route = useRoute();
  const progress = useProgress();
  const done = progress.completed.length;
  const pct = Math.round((done / Math.max(1, stats.lessons)) * 100);

  const activeModule = route.parts[1];
  const isLesson = route.parts[0] === "leccion";

  return (
    <aside className={`sidebar${open ? " open" : ""}`} aria-label="Navegación principal">
      <Brand />
      <div className="sidebar-scroll">
        <div className="nav-label">Estudio</div>
        <a className={`nav-item${route.path === "/" ? " active" : ""}`} href={href("/")} onClick={onClose}>
          <span className="nav-icon">⌂</span> Inicio
        </a>
        <a className={`nav-item${route.parts[0] === "labs" ? " active" : ""}`} href={href("/labs")} onClick={onClose}>
          <span className="nav-icon">🧪</span> Laboratorios
        </a>
        <a className={`nav-item${route.parts[0] === "buscar" ? " active" : ""}`} href={href("/buscar")} onClick={onClose}>
          <span className="nav-icon">⌕</span> Buscar
        </a>

        <div className="nav-label">Módulos</div>
        {modules.map((module) => {
          const completed = module.lessons.filter((lesson) => progress.completed.includes(lesson.id)).length;
          const active = isLesson ? activeModule === module.id : route.parts[1] === module.id && route.parts[0] === "modulo";
          return (
            <a
              key={module.id}
              className={`nav-item${active ? " active" : ""}`}
              href={href(`/modulo/${module.id}`)}
              onClick={onClose}
              title={module.description}
            >
              <span className="nav-icon" aria-hidden="true">{module.icon}</span>
              <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{module.short}</span>
              <span className="nav-count">{completed}/{module.lessons.length}</span>
            </a>
          );
        })}

        <div className="nav-label">Tu progreso</div>
        <div className="progress-card" style={{ margin: "0 4px" }}>
          <div className="progress-head">
            <span>{done} de {stats.lessons} lecciones</span>
            <strong>{pct}%</strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="small muted" style={{ marginTop: 8 }}>
            {stats.exercises} ejercicios · {Math.round(stats.minutes / 60)} h de contenido
          </div>
        </div>
      </div>
      <div className="sidebar-footer">
        <div className="btn-row">
          <button
            type="button"
            className="btn small"
            onClick={() => progressStore.toggleTheme()}
            style={{ flex: 1 }}
            title="Cambiar entre tema claro y oscuro"
          >
            {progress.theme === "dark" ? "☀ Claro" : "☾ Oscuro"}
          </button>
          <button
            type="button"
            className="btn small ghost"
            onClick={() => {
              if (window.confirm("¿Reiniciar todo el progreso guardado? Esta acción no se puede deshacer.")) progressStore.reset();
            }}
            title="Reiniciar progreso"
          >
            ↺
          </button>
        </div>
      </div>
    </aside>
  );
}

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const route = useRoute();
  const progress = useProgress();
  const [query, setQuery] = useState(route.query.get("q") ?? "");

  useEffect(() => {
    if (route.parts[0] === "buscar") setQuery(route.query.get("q") ?? "");
  }, [route]);

  return (
    <header className="topbar">
      <button type="button" className="icon-btn menu-btn" onClick={onMenu} aria-label="Abrir menú">
        ☰
      </button>
      <form
        className="searchbox"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          navigate(`/buscar?q=${encodeURIComponent(query.trim())}`);
        }}
      >
        <span className="search-ico" aria-hidden="true">⌕</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar tema, teorema o ejercicio…"
          aria-label="Buscar en MateLUZ"
        />
        <kbd>Enter</kbd>
      </form>
      <div className="topbar-spacer" />
      <div className="top-actions">
        <span className="badge indigo" style={{ display: "none" }}>LUZ</span>
        <a className="icon-btn" href={href("/labs")} title="Laboratorios interactivos" aria-label="Laboratorios">
          🧪
        </a>
        <button
          type="button"
          className="icon-btn"
          onClick={() => progressStore.toggleTheme()}
          title={progress.theme === "dark" ? "Tema claro" : "Tema oscuro"}
          aria-label="Cambiar tema"
        >
          {progress.theme === "dark" ? "☀" : "☾"}
        </button>
      </div>
    </header>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const progress = useProgress();
  const route = useRoute();

  useEffect(() => {
    document.documentElement.dataset.theme = progress.theme;
  }, [progress.theme]);

  useEffect(() => {
    setOpen(false);
  }, [route.hash]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="app">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      {open ? (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", border: 0, zIndex: 35 }}
        />
      ) : null}
      <div className="main">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="content">{children}</main>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="footer-note">
      <span>MateLUZ · tutor interactivo para la Facultad de Ingeniería de la Universidad del Zulia.</span>
      <span>{allLessons.length} lecciones · {stats.exercises} ejercicios · sin registro, progreso local.</span>
    </footer>
  );
}
