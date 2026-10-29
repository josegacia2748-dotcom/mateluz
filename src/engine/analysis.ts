import type { Step } from "./types";
import {
  type Node,
  bin,
  diff,
  evaluate,
  formatNumber,
  num,
  parse,
  toLatex,
} from "./expr";
import { polyCoeffs } from "./limits";

export type Interval = { from: number; to: number };

export type AnalysisResult = {
  domain: { text: string; latex: string; intervals: Interval[]; excluded: number[] };
  range: { text: string; min: number | null; max: number | null };
  asymptotes: { vertical: number[]; horizontal: string[]; oblique: string[] };
  zeros: number[];
  yIntercept: number | null;
  parity: "par" | "impar" | "ninguna";
  monotonic: { from: number; to: number; trend: "creciente" | "decreciente" }[];
  extrema: { x: number; y: number; type: "máximo" | "mínimo" }[];
  steps: Step[];
};

const fmt = (x: number) => formatNumber(Number(x.toFixed(6)));
const XMIN = -20;
const XMAX = 20;
const N = 4000;

const finite = (v: number) => Number.isFinite(v);

function sample(node: Node, a: number, b: number, n: number): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n;
    out.push({ x, y: evaluate(node, { x }) });
  }
  return out;
}

function domainIntervals(node: Node): { intervals: Interval[]; excluded: number[] } {
  const pts = sample(node, XMIN, XMAX, N);
  const intervals: Interval[] = [];
  const excluded: number[] = [];
  let start: number | null = null;
  let lastFinite: number | null = null;

  for (const p of pts) {
    if (finite(p.y)) {
      if (start === null) start = p.x;
      lastFinite = p.x;
    } else {
      if (start !== null && lastFinite !== null) {
        intervals.push({ from: start, to: lastFinite });
        start = null;
      }
      if (!excluded.length || Math.abs(excluded[excluded.length - 1] - p.x) > 0.05) excluded.push(p.x);
    }
  }
  if (start !== null && lastFinite !== null) intervals.push({ from: start, to: lastFinite });

  // Extiende los extremos si la función sigue definida
  if (intervals.length) {
    const first = intervals[0];
    const last = intervals[intervals.length - 1];
    if (finite(evaluate(node, { x: XMIN - 50 }))) first.from = -Infinity;
    if (finite(evaluate(node, { x: XMAX + 50 }))) last.to = Infinity;
  }

  // Ajusta los bordes numéricos al punto exacto de discontinuidad
  for (const iv of intervals) {
    for (const ex of excluded) {
      if (Math.abs(iv.from - ex) < 0.1) iv.from = ex;
      if (Math.abs(iv.to - ex) < 0.1) iv.to = ex;
    }
  }
  return { intervals, excluded };
}

function converge(values: number[]): number | null {
  const ok = values.filter(finite);
  if (ok.length < 3) return null;
  const tail = ok.slice(-3);
  const spread = Math.max(...tail) - Math.min(...tail);
  const mean = tail.reduce((a, b) => a + b, 0) / tail.length;
  const maxAbs = Math.max(...tail.map(Math.abs));
  if (maxAbs < 1e-3) return 0;
  if (spread < 1e-3) return Number(mean.toPrecision(6));
  if (spread / Math.max(1, Math.abs(tail[2])) < 5e-3) return Number(tail[2].toPrecision(6));
  return null;
}

function infinityBehavior(node: Node, sign: 1 | -1): { kind: "horizontal" | "oblique" | "none"; m?: number; b?: number } {
  const xs = [1e2, 1e3, 1e4, 1e5, 1e6].map((v) => sign * v);
  const ys = xs.map((x) => evaluate(node, { x }));
  const h = converge(ys);
  if (h !== null) return { kind: "horizontal", b: h };
  const slopes = xs.map((x, i) => ys[i] / x);
  const m = converge(slopes);
  if (m !== null && Math.abs(m) > 1e-6) {
    const intercepts = xs.map((x, i) => ys[i] - m * x);
    const b = converge(intercepts);
    if (b !== null) return { kind: "oblique", m, b };
  }
  return { kind: "none" };
}

