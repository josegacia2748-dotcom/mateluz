import { useState } from "react";
import type { ExerciseSpec } from "../content/types";
import { progressStore, useProgress } from "../lib/progress";
import { RichText } from "./RichText";
import { Steps } from "./Steps";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export function Exercise({ exercise }: { exercise: ExerciseSpec }) {
  const progress = useProgress();
  const previous = progress.exercises[exercise.id];
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const hasChoices = !!exercise.choices?.length;
  const correct = hasChoices && selected !== null && selected === exercise.correct;

  const check = () => {
    if (selected === null) return;
    setChecked(true);
    progressStore.setExercise(exercise.id, selected === exercise.correct ? "ok" : "review");
  };

  return (
    <section className="exercise block" aria-label="Ejercicio">
      <div className="exercise-head">
        <span aria-hidden="true">✎</span>
        <h4>Ejercicio</h4>
        {previous === "ok" ? <span className="badge ok" style={{ marginLeft: "auto" }}>✓ resuelto</span> : null}
        {previous === "review" ? <span className="badge amber" style={{ marginLeft: "auto" }}>para repasar</span> : null}
      </div>
      <div className="exercise-body">
        <RichText body={exercise.prompt} />

        {hasChoices ? (
          <div className="choices" role="group" aria-label="Opciones">
            {exercise.choices!.map((choice, i) => {
              let cls = "choice";
              if (checked) {
                if (i === exercise.correct) cls += " correct";
                else if (i === selected) cls += " wrong";
              } else if (i === selected) {
                cls += " selected";
              }
              return (
                <button
                  key={i}
                  type="button"
                  className={cls}
                  onClick={() => {
                    if (checked) return;
                    setSelected(i);
                  }}
                  aria-pressed={selected === i}
                >
                  <span className="letter">{LETTERS[i] ?? i + 1}</span>
                  <span>
                    <RichText body={choice} />
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="exercise-actions">
          {hasChoices ? (
            <button type="button" className="btn primary small" onClick={check} disabled={selected === null || checked}>
              Comprobar
            </button>
          ) : null}
          <button type="button" className="btn small" onClick={() => setShowHint((v) => !v)}>
            {showHint ? "Ocultar pista" : "💡 Ver pista"}
          </button>
          <button
            type="button"
            className="btn small"
            onClick={() => {
              setShowSolution((v) => !v);
              if (!showSolution) progressStore.setExercise(exercise.id, "review");
            }}
          >
            {showSolution ? "Ocultar solución" : "Ver solución paso a paso"}
          </button>
          {checked ? (
            <button
              type="button"
              className="btn ghost small"
              onClick={() => {
                setSelected(null);
                setChecked(false);
              }}
            >
              Reintentar
            </button>
          ) : null}
        </div>

        {showHint ? (
          <div className="hint-box">
            <strong>Pista: </strong>
            <RichText body={exercise.hint} />
          </div>
        ) : null}

        {checked ? (
          <div className={`feedback ${correct ? "ok" : "bad"}`}>
            <span aria-hidden="true">{correct ? "✓" : "✕"}</span>
            <span>
              {correct
                ? "¡Correcto! Revisá la solución para comparar el razonamiento."
                : "Todavía no. Mirá la pista o desglosá la solución; el objetivo es entender el paso que falta."}
            </span>
          </div>
        ) : null}

        {showSolution ? (
          <div style={{ marginTop: 16 }}>
            <Steps steps={exercise.solution} title="Solución del ejercicio" guided />
            {exercise.answer ? (
              <div className="callout ok" style={{ marginTop: 12 }}>
                <span className="co-icon">✓</span>
                <div>
                  <b className="co-title">Respuesta</b>
                  <RichText body={exercise.answer} />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
