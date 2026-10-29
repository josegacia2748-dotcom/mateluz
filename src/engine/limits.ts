import type { Step, Table } from "./types";
import {
  type Node,
  bin,
  call,
  diff,
  evaluate,
  formatNumber,
  num,
  neg,
  parse,
  simplify,
  toLatex,
  varsOf,
} from "./expr";

export type LimitValue = number | "inf" | "-inf" | null;

export type LimitResult = {
  value: LimitValue;
  exists: boolean;
  /** LaTeX del valor del límite. */
  latex: string;
  /** Conclusión en lenguaje natural. */
  text: string;
  steps: Step[];
  table: Table;
  method: string;
  indeterminate?: string;
};

const EPS = 1e-6;

const fmt = (v: number): string => {
  if (!Number.isFinite(v)) return v > 0 ? "+∞" : "−∞";
  if (Math.abs(v) < 1e-10) return "0";
  return String(Number(v.toPrecision(6)));
};

const valueLatex = (value: LimitValue): string =>
  value === null ? "\\text{no existe}" : value === "inf" ? "+\\infty" : value === "-inf" ? "-\\infty" : formatNumber(value);

const valueText = (value: LimitValue): string =>
  value === null
    ? "El límite no existe."
    : value === "inf"
      ? "El límite tiende a +∞."
      : value === "-inf"
        ? "El límite tiende a −∞."
        : `El límite vale ${fmt(value)}.`;

/* ------------------------------------------------------------------ *
 * Polinomios (coeficientes en orden ascendente)
 * ------------------------------------------------------------------ */

type Coeffs = number[];

function trim(c: Coeffs): Coeffs {
  const out = [...c];
  while (out.length > 1 && Math.abs(out[out.length - 1]) < 1e-12) out.pop();
  return out;
}

export function polyCoeffs(node: Node, variable: string): Coeffs | null {
  switch (node.kind) {
    case "num":
      return [node.value];
    case "const":
      return [node.name === "pi" ? Math.PI : Math.E];
    case "var":
      return node.name === variable ? [0, 1] : null;
    case "neg": {
      const c = polyCoeffs(node.arg, variable);
      return c ? c.map((x) => -x) : null;
    }
    case "call":
      return null;
    case "bin": {
      if (node.op === "+" || node.op === "-") {
        const a = polyCoeffs(node.left, variable);
        const b = polyCoeffs(node.right, variable);
        if (!a || !b) return null;
        const out: Coeffs = [];
        for (let i = 0; i < Math.max(a.length, b.length); i++) {
          out[i] = (a[i] ?? 0) + (node.op === "+" ? 1 : -1) * (b[i] ?? 0);
        }
        return trim(out);
      }
      if (node.op === "*") {
        const a = polyCoeffs(node.left, variable);
        const b = polyCoeffs(node.right, variable);
        if (!a || !b) return null;
        const out: Coeffs = Array.from({ length: a.length + b.length - 1 }, () => 0);
        for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++) out[i + j] += a[i] * b[j];
        return trim(out);
      }
      if (node.op === "/") {
        const a = polyCoeffs(node.left, variable);
        const b = polyCoeffs(node.right, variable);
        if (!a || !b || b.length !== 1 || Math.abs(b[0]) < 1e-12) return null;
        return a.map((x) => x / b[0]);
      }
      if (node.op === "^") {
        const base = polyCoeffs(node.left, variable);
        const exp = polyCoeffs(node.right, variable);
        if (!base || !exp || exp.length !== 1) return null;
        const k = exp[0];
        if (!Number.isInteger(k) || k < 0 || k > 12) return null;
        let out: Coeffs = [1];
        for (let i = 0; i < k; i++) {
          const next: Coeffs = Array.from({ length: out.length + base.length - 1 }, () => 0);
          for (let a = 0; a < out.length; a++) for (let b = 0; b < base.length; b++) next[a + b] += out[a] * base[b];
          out = trim(next);
        }
        return out;
      }
      return null;
    }
  }
}

const polyAt = (c: Coeffs, x: number): number => c.reduce((acc, k, i) => acc + k * Math.pow(x, i), 0);
const degree = (c: Coeffs): number => (c.length === 0 ? -1 : c.length - 1);

