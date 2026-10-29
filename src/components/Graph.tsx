import { useEffect, useMemo, useRef } from "react";
import { evaluate, parse, type Node } from "../engine/expr";
import { graphPoints } from "../engine/analysis";
import type { GraphSpec } from "../content/types";

const COLOR_VARS: Record<string, string> = {
  indigo: "--indigo",
  amber: "--amber",
  teal: "--teal",
  rose: "--rose",
  ok: "--ok",
  muted: "--muted",
  ink: "--ink",
};

function readVar(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function niceStep(range: number, target: number): number {
  const raw = range / Math.max(1, target);
  const power = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / power;
  const step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return step * power;
}

function fmtTick(value: number): string {
  if (Math.abs(value) < 1e-10) return "0";
  if (Math.abs(value) >= 1000 || Math.abs(value) < 0.01) return value.toExponential(1);
  return String(Number(value.toFixed(2)));
}

function autoRange(values: number[], fallback: [number, number]): [number, number] {
  const finite = values.filter((v) => Number.isFinite(v));
  if (finite.length < 2) return fallback;
  finite.sort((a, b) => a - b);
  const lo = finite[Math.floor(finite.length * 0.02)];
  const hi = finite[Math.floor(finite.length * 0.98)];
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || lo === hi) return fallback;
  const pad = Math.max(0.5, (hi - lo) * 0.12);
  return [lo - pad, hi + pad];
}

