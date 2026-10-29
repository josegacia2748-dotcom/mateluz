import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

type Props = {
  tex: string;
  block?: boolean;
  className?: string;
};

/** Renderiza LaTeX con KaTeX. Nunca lanza: si hay un error, muestra el texto. */
export function Math({ tex, block = false, className }: Props) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, {
        displayMode: block,
        throwOnError: false,
        strict: false,
        trust: false,
        output: "html",
      });
    } catch {
      return "";
    }
  }, [tex, block]);

  if (!html) {
    return <code className={className}>{tex}</code>;
  }

  return (
    <span
      className={`${block ? "math-block" : "math-inline"}${className ? ` ${className}` : ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
