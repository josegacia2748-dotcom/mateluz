import { Footer } from "../components/Layout";
import { LabView } from "../labs/LabView";
import { navigate, useRoute } from "../lib/router";

const LABS = [
  { kind: "function", title: "Funciones", icon: "ƒ" },
  { kind: "limit", title: "Límites", icon: "→" },
  { kind: "derivative", title: "Derivadas", icon: "∂" },
  { kind: "integral", title: "Integrales", icon: "∫" },
  { kind: "matrix", title: "Matrices", icon: "▦" },
  { kind: "conic", title: "Cónicas", icon: "◯" },
] as const;

type Kind = (typeof LABS)[number]["kind"];

export function LabsPage() {
  const route = useRoute();
  const requested = route.query.get("lab");
  const active: Kind = (LABS.find((lab) => lab.kind === requested)?.kind ?? "function") as Kind;

  return (
    <>
      <div className="page-head">
        <div className="eyebrow">Laboratorios interactivos</div>
        <h1>Experimentá con la matemática</h1>
        <p className="lead">
          Escribí tus propias expresiones y mirá el procedimiento completo, la gráfica y los resultados.
          Todo se calcula en tu navegador; nada se envía a un servidor.
        </p>
      </div>

      <div className="tabs" role="tablist" aria-label="Laboratorios">
        {LABS.map((lab) => (
          <button
            key={lab.kind}
            type="button"
            role="tab"
            aria-selected={active === lab.kind}
            className={`tab${active === lab.kind ? " active" : ""}`}
            onClick={() => navigate(`/labs?lab=${lab.kind}`)}
          >
            <span aria-hidden="true" style={{ marginRight: 6 }}>{lab.icon}</span>
            {lab.title}
          </button>
        ))}
      </div>

      <LabView kind={active} />

      <div className="callout info" style={{ marginTop: 22 }}>
        <span className="co-icon">i</span>
        <div>
          <b className="co-title">Sintaxis de las expresiones</b>
          <p>
            Usá <code>x</code> como variable, <code>^</code> para potencias, <code>*</code> para multiplicar y
            funciones como <code>sin</code>, <code>cos</code>, <code>tan</code>, <code>ln</code>, <code>exp</code>,
            <code>sqrt</code>, <code>abs</code>. La multiplicación implícita también funciona: <code>2x</code> se
            interpreta como <code>2*x</code>.
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
}
