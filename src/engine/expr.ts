import type { Step } from "./types";

/* ------------------------------------------------------------------ *
 * AST
 * ------------------------------------------------------------------ */

export type Node =
  | { kind: "num"; value: number }
  | { kind: "var"; name: string }
  | { kind: "const"; name: "pi" | "e" }
  | { kind: "neg"; arg: Node }
  | { kind: "bin"; op: "+" | "-" | "*" | "/" | "^"; left: Node; right: Node }
  | { kind: "call"; fn: string; arg: Node };

export const num = (value: number): Node => ({ kind: "num", value });
export const v = (name = "x"): Node => ({ kind: "var", name });
export const bin = (op: "+" | "-" | "*" | "/" | "^", left: Node, right: Node): Node => ({
  kind: "bin",
  op,
  left,
  right,
});
export const neg = (arg: Node): Node => ({ kind: "neg", arg });
export const call = (fn: string, arg: Node): Node => ({ kind: "call", fn, arg });

/* ------------------------------------------------------------------ *
 * Lexer
 * ------------------------------------------------------------------ */

type Tok =
  | { t: "num"; v: number }
  | { t: "id"; v: string }
  | { t: "op"; v: "+" | "-" | "*" | "/" | "^" | "(" | ")" };

const isDigit = (c: string) => c >= "0" && c <= "9";
const isAlpha = (c: string) => /[a-zA-ZáéíóúÁÉÍÓÚñÑπ]/.test(c);

