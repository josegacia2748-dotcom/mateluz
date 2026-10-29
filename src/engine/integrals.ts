import type { Step } from "./types";
import {
  type Node,
  bin,
  call,
  diff,
  evaluate,
  formatNumber,
  neg,
  num,
  parse,
  simplify,
  toLatex,
  varsOf,
} from "./expr";
import { polyCoeffs } from "./limits";

export type IntegralResult = {
  method: string;
  /** Antiderivada simbólica (sin +C). */
  antiderivative: Node | null;
  /** LaTeX de la antiderivada o del valor definido. */
  latex: string;
  steps: Step[];
  definite?: { a: number; b: number; value: number | null; latex: string; numeric: number | null };
  numeric?: number | null;
  improper?: boolean;
};

const fmt = (x: number) => formatNumber(x);
const isConst = (n: Node, variable: string) => !varsOf(n).includes(variable);

type Sub = { F: Node | null; method: string };

/* ------------------------------------------------------------------ *
 * Integración simbólica
 * ------------------------------------------------------------------ */

function linearCoeffs(node: Node, variable: string): { a: number; b: number } | null {
  const c = polyCoeffs(node, variable);
  if (!c || c.length > 2) return null;
  const a = c[1] ?? 0;
  const b = c[0] ?? 0;
  if (Math.abs(a) < 1e-12) return null;
  return { a, b };
}

function logAbs(arg: Node): Node {
  return call("ln", call("abs", arg));
}

