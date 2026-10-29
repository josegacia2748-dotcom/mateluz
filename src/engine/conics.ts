import type { Step } from "./types";
import { formatNumber } from "./expr";

export type ConicCoeffs = { A: number; B: number; C: number; D: number; E: number; F: number };

export type ConicKind =
  | "circunferencia"
  | "elipse"
  | "parábola"
  | "hipérbola"
  | "punto"
  | "recta"
  | "dos rectas"
  | "vacío";

export type Point = { x: number; y: number };

export type ConicResult = {
  kind: ConicKind;
  coeffs: ConicCoeffs;
  discriminant: number;
  angle: number;
  center: Point;
  a?: number;
  b?: number;
  c?: number;
  p?: number;
  radius?: number;
  foci: Point[];
  canonical: string;
  steps: Step[];
  /** Orientación del eje focal: 0 = x', 1 = y'. */
  axis: 0 | 1;
  asymptotes: string[];
  directrix?: string;
  degenerate: boolean;
};

const EPS = 1e-9;
const fmt = (x: number) => formatNumber(Number(x.toFixed(6)));

/* ------------------------------------------------------------------ *
 * Lectura de la ecuación
 * ------------------------------------------------------------------ */

export function parseConic(input: string): ConicCoeffs {
  const clean = input
    .toLowerCase()
    .replace(/−/g, "-")
    .replace(/²/g, "^2")
    .replace(/\s+/g, "")
    .replace(/\*/g, "");
  const [lhs, rhs = "0"] = clean.split("=");
  const coeffs: ConicCoeffs = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };

  const addSide = (side: string, mult: number) => {
    if (!side) return;
    const terms = side.match(/[+-]?[^+-]+/g) ?? [];
    for (const raw of terms) {
      let term = raw;
      let s = 1;
      if (term.startsWith("+")) term = term.slice(1);
      else if (term.startsWith("-")) {
        s = -1;
        term = term.slice(1);
      }
      if (!term) continue;
      const m = term.match(/^(\d+(?:\.\d+)?(?:\/\d+)?)?(.*)$/);
      if (!m) throw new Error(`Término no reconocido: «${raw}»`);
      const coefText = m[1];
      const body = m[2];
      let coef = coefText ? (coefText.includes("/") ? Number(coefText.split("/")[0]) / Number(coefText.split("/")[1]) : Number(coefText)) : 1;
      if (!Number.isFinite(coef)) throw new Error(`Coeficiente no válido: «${coefText}»`);
      coef *= s * mult;
      if (body === "x^2") coeffs.A += coef;
      else if (body === "y^2") coeffs.C += coef;
      else if (body === "xy") coeffs.B += coef;
      else if (body === "x") coeffs.D += coef;
      else if (body === "y") coeffs.E += coef;
      else if (body === "") coeffs.F += coef;
      else throw new Error(`Término no reconocido: «${raw}»`);
    }
  };

  addSide(lhs, 1);
  addSide(rhs, -1);
  return coeffs;
}

/* ------------------------------------------------------------------ *
 * Análisis
 * ------------------------------------------------------------------ */

