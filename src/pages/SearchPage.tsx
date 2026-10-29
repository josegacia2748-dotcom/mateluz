import { useMemo } from "react";
import { Footer } from "../components/Layout";
import { search } from "../content";
import { href, useRoute } from "../lib/router";
import type { ReactNode } from "react";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(text: string, query: string): ReactNode[] {
  const terms = query.split(/\s+/).filter((t) => t.length > 1);
  if (!terms.length) return [text];
  const regex = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  return text.split(regex).map((part, i) =>
    regex.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>,
  );
}

export function SearchPage() {
  const route = useRoute();
  const query = route.query.get("q") ?? "";
  const results = useMemo(() => search(query), [query]);

  return (
    <>
      <div className="page-head">
        <div className="eyebrow">Buscador</div>
        <h1>{query ? `Resultados para «${query}»` : "Buscar en MateLUZ"}</h1>
        <p className="lead">
          Buscá por tema, teorema, fórmula o palabra clave. El índice cubre títulos, objetivos, ejemplos y ejercicios.
        </p>
      </div>

      {!query ? (
        <div className="card card-pad">
          <p style={{ marginTop: 0 }}>Probá con alguno de estos términos:</p>
          <div className="chips">
            {["límite", "derivada", "integral", "matriz", "cónica", "serie", "optimización", "continuidad", "Gauss"].map((term) => (
              <a key={term} className="chip" href={href(`/buscar?q=${encodeURIComponent(term)}`)}>{term}</a>
            ))}
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="empty">
          <p>No encontramos coincidencias para <strong>{query}</strong>.</p>
          <p className="small">Probá con una palabra más corta o revisá la ortografía.</p>
        </div>
      ) : (
        <>
          <p className="small muted">{results.length} {results.length === 1 ? "resultado" : "resultados"}</p>
          <div className="search-results">
            {results.map((hit) => (
              <a key={`${hit.module.id}-${hit.lesson.id}`} className="search-hit" href={href(`/leccion/${hit.module.id}/${hit.lesson.id}`)}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <span className="badge indigo">{hit.module.short}</span>
                  <strong style={{ fontSize: 15 }}>{highlight(hit.lesson.title, query)}</strong>
                  <span className="badge" style={{ marginLeft: "auto" }}>{hit.lesson.minutes} min</span>
                </div>
                <div className="small muted">{highlight(hit.snippet, query)}</div>
              </a>
            ))}
          </div>
        </>
      )}
      <Footer />
    </>
  );
}
