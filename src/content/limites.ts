import type { Module } from "./types";
import { checklist, example, exercise, graph, lesson, math, note, s, table, text } from "./blocks";

export const limites: Module = {
  id: "limites",
  title: "Límites y Continuidad",
  short: "Límites",
  description:
    "El concepto que sostiene todo el cálculo: acercarse sin necesariamente llegar.",
  icon: "→",
  accent: "teal",
  lessons: [
    lesson({
      id: "limites-concepto",
      title: "La idea de límite y la definición ε-δ",
      subtitle: "Qué significa «acercarse» con rigor",
      minutes: 24,
      level: "Intermedio",
      objectives: [
        "Interpretar el límite como comportamiento cerca de un punto.",
        "Leer y escribir la definición ε-δ.",
        "Demostrar límites lineales con la definición formal.",
      ],
      blocks: [
        text(
          "El límite responde a una pregunta: **¿a qué valor se acerca $f(x)$ cuando $x$ se acerca a $a$?** No pregunta cuánto vale $f(a)$; de hecho, $f$ puede no estar definida en $a$. Solo importa el comportamiento en una vecindad. Esta distinción es la que permite definir derivadas, donde el cociente se vuelve $0/0$ justo en el punto.",
        ),
        math("\\lim_{x\\to a} f(x)=L", "Escritura del límite"),
        text(
          "Decir «se acerca» es intuitivo pero insuficiente para demostrar. La definición formal, debida a Weierstrass, convierte la idea en un juego de tolerancias: **para cada** error $\\varepsilon>0$ que me exijas en la salida, **existe** una distancia $\\delta>0$ en la entrada tal que si $0<|x-a|<\\delta$, entonces $|f(x)-L|<\\varepsilon$.",
        ),
        math(
          "\\forall\\varepsilon>0\\;\\exists\\delta>0:\\; 0<|x-a|<\\delta \\Rightarrow |f(x)-L|<\\varepsilon",
          "Definición ε-δ",
        ),
        note(
          "La condición $0<|x-a|$ excluye el punto $a$. El límite **no depende del valor en a**, solo de lo que ocurre alrededor. Si $f$ está definida en $a$ y además $\\lim_{x\\to a}f(x)=f(a)$, diremos que $f$ es continua en $a$.",
          { title: "El punto queda excluido", tone: "key" },
        ),
        example(
          "Demostración ε-δ de un límite lineal",
          "Demostrar que $\\lim_{x\\to3}(2x+1)=7$.",
          [
            s("Planteamos la distancia", "|f(x)-L| = |(2x+1)-7| = |2x-6|", "Simplificamos la expresión."),
            s("Factorizamos", "|2x-6| = 2|x-3|", "Sacamos el 2."),
            s("Buscamos la cota", "2|x-3| < \\varepsilon \\iff |x-3| < \\frac{\\varepsilon}{2}", "Despejamos la distancia al punto."),
            s("Elegimos δ", "\\delta = \\frac{\\varepsilon}{2}", "Esta elección depende de ε."),
            s("Verificamos", "0<|x-3|<\\delta \\Rightarrow |f(x)-7| = 2|x-3| < 2\\delta = \\varepsilon", "Se cumple la implicación de la definición."),
            s("Conclusión", "\\therefore \\lim_{x\\to3}(2x+1)=7", "Queda demostrado para todo ε > 0."),
          ],
          "El límite es 7.",
        ),
        graph({
          series: [
            { expr: "2x+1", label: "f(x)=2x+1", color: "indigo" },
            { expr: "7", label: "L=7", color: "amber", dashed: true },
          ],
          xmin: 1,
          xmax: 5,
          ymin: 1,
          ymax: 12,
          points: [{ x: 3, y: 7, label: "(3,7)" }],
          title: "Cerca de x = 3, la recta pasa por y = 7",
          caption: "La banda vertical de ancho 2δ produce una banda horizontal de ancho ε.",
        }),
        text(
          "**Unicidad.** Si un límite existe, es único. Supón que hubiera dos valores $L_1\\neq L_2$. Toma $\\varepsilon=|L_1-L_2|/2$; las dos definiciones exigirían que $f(x)$ estuviera simultáneamente en dos intervalos disjuntos, lo cual es imposible. Por eso podemos hablar de *el* límite.",
        ),
        table(
          ["Expresión", "Se lee", "Significado"],
          [
            ["lim f(x) = L", "límite bilateral", "se acerca igual por ambos lados"],
            ["lim f(x) = ∞", "tiende a infinito", "crece sin cota"],
            ["lim f(x) = L", "en el infinito", "comportamiento para x grande"],
            ["f(a) = L", "valor en el punto", "evaluación directa"],
          ],
          "Notaciones y su lectura",
        ),
        exercise({
          id: "lim-con-1",
          prompt:
            "En la definición ε-δ, ¿qué papel cumple la condición $0<|x-a|<\\delta$?",
          hint: "Piensa si el valor f(a) importa para el límite.",
          answer: "Excluye el punto a: el límite solo mira lo que pasa alrededor.",
          choices: [
            "Excluye el punto a: solo importa el entorno.",
            "Obliga a que f sea continua en a.",
            "Garantiza que el límite sea finito.",
            "Exige que x sea positivo.",
          ],
          correct: 0,
          solution: [
            s("Lectura", "0<|x-a|", "La distancia es positiva, así que x ≠ a."),
            s("Consecuencia", "\\lim_{x\\to a}f(x) \\text{ no depende de } f(a)", "El punto puede incluso no pertenecer al dominio."),
          ],
        }),
        checklist([
          "Entiendo que el límite no evalúa el punto.",
          "Sé escribir la definición ε-δ con cuantificadores.",
          "Puedo elegir δ en función de ε para funciones lineales.",
        ]),
      ],
      keyFormulas: [
        "\\lim_{x\\to a}f(x)=L",
        "\\forall\\varepsilon>0\\;\\exists\\delta>0: 0<|x-a|<\\delta\\Rightarrow|f(x)-L|<\\varepsilon",
      ],
    }),

    lesson({
      id: "limites-laterales",
      title: "Límites laterales y existencia",
      subtitle: "Izquierda, derecha y el requisito de coincidencia",
      minutes: 20,
      level: "Intermedio",
      objectives: [
        "Calcular límites laterales en funciones definidas por partes.",
        "Decidir la existencia del límite bilateral comparando laterales.",
        "Reconocer saltos, asíntotas y discontinuidades evitables.",
      ],
      blocks: [
        text(
          "Cuando $x$ se acerca a $a$ por la izquierda, escribimos $x\\to a^-$; por la derecha, $x\\to a^+$. El límite bilateral existe **si y solo si** ambos laterales existen y son iguales. Esta condición es la definición operativa de existencia y la primera herramienta para analizar funciones partidas.",
        ),
        math(
          "\\lim_{x\\to a}f(x)=L \\iff \\lim_{x\\to a^-}f(x)=\\lim_{x\\to a^+}f(x)=L",
          "Criterio de existencia",
        ),
        example(
          "Función definida por partes",
          "Analizar $f(x)=\\begin{cases}x^2 & x<1\\\\ 2x & x\\ge1\\end{cases}$ en $x=1$.",
          [
            s("Lateral izquierdo", "\\lim_{x\\to1^-}f(x)=\\lim_{x\\to1^-}x^{2}=1", "Para x < 1 usamos la rama x²."),
            s("Lateral derecho", "\\lim_{x\\to1^+}f(x)=\\lim_{x\\to1^+}2x=2", "Para x ≥ 1 usamos la rama 2x."),
            s("Comparamos", "1 \\neq 2", "Los laterales no coinciden."),
            s("Conclusión", "\\lim_{x\\to1}f(x) \\text{ no existe}", "Hay un salto de altura 1."),
            s("Valor en el punto", "f(1)=2", "La función está definida, pero eso no arregla el límite."),
          ],
          "El límite bilateral no existe (salto).",
        ),
        graph({
          series: [
            { expr: "x^2", label: "rama x² (x<1)", color: "indigo" },
            { expr: "2x", label: "rama 2x (x≥1)", color: "amber" },
          ],
          xmin: -1,
          xmax: 3,
          ymin: -0.5,
          ymax: 6,
          points: [
            { x: 1, y: 1, label: "límite izq." },
            { x: 1, y: 2, label: "f(1)" },
          ],
          title: "Salto en x = 1",
          caption: "Por la izquierda se llega a 1; por la derecha, a 2.",
        }),
        text(
          "**Valor absoluto.** La función $f(x)=\\frac{|x|}{x}$ vale $1$ si $x>0$ y $-1$ si $x<0$. En $x=0$ no está definida y sus laterales son distintos: $-1$ y $1$. Es el ejemplo clásico de discontinuidad de salto. En cambio, $\\frac{x^2-1}{x-1}$ tiene una discontinuidad **evitable**: ambos laterales valen 2, pero el punto no pertenece al dominio original.",
        ),
        note(
          "**Clasificación de discontinuidades.** *Evitable:* el límite existe pero no coincide con $f(a)$ (o $f(a)$ no existe). *De salto:* los laterales existen y son distintos. *Infinita:* algún lateral tiende a ±∞ (asíntota vertical). *Esencial:* el límite no existe por oscilación, como $\\operatorname{sen}(1/x)$ en 0.",
          { title: "Cuatro tipos", tone: "key" },
        ),
        example(
          "Discontinuidad evitable",
          "Analizar $g(x)=\\dfrac{x^2-1}{x-1}$ en $x=1$.",
          [
            s("Dominio", "x\\neq1", "El denominador se anula en 1."),
            s("Factorizamos", "\\frac{(x-1)(x+1)}{x-1}", "Diferencia de cuadrados."),
            s("Simplificamos", "x+1 \\quad (x\\neq1)", "Válido para todo x distinto de 1."),
            s("Límite", "\\lim_{x\\to1}(x+1)=2", "Ambos laterales coinciden."),
            s("Comparación con f(1)", "g(1) \\text{ no existe}", "La discontinuidad es evitable: bastaría definir g(1)=2."),
          ],
          "Límite = 2; discontinuidad evitable.",
        ),
        exercise({
          id: "lim-lat-1",
          prompt:
            "Si $\\lim_{x\\to2^-}f(x)=5$ y $\\lim_{x\\to2^+}f(x)=-3$, ¿qué se concluye?",
          hint: "El límite bilateral exige que ambos laterales sean iguales.",
          answer: "El límite bilateral no existe: hay un salto.",
          choices: [
            "El límite bilateral no existe: hay un salto.",
            "El límite vale 2.",
            "El límite vale 5.",
            "f(2) = −3.",
          ],
          correct: 0,
          solution: [
            s("Criterio", "\\lim_{x\\to2^-}f \\neq \\lim_{x\\to2^+}f"),
            s("Conclusión", "\\lim_{x\\to2}f(x) \\text{ no existe}", "Es una discontinuidad de salto."),
          ],
        }),
        checklist([
          "Comparo siempre ambos laterales antes de concluir.",
          "Distingo discontinuidad evitable de salto.",
          "Una asíntota vertical produce laterales infinitos.",
        ]),
      ],
      keyFormulas: ["\\lim_{x\\to a^-}f=\\lim_{x\\to a^+}f=L \\iff \\lim_{x\\to a}f=L"],
    }),

    lesson({
      id: "limites-indeterminaciones",
      title: "Indeterminaciones y técnicas de cálculo",
      subtitle: "0/0, ∞/∞ y las transformaciones que las resuelven",
      minutes: 26,
      level: "Avanzado",
      objectives: [
        "Reconocer las siete formas indeterminadas.",
        "Resolver 0/0 por factorización, racionalización y L'Hôpital.",
        "Usar límites notables y equivalencias trigonométricas.",
      ],
      blocks: [
        text(
          "Una **indeterminación** es una expresión que no permite decidir el límite por simple sustitución. No es un error: es una señal de que hay que transformar la expresión. Las formas clásicas son $\\frac{0}{0}$, $\\frac{\\infty}{\\infty}$, $0\\cdot\\infty$, $\\infty-\\infty$, $0^0$, $1^\\infty$ y $\\infty^0$.",
        ),
        math("\\lim_{x\\to0}\\frac{\\operatorname{sen}x}{x}=1", "Límite notable fundamental"),
        text(
          "**Estrategia general.** (1) Sustituir para identificar la forma. (2) Si es $0/0$ y hay polinomios, factorizar y cancelar. (3) Si hay raíces, multiplicar por el conjugado. (4) Si hay funciones trigonométricas, usar identidades y el límite notable. (5) Si persiste, aplicar L'Hôpital, que requiere derivar numerador y denominador por separado.",
        ),
        note(
          "**L'Hôpital** solo se aplica a $0/0$ o $\\infty/\\infty$. No es la derivada de un cociente: se derivan numerador y denominador **por separado**, no se usa la regla del cociente. Aplicarlo fuera de esas formas produce resultados falsos.",
          { title: "Condición de L'Hôpital", tone: "warn" },
        ),
        example(
          "Factorización",
          "Calcular $\\lim_{x\\to2}\\dfrac{x^2-4}{x-2}$.",
          [
            s("Sustitución directa", "\\frac{4-4}{2-2}=\\frac{0}{0}", "Indeterminación."),
            s("Factorizamos", "x^{2}-4=(x-2)(x+2)", "Diferencia de cuadrados."),
            s("Cancelamos", "\\frac{(x-2)(x+2)}{x-2}=x+2 \\quad (x\\neq2)", "El factor común se anula fuera del punto."),
            s("Nuevo límite", "\\lim_{x\\to2}(x+2)=4", "Ya no hay indeterminación."),
          ],
          "4",
        ),
        example(
          "Racionalización",
          "Calcular $\\lim_{x\\to0}\\dfrac{\\sqrt{x+1}-1}{x}$.",
          [
            s("Sustitución", "\\frac{1-1}{0}=\\frac{0}{0}", "Indeterminación."),
            s("Multiplicamos por el conjugado", "\\frac{\\sqrt{x+1}-1}{x}\\cdot\\frac{\\sqrt{x+1}+1}{\\sqrt{x+1}+1}", "El conjugado elimina la raíz del numerador."),
            s("Diferencia de cuadrados", "\\frac{(x+1)-1}{x(\\sqrt{x+1}+1)}=\\frac{x}{x(\\sqrt{x+1}+1)}", "Simplificamos el numerador."),
            s("Cancelamos x", "\\frac{1}{\\sqrt{x+1}+1} \\quad (x\\neq0)", "Válido alrededor de 0."),
            s("Límite", "\\frac{1}{1+1}=\\frac{1}{2}", "Sustituimos x = 0."),
          ],
          "1/2",
        ),
        example(
          "L'Hôpital dos veces",
          "Calcular $\\lim_{x\\to0}\\dfrac{1-\\cos x}{x^2}$.",
          [
            s("Sustitución", "\\frac{1-1}{0}=\\frac{0}{0}", "Indeterminación."),
            s("Primera derivada", "\\lim_{x\\to0}\\frac{\\operatorname{sen}x}{2x}", "Derivamos numerador y denominador."),
            s("Sigue 0/0", "\\frac{0}{0}", "Aplicamos otra vez."),
            s("Segunda derivada", "\\lim_{x\\to0}\\frac{\\cos x}{2}", "Derivamos de nuevo."),
            s("Evaluamos", "\\frac{1}{2}", "cos 0 = 1."),
          ],
          "1/2",
        ),
        graph({
          series: [
            { expr: "sin(x)/x", label: "sen(x)/x", color: "teal" },
            { expr: "1", label: "y = 1", color: "amber", dashed: true },
          ],
          xmin: -12,
          xmax: 12,
          ymin: -0.4,
          ymax: 1.4,
          points: [{ x: 0, y: 1, label: "límite = 1" }],
          title: "La función oscila, pero se acerca a 1",
          caption: "En x = 0 no está definida; el límite existe y vale 1.",
        }),
        table(
          ["Forma", "Técnica típica"],
          [
            ["0/0", "factorizar, conjugado, L'Hôpital"],
            ["∞/∞", "dividir por la potencia dominante"],
            ["∞ − ∞", "común denominador o conjugado"],
            ["0·∞", "reescribir como cociente"],
            ["1^∞", "logaritmo y límite notable (1+1/n)ⁿ"],
          ],
          "Qué hacer según la forma",
        ),
        exercise({
          id: "lim-ind-1",
          prompt: "Calcula $\\lim_{x\\to0}\\dfrac{\\operatorname{sen}(3x)}{x}$.",
          hint: "Multiplica y divide por 3 para formar el límite notable sen(u)/u.",
          answer: "3",
          choices: ["3", "1", "1/3", "0"],
          correct: 0,
          solution: [
            s("Ajustamos", "\\frac{\\operatorname{sen}(3x)}{x}=\\frac{3\\operatorname{sen}(3x)}{3x}", "Multiplicamos y dividimos por 3."),
            s("Límite notable", "\\lim_{u\\to0}\\frac{\\operatorname{sen}u}{u}=1", "Con u = 3x."),
            s("Resultado", "3\\cdot1=3"),
          ],
        }),
        checklist([
          "Identifico la forma indeterminada antes de operar.",
          "No uso L'Hôpital si no es 0/0 o ∞/∞.",
          "Verifico el resultado con una tabla o gráfica.",
        ]),
      ],
      keyFormulas: [
        "\\lim_{x\\to0}\\frac{\\operatorname{sen}x}{x}=1",
        "\\lim_{x\\to0}\\frac{1-\\cos x}{x^{2}}=\\frac{1}{2}",
        "\\lim_{x\\to\\infty}\\left(1+\\frac{1}{x}\\right)^{x}=e",
      ],
    }),

    lesson({
      id: "limites-continuidad",
      title: "Límites al infinito y continuidad",
      subtitle: "Comportamiento global y teoremas que garantizan soluciones",
      minutes: 24,
      level: "Avanzado",
      objectives: [
        "Calcular límites al infinito comparando grados.",
        "Aplicar la definición de continuidad en un punto y en un intervalo.",
        "Usar el teorema del valor intermedio para localizar raíces.",
      ],
      blocks: [
        text(
          "Los límites al infinito describen el comportamiento de una función cuando la variable crece sin cota. Son la base de las asíntotas horizontales y de la comparación de algoritmos. Para cocientes de polinomios, basta comparar los grados: el término dominante decide todo lo demás.",
        ),
        math(
          "\\lim_{x\\to\\infty}\\frac{a_nx^{n}+\\cdots}{b_mx^{m}+\\cdots} = \\begin{cases}0 & n<m\\\\ \\frac{a_n}{b_m} & n=m\\\\ \\pm\\infty & n>m\\end{cases}",
          "Regla de los grados",
        ),
        example(
          "Tres casos en el infinito",
          "Calcular los límites de $\\frac{5x^2-2}{3x^2+x}$, $\\frac{2x+1}{x^3}$ y $\\frac{x^2}{x+1}$ cuando $x\\to\\infty$.",
          [
            s("Primer cociente", "\\frac{5x^{2}-2}{3x^{2}+x}\\sim\\frac{5x^{2}}{3x^{2}}=\\frac{5}{3}", "Grados iguales: cociente de coeficientes principales."),
            s("Segundo cociente", "\\frac{2x+1}{x^{3}}\\sim\\frac{2x}{x^{3}}=\\frac{2}{x^{2}}\\to0", "El denominador domina."),
            s("Tercer cociente", "\\frac{x^{2}}{x+1}\\sim\\frac{x^{2}}{x}=x\\to+\\infty", "El numerador domina."),
            s("Conclusión", "\\frac{5}{3}, \\quad 0, \\quad +\\infty", "Cada caso ilustra una rama de la regla."),
          ],
          "5/3, 0, +∞",
        ),
        text(
          "**Continuidad.** Una función es continua en $a$ si se cumplen tres condiciones: $f(a)$ existe, $\\lim_{x\\to a}f(x)$ existe y ambos coinciden. Es continua en un intervalo si lo es en cada punto. Los polinomios, senos, cosenos y exponenciales son continuos en todo $\\mathbb{R}$; las racionales lo son salvo en los ceros del denominador.",
        ),
        math("f \\text{ continua en } a \\iff \\lim_{x\\to a}f(x)=f(a)", "Definición de continuidad"),
        note(
          "**Teorema del valor intermedio (TVM).** Si $f$ es continua en $[a,b]$ y $k$ está entre $f(a)$ y $f(b)$, existe al menos un $c\\in(a,b)$ con $f(c)=k$. En particular, si $f(a)$ y $f(b)$ tienen signos opuestos, existe una raíz en $(a,b)$. Es la base del método de bisección.",
          { title: "TVM", tone: "key" },
        ),
        example(
          "Localizar una raíz con el TVM",
          "Demostrar que $f(x)=x^3+x-1$ tiene una raíz en $(0,1)$.",
          [
            s("Continuidad", "f \\text{ es polinomio} \\Rightarrow \\text{continua en } [0,1]", "Los polinomios son continuos en todo ℝ."),
            s("Evaluamos extremos", "f(0)=-1, \\quad f(1)=1", "Sustituimos x = 0 y x = 1."),
            s("Cambio de signo", "f(0)<0<f(1)", "El valor 0 está entre los extremos."),
            s("Aplicamos el TVM", "\\exists c\\in(0,1): f(c)=0", "Existe al menos una raíz."),
            s("Conclusión", "c \\approx 0{,}6823", "El método de bisección la aproxima."),
          ],
          "Existe c ≈ 0,6823 con f(c) = 0.",
        ),
        graph({
          series: [
            { expr: "x^3+x-1", label: "f(x)=x³+x−1", color: "indigo" },
            { expr: "0", label: "y = 0", color: "muted", dashed: true },
          ],
          xmin: -1.5,
          xmax: 1.5,
          ymin: -3,
          ymax: 3,
          points: [
            { x: 0, y: -1, label: "f(0)<0" },
            { x: 1, y: 1, label: "f(1)>0" },
            { x: 0.6823, y: 0, label: "raíz" },
          ],
          title: "El TVM garantiza el cruce por cero",
        }),
        table(
          ["Tipo", "Condición", "Ejemplo"],
          [
            ["Evitable", "límite existe ≠ f(a)", "(x²−1)/(x−1) en 1"],
            ["De salto", "laterales distintos", "|x|/x en 0"],
            ["Infinita", "lateral ±∞", "1/x en 0"],
            ["Esencial", "límite no existe por oscilación", "sen(1/x) en 0"],
          ],
          "Discontinuidades",
        ),
        exercise({
          id: "lim-cont-1",
          prompt:
            "Si $f$ es continua en $[1,4]$, $f(1)=-2$ y $f(4)=7$, ¿qué garantiza el TVM?",
          hint: "El TVM habla de valores intermedios entre f(1) y f(4).",
          answer: "Existe c en (1,4) con f(c)=0 (y con cualquier valor entre −2 y 7).",
          choices: [
            "Existe c en (1,4) con f(c)=0.",
            "f es creciente en [1,4].",
            "f tiene un máximo en x = 4.",
            "f(2) = 2,5 necesariamente.",
          ],
          correct: 0,
          solution: [
            s("Hipótesis", "f \\text{ continua en } [1,4]", "Se cumple la condición del TVM."),
            s("Valores", "f(1)=-2 < 0 < 7=f(4)", "El 0 es un valor intermedio."),
            s("Conclusión", "\\exists c\\in(1,4): f(c)=0", "Hay al menos una raíz; no se sabe dónde exactamente."),
          ],
        }),
        checklist([
          "Comparo grados para límites en el infinito.",
          "Verifico las tres condiciones de continuidad.",
          "El TVM garantiza existencia, no unicidad.",
        ]),
      ],
      keyFormulas: [
        "\\lim_{x\\to\\infty}\\frac{P(x)}{Q(x)}",
        "f \\text{ continua} \\iff \\lim_{x\\to a}f=f(a)",
      ],
    }),
  ],
};