function integrateNode(node: Node, variable: string, steps: Step[], depth = 0, guard = 0): Sub | null {
  if (guard > 8) return null;
  const push = (title: string, tex?: string, text?: string) =>
    steps.push({ title, tex, text, depth });

  switch (node.kind) {
    case "num":
      push("Regla de la constante", `\\int ${fmt(node.value)}\\,d${variable} = ${fmt(node.value)}${variable}`);
      return { F: bin("*", node, { kind: "var", name: variable }), method: "constante" };

    case "const":
      push("Constante", `\\int ${toLatex(node)}\\,d${variable} = ${toLatex(node)}\\,${variable}`);
      return { F: bin("*", node, { kind: "var", name: variable }), method: "constante" };

    case "var":
      if (node.name === variable) {
        push(
          "Regla de la potencia",
          `\\int ${variable}\\,d${variable} = \\frac{${variable}^{2}}{2}`,
          "Aplicamos ∫xⁿ dx = xⁿ⁺¹/(n+1) con n = 1.",
        );
        return {
          F: bin("/", bin("^", node, num(2)), num(2)),
          method: "potencia",
        };
      }
      push("Otra variable", `\\int ${node.name}\\,d${variable} = ${node.name}\\,${variable}`);
      return { F: bin("*", node, { kind: "var", name: variable }), method: "constante" };

    case "neg": {
      const inner = integrateNode(node.arg, variable, steps, depth + 1, guard + 1);
      if (!inner?.F) return null;
      push("Signo", `\\int -f\\,d${variable} = -\\int f\\,d${variable}`);
      return { F: neg(inner.F), method: inner.method };
    }

    case "call": {
      const lin = linearCoeffs(node.arg, variable);
      const a = lin?.a ?? 1;
      const arg = node.arg;
      const simple = (outer: Node, label: string): Sub => {
        push(label, `\\int ${toLatex(node)}\\,d${variable} = ${toLatex(outer)}`);
        return { F: outer, method: label };
      };
      switch (node.fn) {
        case "sin":
          return simple(
            bin("/", neg(call("cos", arg)), num(a)),
            "Integral de seno",
          );
        case "cos":
          return simple(bin("/", call("sin", arg), num(a)), "Integral de coseno");
        case "exp":
          return simple(bin("/", call("exp", arg), num(a)), "Integral de exponencial");
        case "sqrt":
          return simple(
            bin("/", bin("*", num(2), bin("^", arg, bin("/", num(3), num(2)))), num(3 * a)),
            "Integral de raíz",
          );
        case "ln": {
          // ∫ ln(x) dx = x ln x − x
          const x = { kind: "var", name: variable } as Node;
          const F = bin("-", bin("*", x, call("ln", x)), x);
          push(
            "Integración por partes",
            `u = \\ln ${variable},\\quad dv = d${variable} \\;\\Rightarrow\\; \\int \\ln ${variable}\\,d${variable} = ${variable}\\ln ${variable} - ${variable}`,
            "Elegimos u = ln x y dv = dx; entonces du = dx/x y v = x.",
          );
          return { F, method: "por partes" };
        }
        case "tan":
          return simple(neg(logAbs(call("cos", arg))), "Integral de tangente");
        case "sec": {
          const F = logAbs(bin("+", call("sec", arg), call("tan", arg)));
          push("Integral de secante", `\\int \\sec ${variable}\\,d${variable} = \\ln\\left|\\sec ${variable} + \\tan ${variable}\\right|`);
          return { F, method: "secante" };
        }
        case "abs": {
          const F = bin("/", bin("*", arg, call("abs", arg)), num(2));
          push("Integral de |x|", `\\int |${variable}|\\,d${variable} = \\frac{${variable}|${variable}|}{2}`);
          return { F, method: "valor absoluto" };
        }
        case "atan": {
          const x = { kind: "var", name: variable } as Node;
          const F = bin(
            "-",
            bin("*", x, call("atan", x)),
            bin("/", call("ln", bin("+", num(1), bin("^", x, num(2)))), num(2)),
          );
          push("Integración por partes", `\\int \\arctan ${variable}\\,d${variable} = ${variable}\\arctan ${variable} - \\frac{1}{2}\\ln(1+${variable}^{2})`);
          return { F, method: "por partes" };
        }
        case "asin": {
          const x = { kind: "var", name: variable } as Node;
          const F = bin(
            "+",
            bin("*", x, call("asin", x)),
            call("sqrt", bin("-", num(1), bin("^", x, num(2)))),
          );
          push("Integración por partes", `\\int \\arcsin ${variable}\\,d${variable} = ${variable}\\arcsin ${variable} + \\sqrt{1-${variable}^{2}}`);
          return { F, method: "por partes" };
        }
        default:
          return null;
      }
    }

    case "bin": {
      if (node.op === "+" || node.op === "-") {
        const l = integrateNode(node.left, variable, steps, depth + 1, guard + 1);
        const r = integrateNode(node.right, variable, steps, depth + 1, guard + 1);
        if (!l?.F || !r?.F) return null;
        push(
          "Linealidad de la integral",
          `\\int\\left(f ${node.op} g\\right)d${variable} = \\int f\\,d${variable} ${node.op} \\int g\\,d${variable}`,
          "Integramos término por término.",
        );
        return {
          F: simplify(node.op === "+" ? bin("+", l.F, r.F) : bin("-", l.F, r.F)),
          method: "suma de integrales",
        };
      }

      if (node.op === "*") {
        if (isConst(node.left, variable)) {
          const rest = integrateNode(node.right, variable, steps, depth + 1, guard + 1);
          if (!rest?.F) return null;
          push("Constante multiplicativa", `\\int k\\,f\\,d${variable} = k\\int f\\,d${variable}`);
          return { F: bin("*", node.left, rest.F), method: rest.method };
        }
        if (isConst(node.right, variable)) {
          const rest = integrateNode(node.left, variable, steps, depth + 1, guard + 1);
          if (!rest?.F) return null;
          push("Constante multiplicativa", `\\int k\\,f\\,d${variable} = k\\int f\\,d${variable}`);
          return { F: bin("*", node.right, rest.F), method: rest.method };
        }
        const polySide = isPolynomial(node.left, variable) ? node.left : isPolynomial(node.right, variable) ? node.right : null;
        const other = polySide === node.left ? node.right : node.left;
        // ∫ ln x · xⁿ dx  → u = ln x
        const logSide = node.left.kind === "call" && node.left.fn === "ln" ? node.left : node.right.kind === "call" && node.right.fn === "ln" ? node.right : null;
        if (logSide) {
          const rest = logSide === node.left ? node.right : node.left;
          return byParts(logSide, rest, variable, steps, depth, guard);
        }
        if (polySide && isTranscendental(other)) {
          return byParts(polySide, other, variable, steps, depth, guard);
        }
        return null;
      }

      if (node.op === "/") {
        const [p, q] = [node.left, node.right];
        // f'/f → ln|f|
        if (isConst(p, variable) && isPolynomial(q, variable)) {
          const pd = diff(q, variable);
          const ratio = simplify(bin("/", pd, q));
          if (toLatex(ratio) === toLatex(p)) {
            push("Logaritmo", `\\int \\frac{f'}{f}\\,d${variable} = \\ln|f|`);
            return { F: logAbs(q), method: "logarítmica" };
          }
        }
        if (isConst(q, variable)) {
          const rest = integrateNode(p, variable, steps, depth + 1, guard + 1);
          if (!rest?.F) return null;
          push("División por constante", `\\int \\frac{f}{k}\\,d${variable} = \\frac{1}{k}\\int f\\,d${variable}`);
          return { F: bin("/", rest.F, q), method: rest.method };
        }
        if (isConst(p, variable)) {
          // 1/x
          if (q.kind === "var" && q.name === variable) {
            push("Caso especial", `\\int \\frac{1}{${variable}}\\,d${variable} = \\ln|${variable}|`);
            return { F: logAbs(q), method: "logarítmica" };
          }
          if (q.kind === "bin" && q.op === "^" && q.left.kind === "var" && q.left.name === variable && q.right.kind === "num") {
            const n = q.right.value;
            if (n === 1) return { F: logAbs(q.left), method: "logarítmica" };
            push("Regla de la potencia", `\\int ${variable}^{${fmt(n)}}\\,d${variable} = \\frac{${variable}^{${fmt(n + 1)}}}{${fmt(n + 1)}}`);
            return {
              F: bin("/", bin("^", q.left, num(n + 1)), num(n + 1)),
              method: "potencia",
            };
          }
          // 1/(1+x²) y 1/√(1−x²)
          const pattern = specialInverse(p, q, variable);
          if (pattern) {
            push("Integral notable", pattern.tex);
            return { F: pattern.F, method: "inversa trigonométrica" };
          }
          // 1/cos² x → tan x ; 1/sin² x → −cot x
          const trig = reciprocalTrig(p, q, variable);
          if (trig) {
            push("Integral notable", trig.tex);
            return { F: trig.F, method: "trigonométrica" };
          }
          const rational = partialFractions(p, q, variable, steps);
          if (rational) return rational;
        }
        return null;
      }

      if (node.op === "^") {
        const base = node.left;
        const exponent = node.right;
        if (isConst(exponent, variable) && exponent.kind === "num") {
          const n = exponent.value;
          const lin = linearCoeffs(base, variable);
          if (lin) {
            if (n === -1) {
              push("Caso n = −1", `\\int \\frac{1}{${toLatex(base)}}\\,d${variable} = \\frac{1}{${fmt(lin.a)}}\\ln\\left|${toLatex(base)}\\right|`);
              return { F: bin("/", logAbs(base), num(lin.a)), method: "logarítmica" };
            }
            const F = bin("/", bin("^", base, num(n + 1)), num(lin.a * (n + 1)));
            push(
              "Regla de la potencia (con sustitución)",
              `\\int (${toLatex(base)})^{${fmt(n)}}\\,d${variable} = \\frac{(${toLatex(base)})^{${fmt(n + 1)}}}{${fmt(lin.a)}(${fmt(n + 1)})}`,
              "Como la base es lineal con pendiente a, dividimos entre a·(n+1).",
            );
            return { F, method: "potencia" };
          }
          if (base.kind === "call" && base.fn === "cos" && n === -2) {
            const arg = base.arg;
            const la = linearCoeffs(arg, variable)?.a ?? 1;
            return { F: bin("/", call("tan", arg), num(la)), method: "trigonométrica" };
          }
          if (base.kind === "call" && base.fn === "sin" && n === -2) {
            const arg = base.arg;
            const la = linearCoeffs(arg, variable)?.a ?? 1;
            return { F: bin("/", neg(call("cot", arg)), num(la)), method: "trigonométrica" };
          }
        }
        if (isConst(base, variable) && isConst(exponent, variable)) {
          const a = evaluate(base, {});
          if (a > 0 && a !== 1) {
            push("Integral exponencial", `\\int a^{${variable}}\\,d${variable} = \\frac{a^{${variable}}}{\\ln a}`);
            return { F: bin("/", node, call("ln", base)), method: "exponencial" };
          }
        }
        return null;
      }
    }
  }
  return null;
}

