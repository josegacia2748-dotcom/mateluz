import type { ReactNode } from "react";
import { Math } from "./Math";

const TOKEN = /(\$[^$]+\$|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;

function inline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let index = 0;
  for (const match of text.matchAll(TOKEN)) {
    const start = match.index ?? 0;
    if (start > last) out.push(text.slice(last, start));
    const token = match[0];
    const key = `${keyPrefix}-${index++}`;
    if (token.startsWith("$") && token.endsWith("$") && token.length > 2) {
      out.push(<Math key={key} tex={token.slice(1, -1)} />);
    } else if (token.startsWith("**")) {
      out.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      out.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("*")) {
      out.push(<em key={key}>{token.slice(1, -1)}</em>);
    } else {
      out.push(token);
    }
    last = start + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Texto enriquecido: párrafos, listas simples, negritas, cursivas, código y $LaTeX$. */
export function RichText({ body, className }: { body: string; className?: string }) {
  const chunks = body.split(/\n{2,}/);
  return (
    <div className={`prose${className ? ` ${className}` : ""}`}>
      {chunks.map((chunk, ci) => {
        const lines = chunk.split("\n");
        if (lines.every((line) => line.trim().startsWith("- "))) {
          return (
            <ul key={ci}>
              {lines.map((line, li) => (
                <li key={li}>{inline(line.trim().slice(2), `${ci}-${li}`)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={ci}>
            {lines.map((line, li) => (
              <span key={li}>
                {inline(line, `${ci}-${li}`)}
                {li < lines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
