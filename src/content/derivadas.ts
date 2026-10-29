import type { Module } from "./types";
import { checklist, example, exercise, graph, lab, lesson, math, note, s, table, text } from "./blocks";

export const derivadas: Module = {
  id: "derivadas",
  title: "Cálculo Diferencial",
  short: "Derivadas",
  description:
    "La derivada como razón de cambio, regla por regla y aplicada a problemas de ingeniería.",
  icon: "∂",
  accent: "indigo",
  lessons: [
    lesson({
      id: "derivadas-definicion",
      title: "La derivada: definición y reglas básicas",
      subtitle: "Del cociente incremental a la tabla de derivadas",
      minutes: 26,
      level: "Intermedio",
      objectives: [
        "Interpretar la derivada como pendiente y como razón de cambio.",
        "Calcular derivadas con la definición por límite.",
        "Aplicar las reglas de potencias, suma, producto y cociente.",
      ],
      blocks: [
        text(
          "La derivada nace de una pregunta física: **¿a qué velocidad cambia una cantidad?** Si un móvil recorre $s(t)$ metros en $t$ segundos, la velocidad media entre $t$ y $t+h$ es $\\frac{s(t+h)-s(t)}{h}$. Al hacer $h\\to0$ obtenemos la velocidad instantánea. Esa es la derivada.",
        ),
        math(
          "f'(x)=\\lim_{h\\to0}\\frac{f(x+h)-f(x)}{h}",
          "Definición de derivada",
        ),
        note(
          "La derivada en un punto es la **pendiente de la recta tangente** a la gráfica en ese punto. También es la razón de cambio instantánea. Si el límite existe, la función es derivable allí; toda función derivable es continua, pero no al revés (por ejemplo $|x|$ en 0).",
          { title: "Tres lecturas de un mismo número", tone: "key" },
        ),
        example(
          "Derivada por definición",
          "Calcular $f'(x)$ para $f(x)=x^2$ usando la definición.",
          [
            s("Planteamos el cociente", "\\frac{f(x+h)-f(x)}{h}=\\frac{(x+h)^2-x^2}{h}", "Sustituimos f en la definición."),
            s("Desarrollamos", "\\frac{x^2+2xh+h^2-x^2}{h}", "Producto notable."),
            s("Simplificamos", "\\frac{2xh+h^2}{h}=2x+h \\quad (h\\neq0)", "Cancelamos h."),
            s("Tomamos el límite", "\\lim_{h\\to0}(2x+h)=2x", "h desaparece."),
            s("Conclusión", "f'(x)=2x", "La regla de potencias confirma el resultado."),
          ],
          "f'(x) = 2x",
        ),
        math(
          "\\begin{aligned}(x^n)'&=nx^{n-1}\\\\ (cf)'&=cf'\\\\ (f\\pm g)'&=f'\\pm g'\\\\ (fg)'&=f'g+fg'\\\\ \\left(\\frac{f}{g}\\right)'&=\\frac{f'g-fg'}{g^2}\\end{aligned}",
          "Reglas de derivación",
        ),
        table(
          ["Función", "Derivada", "Observación"],
          [
            ["sen x", "cos x", "ángulos en radianes"],
            ["cos x", "−sen x", "signo negativo"],
            ["tan x", "sec² x", "válida donde cos x ≠ 0"],
            ["eˣ", "eˣ", "la función es su propia derivada"],
            ["ln x", "1/x", "solo para x > 0"],
            ["arctan x", "1/(1+x²)", "muy útil en integrales"],
          ],
          "Derivadas inmediatas",
        ),
        example(
          "Producto y cociente",
          "Derivar $y=x^2\\operatorname{sen}x$ y $y=\\dfrac{x}{x+1}$.",
          [
            s("Producto: identificamos", "u=x^{2},\\quad v=\\operatorname{sen}x", "Regla (uv)' = u'v + uv'."),
            s("Derivamos cada factor", "u'=2x,\\quad v'=\\cos x"),
            s("Aplicamos", "y'=2x\\operatorname{sen}x+x^{2}\\cos x", "No se deriva «por partes» sin la regla."),
            s("Cociente: identificamos", "u=x,\\quad v=x+1", "Regla (u/v)' = (u'v − uv')/v²."),
            s("Aplicamos", "y'=\\frac{1\\cdot(x+1)-x\\cdot1}{(x+1)^{2}}=\\frac{1}{(x+1)^{2}}", "El numerador se simplifica."),
          ],
          "y' = 2x sen x + x² cos x;  y' = 1/(x+1)²",
        ),
        graph({
          series: [
            { expr: "x^2", label: "f(x)=x²", color: "indigo" },
            { expr: "2x-1", label: "tangente en x=1", color: "amber", dashed: true },
          ],
          xmin: -2,
          xmax: 3,
          ymin: -2,
          ymax: 7,
          points: [{ x: 1, y: 1, label: "(1,1)" }],
          title: "La tangente toca con pendiente f'(1)=2",
          caption: "La recta tangente es y − 1 = 2(x − 1).",
        }),
        exercise({
          id: "der-def-1",
          prompt: "¿Cuál es la derivada de $f(x)=x^3$ en $x=2$?",
          hint: "Usa la regla de potencias y luego evalúa.",
          answer: "12",
          choices: ["12", "6", "8", "3"],
          correct: 0,
          solution: [
            s("Regla", "f'(x)=3x^{2}", "Regla de potencias."),
            s("Evaluamos", "f'(2)=3\\cdot2^{2}=12"),
          ],
        }),
        checklist([
          "Sé escribir el cociente incremental.",
          "Distingo derivada de pendiente media.",
          "Aplico producto y cociente sin mezclar fórmulas.",
        ]),
      ],
      keyFormulas: [
        "f'(x)=\\lim_{h\\to0}\\frac{f(x+h)-f(x)}{h}",
        "(x^{n})'=nx^{n-1}",
        "(fg)'=f'g+fg'",
      ],
    }),

    lesson({
      id: "derivadas-cadena",
      title: "Regla de la cadena y derivación implícita",
      subtitle: "Composición de funciones y curvas que no son funciones",
      minutes: 28,
      level: "Avanzado",
      objectives: [
        "Derivar funciones compuestas con la regla de la cadena.",
        "Derivar implícitamente ecuaciones como x² + y² = 25.",
        "Calcular derivadas de orden superior y de funciones inversas.",
      ],
      blocks: [
        text(
          "La **regla de la cadena** es la herramienta más usada del cálculo. Si $y$ depende de $u$ y $u$ depende de $x$, entonces los ritmos se multiplican: $\\frac{dy}{dx}=\\frac{dy}{du}\\cdot\\frac{du}{dx}$. Dicho de otro modo: derivamos la capa externa, dejamos la interna intacta y multiplicamos por la derivada de la interna.",
        ),
        math("\\frac{d}{dx}f(g(x))=f'(g(x))\\,g'(x)", "Regla de la cadena"),
        example(
          "Cadena con tres capas",
          "Derivar $y=\\operatorname{sen}\\left(\\sqrt{x^2+1}\\right)$.",
          [
            s("Capa externa", "\\cos\\left(\\sqrt{x^{2}+1}\\right)", "Derivada del seno."),
            s("Capa media", "\\cdot\\frac{1}{2\\sqrt{x^{2}+1}}", "Derivada de la raíz."),
            s("Capa interna", "\\cdot 2x", "Derivada de x² + 1."),
            s("Simplificamos", "y'=\\frac{x\\cos\\left(\\sqrt{x^{2}+1}\\right)}{\\sqrt{x^{2}+1}}", "Los 2 se cancelan."),
          ],
          "y' = x cos(√(x²+1)) / √(x²+1)",
        ),
        note(
          "**Derivación implícita.** Cuando $y$ no está despejada, derivamos ambos lados respecto de $x$ tratando a $y$ como función de $x$. Cada vez que derivamos una expresión con $y$ aparece un factor $y'$ por la regla de la cadena. Luego despejamos $y'$.",
          { title: "y es una función escondida", tone: "key" },
        ),
        example(
          "Circunferencia por derivación implícita",
          "Hallar $y'$ en $x^2+y^2=25$ y la pendiente en $(3,4)$.",
          [
            s("Derivamos ambos lados", "2x+2y\\,y'=0", "La derivada de y² es 2y·y'."),
            s("Despejamos", "y'=-\\frac{x}{y}", "Válido para y ≠ 0."),
            s("Evaluamos en (3,4)", "y'=-\\frac{3}{4}", "Pendiente de la tangente."),
            s("Tangente", "y-4=-\\frac{3}{4}(x-3)", "Forma punto-pendiente."),
            s("Comprobación", "3x+4y=25", "La tangente es perpendicular al radio."),
          ],
          "y' = −x/y; en (3,4): −3/4",
        ),
        text(
          "**Orden superior.** La segunda derivada $f''$ mide cómo cambia la pendiente: es la **concavidad**. En física, si $s(t)$ es posición, $s'$ es velocidad y $s''$ es aceleración. La notación de Leibniz $\\frac{d^2y}{dx^2}$ recuerda que se aplica el operador dos veces.",
        ),
        math("\\frac{d^2y}{dx^2}=\\frac{d}{dx}\\left(\\frac{dy}{dx}\\right)", "Segunda derivada"),
        example(
          "Segunda derivada",
          "Calcular $f''(x)$ para $f(x)=x^3-3x^2+2x$.",
          [
            s("Primera derivada", "f'(x)=3x^{2}-6x+2"),
            s("Segunda derivada", "f''(x)=6x-6", "Derivamos otra vez."),
            s("Punto de inflexión", "6x-6=0\\Rightarrow x=1", "Cambia la concavidad."),
            s("Signos", "f''<0 \\text{ si } x<1;\\quad f''>0 \\text{ si } x>1", "Cóncava hacia abajo y luego hacia arriba."),
          ],
          "f''(x) = 6x − 6; inflexión en x = 1",
        ),
        exercise({
          id: "der-cad-1",
          prompt: "Deriva $y=(3x+1)^5$.",
          hint: "Capa externa: potencia quinta. Capa interna: 3x + 1.",
          answer: "15(3x+1)⁴",
          choices: ["15(3x+1)⁴", "5(3x+1)⁴", "15x(3x+1)⁴", "(3x+1)⁴"],
          correct: 0,
          solution: [
            s("Cadena", "5(3x+1)^{4}\\cdot 3", "Potencia por la derivada de la base."),
            s("Simplificamos", "15(3x+1)^{4}"),
          ],
        }),
        checklist([
          "Identifico las capas de una composición.",
          "No olvido multiplicar por la derivada interna.",
          "Al derivar implícitamente, agrego y' donde aparece y.",
        ]),
      ],
      keyFormulas: [
        "\\frac{d}{dx}f(g(x))=f'(g(x))g'(x)",
        "\\frac{d}{dx}y^{n}=ny^{n-1}y'",
        "f''=\\frac{d}{dx}f'",
      ],
    }),

    lesson({
      id: "derivadas-aplicaciones",
      title: "Tangentes, optimización y razones relacionadas",
      subtitle: "Resolver problemas reales con derivadas",
      minutes: 30,
      level: "Avanzado",
      objectives: [
        "Escribir la recta tangente y normal en un punto.",
        "Resolver problemas de máximos y mínimos con la primera y segunda derivada.",
        "Plantear razones relacionadas en contextos de ingeniería.",
      ],
      blocks: [
        text(
          "Una derivada no es un fin: es una herramienta de decisión. En ingeniería queremos **minimizar costo**, **maximizar resistencia**, **encontrar la pendiente de una rampa** o **relacionar ritmos** (cuánto sube el nivel de un tanque cuando entra agua). El procedimiento es siempre el mismo: modelar, derivar, igualar a cero y verificar.",
        ),
        math("y-f(a)=f'(a)(x-a)", "Recta tangente en x = a"),
        note(
          "La recta **normal** es perpendicular a la tangente: su pendiente es $-1/f'(a)$. Si $f'(a)=0$, la tangente es horizontal y la normal es vertical.",
          { title: "Normal = perpendicular", tone: "info" },
        ),
        example(
          "Tangente y normal",
          "Hallar la tangente y la normal a $f(x)=x^2$ en $x=2$.",
          [
            s("Punto", "f(2)=4\\Rightarrow (2,4)", "Evaluamos la función."),
            s("Pendiente", "f'(x)=2x\\Rightarrow f'(2)=4", "Derivada en el punto."),
            s("Tangente", "y-4=4(x-2)\\Rightarrow y=4x-4", "Forma punto-pendiente."),
            s("Normal", "y-4=-\\frac{1}{4}(x-2)", "Pendiente opuesta y recíproca."),
          ],
          "Tangente y = 4x − 4; normal y = −(x−2)/4 + 4",
        ),
        text(
          "**Optimización.** Un extremo local ocurre donde $f'(x)=0$ (punto crítico) o donde $f'$ no existe. Para clasificar: si $f'$ pasa de $+$ a $-$, es máximo; de $-$ a $+$, mínimo. Alternativamente, si $f''(x_0)>0$ hay mínimo y si $f''(x_0)<0$ hay máximo. En un intervalo cerrado también hay que revisar los extremos.",
        ),
        example(
          "Caja de volumen máximo",
          "Se dispone de una lámina cuadrada de 24 cm de lado. Se recortan cuadrados iguales en las esquinas y se dobla para formar una caja sin tapa. ¿Qué lado deben tener los recortes para maximizar el volumen?",
          [
            s("Variable", "x=\\text{lado del recorte}, \\quad 0<x<12", "El recorte no puede superar la mitad."),
            s("Dimensiones", "\\text{base}=24-2x,\\quad \\text{altura}=x", "Al doblar, la altura es el recorte."),
            s("Función objetivo", "V(x)=x(24-2x)^{2}", "Volumen = área de base × altura."),
            s("Derivamos", "V'(x)=(24-2x)^{2}+x\\cdot2(24-2x)(-2)", "Regla del producto y cadena."),
            s("Simplificamos", "V'(x)=(24-2x)(24-6x)", "Factor común (24 − 2x)."),
            s("Puntos críticos", "x=12 \\text{ (no válido)},\\quad x=4", "x = 12 anula la base."),
            s("Clasificamos", "V''(4)<0\\Rightarrow \\text{máximo}", "La segunda derivada confirma."),
            s("Volumen máximo", "V(4)=4\\cdot16^{2}=1024\\ \\text{cm}^{3}", "Recorte de 4 cm por lado."),
          ],
          "Recortar cuadrados de 4 cm; volumen máximo 1024 cm³.",
        ),
        graph({
          series: [{ expr: "x*(24-2x)^2", label: "V(x)", color: "teal" }],
          xmin: 0,
          xmax: 12,
          ymin: 0,
          ymax: 1200,
          points: [{ x: 4, y: 1024, label: "máximo (4, 1024)" }],
          title: "Volumen en función del recorte",
          caption: "El máximo está en x = 4 cm, no en los extremos del intervalo.",
        }),
        text(
          "**Razones relacionadas.** Si dos cantidades cambian con el tiempo y están ligadas por una ecuación, derivamos respecto de $t$ y relacionamos sus ritmos. Ejemplo clásico: un tanque cónico se llena a razón de $2\\ \\text{m}^3/\\text{min}$; ¿a qué velocidad sube el nivel?",
        ),
        example(
          "Tanque que se llena",
          "Un tanque cilíndrico de radio 2 m recibe agua a $3\\ \\text{m}^3/\\text{min}$. ¿Con qué rapidez sube el nivel?",
          [
            s("Relación", "V=\\pi r^{2}h=4\\pi h", "El radio es constante: r = 2."),
            s("Derivamos respecto de t", "\\frac{dV}{dt}=4\\pi\\frac{dh}{dt}", "r constante."),
            s("Sustituimos", "3=4\\pi\\frac{dh}{dt}", "dV/dt = 3."),
            s("Despejamos", "\\frac{dh}{dt}=\\frac{3}{4\\pi}\\approx0{,}239\\ \\text{m/min}", "El nivel sube unos 23,9 cm por minuto."),
          ],
          "dh/dt = 3/(4π) ≈ 0,239 m/min",
        ),
        exercise({
          id: "der-app-1",
          prompt:
            "La función de costo de producir $q$ unidades es $C(q)=q^2-40q+500$. ¿Qué cantidad minimiza el costo?",
          hint: "Deriva e iguala a cero; verifica con la segunda derivada.",
          answer: "q = 20 unidades",
          choices: ["q = 20", "q = 40", "q = 10", "q = 500"],
          correct: 0,
          solution: [
            s("Derivamos", "C'(q)=2q-40"),
            s("Punto crítico", "2q-40=0\\Rightarrow q=20"),
            s("Segunda derivada", "C''(q)=2>0", "Es un mínimo."),
            s("Costo mínimo", "C(20)=400-800+500=100", "El costo mínimo es 100."),
          ],
        }),
        checklist([
          "Escribo la ecuación antes de derivar.",
          "Reviso los extremos del intervalo en problemas cerrados.",
          "En razones relacionadas, derivo todo respecto del tiempo.",
        ]),
      ],
      keyFormulas: [
        "y-f(a)=f'(a)(x-a)",
        "f'(x)=0 \\Rightarrow \\text{punto crítico}",
        "f''(x)>0 \\Rightarrow \\text{mínimo}",
      ],
    }),

    lesson({
      id: "derivadas-graficas",
      title: "Análisis de funciones y gráficas",
      subtitle: "Monotonía, concavidad, asíntotas y bosquejo completo",
      minutes: 27,
      level: "Avanzado",
      objectives: [
        "Construir el signo de f' y f'' para describir una gráfica.",
        "Ubicar extremos, inflexiones y asíntotas.",
        "Trazar una curva con toda la información algebraica.",
      ],
      blocks: [
        text(
          "Derivar permite **dibujar sin tabular a ciegas**. La primera derivada informa dónde la función sube o baja; la segunda, dónde se curva hacia arriba o hacia abajo. Con dominio, cortes, asíntotas y signos se obtiene un retrato fiel de la función.",
        ),
        table(
          ["f'", "f''", "Forma de la gráfica"],
          [
            ["+", "+", "creciente y cóncava hacia arriba"],
            ["+", "−", "creciente y cóncava hacia abajo"],
            ["−", "+", "decreciente y cóncava hacia arriba"],
            ["−", "−", "decreciente y cóncava hacia abajo"],
            ["0", "cambia", "extremo local"],
            ["cambia", "0", "posible punto de inflexión"],
          ],
          "Lectura conjunta de las derivadas",
        ),
        example(
          "Bosquejo completo",
          "Analizar y graficar $f(x)=x^3-3x$.",
          [
            s("Dominio", "\\mathbb{R}", "Es un polinomio."),
            s("Cortes", "x(x^{2}-3)=0\\Rightarrow x=0,\\pm\\sqrt{3}", "Factorizamos."),
            s("Primera derivada", "f'(x)=3x^{2}-3=3(x-1)(x+1)", "Puntos críticos en ±1."),
            s("Signo de f'", "f'>0 \\text{ en } (-\\infty,-1)\\cup(1,\\infty)", "Crece fuera de [−1,1]."),
            s("Extremos", "f(-1)=2 \\text{ (máx.)},\\quad f(1)=-2 \\text{ (mín.)}", "Cambia de + a − y de − a +."),
            s("Segunda derivada", "f''(x)=6x", "Se anula en 0."),
            s("Inflexión", "f(0)=0", "Cambia de cóncava abajo a arriba."),
            s("Asíntotas", "\\text{ninguna}", "Un polinomio no tiene asíntotas."),
            s("Bosquejo", "\\nearrow \\text{ hasta } (-1,2),\\; \\searrow \\text{ hasta } (1,-2),\\; \\nearrow", "Con inflexión en el origen."),
          ],
          "Máximo (−1,2), mínimo (1,−2), inflexión (0,0).",
        ),
        graph({
          series: [{ expr: "x^3-3x", label: "f(x)=x³−3x", color: "indigo" }],
          xmin: -2.5,
          xmax: 2.5,
          ymin: -4,
          ymax: 4,
          points: [
            { x: -1, y: 2, label: "máximo" },
            { x: 1, y: -2, label: "mínimo" },
            { x: 0, y: 0, label: "inflexión" },
          ],
          title: "Cúbica con dos extremos y una inflexión",
        }),
        text(
          "**Asíntotas.** Verticales donde el denominador se anula sin cancelarse; horizontales comparando grados en el infinito; oblicuas cuando el grado del numerador supera en uno al del denominador. En una función racional conviene factorizar y cancelar antes de concluir.",
        ),
        example(
          "Racional con asíntota oblicua",
          "Analizar $f(x)=\\dfrac{x^2+1}{x}$.",
          [
            s("Dominio", "x\\neq0", "Denominador nulo en 0."),
            s("Simplificamos", "f(x)=x+\\frac{1}{x}", "División término a término."),
            s("Asíntota vertical", "x=0", "f → ±∞ en 0."),
            s("Asíntota oblicua", "y=x", "El término 1/x desaparece."),
            s("Derivada", "f'(x)=1-\\frac{1}{x^{2}}=\\frac{x^{2}-1}{x^{2}}", "Críticos en ±1."),
            s("Extremos", "f(-1)=-2 \\text{ (máx. local)},\\quad f(1)=2 \\text{ (mín. local)}", "Signo de f'."),
            s("Segunda derivada", "f''(x)=\\frac{2}{x^{3}}", "Cóncava arriba si x > 0."),
          ],
          "Asíntotas x = 0 e y = x; extremos en (±1, ±2).",
        ),
        graph({
          series: [
            { expr: "(x^2+1)/x", label: "f(x)", color: "teal" },
            { expr: "x", label: "asíntota y = x", color: "amber", dashed: true },
          ],
          xmin: -6,
          xmax: 6,
          ymin: -6,
          ymax: 6,
          asymptotes: [0],
          title: "Rama hiperbólica alrededor de y = x",
          caption: "Cerca del origen domina 1/x; lejos, domina x.",
        }),
        exercise({
          id: "der-graf-1",
          prompt: "Si $f'(x)>0$ y $f''(x)<0$ en un intervalo, ¿cómo es la gráfica?",
          hint: "Primera derivada: sube o baja. Segunda: concavidad.",
          answer: "Creciente y cóncava hacia abajo.",
          choices: [
            "Creciente y cóncava hacia abajo.",
            "Decreciente y cóncava hacia arriba.",
            "Creciente y cóncava hacia arriba.",
            "Constante.",
          ],
          correct: 0,
          solution: [
            s("f' > 0", "\\text{la función crece}"),
            s("f'' < 0", "\\text{la pendiente disminuye: cóncava hacia abajo}"),
          ],
        }),
        lab("function", "Laboratorio: analiza tu propia función"),
        checklist([
          "Calculo dominio y cortes antes de derivar.",
          "Construyo tablas de signo para f' y f''.",
          "Verifico el bosquejo con la gráfica del laboratorio.",
        ]),
      ],
      keyFormulas: [
        "f'>0 \\Rightarrow \\text{creciente}",
        "f''>0 \\Rightarrow \\text{cóncava hacia arriba}",
        "f'(x_0)=0,\\; f''(x_0)>0 \\Rightarrow \\text{mínimo}",
      ],
    }),
  ],
};