function polyToNode(c: Coeffs, variable: string): Node {
  const terms: Node[] = [];
  for (let i = 0; i < c.length; i++) {
    const k = c[i];
    if (Math.abs(k) < 1e-12) continue;
    const coeff = Math.abs(k - 1) < 1e-12 ? null : num(Math.abs(k));
    const power = i === 0 ? null : i === 1 ? { kind: "var", name: variable } as Node : bin("^", { kind: "var", name: variable }, num(i));
    const body: Node = power ? (coeff ? bin("*", coeff, power) : power) : (coeff ?? num(1));
    terms.push(k < 0 ? neg(body) : body);
  }
  if (!terms.length) return num(0);
  return terms.reduce((acc, t) => bin("+", acc, t));
}

function polyToLatex(c: Coeffs, variable: string): string {
  return toLatex(polyToNode(c, variable));
}

/** Divide por (x − a) usando Ruffini. */
function divideByRoot(c: Coeffs, a: number): Coeffs {
  const n = c.length - 1;
  const out = Array.from({ length: n }, () => 0);
  let carry = 0;
  for (let i = n; i >= 1; i--) {
    carry = c[i] + carry * a;
    out[i - 1] = carry;
  }
  return trim(out);
}

/* ------------------------------------------------------------------ *
 * Detección de forma racional y utilidades
 * ------------------------------------------------------------------ */

function splitFraction(node: Node): [Node, Node] | null {
  if (node.kind === "bin" && node.op === "/") return [node.left, node.right];
  return null;
}

function safeEval(node: Node, variable: string, at: number): number {
  return evaluate(node, { [variable]: at });
}

function limitTable(node: Node, variable: string, at: number | "inf" | "-inf"): Table {
  const rows: string[][] = [];
  if (at === "inf" || at === "-inf") {
    const sign = at === "inf" ? 1 : -1;
    for (const mag of [10, 100, 1000, 10000, 100000, 1000000]) {
      const x = sign * mag;
      rows.push([fmt(x), fmt(safeEval(node, variable, x))]);
    }
  } else {
    for (const h of [0.1, 0.01, 0.001, 0.0001, 0.00001]) {
      const left = safeEval(node, variable, at - h);
      const right = safeEval(node, variable, at + h);
      rows.push([fmt(at - h), fmt(left), fmt(at + h), fmt(right)]);
    }
  }
  return at === "inf" || at === "-inf"
    ? { head: [variable, "f(" + variable + ")"], rows }
    : { head: [variable + " (izq.)", "f(x) izq.", variable + " (der.)", "f(x) der."], rows };
}

function isZeroAt(node: Node, variable: string, at: number): boolean {
  const value = safeEval(node, variable, at);
  return Number.isFinite(value) && Math.abs(value) < 1e-9;
}

/* ------------------------------------------------------------------ *
 * Laterales
 * ------------------------------------------------------------------ */

function lateral(node: Node, variable: string, at: number, side: -1 | 1): number {
  let value = NaN;
  for (const h of [1e-3, 1e-5, 1e-7, 1e-9]) {
    const y = safeEval(node, variable, at + side * h);
    if (Number.isFinite(y)) value = y;
  }
  return value;
}