export function analyzeConic(input: string | ConicCoeffs): ConicResult {
  const k: ConicCoeffs = typeof input === "string" ? parseConic(input) : { ...input };
  const { A, B, C, D, E, F } = k;
  const steps: Step[] = [];
  const discriminant = B * B - 4 * A * C;

  steps.push({
    title: "Ecuación general de segundo grado",
    tex: `${fmt(A)}x^{2} ${B >= 0 ? "+" : "-"} ${fmt(Math.abs(B))}xy ${C >= 0 ? "+" : "-"} ${fmt(Math.abs(C))}y^{2} ${D >= 0 ? "+" : "-"} ${fmt(Math.abs(D))}x ${E >= 0 ? "+" : "-"} ${fmt(Math.abs(E))}y ${F >= 0 ? "+" : "-"} ${fmt(Math.abs(F))} = 0`,
    text: "Identificamos los seis coeficientes A, B, C, D, E y F.",
    depth: 0,
  });

  steps.push({
    title: "Discriminante",
    tex: `\\Delta = B^{2} - 4AC = (${fmt(B)})^{2} - 4(${fmt(A)})(${fmt(C)}) = ${fmt(discriminant)}`,
    text:
      discriminant < -EPS
        ? "Δ < 0: la cónica es una elipse (o una circunferencia)."
        : discriminant > EPS
          ? "Δ > 0: la cónica es una hipérbola."
          : "Δ = 0: la cónica es una parábola (o un caso degenerado).",
    depth: 1,
  });

  // Rotación
  let theta = 0;
  if (Math.abs(B) > EPS) {
    theta = 0.5 * Math.atan2(B, A - C);
    steps.push({
      title: "Rotación de ejes",
      tex: `\\tan(2\\theta) = \\frac{B}{A-C} = \\frac{${fmt(B)}}{${fmt(A - C)}} \\;\\Rightarrow\\; \\theta = ${fmt((theta * 180) / Math.PI)}^{\\circ}`,
      text: "Giramos los ejes para eliminar el término xy.",
      depth: 1,
    });
  }

  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const Ap = A * cos * cos + B * sin * cos + C * sin * sin;
  const Cp = A * sin * sin - B * sin * cos + C * cos * cos;
  const Dp = D * cos + E * sin;
  const Ep = -D * sin + E * cos;
  const Fp = F;

  if (Math.abs(B) > EPS) {
    steps.push({
      title: "Ecuación sin término xy",
      tex: `${fmt(Ap)}x'^{2} + ${fmt(Cp)}y'^{2} + ${fmt(Dp)}x' + ${fmt(Ep)}y' + ${fmt(Fp)} = 0`,
      text: "Al sustituir x = x'cosθ − y'senθ, y = x'senθ + y'cosθ el término cruzado se anula.",
      depth: 1,
    });
  }

  const result = classify(Ap, Cp, Dp, Ep, Fp, theta, steps);
  return {
    ...result,
    coeffs: k,
    discriminant,
    angle: theta,
    steps: [...steps, ...result.steps],
  };
}

type Core = Omit<ConicResult, "coeffs" | "discriminant" | "angle" | "steps"> & { steps: Step[] };

