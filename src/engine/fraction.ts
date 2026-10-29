/**
 * Aritmética exacta con fracciones (BigInt) para álgebra lineal.
 * Evita errores de redondeo al mostrar determinantes, RREF y soluciones.
 */
export type Frac = { n: bigint; d: bigint };

const abs = (v: bigint): bigint => (v < 0n ? -v : v);

const gcd = (a: bigint, b: bigint): bigint => {
  let x = abs(a);
  let y = abs(b);
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x || 1n;
};

export const frac = (n: bigint | number, d: bigint | number = 1n): Frac => {
  let nn = typeof n === "number" ? BigInt(Math.trunc(n)) : n;
  let dd = typeof d === "number" ? BigInt(Math.trunc(d)) : d;
  if (dd === 0n) throw new Error("División por cero");
  if (dd < 0n) {
    nn = -nn;
    dd = -dd;
  }
  const g = gcd(nn, dd);
  return { n: nn / g, d: dd / g };
};

export const ZERO: Frac = { n: 0n, d: 1n };
export const ONE: Frac = { n: 1n, d: 1n };

export const add = (a: Frac, b: Frac): Frac => frac(a.n * b.d + b.n * a.d, a.d * b.d);
export const sub = (a: Frac, b: Frac): Frac => frac(a.n * b.d - b.n * a.d, a.d * b.d);
export const mul = (a: Frac, b: Frac): Frac => frac(a.n * b.n, a.d * b.d);
export const div = (a: Frac, b: Frac): Frac => {
  if (b.n === 0n) throw new Error("División por cero");
  return frac(a.n * b.d, a.d * b.n);
};
export const neg = (a: Frac): Frac => ({ n: -a.n, d: a.d });
export const isZero = (a: Frac): boolean => a.n === 0n;
export const eq = (a: Frac, b: Frac): boolean => a.n * b.d === b.n * a.d;
export const sign = (a: Frac): number => (a.n === 0n ? 0 : a.n > 0n ? 1 : -1);
export const toNumber = (a: Frac): number => Number(a.n) / Number(a.d);
export const powInt = (a: Frac, k: number): Frac => {
  if (k === 0) return ONE;
  if (k < 0) return div(ONE, powInt(a, -k));
  let out = ONE;
  for (let i = 0; i < k; i++) out = mul(out, a);
  return out;
};

export const toLatex = (a: Frac): string => {
  if (a.d === 1n) return a.n.toString();
  const sign = a.n < 0n ? "-" : "";
  const n = a.n < 0n ? -a.n : a.n;
  return `${sign}\\frac{${n.toString()}}{${a.d.toString()}}`;
};

/** Acepta "3", "-3/4", "1.25", "−2" (menos tipográfico). */
export const parseFrac = (text: string): Frac | null => {
  const raw = text.trim().replace(/−/g, "-").replace(/\s+/g, "");
  if (!raw) return null;
  const slash = raw.indexOf("/");
  try {
    if (slash >= 0) {
      const n = parseDecimal(raw.slice(0, slash));
      const d = parseDecimal(raw.slice(slash + 1));
      if (!n || !d || isZero(d)) return null;
      return div(n, d);
    }
    return parseDecimal(raw);
  } catch {
    return null;
  }
};

const parseDecimal = (text: string): Frac | null => {
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(text)) return null;
  const negative = text.startsWith("-");
  const body = text.replace(/^[+-]/, "");
  const [intPart, decPart = ""] = body.split(".");
  const digits = `${intPart || "0"}${decPart}`;
  const scale = 10n ** BigInt(decPart.length);
  const value = frac(BigInt(digits), scale);
  return negative ? neg(value) : value;
};
