import type { Module } from "./types";
import { checklist, example, exercise, graph, lesson, math, note, s, table, text } from "./blocks";

export const funciones: Module = {
  id: "funciones",
  title: "Funciones",
  short: "Funciones",
  description:
    "Dominio, rango, gráficas y asíntotas: aprender a leer una función antes de derivarla.",
  icon: "ƒ",
  accent: "amber",
  lessons: [
    lesson({
      id: "funciones-concepto",
      title: "Qué es una función: dominio y rango",
      subtitle: "La regla que asigna a cada entrada una única salida",
      minutes: 22,
      level: "Básico",
      objectives: [
        "Decidir si una relación es función con la prueba de la recta vertical.",
        "Determinar el dominio imponiendo restricciones algebraicas.",
        "Estimar el rango con la gráfica y con el análisis del comportamiento.",
      ],
      blocks: [
        text(
          "Una **función** $f$ es una regla que asigna a cada elemento $x$ de un conjunto $D$ **exactamente un** elemento $f(x)$. El conjunto $D$ es el **dominio**; el conjunto de todos los valores que toma $f$ es el **rango** o imagen. La palabra clave es *exactamente uno*: si una entrada produce dos salidas, no es función.",
        ),
        math("f: D \\subseteq \\mathbb{R} \\to \\mathbb{R}, \\qquad x \\mapsto f(x)", "Notación de función"),
        text(
          "**Prueba de la recta vertical.** Una curva en el plano es la gráfica de una función si y solo si ninguna recta vertical la corta en más de un punto. Una circunferencia no es función; su mitad superior sí lo es.",
        ),
        note(
          "**Restricciones típicas del dominio.** (1) Denominador distinto de cero. (2) Radicando de índice par mayor o igual que cero. (3) Argumento de logaritmo estrictamente positivo. (4) En contextos físicos, las cantidades deben ser no negativas (tiempo, longitud, masa).",
          { title: "Las cuatro restricciones", tone: "key" },
        ),
        example(
          "Dominio con raíz y denominador",
          "Hallar el dominio de $f(x)=\\dfrac{\\sqrt{x-2}}{x-5}$.",
          [
            s("Restricción de la raíz", "x - 2 \\ge 0 \\;\\Rightarrow\\; x \\ge 2", "El radicando no puede ser negativo."),
            s("Restricción del denominador", "x - 5 \\neq 0 \\;\\Rightarrow\\; x \\neq 5", "No se puede dividir entre cero."),
            s("Intersección", "x \\ge 2 \\;\\text{y}\\; x \\neq 5", "Deben cumplirse ambas a la vez."),
            s("En intervalos", "D = [2,5) \\cup (5,+\\infty)", "El 5 se excluye; el 2 se incluye porque la raíz de 0 es válida."),
            s("Verificación", "f(2)=0, \\quad f(6)=\\frac{2}{1}=2", "Dos valores del dominio producen una única salida."),
          ],
          "D = [2,5) ∪ (5,+∞)",
        ),
        graph({
          series: [{ expr: "sqrt(x-2)/(x-5)", label: "f(x)", color: "indigo" }],
          xmin: 1,
          xmax: 14,
          ymin: -6,
          ymax: 6,
          asymptotes: [5],
          title: "f(x) = √(x−2)/(x−5)",
          caption: "La curva empieza en x = 2 y explota cerca de x = 5.",
        }),
        text(
          "El **rango** es más difícil de calcular que el dominio porque exige conocer el comportamiento global. Tres herramientas ayudan: (1) despejar $x$ en función de $y$ y ver para qué $y$ existe solución; (2) analizar la gráfica; (3) usar límites y monotonía, que estudiaremos más adelante. Para la función anterior, el rango es todo $\\mathbb{R}$: la rama izquierda baja sin cota y la derecha sube sin cota.",
        ),
        table(
          ["Función", "Dominio", "Rango"],
          [
            ["x²", "ℝ", "[0,∞)"],
            ["√x", "[0,∞)", "[0,∞)"],
            ["1/x", "ℝ \\ {0}", "ℝ \\ {0}"],
            ["ln x", "(0,∞)", "ℝ"],
            ["sen x", "ℝ", "[−1,1]"],
          ],
          "Dominios y rangos de referencia",
        ),
        exercise({
          id: "fun-con-1",
          prompt: "¿Cuál es el dominio de $f(x)=\\dfrac{1}{\\sqrt{4-x}}$?",
          hint: "El radicando debe ser positivo (no solo no negativo) porque está en el denominador.",
          answer: "(−∞, 4)",
          choices: ["(−∞, 4)", "(−∞, 4]", "[4, ∞)", "ℝ \\ {4}"],
          correct: 0,
          solution: [
            s("Raíz en denominador", "4 - x > 0", "Debe ser estrictamente positivo: si fuera 0, dividiríamos entre cero."),
            s("Despejamos", "x < 4"),
            s("Intervalo", "D = (-\\infty, 4)"),
          ],
        }),
        checklist([
          "Aplico las restricciones antes de simplificar.",
          "Excluyo los ceros del denominador.",
          "Distingo corchete (incluye) de paréntesis (excluye).",
        ]),
      ],
      keyFormulas: ["f: D \\to \\mathbb{R}", "\\sqrt{g(x)} \\Rightarrow g(x)\\ge0", "\\log g(x) \\Rightarrow g(x)>0"],
    }),

    lesson({
      id: "funciones-graficas",
      title: "Transformaciones y gráficas",
      subtitle: "Mover, estirar y reflejar sin tabular punto por punto",
      minutes: 20,
      level: "Intermedio",
      objectives: [
        "Aplicar traslaciones, reflexiones y escalamientos a una gráfica base.",
        "Componer funciones y reconocer el orden de las transformaciones.",
        "Construir la inversa a partir de la gráfica y de la fórmula.",
      ],
      blocks: [
        text(
          "Todas las gráficas de una familia se obtienen de una **gráfica base** mediante transformaciones. Si conoces $y=f(x)$, entonces conoces nueve gráficas más sin tabular: cada cambio en la fórmula produce un movimiento geométrico predecible.",
        ),
        math("y = a\\,f\\big(b(x-h)\\big) + k", "Forma general de una transformación"),
        table(
          ["Cambio", "Efecto geométrico"],
          [
            ["f(x) + k", "Sube k unidades (k > 0) o baja (k < 0)"],
            ["f(x − h)", "Se desplaza h unidades a la derecha"],
            ["−f(x)", "Refleja respecto al eje x"],
            ["f(−x)", "Refleja respecto al eje y"],
            ["a·f(x), a > 1", "Estira verticalmente"],
            ["a·f(x), 0 < a < 1", "Comprime verticalmente"],
            ["f(bx), b > 1", "Comprime horizontalmente"],
          ],
          "Catálogo de transformaciones",
        ),
        note(
          "El orden importa. En $y=2(x-3)^2+1$ primero se traslada a la derecha 3, luego se estira por 2 y finalmente se sube 1. Si se estira antes de trasladar, el resultado cambia. Regla práctica: **primero lo que está dentro del paréntesis, luego lo de afuera**.",
          { title: "Orden de las operaciones", tone: "warn" },
        ),
        example(
          "De la parábola base a una transformada",
          "Graficar $f(x)=-(x+1)^2+4$ a partir de $y=x^2$ e indicar vértice, eje y cortes.",
          [
            s("Forma base", "y = x^{2}", "Parábola con vértice en (0,0)."),
            s("Traslación horizontal", "y = (x+1)^{2}", "Se mueve 1 unidad a la izquierda."),
            s("Reflexión", "y = -(x+1)^{2}", "Abre hacia abajo."),
            s("Traslación vertical", "y = -(x+1)^{2}+4", "Sube 4 unidades."),
            s("Vértice", "V(-1,4)", "El vértice sigue el desplazamiento."),
            s("Corte con y", "f(0) = -(1)^{2}+4 = 3", "Sustituimos x = 0."),
            s("Cortes con x", "-(x+1)^{2}+4=0 \\Rightarrow (x+1)^{2}=4 \\Rightarrow x=1 \\text{ o } x=-3", "Raíces simétricas respecto al eje x = −1."),
          ],
          "V(−1,4); cortes (−3,0) y (1,0); corte y en (0,3)",
        ),
        graph({
          series: [
            { expr: "x^2", label: "y = x²", color: "amber", dashed: true },
            { expr: "-(x+1)^2+4", label: "y = −(x+1)²+4", color: "indigo" },
          ],
          xmin: -5,
          xmax: 3,
          ymin: -4,
          ymax: 6,
          points: [{ x: -1, y: 4, label: "V" }],
          title: "Transformaciones de la parábola",
        }),
        text(
          "**Función inversa.** Si $f$ es uno a uno, existe $f^{-1}$ que deshace lo que hace $f$. Gráficamente, la inversa es la reflexión respecto a la recta $y=x$. Para hallarla algebraicamente: escribir $y=f(x)$, intercambiar $x$ e $y$, y despejar $y$. El dominio de $f^{-1}$ es el rango de $f$.",
        ),
        example(
          "Inversa de una función racional",
          "Hallar $f^{-1}$ para $f(x)=\\dfrac{2x+1}{x-3}$.",
          [
            s("Escribimos y", "y = \\frac{2x+1}{x-3}", "Con x ≠ 3."),
            s("Intercambiamos", "x = \\frac{2y+1}{y-3}", "Ahora y es la incógnita."),
            s("Multiplicamos", "x(y-3) = 2y+1", "Eliminamos el denominador."),
            s("Agrupamos y", "xy - 2y = 3x + 1", "Pasamos los términos con y a un lado."),
            s("Factorizamos", "y(x-2) = 3x+1", "Sacamos factor común y."),
            s("Despejamos", "f^{-1}(x) = \\frac{3x+1}{x-2}", "Con x ≠ 2."),
            s("Verificación", "f(f^{-1}(x)) = x", "Componer una función con su inversa devuelve la identidad."),
          ],
          "f⁻¹(x) = (3x+1)/(x−2)",
        ),
        exercise({
          id: "fun-gra-1",
          prompt:
            "La gráfica de $y=\\sqrt{x}$ se traslada 2 unidades a la derecha y 3 hacia arriba. ¿Cuál es la nueva ecuación?",
          hint: "Dentro de la raíz va (x − h) para desplazar a la derecha; fuera se suma k.",
          answer: "y = √(x−2) + 3",
          choices: ["y = √(x−2) + 3", "y = √(x+2) + 3", "y = √(x−2) − 3", "y = √(x+3) + 2"],
          correct: 0,
          solution: [
            s("Horizontal", "\\sqrt{x-2}", "x − 2 desplaza a la derecha 2."),
            s("Vertical", "\\sqrt{x-2}+3", "Sumar 3 fuera sube la gráfica."),
          ],
        }),
        checklist([
          "Distingo desplazamiento horizontal de vertical.",
          "Recuerdo que f(x−h) se mueve a la derecha, no a la izquierda.",
          "La inversa se refleja respecto a y = x.",
        ]),
      ],
      keyFormulas: ["y=a f(b(x-h))+k", "f(f^{-1}(x))=x", "\\text{Dom}(f^{-1})=\\text{Rango}(f)"],
    }),

    lesson({
      id: "funciones-asintotas",
      title: "Asíntotas y funciones racionales",
      subtitle: "Qué pasa cuando x o y se van al infinito",
      minutes: 22,
      level: "Intermedio",
      objectives: [
        "Encontrar asíntotas verticales a partir de los ceros del denominador.",
        "Comparar grados para decidir entre asíntota horizontal y oblicua.",
        "Trazar una función racional con tabla de signos.",
      ],
      blocks: [
        text(
          "Una **asíntota** es una recta de la que la gráfica se acerca indefinidamente sin necesariamente tocarla. En funciones racionales $f(x)=P(x)/Q(x)$ hay tres tipos: vertical, horizontal y oblicua. Detectarlas es el primer paso para graficar sin calcular decenas de puntos.",
        ),
        math("\\lim_{x\\to a} f(x)=\\pm\\infty \\;\\Rightarrow\\; x=a \\text{ es asíntota vertical}", "Asíntota vertical"),
        math("\\lim_{x\\to\\pm\\infty} f(x)=L \\;\\Rightarrow\\; y=L \\text{ es asíntota horizontal}", "Asíntota horizontal"),
        note(
          "**Regla de los grados** para $P/Q$: si $\\deg P < \\deg Q$, la asíntota horizontal es $y=0$; si $\\deg P = \\deg Q$, es $y=\\frac{\\text{coef. principal }P}{\\text{coef. principal }Q}$; si $\\deg P = \\deg Q + 1$, hay asíntota oblicua y se obtiene dividiendo los polinomios; si $\\deg P > \\deg Q+1$, no hay asíntota lineal.",
          { title: "Comparar grados", tone: "key" },
        ),
        example(
          "Análisis completo de una racional",
          "Analizar $f(x)=\\dfrac{2x^2-3x+1}{x^2-4}$: dominio, asíntotas y cortes.",
          [
            s("Factorizamos el denominador", "x^{2}-4 = (x-2)(x+2)", "Diferencia de cuadrados."),
            s("Dominio", "\\mathbb{R}\\setminus\\{-2,2\\}", "El denominador se anula en x = ±2."),
            s("Asíntotas verticales", "x=-2, \\quad x=2", "Los ceros del denominador no se cancelan con el numerador."),
            s("Grados iguales", "\\deg P = \\deg Q = 2", "Hay asíntota horizontal."),
            s("Asíntota horizontal", "y = \\frac{2}{1} = 2", "Cociente de coeficientes principales."),
            s("Corte con y", "f(0) = \\frac{1}{-4} = -\\frac{1}{4}", "Sustituimos x = 0."),
            s("Cortes con x", "2x^{2}-3x+1=0 \\Rightarrow x=1,\\; x=\\frac{1}{2}", "Factorizando: (2x−1)(x−1)=0."),
          ],
          "D = ℝ\\{−2,2}; AV x = ±2; AH y = 2; cortes (1,0), (½,0), (0,−¼)",
        ),
        graph({
          series: [{ expr: "(2x^2-3x+1)/(x^2-4)", label: "f(x)", color: "teal" }],
          xmin: -7,
          xmax: 7,
          ymin: -8,
          ymax: 10,
          asymptotes: [-2, 2],
          hlines: [2],
          title: "f(x) = (2x²−3x+1)/(x²−4)",
          caption: "Cerca de x = ±2 la curva se dispara; lejos, se pega a y = 2.",
        }),
        text(
          "**Asíntota oblicua.** Si el grado del numerador es exactamente uno más que el del denominador, se divide: $P(x)=Q(x)\\,c(x)+R(x)$, con $\\deg R<\\deg Q$. La recta $y=c(x)$ es la asíntota oblicua. Por ejemplo, $\\frac{x^2+1}{x}=x+\\frac{1}{x}$ tiene asíntota $y=x$.",
        ),
        example(
          "Asíntota oblicua por división",
          "Hallar la asíntota oblicua de $f(x)=\\dfrac{x^2+3x+5}{x+1}$.",
          [
            s("División", "\\frac{x^{2}+3x+5}{x+1} = x+2+\\frac{3}{x+1}", "Dividendo = divisor × cociente + resto."),
            s("Comportamiento en el infinito", "\\frac{3}{x+1}\\to 0", "El término residual desaparece."),
            s("Asíntota", "y = x+2", "La gráfica se acerca a la recta cuando x → ±∞."),
            s("Verificación numérica", "f(100) = \\frac{10305}{101}\\approx 102{,}03", "Y x + 2 = 102: la diferencia es 0,03."),
          ],
          "y = x + 2",
        ),
        table(
          ["Grados", "Asíntota", "Ejemplo"],
          [
            ["deg P < deg Q", "y = 0", "1/(x²+1)"],
            ["deg P = deg Q", "y = aₚ/a_Q", "(2x²+1)/(x²−4)"],
            ["deg P = deg Q + 1", "oblicua", "(x²+1)/x"],
            ["deg P > deg Q + 1", "ninguna", "x³/(x+1)"],
          ],
          "Resumen de asíntotas",
        ),
        exercise({
          id: "fun-asi-1",
          prompt: "¿Cuál es la asíntota horizontal de $f(x)=\\dfrac{5x^3-2x}{2x^3+x^2+1}$?",
          hint: "Los grados son iguales. Divide los coeficientes de los términos de mayor grado.",
          answer: "y = 5/2",
          choices: ["y = 5/2", "y = 0", "y = 5", "No tiene"],
          correct: 0,
          solution: [
            s("Grados", "\\deg P = \\deg Q = 3"),
            s("Coeficientes principales", "\\frac{5}{2}"),
            s("Asíntota", "y = \\frac{5}{2}"),
          ],
        }),
        checklist([
          "Busco primero los ceros del denominador.",
          "Comparo grados antes de dividir polinomios.",
          "Una asíntota vertical puede tener signos distintos a cada lado.",
        ]),
      ],
      keyFormulas: [
        "\\deg P<\\deg Q \\Rightarrow y=0",
        "\\deg P=\\deg Q \\Rightarrow y=\\frac{a_P}{a_Q}",
      ],
    }),

    lesson({
      id: "funciones-exponenciales",
      title: "Exponenciales y logaritmos",
      subtitle: "Crecimiento, decaimiento y escalas",
      minutes: 20,
      level: "Intermedio",
      objectives: [
        "Aplicar las propiedades de potencias y logaritmos.",
        "Resolver ecuaciones exponenciales y logarítmicas.",
        "Modelar decaimiento radiactivo, enfriamiento y circuitos RC.",
      ],
      blocks: [
        text(
          "La función exponencial $f(x)=a^x$ (con $a>0$, $a\\neq1$) modela fenómenos donde la variación es proporcional al valor actual: poblaciones, intereses, decaimiento radiactivo, carga de un capacitor. Su inversa es el logaritmo, que responde a la pregunta «¿a qué exponente debo elevar la base para obtener este número?».",
        ),
        math("\\log_a(x)=y \\iff a^{y}=x", "Definición de logaritmo"),
        math("\\log_a(xy)=\\log_a x+\\log_a y, \\quad \\log_a\\frac{x}{y}=\\log_a x-\\log_a y, \\quad \\log_a(x^{n})=n\\log_a x", "Propiedades"),
        note(
          "**Cambio de base:** $\\log_a x=\\frac{\\ln x}{\\ln a}$. **Identidades:** $a^{\\log_a x}=x$ y $\\log_a(a^x)=x$. **Dominio:** el logaritmo solo existe para $x>0$. Nunca se puede aplicar $\\ln$ a un número negativo o a cero.",
          { title: "Fórmulas imprescindibles", tone: "key" },
        ),
        example(
          "Ecuación exponencial",
          "Resolver $3\\cdot 2^{x}=48$.",
          [
            s("Aislamos la exponencial", "2^{x}=16", "Dividimos ambos lados entre 3."),
            s("Misma base", "2^{x}=2^{4}", "16 = 2⁴."),
            s("Igualamos exponentes", "x=4", "La función exponencial es inyectiva."),
            s("Verificación", "3\\cdot2^{4}=3\\cdot16=48", "Sustituimos en la ecuación original."),
          ],
          "x = 4",
        ),
        example(
          "Decaimiento radiactivo",
          "Una muestra tiene 80 mg de un isótopo con vida media de 12 días. ¿Cuánto queda a los 30 días?",
          [
            s("Modelo", "m(t)=m_0\\left(\\frac{1}{2}\\right)^{t/T}", "T es la vida media."),
            s("Sustituimos", "m(30)=80\\left(\\frac{1}{2}\\right)^{30/12}", "m₀ = 80, T = 12, t = 30."),
            s("Simplificamos el exponente", "\\frac{30}{12}=2{,}5", "Dos vidas medias y media."),
            s("Calculamos", "m(30)=80\\cdot0{,}1768\\approx14{,}14\\ \\text{mg}", "Queda aproximadamente el 17,7 %."),
          ],
          "≈ 14,14 mg",
        ),
        graph({
          series: [
            { expr: "2^x", label: "y = 2ˣ", color: "amber" },
            { expr: "ln(x)/ln(2)", label: "y = log₂ x", color: "indigo" },
            { expr: "x", label: "y = x", color: "muted", dashed: true },
          ],
          xmin: -4,
          xmax: 8,
          ymin: -4,
          ymax: 8,
          title: "Exponencial y logaritmo son inversas",
          caption: "Cada una es el reflejo de la otra respecto a y = x.",
        }),
        text(
          "**Circuito RC.** Al cargar un capacitor, la corriente decae según $I(t)=I_0e^{-t/RC}$. La constante $\\tau=RC$ se llama constante de tiempo: en $t=\\tau$ la corriente ha caído al 36,8 % ($1/e$). En $5\\tau$ se considera prácticamente cero. Esta es la base de los temporizadores y filtros que usarás en Electrónica.",
        ),
        exercise({
          id: "fun-exp-1",
          prompt: "Resuelve $\\ln(x-1)+\\ln(x+1)=\\ln(8)$.",
          hint: "Combina los logaritmos con la propiedad de la suma y luego iguala los argumentos. Verifica que las soluciones estén en el dominio.",
          answer: "x = 3",
          choices: ["x = 3", "x = ±3", "x = 8", "No tiene solución"],
          correct: 0,
          solution: [
            s("Combinamos", "\\ln\\big((x-1)(x+1)\\big)=\\ln 8", "Suma de logaritmos = logaritmo del producto."),
            s("Igualamos argumentos", "(x-1)(x+1)=8", "La función ln es inyectiva."),
            s("Desarrollamos", "x^{2}-1=8 \\Rightarrow x^{2}=9", "Diferencia de cuadrados."),
            s("Raíces", "x=\\pm3", "Pero x = −3 no cumple x − 1 > 0."),
            s("Verificamos el dominio", "x=3: \\; \\ln2+\\ln4=\\ln8 \\;\\checkmark", "Solo x = 3 es válida."),
          ],
        }),
        checklist([
          "Nunca tomo logaritmo de un número no positivo.",
          "Verifico las soluciones en el dominio original.",
          "Reconozco la vida media y la constante de tiempo.",
        ]),
      ],
      keyFormulas: [
        "\\log_a(xy)=\\log_a x+\\log_a y",
        "\\log_a x=\\frac{\\ln x}{\\ln a}",
        "m(t)=m_0(1/2)^{t/T}",
      ],
    }),
  ],
};