export function Graph({ spec }: { spec: GraphSpec }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const parsed = useMemo(() => {
    const series: { node: Node | null; label: string; color: string; dashed: boolean }[] = spec.series.map((s) => {
      let node: Node | null = null;
      try {
        node = parse(s.expr);
      } catch {
        node = null;
      }
      return { node, label: s.label ?? s.expr, color: s.color ?? "indigo", dashed: !!s.dashed };
    });
    let areaNode: Node | null = null;
    if (spec.area) {
      try {
        areaNode = parse(spec.area.expr);
      } catch {
        areaNode = null;
      }
    }
    return { series, areaNode };
  }, [spec]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = rect.width;
      const height = rect.height || 340;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const paper = readVar("--surface", "#fffdf8");
      const line = readVar("--line", "#e2d9c8");
      const ink = readVar("--ink-2", "#3b4358");
      const muted = readVar("--muted", "#6d7285");

      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, width, height);

      const pad = { left: 44, right: 16, top: 16, bottom: 30 };
      const plotW = Math.max(10, width - pad.left - pad.right);
      const plotH = Math.max(10, height - pad.top - pad.bottom);

      const xmin = spec.xmin ?? -5;
      const xmax = spec.xmax ?? 5;

      const ySamples: number[] = [];
      const segments: { points: { x: number; y: number }[]; color: string; dashed: boolean }[] = [];
      for (const s of parsed.series) {
        if (!s.node) continue;
        const segs = graphPoints(s.node, xmin, xmax, 720);
        for (const seg of segs) {
          for (const p of seg) ySamples.push(p.y);
          segments.push({ points: seg, color: s.color, dashed: s.dashed });
        }
      }
      for (const path of spec.paths ?? []) {
        for (const p of path.points) ySamples.push(p.y);
        segments.push({ points: path.points, color: path.color ?? "teal", dashed: !!path.dashed });
      }
      for (const p of spec.points ?? []) ySamples.push(p.y);
      for (const h of spec.hlines ?? []) ySamples.push(h);
      const [autoMin, autoMax] = autoRange(ySamples, [-5, 5]);
      const ymin = spec.ymin ?? autoMin;
      const ymax = spec.ymax ?? autoMax;

      const sx = (x: number) => pad.left + ((x - xmin) / (xmax - xmin || 1)) * plotW;
      const sy = (y: number) => pad.top + plotH - ((y - ymin) / (ymax - ymin || 1)) * plotH;

      // Rejilla
      const stepX = niceStep(xmax - xmin, Math.max(4, Math.round(plotW / 90)));
      const stepY = niceStep(ymax - ymin, Math.max(3, Math.round(plotH / 70)));
      ctx.lineWidth = 1;
      ctx.strokeStyle = line;
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      for (let x = Math.ceil(xmin / stepX) * stepX; x <= xmax; x += stepX) {
        const px = Math.round(sx(x)) + 0.5;
        ctx.moveTo(px, pad.top);
        ctx.lineTo(px, pad.top + plotH);
      }
      for (let y = Math.ceil(ymin / stepY) * stepY; y <= ymax; y += stepY) {
        const py = Math.round(sy(y)) + 0.5;
        ctx.moveTo(pad.left, py);
        ctx.lineTo(pad.left + plotW, py);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Área sombreada
      if (spec.area && parsed.areaNode) {
        const { a, b } = spec.area;
        const accent = readVar("--amber", "#c2740a");
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.18;
        ctx.beginPath();
        const n = 260;
        for (let i = 0; i <= n; i++) {
          const x = a + ((b - a) * i) / n;
          const y = evaluate(parsed.areaNode, { x });
          if (!Number.isFinite(y)) continue;
          const px = sx(x);
          const py = sy(y);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.lineTo(sx(b), sy(0));
        ctx.lineTo(sx(a), sy(0));
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Ejes
      const y0 = Math.max(pad.top, Math.min(pad.top + plotH, sy(0)));
      const x0 = Math.max(pad.left, Math.min(pad.left + plotW, sx(0)));
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(pad.left, y0);
      ctx.lineTo(pad.left + plotW, y0);
      ctx.moveTo(x0, pad.top);
      ctx.lineTo(x0, pad.top + plotH);
      ctx.stroke();

      // Flechas
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.moveTo(pad.left + plotW, y0);
      ctx.lineTo(pad.left + plotW - 8, y0 - 4);
      ctx.lineTo(pad.left + plotW - 8, y0 + 4);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x0, pad.top);
      ctx.lineTo(x0 - 4, pad.top + 8);
      ctx.lineTo(x0 + 4, pad.top + 8);
      ctx.closePath();
      ctx.fill();

      // Rótulos de los ejes
      ctx.fillStyle = muted;
      ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (let x = Math.ceil(xmin / stepX) * stepX; x <= xmax; x += stepX) {
        if (Math.abs(x) < 1e-10) continue;
        const px = sx(x);
        if (px < pad.left + 10 || px > pad.left + plotW - 4) continue;
        ctx.fillText(fmtTick(x), px, y0 + 6);
      }
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (let y = Math.ceil(ymin / stepY) * stepY; y <= ymax; y += stepY) {
        if (Math.abs(y) < 1e-10) continue;
        const py = sy(y);
        if (py < pad.top + 4 || py > pad.top + plotH - 4) continue;
        ctx.fillText(fmtTick(y), x0 - 6, py);
      }
      ctx.fillStyle = muted;
      ctx.textAlign = "right";
      ctx.textBaseline = "top";
      ctx.fillText("x", pad.left + plotW, y0 + 6);
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillText("y", x0 + 6, pad.top + 2);

      // Asíntotas
      ctx.save();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = readVar("--rose", "#b4234a");
      ctx.globalAlpha = 0.75;
      ctx.lineWidth = 1.2;
      for (const a of spec.asymptotes ?? []) {
        const px = sx(a);
        ctx.beginPath();
        ctx.moveTo(px, pad.top);
        ctx.lineTo(px, pad.top + plotH);
        ctx.stroke();
      }
      ctx.strokeStyle = readVar("--muted", "#6d7285");
      for (const h of spec.hlines ?? []) {
        const py = sy(h);
        ctx.beginPath();
        ctx.moveTo(pad.left, py);
        ctx.lineTo(pad.left + plotW, py);
        ctx.stroke();
      }
      ctx.restore();

      // Curvas
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      for (const seg of segments) {
        if (seg.points.length < 2) continue;
        ctx.strokeStyle = readVar(COLOR_VARS[seg.color] ?? "--indigo", "#4f46e5");
        ctx.lineWidth = 2.2;
        ctx.setLineDash(seg.dashed ? [7, 5] : []);
        ctx.beginPath();
        let started = false;
        for (const p of seg.points) {
          if (!Number.isFinite(p.y)) {
            started = false;
            continue;
          }
          const px = sx(p.x);
          const py = sy(p.y);
          if (py < -height * 4 || py > height * 4) {
            started = false;
            continue;
          }
          if (!started) {
            ctx.moveTo(px, py);
            started = true;
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Puntos
      for (const p of spec.points ?? []) {
        const px = sx(p.x);
        const py = sy(p.y);
        if (!Number.isFinite(px) || !Number.isFinite(py)) continue;
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = readVar("--amber", "#c2740a");
        ctx.fill();
        ctx.strokeStyle = paper;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        if (p.label) {
          ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
          const tw = ctx.measureText(p.label).width;
          const lx = Math.min(pad.left + plotW - tw - 4, Math.max(pad.left + 2, px + 8));
          const ly = Math.max(pad.top + 12, py - 8);
          ctx.fillStyle = paper;
          ctx.globalAlpha = 0.88;
          ctx.fillRect(lx - 3, ly - 10, tw + 6, 14);
          ctx.globalAlpha = 1;
          ctx.fillStyle = ink;
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(p.label, lx, ly - 3);
        }
      }
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    const themeObserver = new MutationObserver(draw);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    window.addEventListener("resize", draw);
    return () => {
      observer.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("resize", draw);
    };
  }, [spec, parsed]);

  return (
    <figure className="graph-card block">
      {spec.title ? (
        <div className="graph-head">
          <span aria-hidden="true">📈</span>
          <span>{spec.title}</span>
        </div>
      ) : null}
      <canvas ref={canvasRef} className="graph-canvas" role="img" aria-label={spec.title ?? "Gráfica de funciones"} />
      <div className="graph-legend">
        {spec.series.map((s, i) => (
          <span key={i}>
            <i style={{ background: `var(${COLOR_VARS[s.color ?? "indigo"] ?? "--indigo"})` }} />
            {s.label ?? s.expr}
          </span>
        ))}
        {spec.area ? <span>Área sombreada: {spec.area.a} → {spec.area.b}</span> : null}
      </div>
      {spec.caption ? <figcaption className="small muted" style={{ padding: "0 16px 12px" }}>{spec.caption}</figcaption> : null}
    </figure>
  );
}