function lateralLimit(
  node: Node,
  variable: string,
  at: number,
  steps: Step[],
): { value: LimitValue; exists: boolean } {
  const left = lateral(node, variable, at, -1);
  const right = lateral(node, variable, at, 1);
  const leftInf = !Number.isFinite(left) || Math.abs(left) > 1e6;
  const rightInf = !Number.isFinite(right) || Math.abs(right) > 1e6;

  steps.push({
    title: "Límites laterales",
    tex: `\\lim_{${variable}\\to ${formatNumber(at)}^{-}} f(${variable}) = ${leftInf ? (left > 0 ? "+\\infty" : "-\\infty") : formatNumber(left)} \\qquad \\lim_{${variable}\\to ${formatNumber(at)}^{+}} f(${variable}) = ${rightInf ? (right > 0 ? "+\\infty" : "-\\infty") : formatNumber(right)}`,
    text: "Al acercarnos por la izquierda y por la derecha obtenemos estos valores.",
    depth: 1,
  });

  if (leftInf && rightInf) {
    const same = Math.sign(left) === Math.sign(right);
    if (same) return { value: left > 0 ? "inf" : "-inf", exists: true };
    steps.push({
      title: "Los laterales no coinciden",
      text: "Un lateral va a +∞ y el otro a −∞, por lo tanto el límite bilateral no existe.",
      depth: 1,
    });
    return { value: null, exists: false };
  }
  if (leftInf !== rightInf) {
    steps.push({
      title: "Los laterales no coinciden",
      text: "Uno de los laterales es infinito y el otro finito; el límite bilateral no existe.",
      depth: 1,
    });
    return { value: null, exists: false };
  }
  if (Math.abs(left - right) < 1e-4) return { value: (left + right) / 2, exists: true };
  steps.push({
    title: "Los laterales no coinciden",
    text: `Izquierda: ${fmt(left)}; derecha: ${fmt(right)}. Como son distintos, el límite no existe.`,
    depth: 1,
  });
  return { value: null, exists: false };
}

/* ------------------------------------------------------------------ *
 * Límite principal
 * ------------------------------------------------------------------ */