function classify(
  A: number,
  C: number,
  D: number,
  E: number,
  F: number,
  theta: number,
  outer: Step[],
): Core {
  const steps: Step[] = [];
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const toOriginal = (xp: number, yp: number): Point => ({
    x: xp * cos - yp * sin,
    y: xp * sin + yp * cos,
  });

  const base: Core = {
    kind: "vacío",
    center: { x: 0, y: 0 },
    foci: [],
    canonical: "",
    steps,
    axis: 0,
    asymptotes: [],
    degenerate: false,
  };

  /* ---------------- Elipse / circunferencia ---------------- */
  if (Math.abs(A) > EPS && Math.abs(C) > EPS) {
    const hp = -D / (2 * A);
    const kp = -E / (2 * C);
    const R = -F + (D * D) / (4 * A) + (E * E) / (4 * C);
    const center = toOriginal(hp, kp);

    steps.push({
      title: "Completamos cuadrados",
      tex: `${fmt(A)}\\left(x' ${hp >= 0 ? "-" : "+"} ${fmt(Math.abs(hp))}\\right)^{2} + ${fmt(C)}\\left(y' ${kp >= 0 ? "-" : "+"} ${fmt(Math.abs(kp))}\\right)^{2} = ${fmt(R)}`,
      text: "Agrupamos los términos cuadráticos y lineales para formar binomios al cuadrado.",
      depth: 1,
    });

    if (Math.abs(R) < 1e-7) {
      steps.push({
        title: "Caso degenerado",
        tex: `\\text{El radio se anula}`,
        text: "La ecuación se reduce a un solo punto.",
        depth: 1,
      });
      return { ...base, kind: "punto", center, canonical: `(x', y') = (${fmt(hp)}, ${fmt(kp)})`, degenerate: true };
    }

    const ra2 = R / A;
    const rb2 = R / C;
    if (ra2 < 0 && rb2 < 0) {
      steps.push({ title: "Sin puntos reales", text: "La suma de cuadrados no puede ser negativa: el conjunto solución es vacío.", depth: 1 });
      return { ...base, kind: "vacío", center, canonical: "\\varnothing", degenerate: true };
    }

    if (ra2 > 0 && rb2 > 0) {
      const isCircle = Math.abs(A - C) < 1e-7 && Math.abs(theta) < 1e-9;
      if (isCircle) {
        const r = Math.sqrt(ra2);
        steps.push({
          title: "Circunferencia",
          tex: `(x - ${fmt(center.x)})^{2} + (y - ${fmt(center.y)})^{2} = ${fmt(r)}^{2}`,
          text: `Centro (${fmt(center.x)}, ${fmt(center.y)}) y radio ${fmt(r)}.`,
          depth: 1,
        });
        return {
          ...base,
          kind: "circunferencia",
          center,
          radius: r,
          a: r,
          b: r,
          canonical: `(x - ${fmt(center.x)})^{2} + (y - ${fmt(center.y)})^{2} = ${fmt(r)}^{2}`,
        };
      }
      const axis: 0 | 1 = ra2 >= rb2 ? 0 : 1;
      const a2 = axis === 0 ? ra2 : rb2;
      const b2 = axis === 0 ? rb2 : ra2;
      const a = Math.sqrt(a2);
      const b = Math.sqrt(b2);
      const c = Math.sqrt(Math.max(0, a2 - b2));
      const dir = axis === 0 ? { x: cos, y: sin } : { x: -sin, y: cos };
      const foci = [
        { x: center.x + c * dir.x, y: center.y + c * dir.y },
        { x: center.x - c * dir.x, y: center.y - c * dir.y },
      ];
      steps.push({
        title: "Elipse",
        tex: `\\frac{(x' - ${fmt(hp)})^{2}}{${fmt(a2)}} + \\frac{(y' - ${fmt(kp)})^{2}}{${fmt(b2)}} = 1`,
        text: `Semieje mayor a = ${fmt(a)}, semieje menor b = ${fmt(b)}, distancia focal c = ${fmt(c)}.`,
        depth: 1,
      });
      return {
        ...base,
        kind: "elipse",
        center,
        a,
        b,
        c,
        foci,
        axis,
        canonical: `\\frac{(x' - ${fmt(hp)})^{2}}{${fmt(a2)}} + \\frac{(y' - ${fmt(kp)})^{2}}{${fmt(b2)}} = 1`,
      };
    }

    // Hipérbola
    const axis: 0 | 1 = ra2 > 0 ? 0 : 1;
    const a2 = axis === 0 ? ra2 : rb2;
    const b2 = axis === 0 ? -rb2 : -ra2;
    const a = Math.sqrt(Math.abs(a2));
    const b = Math.sqrt(Math.abs(b2));
    const c = Math.sqrt(a2 + b2);
    const dir = axis === 0 ? { x: cos, y: sin } : { x: -sin, y: cos };
    const foci = [
      { x: center.x + c * dir.x, y: center.y + c * dir.y },
      { x: center.x - c * dir.x, y: center.y - c * dir.y },
    ];
    const slope1 = axis === 0 ? b / a : a / b;
    steps.push({
      title: "Hipérbola",
      tex:
        axis === 0
          ? `\\frac{(x' - ${fmt(hp)})^{2}}{${fmt(a)}^{2}} - \\frac{(y' - ${fmt(kp)})^{2}}{${fmt(b)}^{2}} = 1`
          : `\\frac{(y' - ${fmt(kp)})^{2}}{${fmt(a)}^{2}} - \\frac{(x' - ${fmt(hp)})^{2}}{${fmt(b)}^{2}} = 1`,
      text: `Centro (${fmt(center.x)}, ${fmt(center.y)}); eje transverso ${axis === 0 ? "horizontal" : "vertical"}; c = ${fmt(c)}.`,
      depth: 1,
    });
    const asymptotes =
      axis === 0
        ? [
            `y - ${fmt(center.y)} = ${fmt(slope1)}(x - ${fmt(center.x)})`,
            `y - ${fmt(center.y)} = -${fmt(slope1)}(x - ${fmt(center.x)})`,
          ]
        : [
            `y - ${fmt(center.y)} = ${fmt(slope1)}(x - ${fmt(center.x)})`,
            `y - ${fmt(center.y)} = -${fmt(slope1)}(x - ${fmt(center.x)})`,
          ];
    return {
      ...base,
      kind: "hipérbola",
      center,
      a,
      b,
      c,
      foci,
      axis,
      asymptotes,
      canonical:
        axis === 0
          ? `\\frac{(x' - ${fmt(hp)})^{2}}{${fmt(a)}^{2}} - \\frac{(y' - ${fmt(kp)})^{2}}{${fmt(b)}^{2}} = 1`
          : `\\frac{(y' - ${fmt(kp)})^{2}}{${fmt(a)}^{2}} - \\frac{(x' - ${fmt(hp)})^{2}}{${fmt(b)}^{2}} = 1`,
    };
  }

  /* ---------------- Parábola ---------------- */
  if (Math.abs(A) < EPS && Math.abs(C) > EPS) {
    // C y'² + D x' + E y' + F = 0
    const kp = -E / (2 * C);
    const R = (E * E) / (4 * C) - F;
    if (Math.abs(D) < EPS) {
      // C(y'−k)² = R
      const rhs = R / C;
      if (rhs > 0) {
        steps.push({ title: "Dos rectas paralelas", tex: `y' = ${fmt(kp)} \\pm ${fmt(Math.sqrt(rhs))}`, depth: 1 });
        return { ...base, kind: "dos rectas", center: toOriginal(0, kp), degenerate: true, canonical: `y' = ${fmt(kp)} \\pm ${fmt(Math.sqrt(rhs))}` };
      }
      if (Math.abs(rhs) < EPS) {
        return { ...base, kind: "recta", center: toOriginal(0, kp), degenerate: true, canonical: `y' = ${fmt(kp)}` };
      }
      return { ...base, kind: "vacío", center: toOriginal(0, kp), degenerate: true, canonical: "\\varnothing" };
    }
    const p = -D / (4 * C);
    const hp = R / D;
    const vertex = toOriginal(hp, kp);
    const axis: 0 | 1 = 0;
    steps.push({
      title: "Parábola",
      tex: `(y' - ${fmt(kp)})^{2} = ${fmt(4 * p)}(x' - ${fmt(hp)})`,
      text: `Vértice (${fmt(vertex.x)}, ${fmt(vertex.y)}), abre hacia ${p > 0 ? "la derecha" : "la izquierda"}, 4p = ${fmt(4 * p)}.`,
      depth: 1,
    });
    return {
      ...base,
      kind: "parábola",
      center: vertex,
      p,
      axis,
      canonical: `(y' - ${fmt(kp)})^{2} = ${fmt(4 * p)}(x' - ${fmt(hp)})`,
      directrix: `x' = ${fmt(hp - p)}`,
    };
  }

  if (Math.abs(C) < EPS && Math.abs(A) > EPS) {
    // A x'² + D x' + E y' + F = 0
    const hp = -D / (2 * A);
    const R = (D * D) / (4 * A) - F;
    if (Math.abs(E) < EPS) {
      const rhs = R / A;
      if (rhs > 0) {
        steps.push({ title: "Dos rectas paralelas", tex: `x' = ${fmt(hp)} \\pm ${fmt(Math.sqrt(rhs))}`, depth: 1 });
        return { ...base, kind: "dos rectas", center: toOriginal(hp, 0), degenerate: true, canonical: `x' = ${fmt(hp)} \\pm ${fmt(Math.sqrt(rhs))}` };
      }
      if (Math.abs(rhs) < EPS) {
        return { ...base, kind: "recta", center: toOriginal(hp, 0), degenerate: true, canonical: `x' = ${fmt(hp)}` };
      }
      return { ...base, kind: "vacío", center: toOriginal(hp, 0), degenerate: true, canonical: "\\varnothing" };
    }
    const p = -E / (4 * A);
    const kp = R / E;
    const vertex = toOriginal(hp, kp);
    const axis: 0 | 1 = 1;
    steps.push({
      title: "Parábola",
      tex: `(x' - ${fmt(hp)})^{2} = ${fmt(4 * p)}(y' - ${fmt(kp)})`,
      text: `Vértice (${fmt(vertex.x)}, ${fmt(vertex.y)}), abre hacia ${p > 0 ? "arriba" : "abajo"}, 4p = ${fmt(4 * p)}.`,
      depth: 1,
    });
    return {
      ...base,
      kind: "parábola",
      center: vertex,
      p,
      axis,
      canonical: `(x' - ${fmt(hp)})^{2} = ${fmt(4 * p)}(y' - ${fmt(kp)})`,
      directrix: `y' = ${fmt(kp - p)}`,
    };
  }

  /* ---------------- Casos lineales ---------------- */
  if (Math.abs(A) < EPS && Math.abs(C) < EPS) {
    if (Math.abs(D) > EPS || Math.abs(E) > EPS) {
      steps.push({ title: "Recta", tex: `${fmt(D)}x + ${fmt(E)}y + ${fmt(F)} = 0`, depth: 1 });
      return { ...base, kind: "recta", canonical: `${fmt(D)}x + ${fmt(E)}y + ${fmt(F)} = 0`, degenerate: true };
    }
    return { ...base, kind: "vacío", canonical: "\\varnothing", degenerate: true };
  }

  outer.push({ title: "Caso no contemplado", text: "La ecuación no corresponde a una cónica real.", depth: 1 });
  return { ...base, kind: "vacío", canonical: "\\varnothing", degenerate: true };
}