function lex(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  const text = src.replace(/−/g, "-").replace(/,/g, ".").replace(/·|×/g, "*").replace(/÷/g, "/");
  while (i < text.length) {
    const c = text[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (isDigit(c) || (c === "." && isDigit(text[i + 1] ?? ""))) {
      let j = i;
      while (j < text.length && (isDigit(text[j]) || text[j] === ".")) j++;
      out.push({ t: "num", v: Number(text.slice(i, j)) });
      i = j;
      continue;
    }
    if (isAlpha(c)) {
      let j = i;
      while (j < text.length && (isAlpha(text[j]) || text[j] === "_")) j++;
      out.push({ t: "id", v: text.slice(i, j) });
      i = j;
      continue;
    }
    if ("+-*/^()".includes(c)) {
      out.push({ t: "op", v: c as "+" | "-" | "*" | "/" | "^" | "(" | ")" });
      i++;
      continue;
    }
    if (c === "[" || c === "{") {
      out.push({ t: "op", v: "(" });
      i++;
      continue;
    }
    if (c === "]" || c === "}") {
      out.push({ t: "op", v: ")" });
      i++;
      continue;
    }
    throw new Error(`Carácter no reconocido: «${c}»`);
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Parser (descenso recursivo, multiplicación implícita)
 * ------------------------------------------------------------------ */

const FUNCTIONS = new Set([
  "sin", "cos", "tan", "sec", "csc", "cot",
  "asin", "acos", "atan", "sinh", "cosh", "tanh",
  "exp", "ln", "log", "sqrt", "abs",
]);

const ALIASES: Record<string, string> = {
  sen: "sin", tg: "tan", cotg: "cot", cosec: "csc",
  arcsin: "asin", arccos: "acos", arctan: "atan",
  log10: "log", raiz: "sqrt", raíz: "sqrt", módulo: "abs", modulo: "abs",
};

class Parser {
  private pos = 0;
  constructor(private toks: Tok[]) {}

  parse(): Node {
    const node = this.sum();
    if (this.pos < this.toks.length) throw new Error("Expresión incompleta o paréntesis desbalanceados");
    return node;
  }

  private peek(): Tok | undefined {
    return this.toks[this.pos];
  }

  private eatOp(v: string): boolean {
    const t = this.peek();
    if (t && t.t === "op" && t.v === v) {
      this.pos++;
      return true;
    }
    return false;
  }

  private expectOp(v: string) {
    if (!this.eatOp(v)) throw new Error(`Se esperaba «${v}»`);
  }

  private sum(): Node {
    let left = this.product();
    for (;;) {
      if (this.eatOp("+")) left = bin("+", left, this.product());
      else if (this.eatOp("-")) left = bin("-", left, this.product());
      else break;
    }
    return left;
  }

  private startsFactor(): boolean {
    const t = this.peek();
    if (!t) return false;
    if (t.t === "num" || t.t === "id") return true;
    return t.t === "op" && t.v === "(";
  }

  private product(): Node {
    let left = this.unary();
    for (;;) {
      if (this.eatOp("*")) {
        left = bin("*", left, this.unary());
      } else if (this.eatOp("/")) {
        left = bin("/", left, this.unary());
      } else if (this.startsFactor()) {
        left = bin("*", left, this.power());
      } else break;
    }
    return left;
  }

  private unary(): Node {
    if (this.eatOp("-")) return neg(this.unary());
    if (this.eatOp("+")) return this.unary();
    return this.power();
  }

  private power(): Node {
    const base = this.atom();
    if (this.eatOp("^")) return bin("^", base, this.unary());
    return base;
  }

  private atom(): Node {
    const t = this.peek();
    if (!t) throw new Error("Se esperaba un número, una variable o un paréntesis");
    if (t.t === "num") {
      this.pos++;
      return num(t.v);
    }
    if (t.t === "op" && t.v === "(") {
      this.pos++;
      const inner = this.sum();
      this.expectOp(")");
      return inner;
    }
    if (t.t === "id") {
      this.pos++;
      const raw = t.v.toLowerCase();
      const name = ALIASES[raw] ?? raw;
      if (name === "pi" || raw === "π") return { kind: "const", name: "pi" };
      if (name === "e") return { kind: "const", name: "e" };
      const next = this.peek();
      if (next && next.t === "op" && next.v === "(" && FUNCTIONS.has(name)) {
        this.pos++;
        const arg = this.sum();
        this.expectOp(")");
        return call(name, arg);
      }
      if (name.length === 1) return v(name);
      // "xy" → x·y ; "2ab" ya lo separa el lexer como número + id
      return [...name].reduce<Node | null>((acc, ch) => {
        if (!/[a-z]/.test(ch)) throw new Error(`Identificador no válido: «${t.v}»`);
        const piece = v(ch);
        return acc ? bin("*", acc, piece) : piece;
      }, null)!;
    }
    throw new Error(`Token inesperado «${t.v}»`);
  }
}

export function parse(input: string): Node {
  if (!input.trim()) throw new Error("Expresión vacía");
  return new Parser(lex(input)).parse();
}

/* ------------------------------------------------------------------ *
 * Evaluación
 * ------------------------------------------------------------------ */

const PI = Math.PI;
const E = Math.E;

export function evaluate(node: Node, scope: Record<string, number> = {}): number {
  switch (node.kind) {
    case "num":
      return node.value;
    case "const":
      return node.name === "pi" ? PI : E;
    case "var": {
      const value = scope[node.name];
      return value === undefined ? NaN : value;
    }
    case "neg":
      return -evaluate(node.arg, scope);
    case "bin": {
      const a = evaluate(node.left, scope);
      const b = evaluate(node.right, scope);
      switch (node.op) {
        case "+":
          return a + b;
        case "-":
          return a - b;
        case "*":
          return a * b;
        case "/":
          return b === 0 ? NaN : a / b;
        case "^":
          if (a < 0 && !Number.isInteger(b)) return NaN;
          if (a === 0 && b < 0) return NaN;
          return Math.pow(a, b);
      }
      return NaN;
    }
    case "call": {
      const x = evaluate(node.arg, scope);
      switch (node.fn) {
        case "sin":
          return Math.sin(x);
        case "cos":
          return Math.cos(x);
        case "tan":
          return Math.cos(x) === 0 ? NaN : Math.tan(x);
        case "sec":
          return Math.cos(x) === 0 ? NaN : 1 / Math.cos(x);
        case "csc":
          return Math.sin(x) === 0 ? NaN : 1 / Math.sin(x);
        case "cot":
          return Math.sin(x) === 0 ? NaN : 1 / Math.tan(x);
        case "asin":
          return Math.abs(x) > 1 ? NaN : Math.asin(x);
        case "acos":
          return Math.abs(x) > 1 ? NaN : Math.acos(x);
        case "atan":
          return Math.atan(x);
        case "sinh":
          return Math.sinh(x);
        case "cosh":
          return Math.cosh(x);
        case "tanh":
          return Math.tanh(x);
        case "exp":
          return Math.exp(x);
        case "ln":
          return x > 0 ? Math.log(x) : NaN;
        case "log":
          return x > 0 ? Math.log10(x) : NaN;
        case "sqrt":
          return x < 0 ? NaN : Math.sqrt(x);
        case "abs":
          return Math.abs(x);
        default:
          return NaN;
      }
    }
  }
}

/** Evalúa numéricamente una expresión de texto. */
export function evalExpr(input: string, scope: Record<string, number> = {}): number {
  return evaluate(parse(input), scope);
}

export function isDefined(node: Node, scope: Record<string, number> = {}): boolean {
  return Number.isFinite(evaluate(node, scope));
}

/* ------------------------------------------------------------------ *
 * Utilidades estructurales
 * ------------------------------------------------------------------ */

export function varsOf(node: Node): string[] {
  const set = new Set<string>();
  const walk = (n: Node) => {
    if (n.kind === "var") set.add(n.name);
    else if (n.kind === "neg") walk(n.arg);
    else if (n.kind === "bin") {
      walk(n.left);
      walk(n.right);
    } else if (n.kind === "call") walk(n.arg);
  };
  walk(node);
  return [...set];
}

export function substitute(node: Node, name: string, value: Node): Node {
  switch (node.kind) {
    case "var":
      return node.name === name ? value : node;
    case "neg":
      return neg(substitute(node.arg, name, value));
    case "bin":
      return bin(node.op, substitute(node.left, name, value), substitute(node.right, name, value));
    case "call":
      return call(node.fn, substitute(node.arg, name, value));
    default:
      return node;
  }
}

/** Serialización estructural estable (clave para agrupar términos). */
export function keyOf(node: Node): string {
  switch (node.kind) {
    case "num":
      return `#${node.value}`;
    case "var":
      return node.name;
    case "const":
      return node.name;
    case "neg":
      return `-(${keyOf(node.arg)})`;
    case "bin":
      return `(${keyOf(node.left)}${node.op}${keyOf(node.right)})`;
    case "call":
      return `${node.fn}(${keyOf(node.arg)})`;
  }
}

/* ------------------------------------------------------------------ *
 * LaTeX
 * ------------------------------------------------------------------ */

export function formatNumber(value: number): string {
  if (Number.isNaN(value)) return "\\text{indefinido}";
  if (!Number.isFinite(value)) return value > 0 ? "+\\infty" : "-\\infty";
  if (Number.isInteger(value)) return String(value);
  const abs = Math.abs(value);
  if (abs !== 0 && (abs < 1e-4 || abs >= 1e6)) {
    const [mantissa, exp] = value.toExponential(4).split("e");
    return `${Number(mantissa)} \\times 10^{${Number(exp)}}`;
  }
  return String(Number(value.toFixed(6)));
}

const FUNCTION_TEX: Record<string, string> = {
  sin: "\\sin", cos: "\\cos", tan: "\\tan", sec: "\\sec", csc: "\\csc", cot: "\\cot",
  asin: "\\arcsin", acos: "\\arccos", atan: "\\arctan",
  sinh: "\\sinh", cosh: "\\cosh", tanh: "\\tanh",
  ln: "\\ln", log: "\\log", exp: "\\exp", abs: "\\left|",
};

const isSum = (n: Node) => n.kind === "bin" && (n.op === "+" || n.op === "-");
const isProd = (n: Node) => n.kind === "bin" && (n.op === "*" || n.op === "/");

function needsParens(child: Node, parentOp: string, side: "l" | "r"): boolean {
  if (child.kind !== "bin") return false;
  if (isSum(child)) return true;
  if (parentOp === "^") return true;
  if (parentOp === "*") return child.op === "/";
  if (parentOp === "/") return child.op === "/" || (side === "r" && isProd(child));
  if (parentOp === "-") return side === "r" && isSum(child);
  return false;
}

function tex(node: Node, parentOp = "", side: "l" | "r" = "l"): string {
  const wrap = (s: string) => (needsParens(node, parentOp, side) ? `\\left(${s}\\right)` : s);

  switch (node.kind) {
    case "num":
      return formatNumber(node.value);
    case "var":
      return node.name;
    case "const":
      return node.name === "pi" ? "\\pi" : "e";
    case "neg": {
      const inner = tex(node.arg, "neg");
      return `-${node.arg.kind === "bin" || node.arg.kind === "neg" ? `\\left(${tex(node.arg)}\\right)` : inner}`;
    }
    case "bin": {
      const { op, left, right } = node;
      if (op === "+" || op === "-") {
        if (op === "+" && right.kind === "num" && right.value < 0) {
          return `${tex(left, "+", "l")} - ${formatNumber(-right.value)}`;
        }
        if (op === "+" && right.kind === "neg") {
          return `${tex(left, "+", "l")} - ${tex(right.arg, "-", "r")}`;
        }
        return `${tex(left, op, "l")} ${op} ${tex(right, op, "r")}`;
      }
      if (op === "*") {
        const l = tex(left, "*", "l");
        const r = tex(right, "*", "r");
        const implicit =
          right.kind === "var" ||
          right.kind === "const" ||
          right.kind === "call" ||
          (right.kind === "bin" && right.op === "^");
        return implicit ? `${l}${r}` : `${l} \\cdot ${r}`;
      }
      if (op === "/") return `\\frac{${tex(left)}}{${tex(right)}}`;
      const baseTex = tex(left);
      const base = left.kind === "bin" || left.kind === "neg" ? `\\left(${baseTex}\\right)` : baseTex;
      return `${base}^{${tex(right)}}`;
    }
    case "call": {
      if (node.fn === "sqrt") return `\\sqrt{${tex(node.arg)}}`;
      if (node.fn === "abs") return `\\left|${tex(node.arg)}\\right|`;
      if (node.fn === "exp") return `e^{${tex(node.arg)}}`;
      const name = FUNCTION_TEX[node.fn] ?? `\\operatorname{${node.fn}}`;
      return `${name}\\left(${tex(node.arg)}\\right)`;
    }
  }
}

export function toLatex(node: Node): string {
  return tex(node);
}

/* ------------------------------------------------------------------ *
 * Simplificación
 * ------------------------------------------------------------------ */

const isNum = (n: Node, value?: number): boolean =>
  n.kind === "num" && (value === undefined || n.value === value);

function flatten(node: Node, op: "+" | "-" | "*"): Node[] {
  if (node.kind === "bin" && node.op === op) return [...flatten(node.left, op), ...flatten(node.right, op)];
  return [node];
}

function rebuildSum(terms: Node[]): Node {
  if (terms.length === 0) return num(0);
  return terms.reduce((acc, term) => bin("+", acc, term));
}

function rebuildProduct(factors: Node[]): Node {
  if (factors.length === 0) return num(1);
  return factors.reduce((acc, factor) => bin("*", acc, factor));
}

function coeffRest(node: Node): { c: number; rest: Node | null } {
  if (node.kind === "num") return { c: node.value, rest: null };
  if (node.kind === "neg") {
    const inner = coeffRest(node.arg);
    return { c: -inner.c, rest: inner.rest };
  }
  if (node.kind === "bin" && node.op === "*") {
    let c = 1;
    const rest: Node[] = [];
    for (const f of flatten(node, "*")) {
      const part = coeffRest(f);
      c *= part.c;
      if (part.rest) rest.push(part.rest);
    }
    return { c, rest: rest.length ? rebuildProduct(rest) : null };
  }
  return { c: 1, rest: node };
}

export function simplify(node: Node): Node {
  switch (node.kind) {
    case "num":
    case "var":
    case "const":
      return node;
    case "neg": {
      const a = simplify(node.arg);
      if (a.kind === "num") return num(-a.value);
      if (a.kind === "neg") return a.arg;
      return neg(a);
    }
    case "call": {
      const a = simplify(node.arg);
      if (a.kind === "num") {
        const value = evaluate(call(node.fn, a));
        if (Number.isFinite(value) && Math.abs(value) < 1e-12) return num(0);
        if (node.fn === "exp") return call("exp", a);
      }
      return call(node.fn, a);
    }
    case "bin":
      return simplifyBin(node);
  }
}

function simplifyBin(node: Extract<Node, { kind: "bin" }>): Node {
  const left = simplify(node.left);
  const right = simplify(node.right);

  switch (node.op) {
    case "+": {
      if (isNum(left, 0)) return right;
      if (isNum(right, 0)) return left;
      const terms = [...flatten(left, "+"), ...flatten(right, "+")];
      return combineTerms(terms);
    }
    case "-": {
      if (isNum(right, 0)) return left;
      if (keyOf(left) === keyOf(right)) return num(0);
      const terms = [...flatten(left, "+"), ...flatten(neg(right), "+")];
      return combineTerms(terms);
    }
    case "*": {
      if (isNum(left, 0) || isNum(right, 0)) return num(0);
      if (isNum(left, 1)) return right;
      if (isNum(right, 1)) return left;
      if (isNum(left, -1)) return simplify(neg(right));
      if (isNum(right, -1)) return simplify(neg(left));
      const factors = [...flatten(left, "*"), ...flatten(right, "*")];
      let c = 1;
      const symbolic: Node[] = [];
      const powers = new Map<string, { base: Node; exp: number }>();
      const addPower = (base: Node, exp: number) => {
        const key = keyOf(base);
        const prev = powers.get(key);
        if (prev) prev.exp += exp;
        else powers.set(key, { base, exp });
      };
      for (const f of factors) {
        if (f.kind === "num") {
          c *= f.value;
        } else if (f.kind === "var") {
          addPower(f, 1);
        } else if (f.kind === "bin" && f.op === "^" && f.right.kind === "num" && Number.isInteger(f.right.value)) {
          addPower(f.left, f.right.value);
        } else {
          symbolic.push(f);
        }
      }
      for (const { base, exp } of powers.values()) {
        if (exp === 0) continue;
        if (exp === 1) symbolic.push(base);
        else symbolic.push(bin("^", base, num(exp)));
      }
      if (c === 0) return num(0);
      const ordered = c === 1 ? symbolic : [num(c), ...symbolic];
      if (ordered.length === 0) return num(1);
      if (ordered.length === 1) return ordered[0];
      return rebuildProduct(ordered);
    }
    case "/": {
      if (right.kind === "num" && right.value === 1) return left;
      if (left.kind === "num" && left.value === 0) return num(0);
      if (keyOf(left) === keyOf(right)) return num(1);
      if (left.kind === "num" && right.kind === "num" && right.value !== 0) {
        const q = left.value / right.value;
        if (Number.isInteger(q)) return num(q);
      }
      return bin("/", left, right);
    }
    case "^": {
      if (right.kind === "num" && right.value === 0) return num(1);
      if (right.kind === "num" && right.value === 1) return left;
      if (left.kind === "num" && left.value === 1) return num(1);
      if (left.kind === "num" && left.value === 0 && right.kind === "num" && right.value > 0) return num(0);
      if (left.kind === "num" && right.kind === "num" && Number.isInteger(right.value) && Math.abs(right.value) <= 12) {
        return num(Math.pow(left.value, right.value));
      }
      if (left.kind === "bin" && left.op === "^" && left.right.kind === "num" && right.kind === "num") {
        return bin("^", left.left, num(left.right.value * right.value));
      }
      return bin("^", left, right);
    }
  }
}

function combineTerms(terms: Node[]): Node {
  const groups = new Map<string, { c: number; rest: Node | null }>();
  const order: string[] = [];
  for (const term of terms) {
    const { c, rest } = coeffRest(term);
    if (c === 0) continue;
    const key = rest ? keyOf(rest) : "#const";
    if (!groups.has(key)) {
      groups.set(key, { c, rest });
      order.push(key);
    } else {
      groups.get(key)!.c += c;
    }
  }
  const out: Node[] = [];
  for (const key of order) {
    const { c, rest } = groups.get(key)!;
    if (Math.abs(c) < 1e-12) continue;
    if (!rest) out.push(num(c));
    else if (c === 1) out.push(rest);
    else if (c === -1) out.push(neg(rest));
    else out.push(bin("*", num(c), rest));
  }
  if (out.length === 0) return num(0);
  return rebuildSum(out);
}

/* ------------------------------------------------------------------ *
 * Derivadas con traza pedagógica
 * ------------------------------------------------------------------ */

export type DerivativeResult = { result: Node; steps: Step[]; latex: string };

type Ctx = { variable: string; steps: Step[] };

function pushStep(ctx: Ctx, step: Step) {
  ctx.steps.push({ depth: 0, ...step });
}

const dtex = (n: Node) => `\\frac{d}{d${"x"}}\\left[${toLatex(n)}\\right]`;

function derive(n: Node, ctx: Ctx, depth: number): Node {
  const vn = ctx.variable;
  const at = (node: Node) => `\\frac{d}{d${vn}}\\left[${toLatex(node)}\\right]`;
  const d = (child: Node) => derive(child, ctx, depth + 1);

  switch (n.kind) {
    case "num":
      pushStep(ctx, {
        title: "Regla de la constante",
        tex: `${at(n)} = 0`,
        text: "La derivada de una constante es cero.",
        depth,
      });
      return num(0);

    case "const":
      pushStep(ctx, {
        title: "Constante",
        tex: `${at(n)} = 0`,
        text: `${toLatex(n)} es una constante, por lo tanto su derivada es 0.`,
        depth,
      });
      return num(0);

    case "var":
      if (n.name === vn) {
        pushStep(ctx, {
          title: "Derivada de la variable",
          tex: `${at(n)} = 1`,
          text: `La derivada de ${vn} respecto a ${vn} es 1.`,
          depth,
        });
        return num(1);
      }
      pushStep(ctx, {
        title: "Otra variable",
        tex: `${at(n)} = 0`,
        text: `${n.name} se comporta como constante respecto a ${vn}.`,
        depth,
      });
      return num(0);

    case "neg": {
      const inner = d(n.arg);
      pushStep(ctx, {
        title: "Regla del signo",
        tex: `${at(n)} = -\\left(${toLatex(inner)}\\right)`,
        text: "El signo negativo sale de la derivada.",
        depth,
      });
      return simplify(neg(inner));
    }

    case "bin": {
      if (n.op === "+" || n.op === "-") {
        const l = d(n.left);
        const r = d(n.right);
        const result = simplify(n.op === "+" ? bin("+", l, r) : bin("-", l, r));
        pushStep(ctx, {
          title: n.op === "+" ? "Regla de la suma" : "Regla de la resta",
          tex: `${at(n)} = ${toLatex(l)} ${n.op} ${toLatex(r)}`,
          text: `Derivamos cada término por separado: (${toLatex(n.left)})' ${n.op} (${toLatex(n.right)})'.`,
          depth,
        });
        return result;
      }

      if (n.op === "*") {
        pushStep(ctx, {
          title: "Regla del producto",
          tex: `(u\\,v)' = u'v + u\\,v'`,
          text: `Tomamos u = ${toLatex(n.left)} y v = ${toLatex(n.right)}.`,
          depth,
        });
        const du = d(n.left);
        const dv = d(n.right);
        const result = simplify(bin("+", bin("*", du, n.right), bin("*", n.left, dv)));
        pushStep(ctx, {
          title: "Producto derivado",
          tex: `${at(n)} = \\left(${toLatex(du)}\\right)\\left(${toLatex(n.right)}\\right) + \\left(${toLatex(n.left)}\\right)\\left(${toLatex(dv)}\\right)`,
          text: "Sustituimos u, v, u' y v' en la fórmula del producto.",
          depth,
        });
        return result;
      }

      if (n.op === "/") {
        pushStep(ctx, {
          title: "Regla del cociente",
          tex: `\\left(\\frac{u}{v}\\right)' = \\frac{u'v - u\\,v'}{v^{2}}`,
          text: `Con u = ${toLatex(n.left)} y v = ${toLatex(n.right)}.`,
          depth,
        });
        const du = d(n.left);
        const dv = d(n.right);
        const result = simplify(bin("/", bin("-", bin("*", du, n.right), bin("*", n.left, dv)), bin("^", n.right, num(2))));
        pushStep(ctx, {
          title: "Cociente derivado",
          tex: `${at(n)} = \\frac{\\left(${toLatex(du)}\\right)\\left(${toLatex(n.right)}\\right) - \\left(${toLatex(n.left)}\\right)\\left(${toLatex(dv)}\\right)}{\\left(${toLatex(n.right)}\\right)^{2}}`,
          depth,
        });
        return result;
      }

      // Potencia
      const baseIsVar = n.left.kind === "var" && n.left.name === vn;
      const expConst = n.right.kind === "num" || varsOf(n.right).every((x) => x !== vn);
      if (expConst) {
        const exponent = evaluate(n.right, {});
        pushStep(ctx, {
          title: "Regla de la potencia (con cadena)",
          tex: `\\frac{d}{d${vn}}\\left[u^{n}\\right] = n\\,u^{n-1}\\,u'`,
          text: `Aquí u = ${toLatex(n.left)} y n = ${toLatex(n.right)}.`,
          depth,
        });
        const du = baseIsVar ? num(1) : d(n.left);
        const result = simplify(bin("*", bin("*", num(exponent), bin("^", n.left, num(exponent - 1))), du));
        pushStep(ctx, {
          title: "Potencia aplicada",
          tex: `${at(n)} = ${toLatex(num(exponent))}\\left(${toLatex(n.left)}\\right)^{${toLatex(num(exponent - 1))}}\\cdot\\left(${toLatex(du)}\\right)`,
          depth,
        });
        return result;
      }
      if (baseIsVar) {
        const exponent = n.right;
        pushStep(ctx, {
          title: "Derivada exponencial",
          tex: `\\frac{d}{d${vn}}\\left[a^{u}\\right] = a^{u}\\ln(a)\\,u'`,
          depth,
        });
        const du = d(exponent);
        return simplify(bin("*", bin("*", bin("^", n.left, exponent), call("ln", n.left)), du));
      }
      // Caso general u^v = e^{v ln u}
      const u = n.left;
      const w = n.right;
      const rewritten = call("exp", bin("*", w, call("ln", u)));
      pushStep(ctx, {
        title: "Potencia variable",
        tex: `${toLatex(n)} = e^{${toLatex(w)}\\ln\\left(${toLatex(u)}\\right)}`,
        text: "Reescribimos la potencia con base e para poder derivar.",
        depth,
      });
      return derive(rewritten, ctx, depth + 1);
    }

    case "call": {
      const arg = n.arg;
      const du = arg.kind === "var" && arg.name === vn ? num(1) : d(arg);
      const [outer, label] = outerDerivative(n.fn, arg);
      pushStep(ctx, {
        title: `Derivada de ${label} (cadena)`,
        tex: `\\frac{d}{d${vn}}\\left[${toLatex(n)}\\right] = \\left(${toLatex(outer)}\\right)\\cdot\\left(${toLatex(du)}\\right)`,
        text: `Derivamos la función externa y multiplicamos por la derivada del argumento ${toLatex(arg)}.`,
        depth,
      });
      return simplify(bin("*", outer, du));
    }
  }
}

function outerDerivative(fn: string, u: Node): [Node, string] {
  const inner = u;
  switch (fn) {
    case "sin":
      return [call("cos", inner), "seno"];
    case "cos":
      return [neg(call("sin", inner)), "coseno"];
    case "tan":
      return [bin("/", num(1), bin("^", call("cos", inner), num(2))), "tangente"];
    case "sec":
      return [bin("*", call("sec", inner), call("tan", inner)), "secante"];
    case "csc":
      return [neg(bin("*", call("csc", inner), call("cot", inner))), "cosecante"];
    case "cot":
      return [neg(bin("/", num(1), bin("^", call("sin", inner), num(2)))), "cotangente"];
    case "asin":
      return [bin("/", num(1), call("sqrt", bin("-", num(1), bin("^", inner, num(2))))), "arcoseno"];
    case "acos":
      return [neg(bin("/", num(1), call("sqrt", bin("-", num(1), bin("^", inner, num(2)))))), "arcocoseno"];
    case "atan":
      return [bin("/", num(1), bin("+", num(1), bin("^", inner, num(2)))), "arcotangente"];
    case "sinh":
      return [call("cosh", inner), "seno hiperbólico"];
    case "cosh":
      return [call("sinh", inner), "coseno hiperbólico"];
    case "tanh":
      return [bin("/", num(1), bin("^", call("cosh", inner), num(2))), "tangente hiperbólica"];
    case "exp":
      return [call("exp", inner), "exponencial"];
    case "ln":
      return [bin("/", num(1), inner), "logaritmo natural"];
    case "log":
      return [bin("/", num(1), bin("*", inner, call("ln", num(10)))), "logaritmo decimal"];
    case "sqrt":
      return [bin("/", num(1), bin("*", num(2), call("sqrt", inner))), "raíz cuadrada"];
    case "abs":
      return [bin("/", inner, call("abs", inner)), "valor absoluto"];
    default:
      return [num(NaN), fn];
  }
}

export function diffWithTrace(node: Node, variable = "x"): DerivativeResult {
  const ctx: Ctx = { variable, steps: [] };
  pushStep(ctx, {
    title: "Planteamos la derivada",
    tex: `\\frac{d}{d${variable}}\\left[${toLatex(node)}\\right]`,
    text: `Derivaremos respecto a ${variable} identificando cada regla que aparece.`,
    depth: 0,
  });
  const raw = derive(node, ctx, 1);
  const result = simplify(raw);
  pushStep(ctx, {
    title: "Resultado simplificado",
    tex: `\\frac{d}{d${variable}}\\left[${toLatex(node)}\\right] = ${toLatex(result)}`,
    text: "Agrupamos términos semejantes y escribimos la respuesta final.",
    depth: 0,
  });
  return { result, steps: ctx.steps, latex: toLatex(result) };
}

export function diff(node: Node, variable = "x"): Node {
  return diffWithTrace(node, variable).result;
}

export { dtex };
