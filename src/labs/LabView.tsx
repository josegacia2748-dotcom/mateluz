import { useMemo, useState, type ReactNode } from "react";
import { analyzeFunction } from "../engine/analysis";
import { analyzeConic, conicPoints, conicSummary } from "../engine/conics";
import { diff, diffWithTrace, evaluate, formatNumber, parse, toLatex } from "../engine/expr";
import { integrate, simpson } from "../engine/integrals";
import { limit } from "../engine/limits";
import {
  detValue,
  determinantGauss,
  inverse,
  matrixToLatex,
  parseMatrix,
  rref,
  solveSystem,
} from "../engine/matrix";
import { Math as Tex } from "../components/Math";
import { Graph } from "../components/Graph";
import { Steps } from "../components/Steps";
import type { GraphSpec } from "../content/types";

type LabKind = "function" | "limit" | "derivative" | "integral" | "matrix" | "conic";

const META: Record<LabKind, { title: string; description: string }> = {
  function: {
    title: "Laboratorio de funciones",
    description: "Escribí una función y observá dominio, rango, asíntotas, ceros, monotonía y extremos.",
  },
  limit: {
    title: "Laboratorio de límites",
    description: "Calculá límites por sustitución, factorización, L'Hôpital o comportamiento asintótico.",
  },
  derivative: {
    title: "Laboratorio de derivadas",
    description: "Derivá paso a paso y visualizá la recta tangente en un punto.",
  },
  integral: {
    title: "Laboratorio de integrales",
    description: "Obtené la antiderivada, el valor definido y la aproximación numérica de Simpson.",
  },
  matrix: {
    title: "Laboratorio de matrices",
    description: "Determinante, rango, inversa y resolución de sistemas con aritmética exacta.",
  },
  conic: {
    title: "Laboratorio de cónicas",
    description: "Clasificá una cónica, completá cuadrados y visualizá sus focos, ejes y asíntotas.",
  },
};

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="callout warn">
      <span className="co-icon">!</span>
      <div>
        <b className="co-title">No se pudo interpretar</b>
        <p>{message}</p>
        <p className="small">Revisá la sintaxis: usá `x`, `*` para multiplicar, `^` para potencias, `sin`, `cos`, `ln`, `sqrt`.</p>
      </div>
    </div>
  );
}

function Pill({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="result-pill">
      <span>{label}</span>
      <b>{children}</b>
    </div>
  );
}

