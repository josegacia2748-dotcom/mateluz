import type { Module } from "./types";
import { checklist, example, exercise, graph, lesson, math, note, s, table, text } from "./blocks";

export const analitica: Module = {
  id: "analitica",
  title: "Geometría Analítica",
  short: "Analítica",
  description:
    "El puente entre el álgebra y las figuras: rectas, circunferencias y cónicas con coordenadas.",
  icon: "◔",
  accent: "teal",
  lessons: [
    lesson({
      id: "analitica-plano",
      title: "Plano cartesiano y la recta",
      subtitle: "Distancia, pendiente y ecuaciones de la recta",
      minutes: 20,
      level: "Básico",
      objectives: [
        "Calcular distancia, punto medio y pendiente entre dos puntos.",
        "Escribir la ecuación de una recta en sus distintas formas.",
        "Reconocer rectas paralelas y perpendiculares por sus pendientes.",
      ],
      blocks: [
        text(
          "René Descartes unió el álgebra y la geometría con una idea simple: cada punto del plano es un par ordenado $(x,y)$. Desde entonces, una figura geométrica puede describirse con una ecuación, y un problema de geometría puede resolverse con álgebra. Toda la ingeniería asistida por computadora (CAD) descansa sobre esta traducción.",
        ),
        math("d = \\sqrt{(x_2-x_1)^{2} + (y_2-y_1)^{2}}", "Distancia entre dos puntos"),
        math("M = \\left(\\frac{x_1+x_2}{2},\\ \\frac{y_1+y_2}{2}\\right)", "Punto medio"),
        math("m = \\frac{y_2-y_1}{x_2-x_1}", "Pendiente"),
        text(
          "Una recta queda determinada por un punto y su pendiente. De ahí nacen tres formas equivalentes de escribirla: **punto-pendiente** $y-y_1=m(x-x_1)$, **pendiente-ordenada** $y=mx+b$ y **general** $Ax+By+C=0$. La forma general es la única que admite rectas verticales, donde la pendiente no existe.",
        ),
        note(
          "**Paralelas:** $m_1 = m_2$. **Perpendiculares:** $m_1\\cdot m_2 = -1$. Una recta vertical $x=k$ es perpendicular a una horizontal $y=c$; sus pendientes no se multiplican porque una no existe.",
          { title: "Criterios de posición", tone: "key" },
        ),
        example(
          "Recta por dos puntos",
          "Hallar la ecuación general de la recta que pasa por $A(-2,1)$ y $B(4,5)$.",
          [
            s("Pendiente", "m = \\frac{5-1}{4-(-2)} = \\frac{4}{6} = \\frac{2}{3}", "Restamos las coordenadas en el mismo orden."),
            s("Punto-pendiente", "y - 1 = \\frac{2}{3}(x + 2)", "Usamos el punto A(-2,1): y − 1 = m(x − (−2))."),
            s("Eliminamos denominadores", "3(y-1) = 2(x+2)", "Multiplicamos por 3."),
            s("Desarrollamos", "3y - 3 = 2x + 4", "Distribuimos."),
            s("Forma general", "2x - 3y + 7 = 0", "Pasamos todo a un lado y ordenamos."),
            s("Verificación", "2(4) - 3(5) + 7 = 8 - 15 + 7 = 0", "El punto B satisface la ecuación."),
          ],
          "2x − 3y + 7 = 0",
        ),
        graph({
          series: [
            { expr: "(2/3)*x + 7/3", label: "2x − 3y + 7 = 0", color: "indigo" },
            { expr: "(-3/2)*x + 2", label: "perpendicular por (0,2)", color: "amber", dashed: true },
          ],
          xmin: -5,
          xmax: 6,
          ymin: -3,
          ymax: 7,
          points: [
            { x: -2, y: 1, label: "A" },
            { x: 4, y: 5, label: "B" },
          ],
          title: "La recta por A y B, y una perpendicular",
          caption: "Las pendientes 2/3 y −3/2 multiplican −1: son perpendiculares.",
        }),
        text(
          "**Aplicación civil.** La pendiente de un techo o de una carretera se expresa como porcentaje: una pendiente del 8 % significa $m = 0{,}08$, es decir, 8 cm de subida por cada metro horizontal. El ángulo de inclinación es $\\arctan(0{,}08) \\approx 4{,}57^\\circ$. En drenajes, la pendiente mínima garantiza que el agua fluya sin estancarse.",
        ),
        table(
          ["Forma", "Ecuación", "Cuándo conviene"],
          [
            ["Punto-pendiente", "y − y₁ = m(x − x₁)", "Conoces un punto y la pendiente"],
            ["Pendiente-ordenada", "y = mx + b", "Para graficar rápido"],
            ["General", "Ax + By + C = 0", "Rectas verticales y sistemas"],
            ["Simétrica", "x/a + y/b = 1", "Conoces los cortes con los ejes"],
          ],
          "Las cuatro formas de una recta",
        ),
        exercise({
          id: "ana-rec-1",
          prompt:
            "Halla la ecuación de la recta perpendicular a $y = 2x - 1$ que pasa por $(4,3)$.",
          hint: "La pendiente perpendicular es el recíproco negativo de 2. Luego usa punto-pendiente.",
          answer: "y = −½x + 5",
          choices: ["y = −½x + 5", "y = 2x − 5", "y = ½x + 1", "y = −2x + 11"],
          correct: 0,
          solution: [
            s("Pendiente perpendicular", "m_\\perp = -\\frac{1}{2}", "El producto 2·m debe ser −1."),
            s("Punto-pendiente", "y - 3 = -\\frac{1}{2}(x - 4)"),
            s("Desarrollamos", "y = -\\frac{1}{2}x + 2 + 3 = -\\frac{1}{2}x + 5"),
          ],
        }),
        checklist([
          "Calculo la pendiente sin invertir el orden de los puntos.",
          "Sé pasar de una forma de la recta a otra.",
          "Reconozco que una recta vertical no tiene pendiente.",
        ]),
      ],
      keyFormulas: [
        "m = \\frac{y_2-y_1}{x_2-x_1}",
        "y-y_1 = m(x-x_1)",
        "m_1 m_2 = -1",
      ],
    }),

    lesson({
      id: "analitica-circunferencia",
      title: "La circunferencia en coordenadas",
      subtitle: "Completar cuadrados y leer el centro y el radio",
      minutes: 22,
      level: "Intermedio",
      objectives: [
        "Obtener la ecuación ordinaria completando cuadrados.",
        "Identificar centro y radio desde la forma general.",
        "Resolver problemas de tangencia y aplicaciones mecánicas.",
      ],
      blocks: [
        text(
          "La circunferencia de centro $(h,k)$ y radio $r$ es el conjunto de puntos que cumplen $(x-h)^2 + (y-k)^2 = r^2$. Desarrollando los binomios se obtiene la **forma general** $x^2+y^2+Dx+Ey+F=0$. El camino inverso —de la forma general al centro y al radio— se recorre **completando cuadrados**, una técnica que reaparecerá en cónicas y en cálculo.",
        ),
        example(
          "De la forma general al centro y radio",
          "Hallar centro y radio de $x^2 + y^2 - 6x + 4y - 12 = 0$.",
          [
            s("Agrupamos por variable", "(x^{2} - 6x) + (y^{2} + 4y) = 12", "Pasamos la constante al otro lado."),
            s("Completamos el cuadrado en x", "x^{2} - 6x + 9 = (x-3)^{2}", "Sumamos (6/2)² = 9."),
            s("Completamos el cuadrado en y", "y^{2} + 4y + 4 = (y+2)^{2}", "Sumamos (4/2)² = 4."),
            s("Sumamos lo mismo al otro lado", "9 + 4 = 13", "Para no alterar la igualdad sumamos 13 en ambos miembros."),
            s("Ecuación ordinaria", "(x-3)^{2} + (y+2)^{2} = 25", "12 + 13 = 25."),
            s("Leemos los parámetros", "C(3,-2), \\quad r = \\sqrt{25} = 5", "El centro es (h,k) y el radio es la raíz del miembro derecho."),
          ],
          "Centro (3,−2), radio 5",
        ),
        graph({
          series: [
            { expr: "-2 + sqrt(25 - (x-3)^2)", label: "semicircunferencia superior", color: "indigo" },
            { expr: "-2 - sqrt(25 - (x-3)^2)", label: "semicircunferencia inferior", color: "indigo" },
          ],
          xmin: -3,
          xmax: 9,
          ymin: -8,
          ymax: 4,
          points: [
            { x: 3, y: -2, label: "centro" },
            { x: 8, y: -2, label: "r = 5" },
          ],
          title: "(x − 3)² + (y + 2)² = 25",
          caption: "El centro no está en el origen: la ecuación lo delata.",
        }),
        note(
          "Si al completar cuadrados el miembro derecho queda **negativo**, no hay puntos reales. Si queda **cero**, la circunferencia degenera en un punto. Esto mismo ocurrirá con las cónicas: la ecuación general puede representar una figura, un punto o el conjunto vacío.",
          { title: "Tres resultados posibles", tone: "warn" },
        ),
        example(
          "Recta tangente en un punto",
          "Hallar la tangente a $x^2+y^2=25$ en el punto $P(3,4)$.",
          [
            s("Centro y radio", "C(0,0), \\quad r = 5", "La ecuación está en forma ordinaria."),
            s("Pendiente del radio", "m_{CP} = \\frac{4-0}{3-0} = \\frac{4}{3}", "Pendiente del segmento del centro a P."),
            s("Pendiente de la tangente", "m_t = -\\frac{3}{4}", "La tangente es perpendicular al radio."),
            s("Punto-pendiente", "y - 4 = -\\frac{3}{4}(x - 3)", "Usamos el punto de tangencia."),
            s("Forma general", "3x + 4y - 25 = 0", "Multiplicamos por 4 y ordenamos."),
            s("Verificación", "3(3) + 4(4) = 25", "El punto P pertenece a la recta."),
          ],
          "3x + 4y − 25 = 0",
        ),
        text(
          "**Aplicación mecánica.** Dos engranajes son tangentes exteriormente si la distancia entre sus centros es $r_1 + r_2$; son tangentes interiormente si es $|r_1 - r_2|$. Esta condición se usa para calcular distancias entre ejes y relaciones de transmisión.",
        ),
        exercise({
          id: "ana-cir-1",
          prompt:
            "¿Cuál es el centro y el radio de $x^2 + y^2 + 8x - 2y + 8 = 0$?",
          hint: "Agrupa, completa cuadrados y recuerda sumar las mismas cantidades al lado derecho.",
          answer: "Centro (−4,1), radio 3",
          choices: ["Centro (−4,1), radio 3", "Centro (4,−1), radio 3", "Centro (−4,1), radio 9", "Centro (4,−1), radio 9"],
          correct: 0,
          solution: [
            s("Agrupamos", "(x^{2}+8x) + (y^{2}-2y) = -8"),
            s("Completamos", "(x+4)^{2} - 16 + (y-1)^{2} - 1 = -8"),
            s("Ordinaria", "(x+4)^{2} + (y-1)^{2} = 9"),
            s("Leemos", "C(-4,1), \\quad r = 3"),
          ],
        }),
        checklist([
          "Completo cuadrados sumando lo mismo en ambos lados.",
          "Recuerdo que el radio es la raíz del término derecho.",
          "La tangente es perpendicular al radio en el punto de contacto.",
        ]),
      ],
      keyFormulas: [
        "(x-h)^{2} + (y-k)^{2} = r^{2}",
        "x^{2}+y^{2}+Dx+Ey+F=0",
      ],
    }),

    lesson({
      id: "analitica-conicas",
      title: "Parábola, elipse e hipérbola",
      subtitle: "Las curvas de las antenas, los puentes y las órbitas",
      minutes: 28,
      level: "Avanzado",
      objectives: [
        "Reconocer y clasificar una cónica por su ecuación general.",
        "Obtener vértice, focos, ejes y asíntotas completando cuadrados.",
        "Relacionar cada cónica con una aplicación real de ingeniería.",
      ],
      blocks: [
        text(
          "Una **cónica** es la intersección de un cono doble con un plano. Según la inclinación del plano aparecen una circunferencia, una elipse, una parábola o una hipérbola. En coordenadas, todas responden a la ecuación general de segundo grado $Ax^2+Bxy+Cy^2+Dx+Ey+F=0$, y el discriminante $\\Delta = B^2-4AC$ las clasifica.",
        ),
        math(
          "\\Delta = B^{2}-4AC \\;\\begin{cases} <0 & \\text{elipse o circunferencia}\\\\ =0 & \\text{parábola}\\\\ >0 & \\text{hipérbola}\\end{cases}",
          "Clasificación por discriminante",
        ),
        text(
          "**Parábola.** Todos sus puntos equidistan del foco y de la directriz. Su forma canónica con vértice en el origen es $y^2 = 4px$ (abre horizontal) o $x^2 = 4py$ (abre vertical). El parámetro $p$ es la distancia del vértice al foco. Las antenas parabólicas, los faros y los puentes colgantes aprovechan esta propiedad: todo rayo paralelo al eje se refleja hacia el foco.",
        ),
        example(
          "Elementos de una parábola",
          "Analizar $y^2 = 8x$: vértice, foco, directriz y gráfica.",
          [
            s("Forma canónica", "y^{2} = 4px \\;\\Rightarrow\\; 4p = 8", "Comparar con y² = 4px."),
            s("Parámetro", "p = 2", "El foco está a 2 unidades del vértice."),
            s("Vértice", "V(0,0)", "La ecuación no tiene términos lineales en y ni constantes."),
            s("Foco", "F(2,0)", "Sobre el eje x, a distancia p del vértice."),
            s("Directriz", "x = -2", "Recta vertical al otro lado del vértice."),
            s("Apertura", "\\text{hacia la derecha}", "El coeficiente de x es positivo."),
          ],
          "V(0,0), F(2,0), directriz x = −2",
        ),
        graph({
          series: [
            { expr: "sqrt(8*x)", label: "rama superior", color: "teal" },
            { expr: "-sqrt(8*x)", label: "rama inferior", color: "teal" },
          ],
          xmin: -3,
          xmax: 10,
          ymin: -7,
          ymax: 7,
          points: [
            { x: 0, y: 0, label: "V" },
            { x: 2, y: 0, label: "F" },
          ],
          title: "Parábola y² = 8x",
          caption: "El foco está dentro de la curva; la directriz queda fuera.",
        }),
        text(
          "**Elipse.** Es el lugar de los puntos cuya suma de distancias a dos focos es constante: $PF_1 + PF_2 = 2a$. Su forma canónica es $\\frac{x^2}{a^2}+\\frac{y^2}{b^2}=1$, con $a>b$ y $c^2=a^2-b^2$. La excentricidad $e=c/a$ mide qué tan «alargada» es: $e=0$ es una circunferencia y $e\\to 1$ una elipse muy plana. Las órbitas planetarias son elipses con el Sol en uno de los focos (Kepler).",
        ),
        example(
          "Elementos de una elipse",
          "Analizar $9x^2 + 16y^2 = 144$.",
          [
            s("Normalizamos", "\\frac{x^{2}}{16} + \\frac{y^{2}}{9} = 1", "Dividimos entre 144."),
            s("Semiejes", "a = 4, \\quad b = 3", "El semieje mayor está bajo x porque 16 > 9."),
            s("Distancia focal", "c^{2} = a^{2}-b^{2} = 16-9 = 7", "Relación fundamental de la elipse."),
            s("Focos", "F_1(-\\sqrt{7},0), \\; F_2(\\sqrt{7},0)", "Sobre el eje mayor, a distancia c del centro."),
            s("Excentricidad", "e = \\frac{\\sqrt{7}}{4} \\approx 0{,}661", "Bastante alargada, pero menor que 1."),
            s("Vértices", "(\\pm 4, 0), \\; (0, \\pm 3)", "Extremos de los ejes mayor y menor."),
          ],
          "a = 4, b = 3, c = √7, e ≈ 0,661",
        ),
        graph({
          series: [
            { expr: "3*sqrt(1 - x^2/16)", label: "rama superior", color: "amber" },
            { expr: "-3*sqrt(1 - x^2/16)", label: "rama inferior", color: "amber" },
          ],
          xmin: -5,
          xmax: 5,
          ymin: -4,
          ymax: 4,
          points: [
            { x: 4, y: 0, label: "a = 4" },
            { x: 2.646, y: 0, label: "F₂" },
          ],
          title: "Elipse 9x² + 16y² = 144",
          caption: "Los focos están dentro, sobre el eje mayor.",
        }),
        text(
          "**Hipérbola.** Es el lugar donde la diferencia de distancias a dos focos es constante. Su forma canónica es $\\frac{x^2}{a^2}-\\frac{y^2}{b^2}=1$, con $c^2=a^2+b^2$ y asíntotas $y=\\pm\\frac{b}{a}x$. Aparece en la navegación por satélites (LORAN/GPS), en el diseño de torres de enfriamiento y en la trayectoria de partículas que pasan cerca de un campo gravitatorio.",
        ),
        note(
          "Si la ecuación general tiene $B\\neq 0$, la cónica está **rotada**. El ángulo de rotación se obtiene con $\\tan(2\\theta)=\\frac{B}{A-C}$. Al girar los ejes desaparece el término $xy$ y se puede completar cuadrados. En MateLUZ puedes hacerlo en el laboratorio de cónicas: escribe la ecuación y observa la rotación y los elementos.",
          { title: "Término xy", tone: "info" },
        ),
        exercise({
          id: "ana-con-1",
          prompt:
            "Clasifica $4x^2 - 9y^2 + 16x + 18y - 43 = 0$ e indica qué tipo de curva es.",
          hint: "Calcula Δ = B² − 4AC. Luego agrupa y completa cuadrados para confirmar.",
          answer: "Hipérbola (Δ = 144 > 0)",
          choices: ["Hipérbola", "Elipse", "Parábola", "Circunferencia"],
          correct: 0,
          solution: [
            s("Coeficientes", "A = 4,\\; B = 0,\\; C = -9"),
            s("Discriminante", "\\Delta = 0^{2} - 4(4)(-9) = 144 > 0"),
            s("Conclusión", "\\Delta > 0 \\Rightarrow \\text{hipérbola}", "El signo de A y C es distinto: las ramas se abren en direcciones opuestas."),
          ],
        }),
        checklist([
          "Clasifico con el discriminante antes de calcular.",
          "Para la elipse uso c² = a² − b²; para la hipérbola, c² = a² + b².",
          "Sé que una cónica rotada requiere eliminar el término xy.",
        ]),
      ],
      keyFormulas: [
        "\\Delta = B^{2}-4AC",
        "y^{2}=4px",
        "\\frac{x^{2}}{a^{2}}+\\frac{y^{2}}{b^{2}}=1",
        "\\frac{x^{2}}{a^{2}}-\\frac{y^{2}}{b^{2}}=1",
      ],
    }),
  ],
};
