import type { Step } from "./types";
import {
  type Frac,
  ZERO,
  ONE,
  add,
  div,
  eq,
  frac,
  isZero,
  mul,
  neg,
  parseFrac,
  sign,
  sub,
  toLatex as fracLatex,
} from "./fraction";

export type Matrix = Frac[][];

/* ------------------------------------------------------------------ *
 * Construcción y formato
 * ------------------------------------------------------------------ */

export function parseMatrix(text: string): Matrix {
  const cleaned = text
    .replace(/[\[\]{}()]/g, "")
    .replace(/\r/g, "")
    .trim();
  const rows = cleaned.split(/[;\n]+/).map((r) => r.trim()).filter(Boolean);
  const matrix = rows.map((row) =>
    row.split(/[,\s]+/).filter(Boolean).map((cell) => {
      const value = parseFrac(cell);
      if (!value) throw new Error(`Entrada no válida en la matriz: «${cell}»`);
      return value;
    }),
  );
  const cols = matrix[0]?.length ?? 0;
  if (!cols || matrix.some((r) => r.length !== cols)) {
    throw new Error("Todas las filas deben tener la misma cantidad de columnas");
  }
  return matrix;
}

export function fromNumbers(rows: number[][]): Matrix {
  return rows.map((row) => row.map((n) => frac(n)));
}

export const clone = (m: Matrix): Matrix => m.map((r) => r.map((x) => ({ ...x })));

export const rows = (m: Matrix) => m.length;
export const cols = (m: Matrix) => m[0]?.length ?? 0;

export function matrixToLatex(m: Matrix, barAfter?: number): string {
  const n = cols(m);
  const spec = Array.from({ length: n }, (_, i) => (barAfter !== undefined && i === barAfter ? "|" : "c")).join("");
  const body = m.map((row) => row.map((x) => fracLatex(x)).join(" & ")).join(" \\\\ ");
  return `\\left(\\begin{array}{${spec}} ${body} \\end{array}\\right)`;
}

export function vectorToLatex(v: Frac[]): string {
  return `\\left(\\begin{array}{c} ${v.map((x) => fracLatex(x)).join(" \\\\ ")} \\end{array}\\right)`;
}

export function identity(n: number): Matrix {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? ONE : ZERO)));
}

export function transpose(m: Matrix): Matrix {
  return Array.from({ length: cols(m) }, (_, j) => m.map((row) => row[j]));
}

export function multiply(a: Matrix, b: Matrix): Matrix {
  if (cols(a) !== rows(b)) throw new Error("Dimensiones incompatibles para multiplicar");
  return Array.from({ length: rows(a) }, (_, i) =>
    Array.from({ length: cols(b) }, (_, j) =>
      a[i].reduce((acc, _, k) => add(acc, mul(a[i][k], b[k][j])), ZERO),
    ),
  );
}

/* ------------------------------------------------------------------ *
 * Determinante con pasos
 * ------------------------------------------------------------------ */

export function determinant(m: Matrix, steps: Step[] = [], depth = 0): Frac {
  const n = rows(m);
  if (n !== cols(m)) throw new Error("El determinante solo existe para matrices cuadradas");
  if (n === 1) return m[0][0];
  if (n === 2) {
    const value = sub(mul(m[0][0], m[1][1]), mul(m[0][1], m[1][0]));
    steps.push({
      title: "Determinante 2×2",
      tex: `\\det ${matrixToLatex(m)} = (${fracLatex(m[0][0])})(${fracLatex(m[1][1])}) - (${fracLatex(m[0][1])})(${fracLatex(m[1][0])}) = ${fracLatex(value)}`,
      text: "Producto de la diagonal principal menos producto de la diagonal secundaria.",
      depth,
    });
    return value;
  }
  steps.push({
    title: `Desarrollo por cofactores (fila 1, ${n}×${n})`,
    tex: `\\det A = \\sum_{j=1}^{${n}} (-1)^{1+j}\\,a_{1j}\\,M_{1j}`,
    text: "Expandimos a lo largo de la primera fila; cada menor se obtiene eliminando su fila y su columna.",
    depth,
  });
  let total = ZERO;
  for (let j = 0; j < n; j++) {
    const minor = m.slice(1).map((row) => row.filter((_, k) => k !== j));
    const minorValue = determinant(minor, steps, depth + 1);
    const cofactor = mul(m[0][j], minorValue);
    const term = j % 2 === 0 ? cofactor : neg(cofactor);
    steps.push({
      title: `Término j = ${j + 1}`,
      tex: `${j % 2 === 0 ? "+" : "-"}\\left(${fracLatex(m[0][j])}\\right)\\det ${matrixToLatex(minor)} = ${fracLatex(term)}`,
      depth: depth + 1,
    });
    total = add(total, term);
  }
  steps.push({
    title: "Sumamos los cofactores",
    tex: `\\det A = ${fracLatex(total)}`,
    depth,
  });
  return total;
}