function useNumeric(value: string, fallback = 0): number {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function FunctionLab() {
  const [expr, setExpr] = useState("x^3-3x");
  const result = useMemo(() => {
    try {
      return { ok: true as const, value: analyzeFunction(expr) };
    } catch (error) {
      return { ok: false as const, message: error instanceof Error ? error.message : String(error) };
    }
  }, [expr]);

  return (
    <div className="lab-grid">
      <div className="lab-controls">
        <Field label="f(x)" hint="Ejemplos: (x^2-1)/(x-2), sin(x)/x, ln(x), sqrt(x^2+4)">
          <input value={expr} onChange={(e) => setExpr(e.target.value)} spellCheck={false} />
        </Field>
        <div className="chips">
          {["x^3-3x", "(x^2-1)/(x-2)", "sin(x)/x", "ln(x)", "1/(x^2+1)"].map((item) => (
            <button key={item} type="button" className="chip" onClick={() => setExpr(item)} style={{ cursor: "pointer" }}>
              {item}
            </button>
          ))}
        </div>
        <p className="small muted" style={{ margin: 0 }}>
          El análisis se recalcula mientras escribís. Las asíntotas y los extremos son aproximaciones numéricas.
        </p>
      </div>
      <div className="lab-output">
        {!result.ok ? <ErrorBox message={result.message} /> : <FunctionOutput expr={expr} data={result.value} />}
      </div>
    </div>
  );
}

function FunctionOutput({ expr, data }: { expr: string; data: ReturnType<typeof analyzeFunction> }) {
  const spec: GraphSpec = {
    series: [{ expr, label: `f(x) = ${expr}`, color: "indigo" }],
    asymptotes: data.asymptotes.vertical,
    points: data.extrema.map((e) => ({ x: e.x, y: e.y, label: `${e.type} (${formatNumber(e.x)}, ${formatNumber(e.y)})` })),
    title: "Gráfica y puntos notables",
  };
  return (
    <>
      <div className="result-strip">
        <Pill label="Dominio">{data.domain.text}</Pill>
        <Pill label="Rango">{data.range.text}</Pill>
        <Pill label="Paridad">{data.parity}</Pill>
      </div>
      <Graph spec={spec} />
      <div className="card card-pad">
        <div className="chips" style={{ marginBottom: 10 }}>
          <span className="badge indigo">ceros: {data.zeros.length ? data.zeros.map((z) => formatNumber(z)).join(", ") : "ninguno"}</span>
          <span className="badge">corte y: {data.yIntercept === null ? "—" : formatNumber(data.yIntercept)}</span>
          {data.asymptotes.vertical.length ? <span className="badge amber">AV: x = {data.asymptotes.vertical.map((v) => formatNumber(v)).join(", ")}</span> : null}
          {data.asymptotes.horizontal.length ? <span className="badge teal">AH: {data.asymptotes.horizontal.join(", ")}</span> : null}
          {data.asymptotes.oblique.length ? <span className="badge teal">AO: {data.asymptotes.oblique.join(", ")}</span> : null}
        </div>
        <Steps steps={data.steps} title="Análisis completo" />
      </div>
    </>
  );
}

function LimitLab() {
  const [expr, setExpr] = useState("sin(x)/x");
  const [at, setAt] = useState("0");
  const result = useMemo(() => {
    try {
      const point: number | "inf" | "-inf" = at.trim() === "inf" ? "inf" : at.trim() === "-inf" ? "-inf" : Number(at.replace(",", "."));
      if (point !== "inf" && point !== "-inf" && !Number.isFinite(point)) throw new Error("El punto debe ser un número, inf o -inf.");
      return { ok: true as const, value: limit(expr, "x", point), point };
    } catch (error) {
      return { ok: false as const, message: error instanceof Error ? error.message : String(error) };
    }
  }, [expr, at]);

  return (
    <div className="lab-grid">
      <div className="lab-controls">
        <Field label="f(x)" hint="Usá sin, cos, tan, ln, exp, sqrt y ^ para potencias.">
          <input value={expr} onChange={(e) => setExpr(e.target.value)} spellCheck={false} />
        </Field>
        <Field label="x tiende a" hint="Número, inf o -inf.">
          <input value={at} onChange={(e) => setAt(e.target.value)} spellCheck={false} />
        </Field>
        <div className="chips">
          {[
            ["sin(x)/x", "0"],
            ["(x^2-4)/(x-2)", "2"],
            ["(1-cos(x))/x^2", "0"],
            ["(3x^2+1)/(x^2-2)", "inf"],
            ["1/x", "0"],
          ].map(([e, a]) => (
            <button key={`${e}-${a}`} type="button" className="chip" onClick={() => { setExpr(e); setAt(a); }} style={{ cursor: "pointer" }}>
              {e} → {a}
            </button>
          ))}
        </div>
      </div>
      <div className="lab-output">
        {!result.ok ? (
          <ErrorBox message={result.message} />
        ) : (
          <LimitOutput expr={expr} data={result.value} point={result.point} />
        )}
      </div>
    </div>
  );
}

function LimitOutput({ expr, data, point }: { expr: string; data: ReturnType<typeof limit>; point: number | "inf" | "-inf" }) {
  const finite = typeof point === "number";
  const spec: GraphSpec = {
    series: [{ expr, label: `f(x) = ${expr}`, color: "teal" }],
    xmin: finite ? point - 4 : -8,
    xmax: finite ? point + 4 : 8,
    asymptotes: finite ? [point] : undefined,
    hlines: typeof data.value === "number" ? [data.value] : undefined,
    points: typeof data.value === "number" && finite ? [{ x: point, y: data.value, label: `L = ${formatNumber(data.value)}` }] : undefined,
    title: "Comportamiento cerca del punto",
  };
  return (
    <>
      <div className="result-strip">
        <Pill label="Límite">
          <Tex tex={data.latex} />
        </Pill>
        <Pill label="Método">{data.method}</Pill>
        <Pill label="¿Existe?">{data.exists ? "sí" : "no"}</Pill>
      </div>
      {data.indeterminate ? <div className="callout key"><span className="co-icon">★</span><div>Forma indeterminada detectada: <strong>{data.indeterminate}</strong></div></div> : null}
      <Graph spec={spec} />
      <div className="card card-pad">
        <Steps steps={data.steps} title="Resolución del límite" />
        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table className="data">
            <thead>
              <tr>{data.table.head.map((h, i) => <th key={i}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {data.table.rows.map((row, ri) => (
                <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function DerivativeLab() {
  const [expr, setExpr] = useState("x^2*sin(x)");
  const [point, setPoint] = useState("1");
  const a = useNumeric(point, 1);
  const result = useMemo(() => {
    try {
      const node = parse(expr);
      const traced = diffWithTrace(node);
      const derivative = diff(node);
      const y0 = evaluate(node, { x: a });
      const m = evaluate(derivative, { x: a });
      return { ok: true as const, traced, y0, m };
    } catch (error) {
      return { ok: false as const, message: error instanceof Error ? error.message : String(error) };
    }
  }, [expr, a]);

  return (
    <div className="lab-grid">
      <div className="lab-controls">
        <Field label="f(x)">
          <input value={expr} onChange={(e) => setExpr(e.target.value)} spellCheck={false} />
        </Field>
        <Field label="Punto x = a">
          <input value={point} onChange={(e) => setPoint(e.target.value)} spellCheck={false} />
        </Field>
        <div className="chips">
          {["x^2*sin(x)", "ln(x^2+1)", "(3x+1)^5", "e^x*cos(x)", "sqrt(x^2+4)"].map((item) => (
            <button key={item} type="button" className="chip" onClick={() => setExpr(item)} style={{ cursor: "pointer" }}>
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="lab-output">
        {!result.ok ? <ErrorBox message={result.message} /> : <DerivativeOutput expr={expr} a={a} data={result} />}
      </div>
    </div>
  );
}

function DerivativeOutput({ expr, a, data }: { expr: string; a: number; data: { traced: ReturnType<typeof diffWithTrace>; y0: number; m: number } }) {
  const tangent = Number.isFinite(data.y0) && Number.isFinite(data.m) ? `${data.y0} + (${data.m})*(x-(${a}))` : null;
  const spec: GraphSpec = {
    series: [
      { expr, label: `f(x) = ${expr}`, color: "indigo" },
      ...(tangent ? [{ expr: tangent, label: "recta tangente", color: "amber", dashed: true }] : []),
    ],
    points: Number.isFinite(data.y0) ? [{ x: a, y: data.y0, label: `(${formatNumber(a)}, ${formatNumber(data.y0)})` }] : undefined,
    title: "Función y tangente en el punto",
  };
  return (
    <>
      <div className="result-strip">
        <Pill label="f'(x)">
          <Tex tex={data.traced.latex} />
        </Pill>
        <Pill label="Pendiente en a">{formatNumber(data.m)}</Pill>
        <Pill label="f(a)">{formatNumber(data.y0)}</Pill>
      </div>
      <Graph spec={spec} />
      <div className="card card-pad">
        <Steps steps={data.traced.steps} title="Derivada paso a paso" />
      </div>
    </>
  );
}

function IntegralLab() {
  const [expr, setExpr] = useState("x^2");
  const [aRaw, setARaw] = useState("0");
  const [bRaw, setBRaw] = useState("2");
  const a = useNumeric(aRaw, 0);
  const b = useNumeric(bRaw, 2);
  const result = useMemo(() => {
    try {
      const node = parse(expr);
      const data = integrate(node, "x", [a, b]);
      const numeric = simpson(node, "x", a, b, 1000);
      return { ok: true as const, data, numeric };
    } catch (error) {
      return { ok: false as const, message: error instanceof Error ? error.message : String(error) };
    }
  }, [expr, a, b]);

  return (
    <div className="lab-grid">
      <div className="lab-controls">
        <Field label="f(x)">
          <input value={expr} onChange={(e) => setExpr(e.target.value)} spellCheck={false} />
        </Field>
        <div className="field-row">
          <Field label="Límite a">
            <input value={aRaw} onChange={(e) => setARaw(e.target.value)} />
          </Field>
          <Field label="Límite b">
            <input value={bRaw} onChange={(e) => setBRaw(e.target.value)} />
          </Field>
        </div>
        <div className="chips">
          {["x^2", "sin(x)", "1/(1+x^2)", "x*e^x", "sqrt(x)"].map((item) => (
            <button key={item} type="button" className="chip" onClick={() => setExpr(item)} style={{ cursor: "pointer" }}>
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="lab-output">
        {!result.ok ? <ErrorBox message={result.message} /> : <IntegralOutput expr={expr} a={a} b={b} data={result.data} numeric={result.numeric} />}
      </div>
    </div>
  );
}

function IntegralOutput({ expr, a, b, data, numeric }: { expr: string; a: number; b: number; data: ReturnType<typeof integrate>; numeric: number | null }) {
  const spec: GraphSpec = {
    series: [{ expr, label: `f(x) = ${expr}`, color: "amber" }],
    area: { expr, a, b },
    xmin: Math.min(a, b) - 1,
    xmax: Math.max(a, b) + 1,
    title: `Área bajo la curva en [${formatNumber(a)}, ${formatNumber(b)}]`,
  };
  return (
    <>
      <div className="result-strip">
        <Pill label="Método">{data.method}</Pill>
        <Pill label="Antiderivada">
          {data.antiderivative ? <Tex tex={`${toLatex(data.antiderivative)}+C`} /> : "—"}
        </Pill>
        <Pill label="Valor definido">{data.definite?.value === null || data.definite?.value === undefined ? "—" : formatNumber(data.definite.value)}</Pill>
        <Pill label="Simpson">{numeric === null ? "—" : formatNumber(numeric)}</Pill>
      </div>
      {data.improper ? <div className="callout warn"><span className="co-icon">!</span><div>La integral es impropia o no converge en el intervalo indicado.</div></div> : null}
      <Graph spec={spec} />
      <div className="card card-pad">
        <Steps steps={data.steps} title="Integración paso a paso" />
      </div>
    </>
  );
}

function MatrixLab() {
  const [matrixText, setMatrixText] = useState("1 2; 3 4");
  const [vectorText, setVectorText] = useState("5; 11");
  const result = useMemo(() => {
    try {
      const m = parseMatrix(matrixText);
      const det = detValue(m);
      const gauss = determinantGauss(m);
      const reduced = rref(m);
      const inv = inverse(m);
      let system = null;
      try {
        const b = parseMatrix(vectorText).map((row) => row[0]);
        if (b.length === m.length && b.every((x) => x !== undefined)) system = solveSystem(m, b);
      } catch {
        system = null;
      }
      return { ok: true as const, m, det, gauss, reduced, inv, system };
    } catch (error) {
      return { ok: false as const, message: error instanceof Error ? error.message : String(error) };
    }
  }, [matrixText, vectorText]);

  return (
    <div className="lab-grid">
      <div className="lab-controls">
        <Field label="Matriz A" hint="Filas separadas por ; y columnas por espacios. Ejemplo: 1 2; 3 4">
          <textarea rows={4} value={matrixText} onChange={(e) => setMatrixText(e.target.value)} spellCheck={false} />
        </Field>
        <Field label="Vector b (opcional)" hint="Una componente por fila, separadas por ;">
          <textarea rows={2} value={vectorText} onChange={(e) => setVectorText(e.target.value)} spellCheck={false} />
        </Field>
        <div className="chips">
          {["1 2; 3 4", "2 -1 0; -1 2 -1; 0 -1 2", "1 2 3; 4 5 6; 7 8 10"].map((item) => (
            <button key={item} type="button" className="chip" onClick={() => setMatrixText(item)} style={{ cursor: "pointer" }}>
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="lab-output">
        {!result.ok ? <ErrorBox message={result.message} /> : <MatrixOutput data={result} />}
      </div>
    </div>
  );
}

function MatrixOutput({ data }: { data: { m: ReturnType<typeof parseMatrix>; det: number; gauss: ReturnType<typeof determinantGauss>; reduced: ReturnType<typeof rref>; inv: ReturnType<typeof inverse>; system: ReturnType<typeof solveSystem> | null } }) {
  return (
    <>
      <div className="result-strip">
        <Pill label="Determinante">{formatNumber(data.det)}</Pill>
        <Pill label="Rango">{data.reduced.rank}</Pill>
        <Pill label="Invertible">{data.inv.inverse ? "sí" : "no"}</Pill>
      </div>
      <div className="card card-pad">
        <div className="small muted" style={{ marginBottom: 6 }}>Matriz original</div>
        <Tex tex={matrixToLatex(data.m)} block />
        <div className="small muted" style={{ margin: "14px 0 6px" }}>Forma escalonada reducida (RREF)</div>
        <Tex tex={matrixToLatex(data.reduced.matrix)} block />
        {data.inv.inverse ? (
          <>
            <div className="small muted" style={{ margin: "14px 0 6px" }}>Inversa</div>
            <Tex tex={matrixToLatex(data.inv.inverse)} block />
          </>
        ) : null}
      </div>
      {data.system ? (
        <div className="card card-pad">
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <strong style={{ fontSize: 14 }}>Sistema A·x = b</strong>
            <span className={`badge ${data.system.type === "unique" ? "ok" : data.system.type === "infinite" ? "amber" : "teal"}`} style={{ marginLeft: "auto" }}>
              {data.system.type === "unique" ? "solución única" : data.system.type === "infinite" ? "infinitas soluciones" : "sin solución"}
            </span>
          </div>
          <Tex tex={data.system.latex} block />
        </div>
      ) : null}
      <div className="card card-pad">
        <Steps steps={[...data.gauss.steps, ...data.reduced.steps]} title="Eliminación paso a paso" />
      </div>
    </>
  );
}

function ConicLab() {
  const [expr, setExpr] = useState("x^2+y^2-4x+2y-4=0");
  const result = useMemo(() => {
    try {
      const data = analyzeConic(expr);
      const paths = conicPoints(data, 200).map((points) => ({ points, color: "teal" }));
      return { ok: true as const, data, paths };
    } catch (error) {
      return { ok: false as const, message: error instanceof Error ? error.message : String(error) };
    }
  }, [expr]);

  return (
    <div className="lab-grid">
      <div className="lab-controls">
        <Field label="Ecuación" hint="Usá x, y, potencias y coeficientes. Ejemplo: x^2/9+y^2/4=1">
          <input value={expr} onChange={(e) => setExpr(e.target.value)} spellCheck={false} />
        </Field>
        <div className="chips">
          {["x^2+y^2-4x+2y-4=0", "x^2/9+y^2/4=1", "y^2=8x", "x^2/4-y^2/9=1"].map((item) => (
            <button key={item} type="button" className="chip" onClick={() => setExpr(item)} style={{ cursor: "pointer" }}>
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="lab-output">
        {!result.ok ? <ErrorBox message={result.message} /> : <ConicOutput data={result.data} paths={result.paths} />}
      </div>
    </div>
  );
}

function ConicOutput({ data, paths }: { data: ReturnType<typeof analyzeConic>; paths: { points: { x: number; y: number }[]; color: string }[] }) {
  const all = paths.flatMap((p) => p.points);
  const xs = all.map((p) => p.x).filter(Number.isFinite);
  const ys = all.map((p) => p.y).filter(Number.isFinite);
  const pad = 2;
  const spec: GraphSpec = {
    series: [],
    paths,
    points: data.foci.map((f, i) => ({ x: f.x, y: f.y, label: `foco ${i + 1}` })),
    xmin: xs.length ? Math.min(...xs) - pad : -6,
    xmax: xs.length ? Math.max(...xs) + pad : 6,
    ymin: ys.length ? Math.min(...ys) - pad : -6,
    ymax: ys.length ? Math.max(...ys) + pad : 6,
    title: `Cónica: ${data.kind}`,
  };
  return (
    <>
      <div className="result-strip">
        <Pill label="Tipo">{data.kind}</Pill>
        <Pill label="Centro">({formatNumber(data.center.x)}, {formatNumber(data.center.y)})</Pill>
        {data.radius !== undefined ? <Pill label="Radio">{formatNumber(data.radius)}</Pill> : null}
        {data.a !== undefined ? <Pill label="a">{formatNumber(data.a)}</Pill> : null}
        {data.b !== undefined ? <Pill label="b">{formatNumber(data.b)}</Pill> : null}
        {data.c !== undefined ? <Pill label="c">{formatNumber(data.c)}</Pill> : null}
      </div>
      <div className="card card-pad">
        <div className="small muted">Ecuación canónica</div>
        <Tex tex={data.canonical} block />
        <p className="small muted" style={{ marginTop: 8 }}>{conicSummary(data)}</p>
        {data.asymptotes.length ? <p className="small">Asíntotas: {data.asymptotes.join("; ")}</p> : null}
        {data.directrix ? <p className="small">Directriz: {data.directrix}</p> : null}
      </div>
      <Graph spec={spec} />
      <div className="card card-pad">
        <Steps steps={data.steps} title="Clasificación y elementos" />
      </div>
    </>
  );
}

export function LabView({ kind, title }: { kind: LabKind; title?: string }) {
  const meta = META[kind];
  const body =
    kind === "function" ? <FunctionLab /> :
    kind === "limit" ? <LimitLab /> :
    kind === "derivative" ? <DerivativeLab /> :
    kind === "integral" ? <IntegralLab /> :
    kind === "matrix" ? <MatrixLab /> :
    <ConicLab />;

  return (
    <section className="card" style={{ overflow: "hidden" }}>
      <div className="graph-head">
        <span aria-hidden="true">🧪</span>
        <span>{title ?? meta.title}</span>
        <span className="badge indigo">interactivo</span>
      </div>
      <p className="small muted" style={{ padding: "12px 20px 0", margin: 0 }}>{meta.description}</p>
      <div style={{ padding: 16 }}>{body}</div>
    </section>
  );
}
