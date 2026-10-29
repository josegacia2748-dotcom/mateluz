import { useState } from "react";
import type { Step } from "../engine/types";
import { Math as Tex } from "./Math";
import { RichText } from "./RichText";

type Props = {
  steps: Step[];
  title?: string;
  /** Si es true, empieza mostrando solo el primer paso. */
  guided?: boolean;
};

export function Steps({ steps, title = "Resolución paso a paso", guided = false }: Props) {
  const [visible, setVisible] = useState(guided ? 1 : steps.length);
  const [isGuided, setIsGuided] = useState(guided);
  const done = visible >= steps.length;

  const restart = () => {
    setIsGuided(true);
    setVisible(1);
  };

  let counter = 0;

  return (
    <div className="steps">
      <div className="steps-head">
        <span aria-hidden="true">✎</span>
        <span>{title}</span>
        <span className="badge">
          {visible}/{steps.length} pasos
        </span>
      </div>
      <div className="step-progress" aria-hidden="true">
        <i style={{ width: `${(visible / Math.max(1, steps.length)) * 100}%` }} />
      </div>
      <ol className="steps-list">
        {steps.slice(0, visible).map((step, i) => {
          const top = !step.depth;
          if (top) counter += 1;
          return (
            <li key={i} className="step-item" data-depth={Math.min(step.depth ?? 0, 3)}>
              <span className="step-dot" aria-hidden="true">
                {top ? counter : "↳"}
              </span>
              <div>
                <div className="step-title">{step.title}</div>
                {step.tex ? (
                  <div className="step-tex">
                    <Tex tex={step.tex} block />
                  </div>
                ) : null}
                {step.text ? <div className="step-text">{step.text}</div> : null}
              </div>
            </li>
          );
        })}
      </ol>
      {!done ? (
        <div className="step-hidden">
          <strong>{steps.length - visible}</strong>{" "}
          {steps.length - visible === 1 ? "paso pendiente" : "pasos pendientes"}. Intentá anticipar el siguiente antes de revelarlo.
        </div>
      ) : null}
      <div className="steps-actions">
        {!done ? (
          <>
            <button type="button" className="btn primary small" onClick={() => setVisible((v) => Math.min(steps.length, v + 1))}>
              Siguiente paso →
            </button>
            <button type="button" className="btn small" onClick={() => setVisible(steps.length)}>
              Mostrar todos
            </button>
          </>
        ) : (
          <button type="button" className="btn small" onClick={restart}>
            ↺ Resolver paso a paso
          </button>
        )}
        {isGuided && done ? <span className="small muted">Modo guiado completado</span> : null}
      </div>
    </div>
  );
}

export function StepList({ steps }: { steps: Step[] }) {
  return <Steps steps={steps} />;
}

export function SolutionBody({ steps, answer }: { steps: Step[]; answer?: string }) {
  return (
    <div>
      <Steps steps={steps} guided />
      {answer ? (
        <div className="feedback ok" style={{ marginTop: 12 }}>
          <strong>Respuesta:</strong>
          <span>
            <RichText body={answer} />
          </span>
        </div>
      ) : null}
    </div>
  );
}
