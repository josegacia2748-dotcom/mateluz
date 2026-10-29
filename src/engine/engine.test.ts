import { describe, expect, it } from "vitest";
import { diffWithTrace, evaluate, parse, simplify, toLatex } from "./expr";
import { limit } from "./limits";
import { integrate, simpson } from "./integrals";
import { determinant, fromNumbers, inverse, parseMatrix, rref, solveSystem } from "./matrix";
import { analyzeConic } from "./conics";
import { analyzeFunction } from "./analysis";
import { frac, toLatex as fracToLatex } from "./fraction";

const near = (a: number, b: number, tol = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(tol);

const numericDerivative = (expr: string, x: number) => {
  const node = parse(expr);
  const h = 1e-6;
  return (evaluate(node, { x: x + h }) - evaluate(node, { x: x - h })) / (2 * h);
};

describe("parser y evaluación", () => {
  it("respeta la precedencia de operaciones", () => {
    expect(evaluate(parse("2+3*4"))).toBe(14);
    expect(evaluate(parse("(2+3)*4"))).toBe(20);
    expect(evaluate(parse("-x^2"), { x: 3 })).toBe(-9);
    expect(evaluate(parse("2^3^2"))).toBe(512);
  });

  it("admite multiplicación implícita", () => {
    expect(evaluate(parse("2x"), { x: 5 })).toBe(10);
    expect(evaluate(parse("2x(x+1)"), { x: 1 })).toBe(4);
    expect(evaluate(parse("3sen(x)"), { x: Math.PI / 2 })).toBeCloseTo(3);
  });

  it("evalúa funciones y constantes", () => {
    near(evaluate(parse("ln(e)")), 1);
    near(evaluate(parse("sqrt(16)")), 4);
    near(evaluate(parse("sin(pi/2)")), 1);
  });

  it("simplifica términos semejantes", () => {
    expect(toLatex(simplify(parse("x+x")))).toBe("2x");
    expect(toLatex(simplify(parse("2x*3x")))).toBe("6x^{2}");
  });
});

describe("derivadas", () => {
  it("deriva x²·sen(x) con producto y cadena", () => {
    const { result, steps } = diffWithTrace(parse("x^2*sin(x)"));
    near(evaluate(result, { x: 1.3 }), numericDerivative("x^2*sin(x)", 1.3), 1e-4);
    expect(steps.some((s) => /producto/i.test(s.title))).toBe(true);
  });

  it("deriva sen(x²) aplicando la cadena", () => {
    const { result } = diffWithTrace(parse("sin(x^2)"));
    near(evaluate(result, { x: 0.7 }), numericDerivative("sin(x^2)", 0.7), 1e-4);
  });

  it("deriva cocientes y logaritmos", () => {
    const q = diffWithTrace(parse("sin(x)/x"));
    near(evaluate(q.result, { x: 2.1 }), numericDerivative("sin(x)/x", 2.1), 1e-4);
    const l = diffWithTrace(parse("ln(x)"));
    near(evaluate(l.result, { x: 3.2 }), 1 / 3.2, 1e-6);
  });
});

describe("límites", () => {
  it("resuelve sen(x)/x en 0 con L'Hôpital", () => {
    const r = limit("sin(x)/x", "x", 0);
    expect(r.value).not.toBeNull();
    near(Number(r.value), 1, 1e-6);
    expect(r.method.toLowerCase()).toContain("l'hôpital");
  });

  it("factoriza (x²−1)/(x−1)", () => {
    const r = limit("(x^2-1)/(x-1)", "x", 1);
    near(Number(r.value), 2);
    expect(r.steps.some((s) => /factoriz/i.test(s.title))).toBe(true);
  });

  it("detecta asíntota bilateral inexistente en 1/x", () => {
    expect(limit("1/x", "x", 0).value).toBeNull();
  });

  it("reconoce 1/x² → +∞", () => {
    expect(limit("1/x^2", "x", 0).value).toBe("inf");
  });

  it("compara grados en el infinito", () => {
    near(Number(limit("(3x^2+1)/(x^2-4)", "x", "inf").value), 3);
    near(Number(limit("(2x+1)/x^3", "x", "inf").value), 0);
    expect(limit("x^2/(x+1)", "x", "inf").value).toBe("inf");
  });

  it("calcula límites notables en el infinito", () => {
    near(Number(limit("sin(x)/x", "x", "inf").value), 0, 1e-3);
  });
});

describe("integrales", () => {
  it("integra potencias", () => {
    const r = integrate("x^2");
    expect(r.antiderivative).not.toBeNull();
    near(evaluate(r.antiderivative!, { x: 1 }), 1 / 3);
  });

  it("integra seno y evalúa la definida", () => {
    const r = integrate("sin(x)", "x", [0, Math.PI]);
    near(Number(r.definite?.value), 2, 1e-6);
    near(Number(r.definite?.numeric), 2, 1e-4);
  });

  it("integra 1/x como logaritmo", () => {
    const r = integrate("1/x");
    expect(r.latex).toContain("\\ln");
    near(evaluate(r.antiderivative!, { x: Math.E }), 1);
  });

  it("integra por partes x·e^x", () => {
    const r = integrate("x*exp(x)");
    expect(r.method).toBe("por partes");
    const x = 1.4;
    near(evaluate(r.antiderivative!, { x }), x * Math.exp(x) - Math.exp(x), 1e-5);
  });

  it("verifica Simpson con x² en [0,3]", () => {
    near(Number(simpson(parse("x^2"), "x", 0, 3)), 9, 1e-6);
  });
});

describe("matrices", () => {
  it("calcula determinantes 2×2 y 3×3", () => {
    expect(fracToLatex(determinant(fromNumbers([[1, 2], [3, 4]])))).toBe("-2");
    expect(fracToLatex(determinant(fromNumbers([[2, 0, 1], [1, 3, 2], [1, 1, 1]])))).toBe("0");
    expect(fracToLatex(determinant(fromNumbers([[2, 1, 0], [1, 3, 1], [0, 1, 2]])))).toBe("8");
  });

  it("lee matrices desde texto", () => {
    const m = parseMatrix("1, 2; 3, 4");
    expect(m.length).toBe(2);
    expect(fracToLatex(m[1][0])).toBe("3");
  });

  it("resuelve sistemas compatibles determinados", () => {
    const r = solveSystem(fromNumbers([[2, 1], [1, -1]]), [frac(5), frac(1)]);
    expect(r.type).toBe("unique");
    expect(r.solution!.map(fracToLatex)).toEqual(["2", "1"]);
  });

  it("detecta sistemas incompatibles", () => {
    const r = solveSystem(fromNumbers([[1, 1], [1, 1]]), [frac(1), frac(2)]);
    expect(r.type).toBe("none");
  });

  it("calcula la inversa", () => {
    const r = inverse(fromNumbers([[1, 2], [3, 4]]));
    expect(r.inverse).not.toBeNull();
    expect(r.inverse!.map((row) => row.map(fracToLatex))).toEqual([["-2", "1"], ["\\frac{3}{2}", "-\\frac{1}{2}"]]);
  });

  it("calcula el rango", () => {
    const r = rref(fromNumbers([[1, 2, 3], [2, 4, 6]]), false);
    expect(r.rank).toBe(1);
  });
});

describe("cónicas", () => {
  it("reconoce una circunferencia y su centro", () => {
    const r = analyzeConic("x^2 + y^2 - 4x + 2y - 4 = 0");
    expect(r.kind).toBe("circunferencia");
    near(r.center.x, 2);
    near(r.center.y, -1);
    near(r.radius ?? 0, 3);
  });

  it("reconoce una parábola", () => {
    const r = analyzeConic("y - x^2 = 0");
    expect(r.kind).toBe("parábola");
    near(r.p ?? 0, 0.25);
  });

  it("reconoce una hipérbola", () => {
    const r = analyzeConic("x^2 - y^2 = 1");
    expect(r.kind).toBe("hipérbola");
    near(r.a ?? 0, 1);
    near(r.b ?? 0, 1);
  });

  it("clasifica una elipse", () => {
    const r = analyzeConic("9x^2 + 4y^2 = 36");
    expect(r.kind).toBe("elipse");
    near(r.a ?? 0, 3);
    near(r.b ?? 0, 2);
  });
});

describe("análisis de funciones", () => {
  it("detecta dominio y asíntotas de 1/x", () => {
    const r = analyzeFunction("1/x");
    expect(r.domain.excluded.some((x) => Math.abs(x) < 1e-6)).toBe(true);
    expect(r.asymptotes.vertical.some((x) => Math.abs(x) < 1e-6)).toBe(true);
    expect(r.asymptotes.horizontal.length).toBeGreaterThan(0);
    expect(r.parity).toBe("impar");
  });

  it("encuentra ceros de x²−4", () => {
    const r = analyzeFunction("x^2-4");
    const zeros = r.zeros.map((z) => Number(z.toFixed(3))).sort();
    expect(zeros).toEqual([-2, 2]);
  });
});
