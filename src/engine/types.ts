export type Step = {
  /** Título corto de la acción matemática. */
  title: string;
  /** Expresión LaTeX (opcional). */
  tex?: string;
  /** Explicación en lenguaje natural (opcional). */
  text?: string;
  /** Nivel de anidamiento para mostrar sub-pasos. */
  depth?: number;
};

export type Table = { head: string[]; rows: string[][] };