export function detValue(m: Matrix): number {
  const value = determinant(m);
  return Number(value.n) / Number(value.d);
}

/* ------------------------------------------------------------------ *
 * Gauss-Jordan (RREF) con pasos
 * ------------------------------------------------------------------ */

export type RrefResult = {
  matrix: Matrix;
  steps: Step[];
  rank: number;
  pivots: number[];
};

export function rref(input: Matrix, collect = true): RrefResult {
  const m = clone(input);
  const steps: Step[] = [];
  const nRows = rows(m);
  const nCols = cols(m);
  const pivots: number[] = [];
  let row = 0;

  if (collect) {
    steps.push({
      title: "Matriz inicial",
      tex: matrixToLatex(m),
      text: "Trabajaremos con operaciones elementales de fila hasta llegar a la forma escalonada reducida.",
      depth: 0,
    });
  }

  for (let col = 0; col < nCols && row < nRows; col++) {
    let pivot = -1;
    for (let i = row; i < nRows; i++) {
      if (!isZero(m[i][col])) {
        pivot = i;
        break;
      }
    }
    if (pivot === -1) continue;

    if (pivot !== row) {
      [m[row], m[pivot]] = [m[pivot], m[row]];
      if (collect) {
        steps.push({
          title: `Intercambiamos F${row + 1} ↔ F${pivot + 1}`,
          tex: matrixToLatex(m),
          text: "Buscamos que el pivote quede en la diagonal.",
          depth: 1,
        });
      }
    }

    const pv = m[row][col];
    if (!eq(pv, ONE)) {
      for (let j = 0; j < nCols; j++) m[row][j] = div(m[row][j], pv);
      if (collect) {
        steps.push({
          title: `Normalizamos F${row + 1}`,
          tex: `F_{${row + 1}} \\leftarrow \\frac{1}{${fracLatex(pv)}}F_{${row + 1}} \\quad\\Rightarrow\\quad ${matrixToLatex(m)}`,
          text: "Dividimos la fila entre el pivote para obtener un 1.",
          depth: 1,
        });
      }
    }

    for (let i = 0; i < nRows; i++) {
      if (i === row) continue;
      const factor = m[i][col];
      if (isZero(factor)) continue;
      for (let j = 0; j < nCols; j++) {
        m[i][j] = sub(m[i][j], mul(factor, m[row][j]));
      }
      if (collect) {
        steps.push({
          title: `Eliminamos en F${i + 1}`,
          tex: `F_{${i + 1}} \\leftarrow F_{${i + 1}} - \\left(${fracLatex(factor)}\\right)F_{${row + 1}} \\quad\\Rightarrow\\quad ${matrixToLatex(m)}`,
          text: "Hacemos cero el resto de la columna del pivote.",
          depth: 1,
        });
      }
    }

    pivots.push(col);
    row++;
  }

  const rank = pivots.length;
  if (collect) {
    steps.push({
      title: "Forma escalonada reducida",
      tex: matrixToLatex(m),
      text: `Rango = ${rank}. Los pivotes están en las columnas ${pivots.map((p) => p + 1).join(", ") || "—"}.`,
      depth: 0,
    });
  }
  return { matrix: m, steps, rank, pivots };
}

export function rank(m: Matrix): number {
  return rref(m, false).rank;
}

/* ------------------------------------------------------------------ *
 * Sistemas lineales
 * ------------------------------------------------------------------ */

export type SolveResult = {
  type: "unique" | "infinite" | "none";
  solution: Frac[] | null;
  steps: Step[];
  latex: string;
  freeVariables: number[];
};

