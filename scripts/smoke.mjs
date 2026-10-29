// Smoke test de MateLUZ con Edge headless + CDP. No usa dependencias externas.
// Uso: node scripts/smoke.mjs [url]
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const URL = process.argv[2] ?? "http://localhost:4173/";
const EDGE_CANDIDATES = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];
const edge = EDGE_CANDIDATES.find((path) => existsSync(path));
if (!edge) throw new Error("No se encontro Edge");

const port = 9334;
const profile = mkdtempSync(join(tmpdir(), "mateluz-cdp-"));
const outDir = join(process.cwd(), ".preview");
mkdirSync(outDir, { recursive: true });

const proc = spawn(
  edge,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "--window-size=1440,900",
    "about:blank",
  ],
  { stdio: "ignore" },
);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const results = [];
const errors = [];
let ws;
let seq = 0;
const pending = new Map();

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });

const evalJs = async (expression) => {
  const reply = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true,
  });
  if (reply.exceptionDetails) {
    throw new Error(`Eval fallo: ${reply.exceptionDetails.text} ${reply.exceptionDetails.exception?.description ?? ""}`);
  }
  return reply.result.value;
};

const dispatchClick = async (point) => {
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1 });
};

const pointOf = async (expression) =>
  evalJs(`(() => {
    const el = ${expression};
    if (!el) return null;
    el.scrollIntoView({ block: 'center', inline: 'center' });
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return null;
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()`);

const click = async (selector, index = 0) => {
  const point = await pointOf(`document.querySelectorAll(${JSON.stringify(selector)})[${index}]`);
  if (!point) throw new Error(`No existe ${selector}[${index}]`);
  await dispatchClick(point);
};

const clickExpr = async (expression) => {
  const point = await pointOf(expression);
  if (!point) throw new Error(`No se encontro: ${expression}`);
  await dispatchClick(point);
};

const shot = async (name) => {
  const data = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(outDir, name), Buffer.from(data.data, "base64"));
};

const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const go = async (hash) => {
  await send("Page.navigate", { url: `${URL.replace(/\/$/, "")}/${hash}` });
  await wait(1400);
};

