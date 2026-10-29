import type { Module } from "./types";
import { checklist, example, exercise, lesson, math, note, s, table, text } from "./blocks";

export const algebra: Module = {
  id: "algebra",
  title: "Álgebra Lineal",
  short: "Álgebra",
  description:
    "Matrices, determinantes y sistemas: el lenguaje con el que se resuelven redes, estructuras y circuitos.",
  icon: "▦",
  accent: "indigo",
  lessons: [
    lesson({
      id: "algebra-matrices",
      title: "Matrices y operaciones",
      subtitle: "Orden, suma, producto y transpuesta sin misterio",
      minutes: 20,
      level: "Básico",
      objectives: [
        "Identificar el orden de una matriz y sus elementos.",
        "Sumar, multiplicar por escalar y multiplicar matrices.",
        "Interpretar el producto matricial como composición de transformaciones.",
      ],
      blocks: [
        text(
          "Una **matriz** es una tabla rectangular de números organizada en filas y columnas. Si tiene $m$ filas y $n$ columnas, su orden es $m\\times n$. No es solo una forma de ordenar datos: es un objeto algebraico que representa transformaciones lineales, sistemas de ecuaciones, redes y operadores.",
        ),
        math(
          "A = \\begin{pmatrix} a_{11} & a_{12} & \\cdots & a_{1n} \\\\ a_{21} & a_{22} & \\cdots & a_{2n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ a_{m1} & a_{m2} & \\cdots & a_{mn} \\end{pmatrix}",
          "Matriz de orden m × n",
        ),
        text(
          "La **suma** exige el mismo orden y se hace elemento a elemento. El **producto por escalar** multiplica cada entrada. El **producto matricial** es distinto: $C = AB$ existe solo si el número de columnas de $A$ coincide con el número de filas de $B$. Cada entrada se obtiene multiplicando una fila de $A$ por una columna de $B$.",
        ),
        math("c_{ij} = \\sum_{k=1}^{n} a_{ik}\\,b_{kj}", "Elemento (i,j) del producto"),
        note(
          "El producto de matrices **no es conmutativo**: en general $AB \\neq BA$. Incluso puede existir $AB$ y no existir $BA$. Esta es la primera gran diferencia con los números reales y refleja que las transformaciones del plano no se pueden reordenar sin cambiar el resultado.",
          { title: "No conmutatividad", tone: "warn" },
        ),
        example(
          "Producto de una 2×3 por una 3×2",
          "Calcular $AB$ con $A=\\begin{pmatrix}1&2&3\\\\0&-1&2\\end{pmatrix}$ y $B=\\begin{pmatrix}2&0\\\\1&3\\\\-1&1\\end{pmatrix}$.",
          [
            s("Verificamos dimensiones", "(2\\times 3)(3\\times 2) \\rightarrow 2\\times 2", "Las columnas de A (3) coinciden con las filas de B (3); el resultado es 2×2."),
            s("Entrada (1,1)", "c_{11} = 1(2)+2(1)+3(-1) = 1", "Fila 1 de A por columna 1 de B."),
            s("Entrada (1,2)", "c_{12} = 1(0)+2(3)+3(1) = 9", "Fila 1 de A por columna 2 de B."),
            s("Entrada (2,1)", "c_{21} = 0(2)+(-1)(1)+2(-1) = -3", "Fila 2 de A por columna 1 de B."),
            s("Entrada (2,2)", "c_{22} = 0(0)+(-1)(3)+2(1) = -1", "Fila 2 de A por columna 2 de B."),
            s("Resultado", "AB = \\begin{pmatrix}1&9\\\\-3&-1\\end{pmatrix}", "Reunimos las cuatro entradas."),
          ],
          "AB = [[1,9],[−3,−1]]",
        ),
        text(
          "**Transpuesta.** Cambiar filas por columnas produce $A^T$. Sus propiedades son $(A^T)^T=A$, $(A+B)^T=A^T+B^T$ y $(AB)^T=B^TA^T$. La última parece extraña, pero es la que garantiza que el producto interno sea simétrico: $\\langle Ax,y\\rangle = \\langle x,A^Ty\\rangle$.",
        ),
        text(
          "**Aplicación en ingeniería.** En una red de tuberías o en un circuito, la matriz de incidencia nodo-arista resume qué elemento conecta qué nodos. Multiplicarla por el vector de flujos produce los balances en cada nodo. En gráficos por computadora, una matriz $2\\times2$ rota, escala o refleja un objeto; componer dos transformaciones equivale a multiplicar sus matrices.",
        ),
        table(
          ["Operación", "Condición", "Resultado"],
          [
            ["A + B", "mismo orden", "elemento a elemento"],
            ["kA", "siempre", "cada entrada por k"],
            ["AB", "columnas(A) = filas(B)", "orden filas(A) × columnas(B)"],
            ["Aᵀ", "siempre", "orden invertido"],
            ["tr(A)", "cuadrada", "suma de la diagonal"],
          ],
          "Resumen de operaciones",
        ),
        exercise({
          id: "alg-mat-1",
          prompt:
            "Si $A$ es de orden $3\\times 2$ y $B$ de orden $2\\times 4$, ¿qué orden tiene $AB$ y cuántas entradas se calculan?",
          hint: "El orden del producto es filas de la primera por columnas de la segunda. El número de entradas es el producto de esos dos números.",
          answer: "Orden 3×4, 12 entradas",
          choices: ["3×4, 12 entradas", "2×2, 4 entradas", "3×2, 6 entradas", "No se puede multiplicar"],
          correct: 0,
          solution: [
            s("Condición", "2 = 2 \\;\\checkmark", "Columnas de A = filas de B."),
            s("Orden", "(3\\times 2)(2\\times 4) = 3\\times 4"),
            s("Entradas", "3\\cdot 4 = 12"),
          ],
        }),
        checklist([
          "Verifico dimensiones antes de multiplicar.",
          "Sé que AB y BA pueden ser distintos.",
          "Puedo escribir la transpuesta sin confundir filas y columnas.",
        ]),
      ],
      keyFormulas: ["c_{ij}=\\sum_k a_{ik}b_{kj}", "(AB)^{T}=B^{T}A^{T}", "(A^{T})^{T}=A"],
    }),

    lesson({
      id: "algebra-determinantes",
      title: "Determinantes y propiedades",
      subtitle: "El número que decide si un sistema tiene solución única",
      minutes: 22,
      level: "Intermedio",
      objectives: [
        "Calcular determinantes 2×2 y 3×3 por cofactores.",
        "Usar propiedades para simplificar el cálculo.",
        "Interpretar el determinante como área o volumen y como criterio de invertibilidad.",
      ],
      blocks: [
        text(
          "El **determinante** es un número asociado a una matriz cuadrada. Geométricamente mide cuánto escala una transformación las áreas (en $2\\times2$) o los volúmenes (en $3\\times3$). Si vale cero, la transformación aplasta el plano en una recta: la matriz no tiene inversa y el sistema asociado pierde información.",
        ),
        math("\\det\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix} = ad - bc", "Determinante 2×2"),
        math(
          "\\det A = \\sum_{j=1}^{n} (-1)^{1+j} a_{1j}\\,M_{1j}",
          "Desarrollo por cofactores de la primera fila",
        ),
        text(
          "El menor $M_{1j}$ se obtiene eliminando la fila 1 y la columna $j$. El signo $(-1)^{1+j}$ alterna $+,-,+,\\ldots$ Esta fórmula recursiva permite calcular determinantes de cualquier orden, aunque para matrices grandes conviene usar Gauss.",
        ),
        example(
          "Determinante 3×3 por cofactores",
          "Calcular $\\det A$ para $A=\\begin{pmatrix}2&1&0\\\\1&3&1\\\\0&1&2\\end{pmatrix}$.",
          [
            s("Desarrollamos por la primera fila", "\\det A = 2\\,M_{11} - 1\\,M_{12} + 0\\,M_{13}", "Los signos alternan + − +."),
            s("Menor M₁₁", "M_{11} = \\det\\begin{pmatrix}3&1\\\\1&2\\end{pmatrix} = 6-1 = 5", "Eliminamos fila 1 y columna 1."),
            s("Menor M₁₂", "M_{12} = \\det\\begin{pmatrix}1&1\\\\0&2\\end{pmatrix} = 2-0 = 2", "Eliminamos fila 1 y columna 2."),
            s("Menor M₁₃", "M_{13} = \\det\\begin{pmatrix}1&3\\\\0&1\\end{pmatrix} = 1-0 = 1", "El término se anula porque a₁₃ = 0, pero el menor se calcula igual."),
            s("Sustituimos", "\\det A = 2(5) - 1(2) + 0(1) = 10 - 2 = 8", "Sumamos los cofactores."),
            s("Interpretación", "\\det A = 8 \\neq 0", "La transformación escala áreas por 8 y la matriz es invertible."),
          ],
          "det A = 8",
        ),
        note(
          "**Propiedades que ahorran trabajo:** si una fila es múltiplo de otra, el determinante es 0; si se intercambian dos filas, cambia de signo; si se suma un múltiplo de una fila a otra, no cambia; $\\det(AB)=\\det A\\det B$; $\\det(A^T)=\\det A$; $\\det(kA)=k^n\\det A$.",
          { title: "Propiedades clave", tone: "key" },
        ),
        text(
          "**Regla de Cramer.** Para un sistema $Ax=b$ con $\\det A\\neq0$, cada incógnita se obtiene como $x_i = \\frac{\\det A_i}{\\det A}$, donde $A_i$ es la matriz que resulta de reemplazar la columna $i$ por $b$. Es elegante para sistemas pequeños y muy útil para analizar cómo cambia la solución al variar un parámetro.",
        ),
        example(
          "Cramer en un sistema 2×2",
          "Resolver $\\begin{cases}2x+y=5\\\\ x-y=1\\end{cases}$ por Cramer.",
          [
            s("Determinante del sistema", "D = \\det\\begin{pmatrix}2&1\\\\1&-1\\end{pmatrix} = -2-1 = -3", "Como D ≠ 0, hay solución única."),
            s("Determinante en x", "D_x = \\det\\begin{pmatrix}5&1\\\\1&-1\\end{pmatrix} = -5-1 = -6", "Reemplazamos la columna de x por el vector b."),
            s("Determinante en y", "D_y = \\det\\begin{pmatrix}2&5\\\\1&1\\end{pmatrix} = 2-5 = -3", "Reemplazamos la columna de y."),
            s("Dividimos", "x = \\frac{-6}{-3}=2, \\qquad y = \\frac{-3}{-3}=1", "Aplicamos la regla de Cramer."),
            s("Verificación", "2(2)+1=5, \\quad 2-1=1", "Ambas ecuaciones se cumplen."),
          ],
          "x = 2, y = 1",
        ),
        exercise({
          id: "alg-det-1",
          prompt:
            "Si $\\det A = 5$ para una matriz $3\\times3$, ¿cuánto vale $\\det(2A)$?",
          hint: "Al multiplicar toda una matriz $n\\times n$ por $k$, cada una de sus $n$ filas queda multiplicada por $k$.",
          answer: "40",
          choices: ["40", "10", "5", "80"],
          correct: 0,
          solution: [
            s("Propiedad", "\\det(kA) = k^{n}\\det A", "Válida para matrices n×n."),
            s("Sustituimos", "\\det(2A) = 2^{3}\\cdot 5 = 8\\cdot 5 = 40"),
          ],
        }),
        checklist([
          "Sé expandir por cofactores con los signos correctos.",
          "Reconozco una matriz singular cuando det = 0.",
          "Uso propiedades antes de calcular a mano.",
        ]),
      ],
      keyFormulas: ["\\det\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}=ad-bc", "\\det(AB)=\\det A\\det B", "x_i=\\frac{\\det A_i}{\\det A}"],
    }),

    lesson({
      id: "algebra-sistemas",
      title: "Sistemas lineales y Gauss-Jordan",
      subtitle: "Operaciones de fila, rango y los tres escenarios posibles",
      minutes: 26,
      level: "Intermedio",
      objectives: [
        "Escribir un sistema como matriz aumentada.",
        "Aplicar Gauss-Jordan hasta la forma escalonada reducida.",
        "Clasificar un sistema como compatible determinado, indeterminado o incompatible.",
      ],
      blocks: [
        text(
          "Resolver un sistema lineal es encontrar los valores que satisfacen **todas** las ecuaciones a la vez. El método de **Gauss-Jordan** transforma la matriz aumentada $[A|b]$ mediante tres operaciones permitidas: intercambiar filas, multiplicar una fila por un escalar no nulo y sumar a una fila un múltiplo de otra. Estas operaciones no cambian el conjunto solución.",
        ),
        math("\\left(\\begin{array}{ccc|c} a_{11}&a_{12}&a_{13}&b_1\\\\ a_{21}&a_{22}&a_{23}&b_2\\\\ a_{31}&a_{32}&a_{33}&b_3 \\end{array}\\right)", "Matriz aumentada"),
        note(
          "**Lectura del resultado.** Si aparece una fila $[0\\ 0\\ \\cdots\\ 0\\,|\\,k]$ con $k\\neq0$, el sistema es **incompatible**. Si no aparece y hay tantos pivotes como incógnitas, es **compatible determinado**. Si hay menos pivotes que incógnitas, es **compatible indeterminado** y las variables sin pivote son libres.",
          { title: "Los tres escenarios", tone: "key" },
        ),
        example(
          "Sistema 3×3 por Gauss-Jordan",
          "Resolver $\\begin{cases}x+y+z=6\\\\ 2x-y+z=3\\\\ x+2y-z=2\\end{cases}$.",
          [
            s("Matriz aumentada", "\\left(\\begin{array}{ccc|c}1&1&1&6\\\\2&-1&1&3\\\\1&2&-1&2\\end{array}\\right)", "Cada fila es una ecuación."),
            s("Eliminamos x en F2", "F_2 \\leftarrow F_2 - 2F_1", "F2 queda (0,−3,−1 | −9)."),
            s("Eliminamos x en F3", "F_3 \\leftarrow F_3 - F_1", "F3 queda (0,1,−2 | −4)."),
            s("Matriz resultante", "\\left(\\begin{array}{ccc|c}1&1&1&6\\\\0&-3&-1&-9\\\\0&1&-2&-4\\end{array}\\right)", "La primera columna ya tiene un solo pivote."),
            s("Intercambiamos F2 y F3", "\\left(\\begin{array}{ccc|c}1&1&1&6\\\\0&1&-2&-4\\\\0&-3&-1&-9\\end{array}\\right)", "Buscamos un pivote cómodo (1 en lugar de −3)."),
            s("Eliminamos y en F3", "F_3 \\leftarrow F_3 + 3F_2", "F3 queda (0,0,−7 | −21)."),
            s("Normalizamos F3", "F_3 \\leftarrow -\\frac{1}{7}F_3", "F3 queda (0,0,1 | 3), es decir z = 3."),
            s("Sustitución hacia atrás", "y - 2(3) = -4 \\Rightarrow y = 2", "De F2: y − 2z = −4."),
            s("Sustitución final", "x + 2 + 3 = 6 \\Rightarrow x = 1", "De F1: x + y + z = 6."),
            s("Solución", "(x,y,z) = (1,2,3)", "Verificamos en las tres ecuaciones originales."),
          ],
          "x = 1, y = 2, z = 3",
        ),
        table(
          ["Rango(A)", "Rango([A|b])", "Incógnitas", "Resultado"],
          [
            ["3", "3", "3", "Solución única"],
            ["2", "2", "3", "Infinitas soluciones (1 variable libre)"],
            ["2", "3", "3", "Incompatible (sin solución)"],
          ],
          "Clasificación por rangos (teorema de Rouché-Frobenius)",
        ),
        text(
          "**Aplicación eléctrica.** Las leyes de Kirchhoff producen un sistema lineal por cada lazo o nodo. En una red con dos lazos, las incógnitas son las corrientes y los coeficientes son resistencias. Resolver el sistema es calcular el régimen de operación del circuito. Si el determinante es cero, el modelo tiene una dependencia lineal: hay una ecuación redundante o una inconsistencia física.",
        ),
        example(
          "Dos lazos de Kirchhoff",
          "En una red: $12 = 2I_1 + 4(I_1-I_2)$ y $-6 = 4(I_2-I_1)+3I_2$. Hallar $I_1$ e $I_2$.",
          [
            s("Simplificamos la primera", "6I_1 - 4I_2 = 12 \\;\\Rightarrow\\; 3I_1 - 2I_2 = 6", "Agrupamos términos semejantes."),
            s("Simplificamos la segunda", "-4I_1 + 7I_2 = -6 \\;\\Rightarrow\\; 4I_1 - 7I_2 = 6", "Multiplicamos por −1."),
            s("Matriz aumentada", "\\left(\\begin{array}{cc|c}3&-2&6\\\\4&-7&6\\end{array}\\right)", "Dos ecuaciones, dos incógnitas."),
            s("Eliminamos I₁", "F_2 \\leftarrow 3F_2 - 4F_1", "F2 queda (0,−13 | −6)."),
            s("Despejamos I₂", "I_2 = \\frac{6}{13} \\approx 0{,}462\\ \\text{A}", "Corriente en el segundo lazo."),
            s("Sustituimos", "3I_1 - 2\\left(\\frac{6}{13}\\right)=6 \\Rightarrow I_1 = \\frac{30}{13} \\approx 2{,}308\\ \\text{A}", "De la primera ecuación."),
          ],
          "I₁ ≈ 2,308 A; I₂ ≈ 0,462 A",
        ),
        exercise({
          id: "alg-sis-1",
          prompt:
            "Un sistema de 3 incógnitas tiene rango(A) = 2 y rango([A|b]) = 3. ¿Cuántas soluciones tiene?",
          hint: "Compara los dos rangos. Si el rango de la aumentada es mayor, hay una fila inconsistente.",
          answer: "Ninguna: el sistema es incompatible",
          choices: ["Ninguna: es incompatible", "Una sola", "Infinitas con una variable libre", "Infinitas con dos variables libres"],
          correct: 0,
          solution: [
            s("Comparamos", "\\text{rg}(A)=2 < \\text{rg}([A|b])=3", "La columna b aporta un pivote nuevo."),
            s("Interpretación", "\\text{Existe una fila } 0 = k, \\; k\\neq0", "Ecuación imposible."),
            s("Conclusión", "\\text{Sistema incompatible}"),
          ],
        }),
        checklist([
          "Escribo la aumentada sin perder términos independientes.",
          "Solo uso las tres operaciones elementales permitidas.",
          "Clasifico por rangos antes de despejar.",
        ]),
      ],
      keyFormulas: [
        "[A|b] \\xrightarrow{\\text{Gauss}} \\text{RREF}",
        "\\text{rg}(A)=\\text{rg}([A|b])=n \\Rightarrow \\text{única}",
      ],
    }),

    lesson({
      id: "algebra-aplicaciones",
      title: "Aplicaciones en ingeniería",
      subtitle: "Redes, estructuras, transformaciones y balance de materia",
      minutes: 24,
      level: "Avanzado",
      objectives: [
        "Modelar una red con matrices de incidencia.",
        "Plantear balances de masa y energía como sistemas lineales.",
        "Interpretar transformaciones lineales en el plano.",
      ],
      blocks: [
        text(
          "El álgebra lineal no es un capítulo abstracto: es la herramienta estándar para modelar sistemas acoplados. Siempre que varias cantidades se relacionan de forma proporcional, aparece una matriz. Estas son cuatro aplicaciones que verás en la Facultad de Ingeniería.",
        ),
        text(
          "**1. Redes y circuitos.** Una matriz de incidencia $M$ tiene una fila por nodo y una columna por arista. El producto $M\\mathbf{f}$ da el balance neto en cada nodo. Si el nodo es de consumo, se iguala a la demanda; si es de suministro, a la oferta. Resolver $M\\mathbf{f}=\\mathbf{d}$ es hallar los flujos.",
        ),
        text(
          "**2. Estructuras.** En una armadura, el equilibrio de cada nodo produce dos ecuaciones (horizontal y vertical). Con $n$ barras se obtiene un sistema de $2n$ ecuaciones. La matriz de coeficientes contiene senos y cosenos de los ángulos de las barras. Un determinante nulo indica que la armadura es inestable: hay una configuración geométrica que no puede equilibrar cargas.",
        ),
        text(
          "**3. Balance de materia.** En una planta química, cada unidad de proceso recibe y entrega corrientes. El principio de conservación genera una ecuación por componente. El sistema suele ser compatible indeterminado: hay infinitas combinaciones de flujos que satisfacen el balance, y se elige la solución que optimiza costo o pureza.",
        ),
        text(
          "**4. Transformaciones lineales.** Una matriz $2\\times2$ transforma el plano. La rotación de ángulo $\\theta$ es $R_\\theta=\\begin{pmatrix}\\cos\\theta&-\\sin\\theta\\\\ \\sin\\theta&\\cos\\theta\\end{pmatrix}$; el escalamiento es $\\begin{pmatrix}k_x&0\\\\0&k_y\\end{pmatrix}$. Componer transformaciones es multiplicar matrices, y el determinante indica cuánto cambia el área.",
        ),
        example(
          "Rotación de un vector",
          "Rotar el vector $\\mathbf{v}=(3,1)$ un ángulo de $90^\\circ$ en sentido antihorario.",
          [
            s("Matriz de rotación", "R_{90^\\circ} = \\begin{pmatrix}0&-1\\\\1&0\\end{pmatrix}", "cos 90° = 0, sen 90° = 1."),
            s("Multiplicamos", "R\\mathbf{v} = \\begin{pmatrix}0&-1\\\\1&0\\end{pmatrix}\\begin{pmatrix}3\\\\1\\end{pmatrix}", "La matriz actúa sobre el vector columna."),
            s("Calculamos", "R\\mathbf{v} = \\begin{pmatrix}0(3)+(-1)(1)\\\\1(3)+0(1)\\end{pmatrix} = \\begin{pmatrix}-1\\\\3\\end{pmatrix}", "El vector gira sin cambiar de longitud."),
            s("Verificación", "\\|\\mathbf{v}\\| = \\sqrt{10} = \\|R\\mathbf{v}\\|", "Una rotación es una isometría: conserva normas."),
          ],
          "(−1, 3)",
        ),
        example(
          "Balance de materia en dos mezcladores",
          "Un tanque A recibe 100 L/min y envía $x$ L/min a B; B envía $y$ L/min de vuelta a A y 40 L/min a la salida. En estado estacionario, hallar $x$ e $y$.",
          [
            s("Balance en A", "100 + y = x", "Lo que entra es igual a lo que sale."),
            s("Balance en B", "x = y + 40", "B recibe x y entrega y más 40."),
            s("Sistema", "\\begin{cases}x - y = 100\\\\ x - y = 40\\end{cases}", "Ambas ecuaciones tienen los mismos coeficientes."),
            s("Observación", "100 \\neq 40", "Las ecuaciones son incompatibles: el dato de salida no cierra con la entrada."),
            s("Interpretación", "\\text{Hay una fuga o un aporte no modelado}", "El álgebra detecta el error físico antes de construir."),
          ],
          "Sistema incompatible: el balance no cierra",
        ),
        note(
          "Cuando un modelo lineal da incompatible, no siempre el problema es matemático: puede faltar una corriente, una reacción o una pérdida. Cuando da indeterminado, suele haber grados de libertad de diseño. Interpretar el resultado es tan importante como resolverlo.",
          { title: "Leer el resultado", tone: "info" },
        ),
        exercise({
          id: "alg-app-1",
          prompt:
            "Una transformación lineal tiene matriz $\\begin{pmatrix}2&0\\\\0&3\\end{pmatrix}$. ¿Qué le hace al área de una figura?",
          hint: "El determinante de una matriz diagonal es el producto de su diagonal. Su valor absoluto es el factor de escala del área.",
          answer: "Multiplica el área por 6",
          choices: ["Multiplica el área por 6", "Multiplica el área por 5", "No cambia el área", "Divide el área entre 6"],
          correct: 0,
          solution: [
            s("Determinante", "\\det = 2\\cdot3 - 0\\cdot0 = 6"),
            s("Interpretación", "|\\det| = 6", "Cada figura ve multiplicada su área por 6."),
          ],
        }),
        checklist([
          "Puedo traducir un enunciado físico a una matriz.",
          "Interpreto determinante nulo como pérdida de información.",
          "Distingo incompatible (contradicción) de indeterminado (libertad).",
        ]),
      ],
      keyFormulas: [
        "R_\\theta=\\begin{pmatrix}\\cos\\theta&-\\sin\\theta\\\\ \\sin\\theta&\\cos\\theta\\end{pmatrix}",
        "\\text{Área}' = |\\det A|\\cdot\\text{Área}",
      ],
    }),
  ],
};