/** Puntos para dibujar la cónica (en coordenadas originales). */
export function conicPoints(result: ConicResult, samples = 160): Point[][] {
  const { kind, center, a, b, angle, p, axis } = result;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const map = (xp: number, yp: number): Point => ({
    x: center.x + xp * cos - yp * sin,
    y: center.y + xp * sin + yp * cos,
  });

  if (kind === "circunferencia" || kind === "elipse") {
    if (!a || !b) return [];
    return [
      Array.from({ length: samples + 1 }, (_, i) => {
        const t = (2 * Math.PI * i) / samples;
        return map(a * Math.cos(t), b * Math.sin(t));
      }),
    ];
  }

  if (kind === "hipérbola") {
    if (!a || !b) return [];
    const limit = 2.5;
    const branch = (sign: 1 | -1) =>
      Array.from({ length: samples + 1 }, (_, i) => {
        const t = -limit + (2 * limit * i) / samples;
        return axis === 0
          ? map(sign * a * Math.cosh(t), b * Math.sinh(t))
          : map(b * Math.sinh(t), sign * a * Math.cosh(t));
      });
    return [branch(1), branch(-1)];
  }

  if (kind === "parábola" && p) {
    const span = Math.max(4, Math.abs(p) * 8);
    return [
      Array.from({ length: samples + 1 }, (_, i) => {
        const t = -span + (2 * span * i) / samples;
        return axis === 0 ? map(t * t / (4 * p), t) : map(t, t * t / (4 * p));
      }),
    ];
  }

  return [];
}

export function conicSummary(r: ConicResult): string {
  switch (r.kind) {
    case "circunferencia":
      return `Circunferencia de centro (${fmt(r.center.x)}, ${fmt(r.center.y)}) y radio ${fmt(r.radius ?? 0)}.`;
    case "elipse":
      return `Elipse de centro (${fmt(r.center.x)}, ${fmt(r.center.y)}), semiejes ${fmt(r.a ?? 0)} y ${fmt(r.b ?? 0)}.`;
    case "hipérbola":
      return `Hipérbola de centro (${fmt(r.center.x)}, ${fmt(r.center.y)}), semiejes ${fmt(r.a ?? 0)} y ${fmt(r.b ?? 0)}.`;
    case "parábola":
      return `Parábola de vértice (${fmt(r.center.x)}, ${fmt(r.center.y)}), parámetro p = ${fmt(r.p ?? 0)}.`;
    case "punto":
      return "Cónica degenerada: un solo punto.";
    case "recta":
      return "Cónica degenerada: una recta.";
    case "dos rectas":
      return "Cónica degenerada: dos rectas.";
    default:
      return "Conjunto vacío: no hay puntos reales.";
  }
}

export { fmt as conicFmt };