export function limit(input: string | Node, variable = "x", at: number | "inf" | "-inf"): LimitResult {
  const node = typeof input === "string" ? parse(input) : input;
  const steps: Step[] = [];
  const table = limitTable(node, variable, at);
  const atTex = at === "inf" ? "+\\infty" : at === "-inf" ? "-\\infty" : formatNumber(at);
  const limTex = `\\lim_{${variable}\\to ${atTex}}`;

  steps.push({
    title: "Planteamos el límite",
    tex: `${limTex} ${toLatex(node)}`,
    text:
      at === "inf" || at === "-inf"
        ? "Estudiamos el comportamiento cuando la variable crece sin cota."
        : "Primero intentamos sustituir el valor en la expresión.",
    depth: 0,
  });

  /* ---------- Infinito ---------- */
  if (at === "inf" || at === "-inf") {
    const sign = at === "inf" ? 1 : -1;
    const frac = splitFraction(node);
    if (frac) {
      const [n, d] = frac;
      const pn = polyCoeffs(n, variable);
      const pd = polyCoeffs(d, variable);
      if (pn && pd) {
        const dn = degree(pn);
        const dd = degree(pd);
        steps.push({
          title: "Comparamos grados",
          tex: `\\text{grado del numerador} = ${dn}, \\quad \\text{grado del denominador} = ${dd}`,
          text: "En un cociente de polinomios, el comportamiento en el infinito depende de los grados.",
          depth: 1,
        });
        let value: LimitValue;
        let method = "grados";
        if (dn < dd) {
          value = 0;
          steps.push({
            title: "Numerador de menor grado",
            tex: `${limTex} \\frac{${polyToLatex(pn, variable)}}{${polyToLatex(pd, variable)}} = 0`,
            text: "El denominador crece más rápido; el cociente tiende a 0.",
            depth: 1,
          });
        } else if (dn === dd) {
          const ratio = pn[dn] / pd[dd];
          value = ratio;
          steps.push({
            title: "Grados iguales",
            tex: `${limTex} \\frac{${polyToLatex(pn, variable)}}{${polyToLatex(pd, variable)}} = \\frac{${formatNumber(pn[dn])}}{${formatNumber(pd[dd])}} = ${formatNumber(ratio)}`,
            text: "El límite es el cociente de los coeficientes principales.",
            depth: 1,
          });
        } else {
          const ratio = pn[dn] / pd[dd];
          const positive = sign > 0 ? ratio > 0 : (dn - dd) % 2 === 0 ? ratio > 0 : ratio < 0;
          value = positive ? "inf" : "-inf";
          steps.push({
            title: "Numerador de mayor grado",
            tex: `${limTex} \\frac{${polyToLatex(pn, variable)}}{${polyToLatex(pd, variable)}} = ${positive ? "+\\infty" : "-\\infty"}`,
            text: "El numerador domina; el cociente crece sin cota.",
            depth: 1,
          });
        }
        return finish(node, variable, at, value, steps, table, method);
      }
    }

    // Exploración numérica
    const guess = numericLimit(node, variable, at);
    if (guess !== undefined) {
      steps.push({
        title: "Exploración numérica",
        tex: `${limTex} ${toLatex(node)} \\approx ${valueLatex(guess)}`,
        text: "Al evaluar valores cada vez más grandes la expresión se estabiliza en este valor.",
        depth: 1,
      });
      return finish(node, variable, at, guess, steps, table, "numérico");
    }
    steps.push({
      title: "Sin estabilización",
      text: "La expresión no se estabiliza numéricamente; el límite no existe o requiere otro análisis.",
      depth: 1,
    });
    return finish(node, variable, at, null, steps, table, "numérico");
  }

  /* ---------- Punto finito ---------- */
  const direct = safeEval(node, variable, at);
  if (Number.isFinite(direct)) {
    steps.push({
      title: "Sustitución directa",
      tex: `${limTex} ${toLatex(node)} = ${formatNumber(direct)}`,
      text: `La función está definida en ${variable} = ${formatNumber(at)}, así que el límite es el valor de la función.`,
      depth: 1,
    });
    return finish(node, variable, at, direct, steps, table, "sustitución");
  }

  const frac = splitFraction(node);
  if (frac) {
    const [n, d] = frac;
    const nv = safeEval(n, variable, at);
    const dv = safeEval(d, variable, at);

    if (Math.abs(dv) < 1e-12 && Math.abs(nv) > 1e-9) {
      steps.push({
        title: "Forma k/0",
        tex: `\\frac{${formatNumber(nv)}}{0}`,
        text: "El numerador no se anula y el denominador sí: aparece una asíntota vertical. Analizamos los laterales.",
        depth: 1,
      });
      const lat = lateralLimit(node, variable, at, steps);
      return finish(node, variable, at, lat.value, steps, table, "laterales");
    }

    if (Math.abs(dv) < 1e-12 && Math.abs(nv) < 1e-9) {
      steps.push({
        title: "Indeterminación 0/0",
        tex: `${limTex} \\frac{${toLatex(n)}}{${toLatex(d)}} = \\frac{0}{0}`,
        text: "Numerador y denominador se anulan. Hay que transformar la expresión.",
        depth: 1,
      });

      const pn = polyCoeffs(n, variable);
      const pd = polyCoeffs(d, variable);
      if (pn && pd) {
        let cn = pn;
        let cd = pd;
        let k = 0;
        while (Math.abs(polyAt(cd, at)) < 1e-9 && Math.abs(polyAt(cn, at)) < 1e-9 && k < 8) {
          cn = divideByRoot(cn, at);
          cd = divideByRoot(cd, at);
          k++;
        }
        steps.push({
          title: "Factorizamos y cancelamos",
          tex: `\\frac{${polyToLatex(pn, variable)}}{${polyToLatex(pd, variable)}} = \\frac{(${variable} - ${formatNumber(at)})^{${k}}\\left(${polyToLatex(cn, variable)}\\right)}{(${variable} - ${formatNumber(at)})^{${k}}\\left(${polyToLatex(cd, variable)}\\right)}`,
          text: `El factor (${variable} − ${formatNumber(at)}) aparece ${k} ${k === 1 ? "vez" : "veces"} en ambos.`,
          depth: 1,
        });
        const reduced: Node = bin("/", polyToNode(cn, variable), polyToNode(cd, variable));
        steps.push({
          title: "Expresión simplificada",
          tex: `${limTex} \\frac{${polyToLatex(cn, variable)}}{${polyToLatex(cd, variable)}}`,
          text: "Cancelado el factor común, la indeterminación desaparece.",
          depth: 1,
        });
        const reducedValue = safeEval(reduced, variable, at);
        if (Number.isFinite(reducedValue)) {
          steps.push({
            title: "Sustituimos de nuevo",
            tex: `= ${formatNumber(reducedValue)}`,
            depth: 1,
          });
          return finish(node, variable, at, reducedValue, steps, table, "factorización");
        }
      }

      // L'Hôpital
      let cn: Node = n;
      let cd: Node = d;
      for (let i = 0; i < 4; i++) {
        steps.push({
          title: "Regla de L'Hôpital",
          tex: `\\lim \\frac{f}{g} = \\lim \\frac{f'}{g'}`,
          text: "Como la forma es 0/0, derivamos numerador y denominador por separado.",
          depth: 1,
        });
        cn = simplify(diff(cn, variable));
        cd = simplify(diff(cd, variable));
        steps.push({
          title: `Derivadas (iteración ${i + 1})`,
          tex: `${limTex} \\frac{${toLatex(cn)}}{${toLatex(cd)}}`,
          depth: 1,
        });
        const nv2 = safeEval(cn, variable, at);
        const dv2 = safeEval(cd, variable, at);
        if (Number.isFinite(nv2) && Number.isFinite(dv2) && Math.abs(dv2) > 1e-12) {
          const value = nv2 / dv2;
          steps.push({
            title: "Evaluamos",
            tex: `= \\frac{${formatNumber(nv2)}}{${formatNumber(dv2)}} = ${formatNumber(value)}`,
            depth: 1,
          });
          return finish(node, variable, at, value, steps, table, "L'Hôpital");
        }
        if (Math.abs(dv2) < 1e-12 && Math.abs(nv2) > 1e-9) {
          const lat = lateralLimit(bin("/", cn, cd), variable, at, steps);
          return finish(node, variable, at, lat.value, steps, table, "L'Hôpital + laterales");
        }
      }
    }
  }

  // 0·∞, ∞−∞ u otras: exploración numérica
  const guess = numericLimit(node, variable, at);
  if (guess !== undefined) {
    steps.push({
      title: "Exploración numérica",
      tex: `${limTex} ${toLatex(node)} \\approx ${valueLatex(guess)}`,
      text: "Evaluamos a ambos lados del punto para estimar el comportamiento.",
      depth: 1,
    });
    return finish(node, variable, at, guess, steps, table, "numérico");
  }

  const lat = lateralLimit(node, variable, at, steps);
  return finish(node, variable, at, lat.value, steps, table, lat.exists ? "laterales" : "sin límite");
}