function bisect(node: Node, a: number, b: number): number | null {
  let fa = evaluate(node, { x: a });
  let fb = evaluate(node, { x: b });
  if (!finite(fa) || !finite(fb) || fa * fb > 0) return null;
  for (let i = 0; i < 80; i++) {
    const mid = (a + b) / 2;
    const fm = evaluate(node, { x: mid });
    if (!finite(fm)) return null;
    if (Math.abs(fm) < 1e-12) return mid;
    if (fa * fm < 0) {
      b = mid;
      fb = fm;
    } else {
      a = mid;
      fa = fm;
    }
  }
  return (a + b) / 2;
}

function findZeros(node: Node): number[] {
  const pts = sample(node, XMIN, XMAX, N);
  const zeros: number[] = [];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    if (!finite(a.y) || !finite(b.y)) continue;
    if (Math.abs(a.y) < 1e-10) {
      if (!zeros.some((z) => Math.abs(z - a.x) < 1e-4)) zeros.push(a.x);
      continue;
    }
    if (a.y * b.y < 0) {
      const root = bisect(node, a.x, b.x);
      if (root !== null && !zeros.some((z) => Math.abs(z - root) < 1e-4)) zeros.push(root);
    }
  }
  return zeros.sort((p, q) => p - q);
}

function parityOf(node: Node): "par" | "impar" | "ninguna" {
  let par = true;
  let impar = true;
  let tested = 0;
  for (const x of [0.37, 0.81, 1.23, 2.17, 3.11, 4.07]) {
    const a = evaluate(node, { x });
    const b = evaluate(node, { x: -x });
    if (!finite(a) || !finite(b)) continue;
    tested++;
    if (Math.abs(a - b) > 1e-6) par = false;
    if (Math.abs(a + b) > 1e-6) impar = false;
  }
  if (!tested) return "ninguna";
  if (par) return "par";
  if (impar) return "impar";
  return "ninguna";
}

function analyzeGrowth(node: Node): { monotonic: AnalysisResult["monotonic"]; extrema: AnalysisResult["extrema"] } {
  const d = diff(node, "x");
  const pts = sample(d, XMIN, XMAX, 1600);
  const monotonic: AnalysisResult["monotonic"] = [];
  const extrema: AnalysisResult["extrema"] = [];

  let current: "creciente" | "decreciente" | null = null;
  let start = XMIN;

  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (!finite(p.y)) continue;
    const trend = p.y > 1e-7 ? "creciente" : p.y < -1e-7 ? "decreciente" : null;
    if (trend !== current) {
      if (current && p.x - start > 0.2) monotonic.push({ from: start, to: p.x, trend: current });
      start = p.x;
      current = trend;
    }
    if (i > 0 && finite(pts[i - 1].y) && Math.sign(pts[i - 1].y) !== Math.sign(p.y) && Math.abs(p.x) < XMAX - 0.1) {
      const root = bisect(d, pts[i - 1].x, p.x);
      if (root !== null && !extrema.some((e) => Math.abs(e.x - root) < 1e-3)) {
        const y = evaluate(node, { x: root });
        if (!finite(y)) continue;
        const second = evaluate(diff(d, "x"), { x: root });
        const type: "máximo" | "mínimo" = second < 0 ? "máximo" : second > 0 ? "mínimo" : p.y < 0 ? "mínimo" : "máximo";
        extrema.push({ x: root, y, type });
      }
    }
  }
  if (current && XMAX - start > 0.2) monotonic.push({ from: start, to: XMAX, trend: current });
  return { monotonic, extrema };
}