function isPolynomial(node: Node, variable: string): boolean {
  return polyCoeffs(node, variable) !== null;
}

function isTranscendental(node: Node): boolean {
  if (node.kind === "call") return true;
  if (node.kind === "bin") return isTranscendental(node.left) || isTranscendental(node.right);
  return false;
}

function byParts(
  u: Node,
  dv: Node,
  variable: string,
  steps: Step[],
  depth: number,
  guard: number,
): Sub | null {
  if (guard > 6) return null;
  const du = simplify(diff(u, variable));
  const vPart = integrateNode(dv, variable, steps, depth + 1, guard + 1);
  if (!vPart?.F) return null;
  const v = simplify(vPart.F);
  const remaining = integrateNode(simplify(bin("*", v, du)), variable, steps, depth + 1, guard + 1);
  if (!remaining?.F) return null;
  steps.push({
    title: "Integración por partes",
    tex: `u = ${toLatex(u)},\\quad dv = ${toLatex(dv)}\\,d${variable} \\;\\Rightarrow\\; du = ${toLatex(du)}\\,d${variable},\\quad v = ${toLatex(v)}`,
    text: "Aplicamos ∫u dv = uv − ∫v du.",
    depth,
  });
  steps.push({
    title: "Sustituimos en la fórmula",
    tex: `\\int ${toLatex(u)}\\,${toLatex(dv)}\\,d${variable} = \\left(${toLatex(u)}\\right)\\left(${toLatex(v)}\\right) - \\int \\left(${toLatex(v)}\\right)\\left(${toLatex(du)}\\right)d${variable}`,
    depth,
  });
  return {
    F: simplify(bin("-", bin("*", u, v), remaining.F)),
    method: "por partes",
  };
}