function numericLimit(node: Node, variable: string, at: number | "inf" | "-inf"): LimitValue | undefined {
  let samples: number[];
  if (at === "inf" || at === "-inf") {
    const sign = at === "inf" ? 1 : -1;
    samples = [1e2, 1e3, 1e4, 1e5, 1e6, 1e7].map((m) => safeEval(node, variable, sign * m));
  } else {
    samples = [1e-2, 1e-3, 1e-4, 1e-5, 1e-6].flatMap((h) => [
      safeEval(node, variable, at - h),
      safeEval(node, variable, at + h),
    ]);
  }
  const finite = samples.filter((x) => Number.isFinite(x));
  if (finite.length < 4) {
    if (finite.length >= 2) {
      const last = finite[finite.length - 1];
      if (Math.abs(last) > 1e6) return last > 0 ? "inf" : "-inf";
    }
    return undefined;
  }
  const tail = finite.slice(-4);
  const mean = tail.reduce((a, b) => a + b, 0) / tail.length;
  const spread = Math.max(...tail) - Math.min(...tail);
  const scale = Math.max(1, Math.abs(mean));
  if (spread / scale < 5e-3) return Number(mean.toPrecision(6));
  if (Math.abs(tail[tail.length - 1]) > 1e6) return tail[tail.length - 1] > 0 ? "inf" : "-inf";
  return undefined;
}

function finish(
  node: Node,
  variable: string,
  at: number | "inf" | "-inf",
  value: LimitValue,
  steps: Step[],
  table: Table,
  method: string,
): LimitResult {
  const atTex = at === "inf" ? "+\\infty" : at === "-inf" ? "-\\infty" : formatNumber(at);
  const limTex = `\\lim_{${variable}\\to ${atTex}}`;
  steps.push({
    title: "Conclusión",
    tex: `${limTex} ${toLatex(node)} = ${valueLatex(value)}`,
    text: valueText(value),
    depth: 0,
  });
  return {
    value,
    exists: value !== null,
    latex: valueLatex(value),
    text: valueText(value),
    steps,
    table,
    method,
  };
}

/** Límite numérico rápido (para gráficas y análisis). */
export function numericLimitValue(node: Node, variable: string, at: number): number {
  return safeEval(node, variable, at);
}

export { valueLatex };
