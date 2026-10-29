import { useState } from "react";
import type { Block } from "../content/types";
import { Exercise } from "./Exercise";
import { Graph } from "./Graph";
import { Math } from "./Math";
import { RichText } from "./RichText";
import { Steps } from "./Steps";
import { LabView } from "../labs/LabView";

const TONE_ICON: Record<string, string> = { info: "i", key: "★", warn: "!", ok: "✓" };

function NoteBlock({ body, title, tone = "info" }: { body: string; title?: string; tone?: string }) {
  return (
    <div className={`callout ${tone} block`}>
      <span className="co-icon" aria-hidden="true">
        {TONE_ICON[tone] ?? "i"}
      </span>
      <div>
        {title ? <b className="co-title">{title}</b> : null}
        <RichText body={body} />
      </div>
    </div>
  );
}

function Checklist({ items }: { items: string[] }) {
  const [done, setDone] = useState<boolean[]>(() => items.map(() => false));
  const total = items.length;
  const count = done.filter(Boolean).length;
  return (
    <div className="card card-pad block">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <strong style={{ fontSize: 14 }}>Antes de avanzar</strong>
        <span className={`badge ${count === total ? "ok" : ""}`} style={{ marginLeft: "auto" }}>
          {count}/{total}
        </span>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {items.map((item, i) => (
          <label key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={done[i]}
              onChange={() =>
                setDone((prev) => {
                  const next = [...prev];
                  next[i] = !next[i];
                  return next;
                })
              }
              style={{ marginTop: 4, accentColor: "var(--indigo)" }}
            />
            <span style={{ color: done[i] ? "var(--muted)" : "var(--ink-2)", textDecoration: done[i] ? "line-through" : "none" }}>
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function BlockView({ block, index }: { block: Block; index: number }) {
  const anchor = `bloque-${index}`;
  switch (block.type) {
    case "text":
      return (
        <div className="block" id={anchor}>
          <RichText body={block.body} />
        </div>
      );
    case "math":
      return (
        <div className="formula-card block" id={anchor}>
          <Math tex={block.tex} block />
          {block.label ? <div className="small muted" style={{ marginTop: 6 }}>{block.label}</div> : null}
        </div>
      );
    case "note":
      return (
        <div id={anchor}>
          <NoteBlock body={block.body} title={block.title} tone={block.tone} />
        </div>
      );
    case "steps":
      return (
        <div className="block" id={anchor}>
          <Steps steps={block.steps} title={block.title} />
        </div>
      );
    case "graph":
      return (
        <div id={anchor}>
          <Graph spec={block.spec} />
        </div>
      );
    case "table":
      return (
        <div className="block" id={anchor}>
          {block.title ? <div className="small muted" style={{ marginBottom: 6 }}>{block.title}</div> : null}
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  {block.table.head.map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.table.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    case "example":
      return (
        <div className="example block" id={anchor}>
          <div className="example-head">
            <h4>{block.title}</h4>
            <span className="badge amber">{block.tag ?? "Ejemplo"}</span>
          </div>
          <div className="example-problem">
            <RichText body={block.problem} />
          </div>
          <div className="example-body">
            <Steps steps={block.steps} title="Desarrollo completo" />
          </div>
          {block.answer ? (
            <div className="callout ok" style={{ margin: "0 16px 16px", borderRadius: 9 }}>
              <span className="co-icon">✓</span>
              <div>
                <b className="co-title">Resultado</b>
                <RichText body={block.answer} />
              </div>
            </div>
          ) : null}
        </div>
      );
    case "exercise":
      return (
        <div id={anchor}>
          <Exercise exercise={block.exercise} />
        </div>
      );
    case "lab":
      return (
        <div className="block" id={anchor}>
          <LabView kind={block.lab} title={block.title} />
        </div>
      );
    case "checklist":
      return (
        <div id={anchor}>
          <Checklist items={block.items} />
        </div>
      );
    default:
      return null;
  }
}