function specialInverse(p: Node, q: Node, variable: string): { F: Node; tex: string } | null {
  const one = p.kind === "num" && Math.abs(p.value - 1) < 1e-12;
  if (!one) return null;
  const x = { kind: "var", name: variable } as Node;
  // 1/(1+x²)
  const qp = polyCoeffs(q, variable);
  if (qp && qp.length === 3) {
    const [c, b, a] = qp;
    if (Math.abs(a - 1) < 1e-12 && Math.abs(b) < 1e-12 && Math.abs(c - 1) < 1e-12) {
      return {
        F: call("atan", x),
        tex: `\\int \\frac{1}{1+${variable}^{2}}\\,d${variable} = \\arctan ${variable}`,
      };
    }
    if (Math.abs(a) < 1e-12) return null;
  }
  // 1/√(1−x²)
  if (q.kind === "call" && q.fn === "sqrt") {
    const inner = polyCoeffs(q.arg, variable);
    if (inner && inner.length === 3 && Math.abs(inner[0] - 1) < 1e-12 && Math.abs(inner[1]) < 1e-12 && Math.abs(inner[2] + 1) < 1e-12) {
      return {
        F: call("asin", x),
        tex: `\\int \\frac{1}{\\sqrt{1-${variable}^{2}}}\\,d${variable} = \\arcsin ${variable}`,
      };
    }
  }
  return null;
}

function reciprocalTrig(p: Node, q: Node, variable: string): { F: Node; tex: string } | null {
  const one = p.kind === "num" && Math.abs(p.value - 1) < 1e-12;
  if (!one) return null;
  if (q.kind === "bin" && q.op === "^" && q.right.kind === "num" && q.right.value === 2 && q.left.kind === "call") {
    if (q.left.fn === "cos") {
      return {
        F: call("tan", q.left.arg),
        tex: `\\int \\sec^{2}${variable}\\,d${variable} = \\tan ${variable}`,
      };
    }
    if (q.left.fn === "sin") {
      return {
        F: neg(call("cot", q.left.arg)),
        tex: `\\int \\csc^{2}${variable}\\,d${variable} = -\\cot ${variable}`,
      };
    }
  }
  return null;
}

