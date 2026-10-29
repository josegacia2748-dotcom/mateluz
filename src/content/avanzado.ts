import type { Module } from "./types";
import { checklist, example, exercise, graph, lesson, math, note, s, table, text } from "./blocks";

export const avanzado: Module = {
  id: "avanzado",
  title: "Cálculo Avanzado",
  short: "Avanzado",
  description:
    "Series, ecuaciones diferenciales, Taylor y métodos numéricos para ingeniería.",
  icon: "∑",
  accent: "teal",
  lessons: [
    lesson({
      id: "avanzado-series",
      title: "Sucesiones y series",
      subtitle: "Convergencia, series geométricas y criterios",
      minutes: 28,
      level: "Avanzado",
      objectives: [
        "Distinguir sucesión de serie y estudiar su convergencia.",
        "Sumar series geométricas y telescópicas.",
        "Aplicar los criterios de la razón, la raíz y comparación.",
      ],
      blocks: [
        text(
          "Una **sucesión** es una lista ordenada $a_1,a_2,a_3,\\dots$; una **serie** es la suma de sus términos. La pregunta central es si esa suma infinita se acerca a un número finito. Si las sumas parciales $S_n=a_1+\\dots+a_n$ tienen límite, la serie converge.",
        ),
        math("\\sum_{n=1}^{\\infty}a_n=\\lim_{n\\to\\infty}S_n,\\qquad S_n=\\sum_{k=1}^{n}a_k", "Serie y sumas parciales"),
        note(
          "**Condición necesaria.** Si $\\sum a_n$ converge, entonces $a_n\\to0$. El recíproco es falso: la serie armónica $\\sum1/n$ tiene términos que tienden a cero pero diverge. Por eso $a_n\\to0$ sirve para detectar divergencia, no para probar convergencia.",
          { title: "Cuidado con el recíproco", tone: "warn" },
        ),
        text(
          "**Serie geométrica.** $\\sum_{n=0}^{\\infty}ar^n=\\frac{a}{1-r}$ si $|r|<1$; diverge si $|r|\\ge1$. Es la serie más importante en la práctica: aparece en interés compuesto, señales discretas y amortiguamientos.",
        ),
        math("\\sum_{n=0}^{\\infty}ar^{n}=\\frac{a}{1-r}\\quad(|r|<1)", "Serie geométrica"),
        example(
          "Serie geométrica",
          "Calcular $\\displaystyle\\sum_{n=0}^{\\infty}\\left(\\frac{1}{3}\\right)^n$.",
          [
            s("Identificamos", "a=1,\\quad r=\\frac{1}{3}", "Primer término y razón."),
            s("Verificamos convergencia", "|r|=\\frac{1}{3}<1", "La serie converge."),
            s("Aplicamos la fórmula", "S=\\frac{1}{1-\\frac{1}{3}}", "Sustituimos."),
            s("Simplificamos", "S=\\frac{1}{\\frac{2}{3}}=\\frac{3}{2}", "Suma total."),
            s("Comprobación parcial", "1+\\frac{1}{3}+\\frac{1}{9}+\\dots=1{,}5", "Las sumas parciales se acercan a 1,5."),
          ],
          "3/2",
        ),
        table(
          ["Criterio", "Cuándo usarlo", "Conclusión"],
          [
            ["Término n-ésimo", "aₙ no tiende a 0", "diverge"],
            ["Geométrica", "razón constante", "converge si |r| < 1"],
            ["Comparación", "términos positivos y cota conocida", "hereda convergencia"],
            ["Razón (D'Alembert)", "factoriales y exponenciales", "L < 1 converge, L > 1 diverge"],
            ["Raíz (Cauchy)", "potencias n-ésimas", "L < 1 converge, L > 1 diverge"],
            ["Integral", "f(n) decreciente y positiva", "serie y integral comparten destino"],
          ],
          "Criterios de convergencia",
        ),
        example(
          "Criterio de la razón",
          "Estudiar $\\displaystyle\\sum_{n=1}^{\\infty}\\frac{n}{2^n}$.",
          [
            s("Término general", "a_n=\\frac{n}{2^{n}}"),
            s("Cociente", "\\frac{a_{n+1}}{a_n}=\\frac{n+1}{2^{n+1}}\\cdot\\frac{2^{n}}{n}", "Invertimos y multiplicamos."),
            s("Simplificamos", "=\\frac{n+1}{2n}"),
            s("Límite", "\\lim_{n\\to\\infty}\\frac{n+1}{2n}=\\frac{1}{2}", "L = 1/2."),
            s("Conclusión", "L<1\\Rightarrow\\text{converge}", "El criterio de la razón decide."),
          ],
          "Converge (L = 1/2).",
        ),
        graph({
          series: [
            { expr: "1/x", label: "f(x)=1/x", color: "rose" },
            { expr: "1/x^2", label: "g(x)=1/x²", color: "teal" },
          ],
          xmin: 0.4,
          xmax: 8,
          ymin: 0,
          ymax: 2.5,
          title: "Armónica vs. armónica cuadrática",
          caption: "∫1/x diverge; ∫1/x² converge. La integral decide la serie.",
        }),
        exercise({
          id: "av-ser-1",
          prompt: "¿Converge $\\displaystyle\\sum_{n=1}^{\\infty}\\frac{1}{n}$?",
          hint: "Es la serie armónica. Compara con la integral de 1/x.",
          answer: "No: diverge, aunque sus términos tiendan a cero.",
          choices: [
            "No: diverge, aunque sus términos tiendan a cero.",
            "Sí: converge a 1.",
            "Sí: converge a 0.",
            "No se puede decidir.",
          ],
          correct: 0,
          solution: [
            s("Término general", "a_n=\\frac{1}{n}\\to0", "La condición necesaria se cumple."),
            s("Integral asociada", "\\int_1^{\\infty}\\frac{1}{x}dx=\\lim_{b\\to\\infty}\\ln b=\\infty", "Diverge."),
            s("Conclusión", "\\sum\\frac{1}{n}\\text{ diverge}", "La condición necesaria no es suficiente."),
          ],
        }),
        checklist([
          "No confundo sucesión con serie.",
          "Verifico el término n-ésimo antes de aplicar criterios.",
          "Reconozco una geométrica por su razón constante.",
        ]),
      ],
      keyFormulas: [
        "\\sum_{n=0}^{\\infty}ar^{n}=\\frac{a}{1-r}\\;(|r|<1)",
        "\\lim_{n\\to\\infty}a_n=0 \\text{ es necesario, no suficiente}",
        "L=\\lim\\left|\\frac{a_{n+1}}{a_n}\\right|",
      ],
    }),

    lesson({
      id: "avanzado-edo",
      title: "Ecuaciones diferenciales de primer orden",
      subtitle: "Modelar cambios: separables y lineales",
      minutes: 30,
      level: "Avanzado",
      objectives: [
        "Reconocer una ecuación diferencial y su orden.",
        "Resolver EDO separables y lineales de primer orden.",
        "Interpretar la solución y la condición inicial.",
      ],
      blocks: [
        text(
          "Una **ecuación diferencial** relaciona una función con sus derivadas. Aparecen cuando modelamos crecimiento, enfriamiento, circuitos, mezclas o decaimiento radiactivo. Resolverla es encontrar la función, no un número.",
        ),
        math("\\frac{dy}{dx}=f(x,y)", "EDO de primer orden"),
        note(
          "Una solución general contiene una constante arbitraria. La **condición inicial** $y(x_0)=y_0$ fija esa constante y produce la solución particular. Sin condición inicial hay infinitas soluciones.",
          { title: "General vs. particular", tone: "key" },
        ),
        text(
          "**Separables.** Si podemos escribir $\\frac{dy}{dx}=g(x)h(y)$, separamos $\\frac{dy}{h(y)}=g(x)\\,dx$ e integramos ambos lados. Es la técnica más directa y cubre muchos modelos introductorios.",
        ),
        math("\\int\\frac{dy}{h(y)}=\\int g(x)\\,dx", "Variables separadas"),
        example(
          "Decaimiento exponencial",
          "Resolver $\\dfrac{dy}{dx}=-ky$ con $y(0)=y_0$.",
          [
            s("Separamos", "\\frac{dy}{y}=-k\\,dx", "Variables a cada lado."),
            s("Integramos", "\\ln|y|=-kx+C", "Integral de 1/y."),
            s("Exponenciamos", "|y|=e^{C}e^{-kx}", "Propiedad de la exponencial."),
            s("Constante", "y=Ae^{-kx}", "A absorbe el signo y la constante."),
            s("Condición inicial", "y(0)=A=y_0", "Evaluamos en x = 0."),
            s("Solución", "y=y_0e^{-kx}", "Decaimiento exponencial."),
          ],
          "y = y₀ e^(−kx)",
        ),
        graph({
          series: [
            { expr: "5*exp(-0.4x)", label: "y₀=5, k=0,4", color: "indigo" },
            { expr: "5*exp(-1.2x)", label: "k=1,2", color: "amber" },
          ],
          xmin: 0,
          xmax: 8,
          ymin: 0,
          ymax: 6,
          title: "La constante k controla la rapidez del decaimiento",
        }),
        text(
          "**Lineales de primer orden.** Tienen la forma $y'+P(x)y=Q(x)$. Se multiplica por el factor integrante $\\mu(x)=e^{\\int P(x)dx}$, que convierte el lado izquierdo en la derivada de $\\mu y$. Luego se integra.",
        ),
        math("y'+P(x)y=Q(x)\\;\\Longrightarrow\\;\\mu(x)=e^{\\int P(x)dx}", "Factor integrante"),
        example(
          "EDO lineal",
          "Resolver $y'+2y=4$ con $y(0)=0$.",
          [
            s("Forma estándar", "P(x)=2,\\quad Q(x)=4", "Ya está despejada y'."),
            s("Factor integrante", "\\mu=e^{\\int2\\,dx}=e^{2x}"),
            s("Multiplicamos", "e^{2x}y'+2e^{2x}y=4e^{2x}", "El lado izquierdo es (μy)'."),
            s("Reescribimos", "\\left(e^{2x}y\\right)'=4e^{2x}"),
            s("Integramos", "e^{2x}y=2e^{2x}+C"),
            s("Despejamos", "y=2+Ce^{-2x}", "Solución general."),
            s("Condición inicial", "0=2+C\\Rightarrow C=-2"),
            s("Solución particular", "y=2\\left(1-e^{-2x}\\right)", "Se acerca a 2 cuando x crece."),
          ],
          "y = 2(1 − e^(−2x))",
        ),
        table(
          ["Modelo", "EDO", "Solución"],
          [
            ["Crecimiento/decaimiento", "y' = ky", "y = y₀e^{kt}"],
            ["Enfriamiento de Newton", "T' = −k(T − Tₘ)", "T = Tₘ + (T₀ − Tₘ)e^{−kt}"],
            ["Circuito RL", "L i' + R i = V", "i = V/R + Ce^{−Rt/L}"],
            ["Mezcla", "V c' = qₑcₑ − qₛc", "depende de los caudales"],
          ],
          "EDO en ingeniería",
        ),
        exercise({
          id: "av-edo-1",
          prompt: "La solución de $y'=3y$ con $y(0)=2$ es:",
          hint: "Es un crecimiento exponencial con k = 3.",
          answer: "y = 2e^(3x)",
          choices: ["y = 2e^(3x)", "y = 3e^(2x)", "y = 2e^(−3x)", "y = 6x"],
          correct: 0,
          solution: [
            s("Separamos", "\\frac{dy}{y}=3\\,dx"),
            s("Integramos", "\\ln|y|=3x+C"),
            s("General", "y=Ae^{3x}"),
            s("Inicial", "A=2"),
          ],
        }),
        checklist([
          "Identifico el orden de la EDO.",
          "Separo variables solo si el producto lo permite.",
          "Aplico la condición inicial al final, no antes.",
        ]),
      ],
      keyFormulas: [
        "\\frac{dy}{dx}=g(x)h(y)\\Rightarrow\\int\\frac{dy}{h(y)}=\\int g(x)dx",
        "\\mu(x)=e^{\\int P(x)dx}",
        "y=y_0e^{k(x-x_0)}",
      ],
    }),

    lesson({
      id: "avanzado-taylor",
      title: "Aproximación de Taylor y error",
      subtitle: "Polinomios que imitan funciones",
      minutes: 26,
      level: "Avanzado",
      objectives: [
        "Construir el polinomio de Taylor de una función.",
        "Usar desarrollos conocidos (eˣ, sen x, cos x, ln(1+x)).",
        "Estimar el error de una aproximación.",
      ],
      blocks: [
        text(
          "Las calculadoras no evalúan $\\operatorname{sen}x$ con geometría: usan polinomios. El **polinomio de Taylor** de grado $n$ alrededor de $a$ imita a la función hasta la derivada $n$-ésima en ese punto. Cuanto mayor el grado y más cerca de $a$, mejor la aproximación.",
        ),
        math(
          "P_n(x)=\\sum_{k=0}^{n}\\frac{f^{(k)}(a)}{k!}(x-a)^{k}",
          "Polinomio de Taylor",
        ),
        note(
          "El caso $a=0$ se llama **serie de Maclaurin**. El resto $R_n(x)=f(x)-P_n(x)$ mide el error. Una forma útil es $R_n(x)=\\frac{f^{(n+1)}(c)}{(n+1)!}(x-a)^{n+1}$ para algún $c$ entre $a$ y $x$.",
          { title: "Error controlado", tone: "key" },
        ),
        table(
          ["Función", "Desarrollo en 0", "Radio"],
          [
            ["eˣ", "1 + x + x²/2! + x³/3! + …", "∞"],
            ["sen x", "x − x³/3! + x⁵/5! − …", "∞"],
            ["cos x", "1 − x²/2! + x⁴/4! − …", "∞"],
            ["ln(1+x)", "x − x²/2 + x³/3 − …", "|x| < 1"],
            ["1/(1−x)", "1 + x + x² + x³ + …", "|x| < 1"],
          ],
          "Desarrollos fundamentales",
        ),
        example(
          "Taylor de eˣ",
          "Construir $P_4(x)$ para $f(x)=e^x$ alrededor de 0 y aproximar $e^{0{,}5}$.",
          [
            s("Derivadas", "f^{(k)}(x)=e^{x}\\Rightarrow f^{(k)}(0)=1", "Todas valen 1 en 0."),
            s("Fórmula", "P_4(x)=1+x+\\frac{x^{2}}{2!}+\\frac{x^{3}}{3!}+\\frac{x^{4}}{4!}", "Coeficientes 1/k!."),
            s("Sustituimos", "P_4(0{,}5)=1+0{,}5+0{,}125+0{,}0208+0{,}0026", "Cada término."),
            s("Sumamos", "P_4(0{,}5)\\approx1{,}6484", "Aproximación."),
            s("Valor real", "e^{0{,}5}\\approx1{,}6487", "Error menor que 0,0003."),
          ],
          "P₄(0,5) ≈ 1,6484; error < 0,0003",
        ),
        graph({
          series: [
            { expr: "exp(x)", label: "eˣ", color: "indigo" },
            { expr: "1+x+x^2/2", label: "P₂", color: "amber", dashed: true },
            { expr: "1+x+x^2/2+x^3/6", label: "P₃", color: "teal", dashed: true },
          ],
          xmin: -2,
          xmax: 2,
          ymin: -1,
          ymax: 8,
          title: "Los polinomios se pegan a eˣ cerca de 0",
          caption: "Lejos del centro, el error crece rápidamente.",
        }),
        example(
          "Aproximar sen x",
          "Usar $P_3(x)=x-\\frac{x^3}{6}$ para estimar $\\operatorname{sen}(0{,}2)$.",
          [
            s("Desarrollo", "\\operatorname{sen}x\\approx x-\\frac{x^{3}}{6}", "Hasta grado 3."),
            s("Sustituimos", "0{,}2-\\frac{0{,}008}{6}", "x³ = 0,008."),
            s("Calculamos", "0{,}2-0{,}001333\\approx0{,}198667", "Aproximación."),
            s("Valor real", "\\operatorname{sen}(0{,}2)\\approx0{,}198669", "Error del orden de 10⁻⁶."),
          ],
          "≈ 0,198667",
        ),
        exercise({
          id: "av-tay-1",
          prompt: "¿Cuál es el polinomio de Taylor de grado 2 de $f(x)=\\cos x$ en 0?",
          hint: "cos 0 = 1, cos' 0 = 0, cos'' 0 = −1.",
          answer: "1 − x²/2",
          choices: ["1 − x²/2", "1 + x²/2", "x − x³/6", "1 − x"],
          correct: 0,
          solution: [
            s("Derivadas en 0", "f(0)=1,\\quad f'(0)=0,\\quad f''(0)=-1"),
            s("Fórmula", "P_2(x)=1+0\\cdot x-\\frac{1}{2}x^{2}"),
            s("Resultado", "1-\\frac{x^{2}}{2}"),
          ],
        }),
        checklist([
          "Calculo las derivadas en el centro, no en x.",
          "Divido cada término por k!.",
          "Recuerdo que la aproximación es local.",
        ]),
      ],
      keyFormulas: [
        "P_n(x)=\\sum_{k=0}^{n}\\frac{f^{(k)}(a)}{k!}(x-a)^{k}",
        "e^{x}=\\sum_{k=0}^{\\infty}\\frac{x^{k}}{k!}",
        "\\operatorname{sen}x=\\sum_{k=0}^{\\infty}\\frac{(-1)^{k}x^{2k+1}}{(2k+1)!}",
      ],
    }),

    lesson({
      id: "avanzado-numerico",
      title: "Métodos numéricos y cálculo vectorial",
      subtitle: "Cuando la solución exacta no está disponible",
      minutes: 28,
      level: "Avanzado",
      objectives: [
        "Aproximar raíces con bisección y Newton-Raphson.",
        "Integrar numéricamente con trapecios y Simpson.",
        "Interpretar gradiente, divergencia y rotacional.",
      ],
      blocks: [
        text(
          "Muchas ecuaciones de ingeniería no tienen solución cerrada. Los **métodos numéricos** construyen aproximaciones sucesivas con error controlado. No reemplazan el cálculo: lo usan. Bisección se apoya en el TVM; Newton en la recta tangente; Simpson en la interpolación cuadrática.",
        ),
        math("x_{n+1}=x_n-\\frac{f(x_n)}{f'(x_n)}", "Newton-Raphson"),
        note(
          "**Bisección** es lenta pero segura: si $f(a)$ y $f(b)$ tienen signos opuestos, se parte el intervalo y se conserva el subintervalo con cambio de signo. **Newton** es mucho más rápido cerca de la raíz, pero puede divergir si $f'(x_n)$ es pequeño o si la semilla está lejos.",
          { title: "Velocidad vs. garantía", tone: "key" },
        ),
        example(
          "Una iteración de Newton",
          "Aproximar la raíz de $f(x)=x^2-2$ partiendo de $x_0=1$.",
          [
            s("Función y derivada", "f(x)=x^{2}-2,\\quad f'(x)=2x", "Derivada simple."),
            s("Fórmula", "x_1=x_0-\\frac{x_0^{2}-2}{2x_0}", "Sustituimos."),
            s("Evaluamos", "x_1=1-\\frac{1-2}{2}=1+\\frac{1}{2}", "f(1) = −1."),
            s("Resultado", "x_1=1{,}5", "Ya se acerca a √2 ≈ 1,4142."),
            s("Segunda iteración", "x_2=1{,}5-\\frac{0{,}25}{3}\\approx1{,}4167", "Convergencia cuadrática."),
          ],
          "x₁ = 1,5; x₂ ≈ 1,4167",
        ),
        text(
          "**Integración numérica.** La regla del trapecio aproxima el área con trapecios; Simpson usa parábolas y suele ser mucho más precisa con el mismo número de puntos. Si $n$ es par, $\\int_a^b f\\approx\\frac{h}{3}\\left[f_0+4f_1+2f_2+\\cdots+4f_{n-1}+f_n\\right]$.",
        ),
        math(
          "\\int_a^b f(x)dx\\approx\\frac{h}{3}\\left[f_0+4\\sum_{\\text{impar}}f_i+2\\sum_{\\text{par}}f_i+f_n\\right]",
          "Regla de Simpson 1/3",
        ),
        table(
          ["Método", "Idea", "Ventaja", "Riesgo"],
          [
            ["Bisección", "partir el intervalo", "siempre converge", "lento"],
            ["Newton-Raphson", "tangente", "muy rápido", "puede divergir"],
            ["Trapecio", "rectas", "simple", "error O(h²)"],
            ["Simpson", "parábolas", "preciso", "requiere n par"],
          ],
          "Comparación de métodos",
        ),
        text(
          "**Cálculo vectorial.** El gradiente $\\nabla f$ apunta en la dirección de máximo crecimiento; la divergencia mide cuánto «sale» un campo de un punto; el rotacional mide la circulación local. Son el lenguaje de la mecánica de fluidos, el electromagnetismo y la transferencia de calor.",
        ),
        math(
          "\\nabla f=\\left(\\frac{\\partial f}{\\partial x},\\frac{\\partial f}{\\partial y}\\right),\\quad \\nabla\\cdot\\mathbf{F}=\\frac{\\partial F_x}{\\partial x}+\\frac{\\partial F_y}{\\partial y}",
          "Gradiente y divergencia",
        ),
        example(
          "Gradiente de un campo escalar",
          "Hallar $\\nabla f$ para $f(x,y)=x^2y+3y^2$ en $(1,2)$.",
          [
            s("Derivada parcial en x", "f_x=2xy", "y se trata como constante."),
            s("Derivada parcial en y", "f_y=x^{2}+6y", "x se trata como constante."),
            s("Evaluamos", "\\nabla f(1,2)=(4,\\,13)", "Sustituimos x = 1, y = 2."),
            s("Interpretación", "\\text{máximo crecimiento en dirección }(4,13)", "La magnitud es √185 ≈ 13,6."),
          ],
          "∇f(1,2) = (4, 13)",
        ),
        exercise({
          id: "av-num-1",
          prompt:
            "Si $f(1)=-2$ y $f(2)=3$, ¿qué método garantiza encontrar una raíz en [1,2]?",
          hint: "Hay cambio de signo. ¿Qué teorema lo garantiza?",
          answer: "Bisección, por el teorema del valor intermedio.",
          choices: [
            "Bisección, por el teorema del valor intermedio.",
            "Newton-Raphson, siempre.",
            "Simpson.",
            "Ninguno: no se puede saber.",
          ],
          correct: 0,
          solution: [
            s("Hipótesis", "f \\text{ continua y } f(1)<0<f(2)", "Cambio de signo."),
            s("TVM", "\\exists c\\in(1,2): f(c)=0"),
            s("Método", "\\text{bisección conserva el cambio de signo}", "Convergencia garantizada."),
          ],
        }),
        checklist([
          "Verifico el cambio de signo antes de usar bisección.",
          "Para Newton, calculo f' y evito derivadas nulas.",
          "En Simpson, uso un número par de subintervalos.",
        ]),
      ],
      keyFormulas: [
        "x_{n+1}=x_n-\\frac{f(x_n)}{f'(x_n)}",
        "\\int_a^b f\\approx\\frac{h}{3}[f_0+4f_1+2f_2+\\cdots+f_n]",
        "\\nabla f=(f_x,f_y)",
      ],
    }),
  ],
};
