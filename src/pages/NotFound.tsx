import { href } from "../lib/router";

export function NotFound() {
  return (
    <div className="empty">
      <h2 style={{ fontFamily: "var(--serif)" }}>No encontramos esa página</h2>
      <p>El enlace puede estar roto o el tema todavía no existe.</p>
      <div className="btn-row" style={{ justifyContent: "center" }}>
        <a className="btn primary" href={href("/")}>Volver al inicio</a>
        <a className="btn" href={href("/labs")}>Ir a laboratorios</a>
      </div>
    </div>
  );
}