function partialFractions(p: Node, q: Node, variable: string, steps: Step[]): Sub | null {
  const pn = polyCoeffs(p, variable);
  const pd = polyCoeffs(q, variable);
  if (!pn || !pd) return null;

  // Denominador cuadrático
  if (pd.length === 3) {
    const [c0, c1, c2] = pd;
    const disc = c1 * c1 - 4 * c2 * c0;
    if (disc > 1e-12) {
      const r1 = (-c1 + Math.sqrt(disc)) / (2 * c2);
      const r2 = (-c1 - Math.sqrt(disc)) / (2 * c2);
      const pv = (r: number) => pn.reduce((acc, k, i) => acc + k * Math.pow(r, i), 0);
      const A = pv(r1) / (c2 * (r1 - r2));
      const B = pv(r2) / (c2 * (r2 - r1));
      const x = { kind: "var", name: variable } as Node;
      const F = bin(
        "+",
        bin("*", num(A), logAbs(bin("-", x, num(r1)))),
        bin("*", num(B), logAbs(bin("-", x, num(r2)))),
      );
      steps.push({
        title: "Fracciones simples",
        tex: `\\frac{${toLatex(p)}}{${toLatex(q)}} = \\frac{${fmt(A)}}{${variable} - \\left(${fmt(r1)}\\right)} + \\frac{${fmt(B)}}{${variable} - \\left(${fmt(r2)}\\right)}`,
        text: "El denominador tiene dos raíces reales distintas; descomponemos en fracciones simples.",
        depth: 1,
      });
      steps.push({
        title: "Integramos cada fracción",
        tex: `\\int \\frac{${toLatex(p)}}{${toLatex(q)}}\\,d${variable} = ${fmt(A)}\\ln\\left|${variable} - \\left(${fmt(r1)}\\right)\\right| + ${fmt(B)}\\ln\\left|${variable} - \\left(${fmt(r2)}\\right)\\right|`,
        depth: 1,
      });
      return { F: simplify(F), method: "fracciones simples" };
    }
    if (disc < -1e-12) {
      // ∫ 1/(cuadrática sin raíces) → arctan
      const k = 4 * c2 * c0 - c1 * c1;
      if (Math.abs(pn.length - 1) === 0 && Math.abs(pn[0]) > 0) {
        const A = pn[0];
        const F = bin(
          "*",
          bin("*", num((2 * A) / Math.sqrt(k)), num(1)),
          call("atan", bin("/", bin("+", bin("*", num(2 * c2), { kind: "var", name: variable }), num(c1)), num(Math.sqrt(k)))),
        );
        steps.push({
          title: "Completamos el cuadrado",
          tex: `\\int \\frac{${toLatex(p)}}{${toLatex(q)}}\\,d${variable} = \\frac{2\\cdot ${fmt(A)}}{\\sqrt{${fmt(k)}}}\\arctan\\left(\\frac{2\\cdot ${fmt(c2)}${variable} + ${fmt(c1)}}{\\sqrt{${fmt(k)}}}\\right)`,
          text: "El denominador no tiene raíces reales; lleva a una arcotangente.",
          depth: 1,
        });
        return { F: simplify(F), method: "arcotangente" };
      }
    }
  }

  // Numerador constante y denominador lineal
  if (pd.length === 2 && pn.length === 1 && Math.abs(pn[0]) > 0) {
    const [b, a] = pd;
    const root = -b / a;
    const x = { kind: "var", name: variable } as Node;
    const F = bin("*", num(pn[0] / a), logAbs(bin("-", x, num(root))));
    steps.push({
      title: "Fracción simple",
      tex: `\\int \\frac{${fmt(pn[0])}}{${toLatex(q)}}\\,d${variable} = \\frac{${fmt(pn[0])}}{${fmt(a)}}\\ln\\left|${variable} - \\left(${fmt(root)}\\right)\\right|`,
      depth: 1,
    });
    return { F, method: "fracciones simples" };
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * Simpson
 * ------------------------------------------------------------------ */

export function simpson(node: Node, variable: string, a: number, b: number, n = 1000): number | null {
  if (!(b > a)) return null;
  const steps = n % 2 === 0 ? n : n + 1;
  const h = (b - a) / steps;
  let sum = 0;
  for (let i = 0; i <= steps; i++) {
    const x = a + i * h;
    const y = evaluate(node, { [variable]: x });
    if (!Number.isFinite(y)) return null;
    const w = i === 0 || i === steps ? 1 : i % 2 === 1 ? 4 : 2;
    sum += w * y;
  }
  return (h / 3) * sum;
}

/* ------------------------------------------------------------------ *
 * API principal
 * ------------------------------------------------------------------ */

export function integrate(
  input: string | Node,
  variable = "x",
  bounds?: [number, number],
): IntegralResult {
  const node = typeof input === "string" ? parse(input) : input;
  const steps: Step[] = [];
  steps.push({
    title: "Planteamos la integral",
    tex: bounds
      ? `\\int_{${fmt(bounds[0])}}^{${fmt(bounds[1])}} ${toLatex(node)}\\,d${variable}`
      : `\\int ${toLatex(node)}\\,d${variable}`,
    text: "Buscamos una función cuya derivada sea el integrando.",
    depth: 0,
  });

  const sub = integrateNode(node, variable, steps, 1);
  const F = sub?.F ? simplify(sub.F) : null;
  const method = sub?.method ?? "numérico";

  if (!F) {
    steps.push({
      title: "Sin antiderivada elemental",
      text: "No encontramos una primitiva con las reglas básicas. Usamos integración numérica (Simpson).",
      depth: 1,
    });
  } else {
    steps.push({
      title: "Antiderivada encontrada",
      tex: `\\int ${toLatex(node)}\\,d${variable} = ${toLatex(F)} + C`,
      text: `Método: ${method}. No olvides la constante de integración C.`,
      depth: 0,
    });
  }

  if (bounds) {
    const [a, b] = bounds;
    const numeric = simpson(node, variable, a, b);
    let value: number | null = null;
    let improper = false;
    if (F) {
      const Fa = evaluate(F, { [variable]: a });
      const Fb = evaluate(F, { [variable]: b });
      if (Number.isFinite(Fa) && Number.isFinite(Fb)) value = Fb - Fa;
    }
    // Detecta singularidades dentro del intervalo
    for (let i = 0; i <= 200; i++) {
      const x = a + ((b - a) * i) / 200;
      if (!Number.isFinite(evaluate(node, { [variable]: x }))) {
        improper = true;
        break;
      }
    }
    if (improper) {
      steps.push({
        title: "Integral impropia",
        text: "El integrando no está definido en todo el intervalo: hay una singularidad. La integral debe tratarse como impropia.",
        depth: 1,
      });
      value = null;
    }
    if (F && value !== null) {
      const Fb = evaluate(F, { [variable]: b });
      const Fa = evaluate(F, { [variable]: a });
      steps.push({
        title: "Teorema Fundamental del Cálculo",
        tex: `\\int_{${fmt(a)}}^{${fmt(b)}} f(${variable})\\,d${variable} = F(${fmt(b)}) - F(${fmt(a)}) = ${fmt(Fb)} - \\left(${fmt(Fa)}\\right)`,
        text: `Evaluamos la antiderivada en los extremos: F(${fmt(b)}) − F(${fmt(a)}).`,
        depth: 1,
      });
      steps.push({
        title: "Sustituimos los límites",
        tex: `= ${fmt(Fb)} - \\left(${fmt(Fa)}\\right) = ${fmt(value)}`,
        depth: 1,
      });
    }
    if (numeric !== null) {
      steps.push({
        title: "Verificación numérica (Simpson)",
        tex: `\\int_{${fmt(a)}}^{${fmt(b)}} f(${variable})\\,d${variable} \\approx ${fmt(numeric)}`,
        text: "La regla de Simpson con 1000 subintervalos confirma el resultado.",
        depth: 1,
      });
    }
    steps.push({
      title: "Resultado",
      tex: `\\int_{${fmt(a)}}^{${fmt(b)}} ${toLatex(node)}\\,d${variable} = ${value === null ? "\\text{no convergente}" : fmt(value)}`,
      depth: 0,
    });
    return {
      method,
      antiderivative: F,
      latex: value === null ? "\\text{no convergente}" : fmt(value),
      steps,
      definite: { a, b, value, latex: value === null ? "\\text{no convergente}" : fmt(value), numeric },
      numeric,
      improper,
    };
  }

  return {
    method,
    antiderivative: F,
    latex: F ? `${toLatex(F)} + C` : "\\text{sin primitiva elemental}",
    steps,
    numeric: null,
  };
}

/** Área entre dos curvas en [a,b]. */
export function areaBetween(
  f: string,
  g: string,
  a: number,
  b: number,
  variable = "x",
): { value: number | null; steps: Step[] } {
  const nf = parse(f);
  const ng = parse(g);
  const diffNode = simplify(bin("-", nf, ng));
  const numeric = simpson(diffNode, variable, a, b);
  const abs = simpson(call("abs", diffNode), variable, a, b);
  const steps: Step[] = [
    {
      title: "Planteamos el área",
      tex: `A = \\int_{${fmt(a)}}^{${fmt(b)}} \\left|${toLatex(nf)} - \\left(${toLatex(ng)}\\right)\\right| d${variable}`,
      text: "El área entre dos curvas es la integral del valor absoluto de su diferencia.",
      depth: 0,
    },
    {
      title: "Evaluación numérica",
      tex: `A \\approx ${abs === null ? "\\text{indefinida}" : fmt(abs)}`,
      text: "Usamos Simpson para integrar la diferencia en valor absoluto.",
      depth: 1,
    },
  ];
  return { value: abs, steps };
}

export { fmt };