export function analyzeFunction(input: string | Node, variable = "x"): AnalysisResult {
  const node = typeof input === "string" ? parse(input) : input;
  const steps: Step[] = [];
  steps.push({
    title: "Función a analizar",
    tex: `f(${variable}) = ${toLatex(node)}`,
    text: "Estudiaremos dominio, rango, asíntotas, cortes, simetría y crecimiento.",
    depth: 0,
  });

  const { intervals, excluded } = domainIntervals(node);
  const domainText = intervals.length
    ? intervals
        .map((i) => `(${i.from === -Infinity ? "−∞" : fmt(i.from)}, ${i.to === Infinity ? "+∞" : fmt(i.to)})`)
        .join(" ∪ ")
    : "∅";
  steps.push({
    title: "Dominio",
    tex: `\\text{Dom}(f) = ${domainText.replace(/−∞/g, "-\\infty").replace(/\+∞/g, "+\\infty")}`,
    text:
      excluded.length > 0
        ? `La función no está definida cerca de ${excluded.map((x) => fmt(x)).join(", ")}.`
        : "La función está definida en todos los puntos analizados.",
    depth: 1,
  });

  // Asíntotas verticales
  const vertical: number[] = [];
  for (const x of excluded) {
    const left = evaluate(node, { x: x - 1e-7 });
    const right = evaluate(node, { x: x + 1e-7 });
    if (Math.abs(left) > 1e4 || Math.abs(right) > 1e4) {
      if (!vertical.some((v) => Math.abs(v - x) < 0.05)) vertical.push(x);
    }
  }
  // Polos racionales exactos
  if (node.kind === "bin" && node.op === "/") {
    const pd = polyCoeffs(node.right, variable);
    if (pd && pd.length > 1) {
      for (const x of realRoots(pd)) {
        if (!vertical.some((v) => Math.abs(v - x) < 1e-6)) vertical.push(x);
      }
    }
  }

  const plus = infinityBehavior(node, 1);
  const minus = infinityBehavior(node, -1);
  const horizontal: string[] = [];
  const oblique: string[] = [];
  if (plus.kind === "horizontal") horizontal.push(`y = ${fmt(plus.b!)} \\;(x \\to +\\infty)`);
  if (minus.kind === "horizontal") horizontal.push(`y = ${fmt(minus.b!)} \\;(x \\to -\\infty)`);
  if (plus.kind === "oblique") oblique.push(`y = ${fmt(plus.m!)}x ${plus.b! >= 0 ? "+" : "-"} ${fmt(Math.abs(plus.b!))} \\;(x \\to +\\infty)`);
  if (minus.kind === "oblique") oblique.push(`y = ${fmt(minus.m!)}x ${minus.b! >= 0 ? "+" : "-"} ${fmt(Math.abs(minus.b!))} \\;(x \\to -\\infty)`);

  steps.push({
    title: "Asíntotas",
    tex: [
      vertical.length ? `\\text{Verticales: } ${vertical.map((x) => `${variable} = ${fmt(x)}`).join(", ")}` : "\\text{Sin asíntotas verticales}",
      horizontal.length ? `\\text{Horizontales: } ${horizontal.join(", ")}` : "",
      oblique.length ? `\\text{Oblicuas: } ${oblique.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join(" \\\\ "),
    text: "Las verticales aparecen donde la función explota; las horizontales/oblicuas describen el comportamiento en el infinito.",
    depth: 1,
  });

  const zeros = findZeros(node);
  const yInterceptRaw = evaluate(node, { x: 0 });
  const yIntercept = finite(yInterceptRaw) ? yInterceptRaw : null;
  steps.push({
    title: "Cortes con los ejes",
    tex: [
      zeros.length ? `\\text{Cortes en } x: ${zeros.map((z) => fmt(z)).join(", ")}` : "\\text{Sin cortes reales en el eje } x",
      yIntercept !== null ? `\\text{Corte en } y: (0, ${fmt(yIntercept)})` : "\\text{Sin corte con el eje } y",
    ].join(" \\\\ "),
    text: "Los ceros se obtienen resolviendo f(x) = 0; el corte con y es f(0).",
    depth: 1,
  });

  const parity = parityOf(node);
  steps.push({
    title: "Simetría",
    tex:
      parity === "par"
        ? `f(-x) = f(x) \\;\\Rightarrow\\; \\text{función par (simetría respecto al eje } y\\text{)}`
        : parity === "impar"
          ? `f(-x) = -f(x) \\;\\Rightarrow\\; \\text{función impar (simetría respecto al origen)}`
          : "f(-x) \\neq \\pm f(x) \\;\\Rightarrow\\; \\text{sin simetría par ni impar}",
    depth: 1,
  });

  const { monotonic, extrema } = analyzeGrowth(node);
  steps.push({
    title: "Crecimiento y extremos",
    tex:
      monotonic.length > 0
        ? monotonic
            .map((m) => `${m.trend === "creciente" ? "\\nearrow" : "\\searrow"} \\; (${fmt(m.from)}, ${fmt(m.to)})`)
            .join(" \\quad ")
        : "\\text{Sin intervalos detectados}",
    text: extrema.length
      ? `Extremos locales: ${extrema.map((e) => `${e.type} en x = ${fmt(e.x)}`).join(", ")}.`
      : "No se detectaron extremos locales en el intervalo analizado.",
    depth: 1,
  });

  // Rango numérico
  const pts = sample(node, XMIN, XMAX, N).filter((p) => finite(p.y));
  let min: number | null = null;
  let max: number | null = null;
  for (const p of pts) {
    if (min === null || p.y < min) min = p.y;
    if (max === null || p.y > max) max = p.y;
  }
  if (horizontal.length) {
    for (const h of horizontal) {
      const value = Number(h.replace(/[^0-9.\-]/g, ""));
      if (Number.isFinite(value)) {
        if (min === null || value < min) min = value;
        if (max === null || value > max) max = value;
      }
    }
  }
  steps.push({
    title: "Rango (estimado)",
    tex: `\\text{Rango} \\approx \\left[${min === null ? "-\\infty" : fmt(min)},\\ ${max === null ? "+\\infty" : fmt(max)}\\right]`,
    text: "El rango se estima con un barrido numérico y las asíntotas horizontales.",
    depth: 1,
  });

  return {
    domain: { text: domainText, latex: domainText, intervals, excluded },
    range: { text: `[${min ?? "-∞"}, ${max ?? "+∞"}]`, min, max },
    asymptotes: { vertical, horizontal, oblique },
    zeros,
    yIntercept,
    parity,
    monotonic,
    extrema,
    steps,
  };
}

function realRoots(c: number[]): number[] {
  if (c.length === 2) {
    if (Math.abs(c[1]) < 1e-12) return [];
    return [-c[0] / c[1]];
  }
  if (c.length === 3) {
    const [a, b, k] = c;
    const disc = b * b - 4 * k * a;
    if (disc < -1e-12) return [];
    if (Math.abs(disc) < 1e-12) return [-b / (2 * k)];
    return [(-b + Math.sqrt(disc)) / (2 * k), (-b - Math.sqrt(disc)) / (2 * k)];
  }
  // Barrido numérico para grados altos
  const f = (x: number) => c.reduce((acc, v, i) => acc + v * Math.pow(x, i), 0);
  const roots: number[] = [];
  for (let x = -20; x < 20; x += 0.01) {
    if (f(x) * f(x + 0.01) <= 0) {
      let a = x;
      let b = x + 0.01;
      for (let i = 0; i < 60; i++) {
        const m = (a + b) / 2;
        if (f(a) * f(m) <= 0) b = m;
        else a = m;
      }
      const r = (a + b) / 2;
      if (!roots.some((z) => Math.abs(z - r) < 1e-3)) roots.push(r);
    }
  }
  return roots;
}

/** Puntos para graficar, cortando saltos. */
export function graphPoints(node: Node, xmin: number, xmax: number, n = 600): { x: number; y: number }[][] {
  const out: { x: number; y: number }[][] = [];
  let current: { x: number; y: number }[] = [];
  let prev: number | null = null;
  for (let i = 0; i <= n; i++) {
    const x = xmin + ((xmax - xmin) * i) / n;
    const y = evaluate(node, { x });
    if (!Number.isFinite(y) || Math.abs(y) > 1e6) {
      if (current.length > 1) out.push(current);
      current = [];
      prev = null;
      continue;
    }
    if (prev !== null && Math.abs(y - prev) > 1e4) {
      if (current.length > 1) out.push(current);
      current = [];
    }
    current.push({ x, y });
    prev = y;
  }
  if (current.length > 1) out.push(current);
  return out;
}

export { num, bin };
