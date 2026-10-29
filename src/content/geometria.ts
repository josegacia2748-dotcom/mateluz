import type { Module } from "./types";
import { checklist, example, exercise, graph, lesson, math, note, s, steps, table, text } from "./blocks";

export const geometria: Module = {
  id: "geometria",
  title: "Geometría Euclidiana",
  short: "Geometría",
  description:
    "Axiomas, postulados y demostraciones paso a paso: la base lógica de toda la ingeniería.",
  icon: "△",
  accent: "indigo",
  lessons: [
    lesson({
      id: "geometria-axiomas",
      title: "Axiomas, postulados y método deductivo",
      subtitle: "Cómo se construye una verdad matemática desde cero",
      minutes: 18,
      level: "Básico",
      objectives: [
        "Distinguir términos primitivos, axiomas, postulados y teoremas.",
        "Escribir una demostración directa con hipótesis, tesis y justificación.",
        "Reconocer la diferencia entre verificar con ejemplos y demostrar.",
      ],
      blocks: [
        text(
          "La geometría no empieza con fórmulas: empieza con **acuerdos**. Para construir cualquier edificio necesitas un terreno firme; para construir la matemática necesitas aceptar unas pocas ideas sin demostrarlas. Esas ideas son los **términos primitivos**, los **axiomas** y los **postulados**.",
        ),
        note(
          "**Términos primitivos:** punto, recta y plano. No se definen; se describen con intuición. **Axioma:** verdad general que se acepta sin demostración. **Postulado:** afirmación geométrica que se acepta como base. **Teorema:** proposición que sí se demuestra.",
          { title: "Vocabulario mínimo", tone: "key" },
        ),
        text(
          "Euclides organizó la geometría en los *Elementos* con cinco postulados. Los tres primeros son construcciones; el cuarto afirma que todos los ángulos rectos son iguales; el quinto es el famoso postulado de las paralelas. Durante más de dos mil años se intentó demostrar el quinto a partir de los otros cuatro. Al no lograrlo, nacieron las **geometrías no euclidianas**, y con ellas la teoría de la relatividad.",
        ),
        math(
          "\\text{Por dos puntos distintos pasa una y solo una recta.}",
          "Postulado 1",
        ),
        text(
          "Fíjate en la estructura de una demostración. Primero se escribe lo que **se sabe** (hipótesis). Después, lo que **se quiere probar** (tesis). Finalmente, una cadena de pasos donde cada uno se justifica con una definición, un postulado, un axioma o un teorema ya demostrado. Ningún paso se omite: si un lector no puede verificarlo, la demostración está incompleta.",
        ),
        example(
          "Demostración directa: ángulos suplementarios al mismo ángulo",
          "Si $\\angle A$ y $\\angle B$ son suplementarios del mismo ángulo $\\angle C$, demostrar que $\\angle A = \\angle B$.",
          [
            s("Hipótesis", "m\\angle A + m\\angle C = 180^\\circ \\quad\\text{y}\\quad m\\angle B + m\\angle C = 180^\\circ", "Escribimos exactamente lo que significa «ser suplementario»."),
            s("Igualamos las dos sumas", "m\\angle A + m\\angle C = m\\angle B + m\\angle C", "Ambas expresiones valen 180°; por transitividad son iguales."),
            s("Cancelamos el término común", "m\\angle A = m\\angle B", "Restamos m∠C en ambos lados. La igualdad se conserva."),
            s("Conclusión", "\\therefore \\angle A \\cong \\angle B", "Ángulos de igual medida son congruentes. Queda demostrado."),
          ],
          "Los ángulos son congruentes.",
        ),
        note(
          "Un error frecuente es **demostrar con un dibujo**. El dibujo sugiere, pero no prueba: puede estar mal escalado o representar un caso particular. La demostración debe valer para todos los casos que cumplen la hipótesis.",
          { title: "Cuidado con el dibujo", tone: "warn" },
        ),
        table(
          ["Elemento", "¿Se demuestra?", "Ejemplo"],
          [
            ["Término primitivo", "No", "punto, recta, plano"],
            ["Axioma", "No", "el todo es mayor que sus partes"],
            ["Postulado", "No", "por dos puntos pasa una recta"],
            ["Teorema", "Sí", "la suma de ángulos internos de un triángulo es 180°"],
            ["Corolario", "Sí (consecuencia)", "los ángulos de un triángulo equilátero miden 60°"],
          ],
          "Jerarquía del conocimiento geométrico",
        ),
        exercise({
          id: "geo-axi-1",
          prompt:
            "En la demostración anterior, ¿cuál es la **tesis** y qué propiedad permite pasar de $m\\angle A + m\\angle C = m\\angle B + m\\angle C$ a $m\\angle A = m\\angle B$?",
          hint: "La tesis es lo que aparece después de «demostrar que». Para el paso, piensa qué operación se aplica a ambos lados de una igualdad.",
          answer: "Tesis: ∠A ≅ ∠B. Se usa la propiedad de cancelación (restar la misma cantidad en ambos miembros).",
          choices: [
            "Tesis: ∠A ≅ ∠B. Se resta m∠C en ambos lados.",
            "Tesis: ∠A y ∠B son suplementarios. Se suman los ángulos.",
            "Tesis: ∠C = 90°. Se aplica el postulado de las paralelas.",
            "Tesis: ∠A ≅ ∠B. Se multiplica por m∠C.",
          ],
          correct: 0,
          solution: [
            s("Identificamos la tesis", "\\text{Tesis: } \\angle A \\cong \\angle B", "Es la afirmación que se quiere probar."),
            s("Justificamos el paso", "m\\angle A + m\\angle C = m\\angle B + m\\angle C \\;\\Rightarrow\\; m\\angle A = m\\angle B", "Propiedad de cancelación de la suma: si a + c = b + c, entonces a = b."),
          ],
        }),
        checklist([
          "Sé distinguir axioma, postulado y teorema.",
          "Puedo escribir hipótesis y tesis antes de empezar.",
          "Justifico cada paso con una propiedad nombrada.",
        ]),
      ],
      keyFormulas: ["m\\angle A + m\\angle C = 180^\\circ", "a + c = b + c \\Rightarrow a = b"],
    }),

    lesson({
      id: "geometria-triangulos",
      title: "Triángulos, congruencia y semejanza",
      subtitle: "Del teorema de Pitágoras a la altura de un edificio",
      minutes: 22,
      level: "Intermedio",
      objectives: [
        "Aplicar los criterios de congruencia LAL, ALA y LLL.",
        "Demostrar el teorema de la suma de ángulos internos.",
        "Resolver problemas de alturas inaccesibles con semejanza y Thales.",
      ],
      blocks: [
        text(
          "Un triángulo queda determinado por tres datos bien elegidos. Los **criterios de congruencia** dicen qué combinaciones de lados y ángulos garantizan que dos triángulos sean idénticos salvo por posición: **LAL** (lado-ángulo-lado), **ALA** (ángulo-lado-ángulo) y **LLL** (lado-lado-lado). Ojo: **AAA no garantiza congruencia**, solo semejanza.",
        ),
        math(
          "\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R",
          "Ley de los senos",
        ),
        math("c^{2} = a^{2} + b^{2} - 2ab\\cos C", "Ley de los cosenos"),
        text(
          "La ley de los cosenos es una generalización del teorema de Pitágoras: si $C = 90^\\circ$, entonces $\\cos C = 0$ y recuperamos $c^2 = a^2 + b^2$. Esta es la forma en que se calculan distancias en topografía, navegación y mecánica de estructuras.",
        ),
        example(
          "Suma de los ángulos internos = 180°",
          "Demostrar que en todo triángulo $ABC$ se cumple $A + B + C = 180^\\circ$.",
          [
            s("Trazamos una paralela", "\\text{Por } A \\text{ trazamos } \\ell \\parallel BC", "Por el postulado de las paralelas existe una única recta paralela a BC que pasa por A."),
            s("Marcamos ángulos alternos internos", "\\angle 1 = B, \\qquad \\angle 2 = C", "Los ángulos alternos internos entre paralelas son iguales."),
            s("Formamos un ángulo llano", "\\angle 1 + A + \\angle 2 = 180^\\circ", "Los tres ángulos quedan sobre la recta ℓ, que es un ángulo llano."),
            s("Sustituimos", "B + A + C = 180^\\circ", "Reemplazamos ∠1 por B y ∠2 por C."),
            s("Conclusión", "\\therefore A + B + C = 180^\\circ", "La suma no depende de la forma del triángulo."),
          ],
          "La suma siempre es 180°.",
        ),
        text(
          "**Aplicación de ingeniería.** Para medir la altura de un edificio sin subir, se clava una estaca vertical y se comparan las sombras. Los rayos del sol son paralelos, así que los triángulos formados son semejantes.",
        ),
        example(
          "Altura inaccesible por semejanza",
          "Una estaca de 1,5 m proyecta una sombra de 2 m. El edificio proyecta una sombra de 24 m. ¿Cuál es su altura?",
          [
            s("Identificamos la semejanza", "\\triangle_{\\text{estaca}} \\sim \\triangle_{\\text{edificio}}", "Ambos triángulos son rectángulos y comparten el ángulo del sol."),
            s("Planteamos la proporción", "\\frac{h}{24} = \\frac{1{,}5}{2}", "Los lados homólogos son proporcionales: altura/sombra es constante."),
            s("Despejamos h", "h = 24 \\cdot \\frac{1{,}5}{2} = 24 \\cdot 0{,}75", "Multiplicamos ambos lados por 24."),
            s("Calculamos", "h = 18\\ \\text{m}", "El edificio mide 18 metros."),
          ],
          "18 m",
        ),
        graph({
          series: [
            { expr: "1.5/2*x", label: "Rayo de sol (pendiente 0,75)", color: "amber" },
            { expr: "18", label: "Altura del edificio", color: "indigo", dashed: true },
          ],
          xmin: 0,
          xmax: 26,
          ymin: 0,
          ymax: 21,
          points: [
            { x: 2, y: 1.5, label: "estaca" },
            { x: 24, y: 18, label: "edificio" },
          ],
          title: "Semejanza de triángulos: misma pendiente, distinta escala",
        }),
        exercise({
          id: "geo-tri-1",
          prompt:
            "Un triángulo tiene lados $a = 7$, $b = 9$ y el ángulo entre ellos $C = 60^\\circ$. Calcula el lado $c$.",
          hint: "Usa la ley de los cosenos: $c^2 = a^2 + b^2 - 2ab\\cos C$. Recuerda que $\\cos 60^\\circ = 0{,}5$.",
          answer: "c = √67 ≈ 8,19",
          choices: ["√67 ≈ 8,19", "√130 ≈ 11,40", "8", "√103 ≈ 10,15"],
          correct: 0,
          solution: [
            s("Escribimos la ley", "c^{2} = a^{2} + b^{2} - 2ab\\cos C"),
            s("Sustituimos", "c^{2} = 7^{2} + 9^{2} - 2(7)(9)(0{,}5)"),
            s("Calculamos", "c^{2} = 49 + 81 - 63 = 67"),
            s("Raíz", "c = \\sqrt{67} \\approx 8{,}19"),
          ],
        }),
        checklist([
          "Distingo congruencia (misma forma y tamaño) de semejanza (misma forma).",
          "Sé cuándo usar senos y cuándo cosenos.",
          "Puedo plantear una proporción de sombras o escalas.",
        ]),
      ],
      keyFormulas: [
        "A + B + C = 180^\\circ",
        "\\frac{a}{\\sin A} = \\frac{b}{\\sin B}",
        "c^{2} = a^{2} + b^{2} - 2ab\\cos C",
      ],
    }),

    lesson({
      id: "geometria-circunferencia",
      title: "Circunferencia, ángulos y áreas",
      subtitle: "Engranajes, arcos y sectores en el taller",
      minutes: 20,
      level: "Intermedio",
      objectives: [
        "Aplicar el teorema del ángulo inscrito y el de la tangente.",
        "Calcular longitud de arco, área de sector y área de segmento.",
        "Resolver problemas de engranajes y tuberías con geometría circular.",
      ],
      blocks: [
        text(
          "La circunferencia es el lugar geométrico de los puntos que equidistan de un centro. Es la figura más importante en la ingeniería mecánica: ruedas, poleas, engranajes, tuberías y roscas son circulares. Su estudio combina ángulos, cuerdas y longitudes de arco.",
        ),
        math("L = 2\\pi r, \\qquad A = \\pi r^{2}", "Longitud y área del círculo"),
        math("s = r\\theta, \\qquad A_{\\text{sector}} = \\frac{1}{2}r^{2}\\theta", "Arco y sector (θ en radianes)"),
        note(
          "**Teorema del ángulo inscrito:** un ángulo inscrito mide la mitad del arco que subtiende. Consecuencia: todo ángulo inscrito que abarca un diámetro mide 90°. Este resultado se usa para trazar tangentes y verificar escuadras.",
          { title: "Ángulo inscrito", tone: "key" },
        ),
        example(
          "Área de un sector de engranaje",
          "Un engranaje tiene radio $r = 12\\ \\text{cm}$ y un diente abarca un ángulo central de $40^\\circ$. Calcula la longitud del arco y el área del sector.",
          [
            s("Convertimos a radianes", "\\theta = 40^\\circ \\cdot \\frac{\\pi}{180^\\circ} = \\frac{2\\pi}{9}\\ \\text{rad}", "Las fórmulas de arco y sector exigen radianes."),
            s("Longitud del arco", "s = r\\theta = 12\\cdot\\frac{2\\pi}{9} = \\frac{8\\pi}{3}\\ \\text{cm}", "Sustituimos r = 12 y θ = 2π/9."),
            s("Valor numérico", "s \\approx 8{,}38\\ \\text{cm}", "Multiplicamos 8π/3."),
            s("Área del sector", "A = \\frac{1}{2}r^{2}\\theta = \\frac{1}{2}(12)^{2}\\frac{2\\pi}{9}", "Aplicamos la fórmula del sector."),
            s("Simplificamos", "A = \\frac{144\\pi}{9} = 16\\pi \\approx 50{,}27\\ \\text{cm}^{2}", "El sector ocupa una novena parte del círculo."),
          ],
          "s ≈ 8,38 cm; A ≈ 50,27 cm²",
        ),
        text(
          "**Aplicación:** dos poleas unidas por una correa. Si la correa abraza un ángulo $\\theta$ de la polea, la longitud en contacto es $s = r\\theta$. Sumando los tramos rectos y los arcos de ambas poleas se obtiene la longitud total de la correa, dato necesario para seleccionar la referencia comercial.",
        ),
        example(
          "Tangente perpendicular al radio",
          "Demostrar que la tangente a una circunferencia en un punto $P$ es perpendicular al radio $OP$.",
          [
            s("Supongamos lo contrario", "OT \\not\\perp OP", "Si no es perpendicular, existe otra recta por P que sí lo es."),
            s("Comparación de distancias", "OP > d(O, \\ell)", "La distancia más corta del centro a una recta es la perpendicular; OP es la hipotenusa de un triángulo rectángulo."),
            s("Contradicción", "d(O,\\ell) < r", "Entonces la recta corta la circunferencia en dos puntos y no es tangente."),
            s("Conclusión", "\\therefore OT \\perp OP", "La única recta con un solo punto de contacto es la perpendicular al radio."),
          ],
          "La tangente es perpendicular al radio en el punto de tangencia.",
        ),
        exercise({
          id: "geo-cir-1",
          prompt:
            "Un arco de circunferencia de radio $10\\ \\text{cm}$ tiene una longitud de $15\\ \\text{cm}$. ¿Cuál es el ángulo central en radianes y en grados?",
          hint: "Despeja $\\theta$ de $s = r\\theta$ y luego convierte multiplicando por $180^\\circ/\\pi$.",
          answer: "θ = 1,5 rad ≈ 85,94°",
          choices: ["1,5 rad ≈ 85,94°", "0,667 rad ≈ 38,2°", "150 rad", "1,5 rad ≈ 270°"],
          correct: 0,
          solution: [
            s("Despejamos θ", "\\theta = \\frac{s}{r} = \\frac{15}{10} = 1{,}5\\ \\text{rad}"),
            s("Convertimos", "1{,}5 \\cdot \\frac{180^\\circ}{\\pi} \\approx 85{,}94^\\circ"),
          ],
        }),
        checklist([
          "Convierto grados a radianes antes de usar s = rθ.",
          "Sé que el ángulo inscrito mide la mitad del central.",
          "La tangente es perpendicular al radio.",
        ]),
      ],
      keyFormulas: ["s = r\\theta", "A_{\\text{sector}} = \\tfrac{1}{2}r^{2}\\theta", "L = 2\\pi r"],
    }),
  ],
};