try {
  let target = null;
  for (let attempt = 0; attempt < 60 && !target; attempt++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const list = await response.json();
      target = list.find((item) => item.type === "page");
    } catch {
      await wait(200);
    }
  }
  if (!target) throw new Error("CDP no respondio");

  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(JSON.stringify(message.error)));
      else resolve(message.result);
      return;
    }
    if (message.method === "Runtime.exceptionThrown") {
      const details = message.params.exceptionDetails;
      errors.push(details.exception?.description ?? details.text);
    }
    if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
      errors.push(message.params.entry.text);
    }
    if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
      errors.push(message.params.args.map((arg) => arg.value ?? arg.description ?? "").join(" "));
    }
  };

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await send("Page.navigate", { url: URL });
  await wait(1800);

  // 1. Portada
  const home = await evalJs(`({
    title: document.title,
    heading: document.querySelector('.hero h1')?.textContent ?? null,
    modules: document.querySelectorAll('.module-card').length,
    sidebar: Boolean(document.querySelector('.sidebar')),
    lessons: document.querySelector('.hero-stats')?.textContent ?? null,
    overflowX: document.documentElement.scrollWidth > window.innerWidth,
  })`);
  check(
    "Portada renderiza",
    home.modules >= 9 && Boolean(home.sidebar) && /33/.test(home.lessons ?? ""),
    JSON.stringify(home),
  );
  check("Sin desbordamiento horizontal", !home.overflowX);
  await shot("01-home.png");

  // 2. Tema claro/oscuro persistente
  await clickExpr(`[...document.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === 'Cambiar tema')`);
  await wait(400);
  const dark = await evalJs(`({
    theme: document.documentElement.dataset.theme,
    stored: JSON.parse(localStorage.getItem('mateluz:v1') ?? '{}').theme ?? null,
  })`);
  check("Tema oscuro se aplica y persiste", dark.theme === "dark" && dark.stored === "dark", JSON.stringify(dark));
  await shot("02-dark.png");
  await clickExpr(`[...document.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === 'Cambiar tema')`);
  await wait(300);

  // 3. Modulo
  await click(".module-card", 0);
  await wait(900);
  const modulePage = await evalJs(`({
    heading: document.querySelector('.page-head h1')?.textContent ?? null,
    lessons: document.querySelectorAll('.lesson-row').length,
    progress: Boolean(document.querySelector('.progress-track')),
    hash: location.hash,
  })`);
  check(
    "Modulo abre con sus lecciones",
    Boolean(modulePage.heading) && modulePage.lessons > 0 && modulePage.progress,
    JSON.stringify(modulePage),
  );
  await shot("03-modulo.png");

  // 4. Leccion con grafica y ejercicio
  await go("#/leccion/derivadas/derivadas-definicion");
  const lesson = await evalJs(`({
    heading: document.querySelector('.lesson-head h1')?.textContent ?? null,
    objectives: document.querySelectorAll('.objectives li').length,
    blocks: document.querySelectorAll('.block').length,
    katex: document.querySelectorAll('.katex').length,
    canvas: document.querySelectorAll('.graph-canvas').length,
    exercises: document.querySelectorAll('.exercise').length,
    toc: document.querySelectorAll('.toc button').length,
    overflowX: document.documentElement.scrollWidth > window.innerWidth,
  })`);
  check(
    "Leccion carga contenido completo",
    /^La derivada/.test(lesson.heading ?? "") &&
      lesson.objectives >= 3 &&
      lesson.blocks >= 6 &&
      lesson.katex >= 5 &&
      lesson.canvas >= 1 &&
      lesson.exercises >= 1 &&
      lesson.toc >= 6,
    JSON.stringify(lesson),
  );
  check("Leccion sin desbordamiento horizontal", !lesson.overflowX);
  await shot("04-leccion.png");

  // 5. Ejercicio interactivo
  await click(".exercise .choice", 0);
  await wait(200);
  await clickExpr(`[...document.querySelectorAll('.exercise .exercise-actions button')].find((b) => b.textContent.includes('Comprobar'))`);
  await wait(400);
  const exercise = await evalJs(`({
    feedback: document.querySelector('.exercise .feedback')?.textContent ?? null,
    stored: JSON.parse(localStorage.getItem('mateluz:v1') ?? '{}').exercises ?? {},
  })`);
  const exerciseState = Object.values(exercise.stored)[0];
  check(
    "Ejercicio comprueba y guarda estado",
    Boolean(exercise.feedback) && (exerciseState === "ok" || exerciseState === "review"),
    JSON.stringify(exercise),
  );

  await clickExpr(`[...document.querySelectorAll('.exercise .exercise-actions button')].find((b) => b.textContent.includes('Ver solución'))`);
  await wait(400);
  const guided = await evalJs(`({
    visible: document.querySelectorAll('.exercise .step-item').length,
    pending: document.querySelector('.exercise .step-hidden')?.textContent ?? null,
  })`);
  check("Solucion arranca en modo guiado", guided.visible === 1 && Boolean(guided.pending), JSON.stringify(guided));
  await clickExpr(`[...document.querySelectorAll('.exercise .steps-actions button')].find((b) => b.textContent.includes('Mostrar todos'))`);
  await wait(300);
  const solution = await evalJs(`({
    steps: document.querySelectorAll('.exercise .step-item').length,
    answer: document.querySelector('.exercise .callout.ok')?.textContent ?? null,
  })`);
  check("Solucion del ejercicio se despliega paso a paso", solution.steps >= 2, JSON.stringify(solution));
  await shot("05-ejercicio.png");

  // 6. Marcar leccion completada
  await clickExpr(`[...document.querySelectorAll('button')].find((b) => b.textContent.includes('Marcar como completada'))`);
  await wait(400);
  const completed = await evalJs(`({
    stored: JSON.parse(localStorage.getItem('mateluz:v1') ?? '{}').completed ?? [],
    badge: document.querySelector('.lesson-meta .badge.ok')?.textContent ?? null,
  })`);
  check(
    "Leccion se marca como completada",
    completed.stored.includes("derivadas-definicion") && Boolean(completed.badge),
    JSON.stringify(completed),
  );

  // 7. Buscador
  await go("#/buscar?q=derivada");
  const search = await evalJs(`({
    hits: document.querySelectorAll('.search-hit').length,
    marks: document.querySelectorAll('mark').length,
    empty: Boolean(document.querySelector('.empty')),
  })`);
  check("Buscador devuelve resultados resaltados", search.hits >= 3 && search.marks >= 1 && !search.empty, JSON.stringify(search));
  await shot("06-buscar.png");

  // 8. Laboratorios
  await go("#/labs?lab=function");
  const lab = await evalJs(`({
    tabs: document.querySelectorAll('.tab').length,
    canvas: document.querySelectorAll('.graph-canvas').length,
    pills: document.querySelectorAll('.result-pill').length,
    steps: document.querySelectorAll('.lab-output .step-item').length,
    overflowX: document.documentElement.scrollWidth > window.innerWidth,
  })`);
  check(
    "Laboratorio de funciones grafica y analiza",
    lab.tabs === 6 && lab.canvas === 1 && lab.pills >= 3 && lab.steps >= 2,
    JSON.stringify(lab),
  );
  check("Laboratorio sin desbordamiento horizontal", !lab.overflowX);
  await shot("07-lab-funciones.png");

  await clickExpr(`[...document.querySelectorAll('.tab')].find((b) => b.textContent.includes('Matrices'))`);
  await wait(1200);
  const matrixLab = await evalJs(`({
    katex: document.querySelectorAll('.lab-output .katex').length,
    pills: [...document.querySelectorAll('.lab-output .result-pill')].map((p) => p.textContent.trim()),
    errors: Boolean(document.querySelector('.lab-output .callout.warn')),
  })`);
  check(
    "Laboratorio de matrices calcula RREF e inversa",
    matrixLab.katex >= 2 && matrixLab.pills.length >= 3 && !matrixLab.errors,
    JSON.stringify(matrixLab),
  );
  await shot("08-lab-matrices.png");

  // 9. Movil
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await go("#/");
  const mobile = await evalJs(`({
    sidebarHidden: getComputedStyle(document.querySelector('.sidebar')).transform !== 'none',
    menuVisible: getComputedStyle(document.querySelector('.menu-btn')).display !== 'none',
    modules: document.querySelectorAll('.module-card').length,
    overflowX: document.documentElement.scrollWidth > window.innerWidth,
  })`);
  check(
    "Layout movil oculta sidebar y muestra menu",
    mobile.sidebarHidden && mobile.menuVisible && mobile.modules >= 9,
    JSON.stringify(mobile),
  );
  check("Movil sin desbordamiento horizontal", !mobile.overflowX);

  await click(".menu-btn");
  await wait(500);
  const drawer = await evalJs(`({
    open: Boolean(document.querySelector('.sidebar.open')),
    transform: getComputedStyle(document.querySelector('.sidebar')).transform,
  })`);
  check("Menu movil abre la navegacion", drawer.open, JSON.stringify(drawer));
  await shot("09-movil.png");

  const realErrors = errors.filter((text) => !/favicon|Failed to load resource/i.test(text));
  check("Sin errores de runtime", realErrors.length === 0, realErrors.join(" | ").slice(0, 400));

  const failed = results.filter((item) => !item.ok).length;
  console.log(`\n${results.length - failed}/${results.length} comprobaciones OK`);
  console.log(`Capturas en ${outDir}`);
  if (realErrors.length) console.log("Errores:", realErrors);
  process.exitCode = failed ? 1 : 0;
} catch (error) {
  console.error("SMOKE_ERROR", error);
  process.exitCode = 1;
} finally {
  try {
    ws?.close();
  } catch {
    /* ignorado */
  }
  proc.kill();
}
