import type { Module } from "./types";
import { checklist, example, exercise, graph, lab, lesson, math, note, s, table, text } from "./blocks";

export const integrales: Module = {
  id: "integrales",
  title: "Cálculo Integral",
  short: "Integrales",
  description:
    "Acumulación, áreas y antiderivadas: el inverso del cálculo diferencial.",
  icon: "∫",
  accent: "amber",
  lessons: [
    lesson({
      id: "integrales-antiderivada",
      title: "La antiderivada y la integral indefinida",
      subtitle: "Reconstruir una función a partir de su derivada",
      minutes: 24,
      level: "Intermedio",
      objectives: [
        "Definir antiderivada y reconocer la constante de integración.",
        "Aplicar la regla de potencias y las integrales inmediatas.",
        "Verificar toda integral derivando el resultado.",
      ],
      blocks: [
        text(
          "Integrar es **deshacer una derivada**. Si $F'(x)=f(x)$, decimos que $F$ es una antiderivada de $f$. Como la derivada de una constante es cero, toda función tiene infinitas antiderivadas que difieren en una constante: por eso escribimos $+C$.",
        ),
        math("\\int f(x)\\,dx=F(x)+C \\iff F'(x)=f(x)", "Integral indefinida"),
        note(
          "El símbolo $\\int$ es una S alargada de «suma»: la integral definida nace de sumar áreas de rectángulos infinitesimales. La constante $C$ no es un adorno: sin ella se pierden todas las soluciones posibles de una ecuación diferencial.",
          { title: "¿Por qué aparece +C?", tone: "key" },
        ),
        table(
          ["Integral", "Resultado", "Comprobación"],
          [
            ["∫xⁿ dx (n ≠ −1)", "xⁿ⁺¹/(n+1) + C", "derivar devuelve xⁿ"],
            ["∫1/x dx", "ln|x| + C", "válida para x ≠ 0"],
            ["∫eˣ dx", "eˣ + C", "eˣ es su propia derivada"],
            ["∫cos x dx", "sen x + C", "derivada del seno"],
            ["∫sen x dx", "−cos x + C", "signo negativo"],
            ["∫sec²x dx", "tan x + C", "derivada de tan"],
            ["∫1/(1+x²) dx", "arctan x + C", "derivada del arctan"],
          ],
          "Integrales inmediatas",
        ),
        example(
          "Potencia y suma",
          "Calcular $\\displaystyle\\int\\left(3x^2-4x+5\\right)dx$.",
          [
            s("Separamos", "\\int3x^{2}dx-\\int4x\\,dx+\\int5\\,dx", "Linealidad de la integral."),
            s("Potencia", "3\\cdot\\frac{x^{3}}{3}=x^{3}", "Regla xⁿ⁺¹/(n+1)."),
            s("Término lineal", "4\\cdot\\frac{x^{2}}{2}=2x^{2}", "n = 1."),
            s("Constante", "5x", "∫k dx = kx."),
            s("Resultado", "x^{3}-2x^{2}+5x+C", "Una sola constante al final."),
            s("Verificación", "\\frac{d}{dx}\\left(x^{3}-2x^{2}+5x+C\\right)=3x^{2}-4x+5", "Coincide con el integrando."),
          ],
          "x³ − 2x² + 5x + C",
        ),
        example(
          "Reescribir antes de integrar",
          "Calcular $\\displaystyle\\int\\frac{x^2+1}{x}\\,dx$.",
          [
            s("Dividimos", "\\frac{x^{2}+1}{x}=x+\\frac{1}{x}", "Separamos la fracción."),
            s("Integramos", "\\int x\\,dx+\\int\\frac{1}{x}\\,dx", "Dos integrales inmediatas."),
            s("Resultado", "\\frac{x^{2}}{2}+\\ln|x|+C", "El valor absoluto evita problemas de dominio."),
          ],
          "x²/2 + ln|x| + C",
        ),
        graph({
          series: [
            { expr: "x^2", label: "f(x)=x²", color: "amber" },
            { expr: "x^3/3", label: "F(x)=x³/3", color: "indigo" },
          ],
          xmin: -2,
          xmax: 2,
          ymin: -3,
          ymax: 3,
          title: "F es una antiderivada de f",
          caption: "En cada punto, la pendiente de F coincide con la altura de f.",
        }),
        exercise({
          id: "int-anti-1",
          prompt: "Calcula $\\displaystyle\\int\\left(6x+2\\right)dx$.",
          hint: "Integra término a término con la regla de potencias.",
          answer: "3x² + 2x + C",
          choices: ["3x² + 2x + C", "6x² + 2x + C", "3x² + 2 + C", "6x + C"],
          correct: 0,
          solution: [
            s("Término cuadrático", "\\int6x\\,dx=3x^{2}"),
            s("Término constante", "\\int2\\,dx=2x"),
            s("Resultado", "3x^{2}+2x+C", "Derivando se recupera 6x + 2."),
          ],
        }),
        checklist([
          "Siempre agrego +C en integrales indefinidas.",
          "Verifico derivando el resultado.",
          "Reescribo el integrando si no es inmediato.",
        ]),
      ],
      keyFormulas: [
        "\\int x^{n}dx=\\frac{x^{n+1}}{n+1}+C\\;(n\\neq-1)",
        "\\int\\frac{1}{x}dx=\\ln|x|+C",
        "\\int e^{x}dx=e^{x}+C",
      ],
    }),

    lesson({
      id: "integrales-sustitucion",
      title: "Integración por sustitución",
      subtitle: "La regla de la cadena leída al revés",
      minutes: 26,
      level: "Avanzado",
      objectives: [
        "Reconocer cuándo un integrando contiene su propia derivada interna.",
        "Aplicar el cambio de variable y ajustar el diferencial.",
        "Resolver integrales trigonométricas y exponenciales por sustitución.",
      ],
      blocks: [
        text(
          "La sustitución es la técnica más rentable. Si en el integrando aparece una función $u=g(x)$ y también su derivada $g'(x)$ (salvo constante), conviene cambiar de variable. Formalmente, $du=g'(x)\\,dx$, así que el integrando se transforma en uno más simple.",
        ),
        math("\\int f(g(x))g'(x)\\,dx=\\int f(u)\\,du", "Cambio de variable"),
        note(
          "**Cómo elegir u.** Busca la parte «interna»: lo que está dentro de una potencia, raíz, seno, exponencial o denominador. Luego verifica que su derivada aparezca multiplicando. Si falta una constante, se ajusta; si falta una función, la sustitución no sirve directamente.",
          { title: "Estrategia", tone: "info" },
        ),
        example(
          "Sustitución directa",
          "Calcular $\\displaystyle\\int 2x\\,e^{x^2}\\,dx$.",
          [
            s("Elegimos u", "u=x^{2}", "La parte interna de la exponencial."),
            s("Diferencial", "du=2x\\,dx", "Justo lo que aparece multiplicando."),
            s("Sustituimos", "\\int e^{u}\\,du", "El integrando se simplifica."),
            s("Integramos", "e^{u}+C"),
            s("Volvemos a x", "e^{x^{2}}+C", "Siempre regresar a la variable original."),
            s("Verificación", "\\frac{d}{dx}e^{x^{2}}=2x\\,e^{x^{2}}", "Correcto."),
          ],
          "e^(x²) + C",
        ),
        example(
          "Ajuste de constante",
          "Calcular $\\displaystyle\\int x\\sqrt{x^2+4}\\,dx$.",
          [
            s("Elegimos u", "u=x^{2}+4", "Dentro de la raíz."),
            s("Diferencial", "du=2x\\,dx\\Rightarrow x\\,dx=\\frac{du}{2}", "Ajustamos el factor 2."),
            s("Sustituimos", "\\frac{1}{2}\\int u^{1/2}\\,du"),
            s("Integramos", "\\frac{1}{2}\\cdot\\frac{2}{3}u^{3/2}=\\frac{1}{3}u^{3/2}"),
            s("Volvemos", "\\frac{1}{3}\\left(x^{2}+4\\right)^{3/2}+C"),
          ],
          "(1/3)(x²+4)^(3/2) + C",
        ),
        example(
          "Sustitución trigonométrica simple",
          "Calcular $\\displaystyle\\int\\operatorname{sen}^3x\\cos x\\,dx$.",
          [
            s("Elegimos u", "u=\\operatorname{sen}x", "Su derivada es cos x."),
            s("Diferencial", "du=\\cos x\\,dx"),
            s("Sustituimos", "\\int u^{3}\\,du"),
            s("Integramos", "\\frac{u^{4}}{4}+C"),
            s("Volvemos", "\\frac{\\operatorname{sen}^{4}x}{4}+C"),
          ],
          "sen⁴x / 4 + C",
        ),
        graph({
          series: [
            { expr: "2x*exp(x^2)", label: "integrando", color: "amber" },
            { expr: "exp(x^2)", label: "antiderivada", color: "indigo" },
          ],
          xmin: -1.6,
          xmax: 1.6,
          ymin: -2,
          ymax: 6,
          title: "La antiderivada crece donde el integrando es positivo",
        }),
        exercise({
          id: "int-sust-1",
          prompt: "Calcula $\\displaystyle\\int\\cos(3x)\\,dx$.",
          hint: "Sustituye u = 3x y ajusta el diferencial.",
          answer: "(1/3) sen(3x) + C",
          choices: ["(1/3) sen(3x) + C", "3 sen(3x) + C", "−sen(3x) + C", "sen(3x) + C"],
          correct: 0,
          solution: [
            s("Sustitución", "u=3x,\\quad du=3\\,dx\\Rightarrow dx=\\frac{du}{3}"),
            s("Integramos", "\\frac{1}{3}\\int\\cos u\\,du=\\frac{1}{3}\\operatorname{sen}u"),
            s("Volvemos", "\\frac{1}{3}\\operatorname{sen}(3x)+C"),
          ],
        }),
        checklist([
          "Elijo la parte interna, no la externa.",
          "Ajusto constantes sin alterar el valor.",
          "Regreso siempre a la variable original.",
        ]),
      ],
      keyFormulas: [
        "\\int f(g(x))g'(x)dx=\\int f(u)du",
        "du=g'(x)dx",
      ],
    }),

    lesson({
      id: "integrales-partes",
      title: "Integración por partes y fracciones parciales",
      subtitle: "Productos y cocientes que la sustitución no resuelve",
      minutes: 30,
      level: "Avanzado",
      objectives: [
        "Aplicar la fórmula de integración por partes eligiendo u y dv.",
        "Repetir partes cuando aparece de nuevo la integral original.",
        "Descomponer fracciones racionales en fracciones simples.",
      ],
      blocks: [
        text(
          "La integración por partes es la regla del producto invertida. Si $(uv)'=u'v+uv'$, integrando ambos lados se obtiene $\\int u\\,dv=uv-\\int v\\,du$. Sirve cuando el integrando es un producto de funciones de distinto tipo, como un polinomio por una exponencial o un logaritmo.",
        ),
        math("\\int u\\,dv=uv-\\int v\\,du", "Integración por partes"),
        note(
          "**Regla LIATE** para elegir $u$: Logarítmica, Inversa trigonométrica, Algebraica, Trigonométrica, Exponencial. Se elige como $u$ la primera que aparezca; el resto es $dv$. El objetivo es que la nueva integral sea más simple.",
          { title: "Cómo elegir u", tone: "key" },
        ),
        example(
          "Partes una vez",
          "Calcular $\\displaystyle\\int x\\,e^{x}\\,dx$.",
          [
            s("Elegimos", "u=x,\\quad dv=e^{x}dx", "Algebraica antes que exponencial."),
            s("Derivamos e integramos", "du=dx,\\quad v=e^{x}"),
            s("Aplicamos", "\\int x e^{x}dx=xe^{x}-\\int e^{x}dx", "Fórmula de partes."),
            s("Resolvemos", "xe^{x}-e^{x}+C", "La integral restante es inmediata."),
            s("Factorizamos", "e^{x}(x-1)+C"),
            s("Verificación", "\\frac{d}{dx}\\left[e^{x}(x-1)\\right]=e^{x}(x-1)+e^{x}=xe^{x}", "Correcto."),
          ],
          "eˣ(x − 1) + C",
        ),
        example(
          "Partes cíclicas",
          "Calcular $\\displaystyle\\int e^{x}\\operatorname{sen}x\\,dx$.",
          [
            s("Primera vez", "u=\\operatorname{sen}x,\\;dv=e^{x}dx", "Elegimos seno como u."),
            s("Aplicamos", "e^{x}\\operatorname{sen}x-\\int e^{x}\\cos x\\,dx", "Queda otra integral por partes."),
            s("Segunda vez", "u=\\cos x,\\;dv=e^{x}dx"),
            s("Sustituimos", "I=e^{x}\\operatorname{sen}x-e^{x}\\cos x-I", "Aparece la integral original I."),
            s("Despejamos", "2I=e^{x}(\\operatorname{sen}x-\\cos x)"),
            s("Resultado", "I=\\frac{e^{x}}{2}(\\operatorname{sen}x-\\cos x)+C"),
          ],
          "eˣ(sen x − cos x)/2 + C",
        ),
        text(
          "**Fracciones parciales.** Para integrar $\\frac{P(x)}{Q(x)}$ con grado de $P$ menor que el de $Q$, se factoriza $Q$ y se escribe la fracción como suma de términos simples. Cada término se integra con logaritmos o arcotangentes. Si el grado de $P$ es mayor o igual, primero se divide.",
        ),
        example(
          "Fracciones parciales con factores lineales",
          "Calcular $\\displaystyle\\int\\frac{1}{x^2-1}\\,dx$.",
          [
            s("Factorizamos", "x^{2}-1=(x-1)(x+1)", "Diferencia de cuadrados."),
            s("Descomponemos", "\\frac{1}{(x-1)(x+1)}=\\frac{A}{x-1}+\\frac{B}{x+1}", "Factores lineales distintos."),
            s("Resolvemos", "1=A(x+1)+B(x-1)", "Multiplicamos por el denominador."),
            s("Coeficientes", "A=\\frac{1}{2},\\quad B=-\\frac{1}{2}", "Evaluando en x = 1 y x = −1."),
            s("Integramos", "\\frac{1}{2}\\ln|x-1|-\\frac{1}{2}\\ln|x+1|+C"),
            s("Combinamos", "\\frac{1}{2}\\ln\\left|\\frac{x-1}{x+1}\\right|+C"),
          ],
          "(1/2) ln|(x−1)/(x+1)| + C",
        ),
        table(
          ["Factor en Q", "Término propuesto"],
          [
            ["(x − a)", "A/(x − a)"],
            ["(x − a)²", "A/(x − a) + B/(x − a)²"],
            ["x² + bx + c irreducible", "(Ax + B)/(x² + bx + c)"],
            ["repetido irreducible", "suma de términos con potencias crecientes"],
          ],
          "Guía de descomposición",
        ),
        exercise({
          id: "int-partes-1",
          prompt: "Calcula $\\displaystyle\\int x\\cos x\\,dx$.",
          hint: "u = x, dv = cos x dx.",
          answer: "x sen x + cos x + C",
          choices: ["x sen x + cos x + C", "x sen x − cos x + C", "−x cos x + C", "x cos x + sen x + C"],
          correct: 0,
          solution: [
            s("Elegimos", "u=x,\\quad dv=\\cos x\\,dx"),
            s("Derivamos e integramos", "du=dx,\\quad v=\\operatorname{sen}x"),
            s("Aplicamos", "x\\operatorname{sen}x-\\int\\operatorname{sen}x\\,dx"),
            s("Resolvemos", "x\\operatorname{sen}x+\\cos x+C"),
          ],
        }),
        lab("integral", "Laboratorio: integra y compara con Simpson"),
        checklist([
          "Elijo u con LIATE y verifico que la nueva integral sea más simple.",
          "En integrales cíclicas, despejo la integral original.",
          "Antes de fracciones parciales, comparo grados y divido si hace falta.",
        ]),
      ],
      keyFormulas: [
        "\\int u\\,dv=uv-\\int v\\,du",
        "\\frac{1}{(x-a)(x-b)}=\\frac{A}{x-a}+\\frac{B}{x-b}",
      ],
    }),

    lesson({
      id: "integrales-definida",
      title: "Integral definida, áreas y aplicaciones",
      subtitle: "Del límite de sumas al teorema fundamental",
      minutes: 30,
      level: "Avanzado",
      objectives: [
        "Interpretar la integral definida como área neta.",
        "Aplicar el teorema fundamental del cálculo (Barrow).",
        "Calcular áreas entre curvas y volúmenes de revolución.",
      ],
      blocks: [
        text(
          "La integral definida $\\int_a^b f(x)\\,dx$ es el límite de sumas de Riemann: se aproxima el área bajo la curva con rectángulos y se hace tender su ancho a cero. Si $f$ es negativa, el área se cuenta como negativa; por eso se llama **área neta**.",
        ),
        math(
          "\\int_a^b f(x)\\,dx=\\lim_{n\\to\\infty}\\sum_{i=1}^{n}f(x_i^*)\\,\\Delta x",
          "Suma de Riemann",
        ),
        note(
          "**Teorema fundamental del cálculo.** Si $f$ es continua en $[a,b]$ y $F$ es cualquier antiderivada, entonces $\\int_a^b f(x)\\,dx=F(b)-F(a)$. Esto conecta las dos grandes ideas del cálculo: derivar e integrar son procesos inversos.",
          { title: "El puente entre derivada e integral", tone: "key" },
        ),
        math("\\int_a^b f(x)\\,dx=\\left.F(x)\\right|_a^b=F(b)-F(a)", "Regla de Barrow"),
        example(
          "Área bajo una parábola",
          "Calcular $\\displaystyle\\int_0^2 x^2\\,dx$.",
          [
            s("Antiderivada", "F(x)=\\frac{x^{3}}{3}", "Regla de potencias."),
            s("Evaluamos", "F(2)-F(0)=\\frac{8}{3}-0", "Barrow."),
            s("Resultado", "\\frac{8}{3}\\approx2{,}667", "Área en unidades cuadradas."),
            s("Interpretación", "\\text{área}=\\frac{8}{3}", "La región está bajo y = x² entre 0 y 2."),
          ],
          "8/3 ≈ 2,667",
        ),
        graph({
          series: [{ expr: "x^2", label: "y = x²", color: "indigo" }],
          xmin: -0.5,
          xmax: 2.5,
          ymin: 0,
          ymax: 5,
          area: { expr: "x^2", a: 0, b: 2 },
          title: "Área bajo la parábola entre 0 y 2",
          caption: "La integral definida acumula el área sombreada.",
        }),
        text(
          "**Área entre curvas.** Si $f(x)\\ge g(x)$ en $[a,b]$, el área encerrada es $\\int_a^b\\left[f(x)-g(x)\\right]dx$. Conviene encontrar los puntos de intersección para fijar los límites. Para volúmenes de revolución alrededor del eje $x$, el método de discos usa $V=\\pi\\int_a^b\\left[f(x)\\right]^2dx$.",
        ),
        example(
          "Área entre dos curvas",
          "Hallar el área entre $y=x$ y $y=x^2$.",
          [
            s("Intersecciones", "x=x^{2}\\Rightarrow x(1-x)=0\\Rightarrow x=0,1", "Límites de integración."),
            s("Orden de las curvas", "x\\ge x^{2} \\text{ en } [0,1]", "La recta va arriba."),
            s("Planteamos", "A=\\int_0^1\\left(x-x^{2}\\right)dx"),
            s("Integramos", "\\left[\\frac{x^{2}}{2}-\\frac{x^{3}}{3}\\right]_0^1"),
            s("Evaluamos", "\\frac{1}{2}-\\frac{1}{3}=\\frac{1}{6}"),
            s("Resultado", "A=\\frac{1}{6}", "El área es 1/6."),
          ],
          "1/6",
        ),
        graph({
          series: [
            { expr: "x", label: "y = x", color: "amber" },
            { expr: "x^2", label: "y = x²", color: "indigo" },
          ],
          xmin: -0.2,
          xmax: 1.3,
          ymin: 0,
          ymax: 1.2,
          area: { expr: "x-(x^2)", a: 0, b: 1 },
          points: [
            { x: 0, y: 0, label: "(0,0)" },
            { x: 1, y: 1, label: "(1,1)" },
          ],
          title: "Región entre la recta y la parábola",
        }),
        example(
          "Volumen de revolución",
          "Calcular el volumen al girar $y=\\sqrt{x}$ alrededor del eje x entre 0 y 4.",
          [
            s("Método de discos", "V=\\pi\\int_0^4\\left(\\sqrt{x}\\right)^{2}dx", "Radio = f(x)."),
            s("Simplificamos", "V=\\pi\\int_0^4 x\\,dx", "La raíz al cuadrado se cancela."),
            s("Integramos", "V=\\pi\\left[\\frac{x^{2}}{2}\\right]_0^4"),
            s("Evaluamos", "V=\\pi\\cdot\\frac{16}{2}=8\\pi"),
            s("Resultado", "V=8\\pi\\approx25{,}13", "Unidades cúbicas."),
          ],
          "8π ≈ 25,13",
        ),
        exercise({
          id: "int-def-1",
          prompt: "Calcula $\\displaystyle\\int_1^3 2x\\,dx$.",
          hint: "La antiderivada de 2x es x². Evalúa en los extremos.",
          answer: "8",
          choices: ["8", "6", "9", "4"],
          correct: 0,
          solution: [
            s("Antiderivada", "F(x)=x^{2}"),
            s("Barrow", "F(3)-F(1)=9-1=8"),
          ],
        }),
        checklist([
          "Identifico cuál curva va arriba antes de plantear el área.",
          "Uso los puntos de intersección como límites.",
          "En volúmenes, el radio se eleva al cuadrado.",
        ]),
      ],
      keyFormulas: [
        "\\int_a^b f(x)dx=F(b)-F(a)",
        "A=\\int_a^b[f(x)-g(x)]dx",
        "V=\\pi\\int_a^b[f(x)]^{2}dx",
      ],
    }),
  ],
};