export function solveSystem(A: Matrix, b: Frac[]): SolveResult {
  if (rows(A) !== b.length) throw new Error("El vector b debe tener tantas componentes como filas tiene A");
  const n = cols(A);
  const augmented: Matrix = A.map((row, i) => [...row.map((x) => ({ ...x })), { ...b[i] }]);
  const steps: Step[] = [
    {
      title: "Sistema aumentado",
      tex: matrixToLatex(augmented, n - 1),
      text: "Escribimos el sistema como una matriz aumentada [A | b].",
      depth: 0,
    },
  ];
  const reduced = rref(augmented, true);
  steps.push(...reduced.steps.map((s) => ({ ...s, depth: (s.depth ?? 0) + 1 })));

  const pivotInLast = reduced.pivots.includes(n);
  if (pivotInLast) {
    steps.push({
      title: "Sistema incompatible",
      tex: "\\text{La última columna tiene pivote}",
      text: "Aparece una fila del tipo 0 = k con k ≠ 0: el sistema no tiene solución.",
      depth: 0,
    });
    return { type: "none", solution: null, steps, latex: "\\text{sin solución}", freeVariables: [] };
  }

  const pivotCols = reduced.pivots.filter((p) => p < n);
  const freeVariables = Array.from({ length: n }, (_, i) => i).filter((i) => !pivotCols.includes(i));

  if (freeVariables.length > 0) {
    steps.push({
      title: "Infinitas soluciones",
      tex: `\\text{Variables libres: } ${freeVariables.map((i) => `x_{${i + 1}}`).join(", ")}`,
      text: "Hay menos pivotes que incógnitas: el sistema es compatible indeterminado.",
      depth: 0,
    });
    const solution = Array.from({ length: n }, () => ZERO);
    pivotCols.forEach((col, i) => {
      solution[col] = reduced.matrix[i][n];
    });
    return {
      type: "infinite",
      solution,
      steps,
      latex: "\\text{infinitas soluciones}",
      freeVariables,
    };
  }

  const solution = pivotCols.map((_, i) => reduced.matrix[i][n]);
  steps.push({
    title: "Solución única",
    tex: `\\left(${solution.map((x, i) => `x_{${i + 1}} = ${fracLatex(x)}`).join(", \\; ")}\\right)`,
    text: "Cada incógnita queda determinada por la forma escalonada reducida.",
    depth: 0,
  });
  return {
    type: "unique",
    solution,
    steps,
    latex: vectorToLatex(solution),
    freeVariables: [],
  };
}

/* ------------------------------------------------------------------ *
 * Inversa
 * ------------------------------------------------------------------ */

export type InverseResult = { inverse: Matrix | null; steps: Step[] };

export function inverse(m: Matrix): InverseResult {
  const n = rows(m);
  if (n !== cols(m)) throw new Error("Solo las matrices cuadradas pueden tener inversa");
  const augmented: Matrix = m.map((row, i) => [...row.map((x) => ({ ...x })), ...identity(n)[i]]);
  const steps: Step[] = [
    {
      title: "Matriz ampliada [A | I]",
      tex: matrixToLatex(augmented, n - 1),
      text: "Aplicaremos Gauss-Jordan: si la mitad izquierda se convierte en I, la derecha será A⁻¹.",
      depth: 0,
    },
  ];
  const reduced = rref(augmented, true);
  steps.push(...reduced.steps.map((s) => ({ ...s, depth: (s.depth ?? 0) + 1 })));

  const left = reduced.matrix.map((row) => row.slice(0, n));
  const isIdentity = left.every((row, i) => row.every((x, j) => eq(x, i === j ? ONE : ZERO)));
  if (!isIdentity) {
    steps.push({
      title: "No existe inversa",
      tex: `\\det A = 0`,
      text: "La mitad izquierda no pudo convertirse en la identidad: la matriz es singular.",
      depth: 0,
    });
    return { inverse: null, steps };
  }

  const inv = reduced.matrix.map((row) => row.slice(n));
  steps.push({
    title: "Matriz inversa",
    tex: `A^{-1} = ${matrixToLatex(inv)}`,
    depth: 0,
  });
  return { inverse: inv, steps };
}

/* ------------------------------------------------------------------ *
 * Utilidades didácticas
 * ------------------------------------------------------------------ */

export function determinantGauss(m: Matrix): { value: Frac; steps: Step[] } {
  const a = clone(m);
  const n = rows(a);
  const steps: Step[] = [];
  let factor = ONE;
  steps.push({ title: "Método de Gauss", tex: matrixToLatex(a), text: "Triangulamos la matriz; el determinante es el producto de la diagonal por el factor de los intercambios.", depth: 0 });
  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && isZero(a[pivot][col])) pivot++;
    if (pivot === n) {
      steps.push({ title: "Columna sin pivote", tex: `\\det A = 0`, depth: 1 });
      return { value: ZERO, steps };
    }
    if (pivot !== col) {
      [a[col], a[pivot]] = [a[pivot], a[col]];
      factor = neg(factor);
      steps.push({ title: `Intercambio F${col + 1} ↔ F${pivot + 1}`, tex: matrixToLatex(a), text: "Cada intercambio cambia el signo del determinante.", depth: 1 });
    }
    for (let i = col + 1; i < n; i++) {
      if (isZero(a[i][col])) continue;
      const k = div(a[i][col], a[col][col]);
      for (let j = col; j < n; j++) a[i][j] = sub(a[i][j], mul(k, a[col][j]));
      steps.push({ title: `F${i + 1} ← F${i + 1} − (${fracLatex(k)})F${col + 1}`, tex: matrixToLatex(a), depth: 1 });
    }
  }
  let product = factor;
  for (let i = 0; i < n; i++) product = mul(product, a[i][i]);
  steps.push({ title: "Producto de la diagonal", tex: `\\det A = ${fracLatex(product)}`, depth: 0 });
  return { value: product, steps };
}

export { fracLatex, sign };
