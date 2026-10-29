# MateLUZ

Tutor interactivo de matemática para estudiantes de ingeniería de la **Universidad del Zulia (LUZ)**. Cubre el camino completo desde la geometría euclidiana hasta el cálculo avanzado, con procedimientos descompuestos paso a paso, gráficas interactivas y problemas de examen.

**Sitio:** https://mateluz.vercel.app

## Qué incluye

- **9 módulos, 33 lecciones y 40 ejercicios** con objetivos, ejemplos resueltos, pistas y soluciones guiadas.
- **Modo guiado:** cada desarrollo revela un paso a la vez para que intentes anticipar el siguiente.
- **Gráficas en canvas** generadas por un motor propio (funciones, áreas, asíntotas, cónicas, puntos notables).
- **Seis laboratorios interactivos:** funciones, límites, derivadas, integrales, matrices y cónicas.
- **Progreso local:** lecciones completadas, estado de ejercicios y tema claro/oscuro en `localStorage`, sin registro.
- **Buscador** por título, objetivos, ejemplos y ejercicios, con resaltado de coincidencias.
- **Contenido 100 % en español**, con notación matemática renderizada con KaTeX.

### Ruta de estudio

| # | Módulo | Contenido |
|---|--------|-----------|
| 1 | Geometría Euclidiana | Axiomas, triángulos, circunferencia, semejanza, áreas y volúmenes |
| 2 | Geometría Analítica | Recta, circunferencia, parábola, elipse, hipérbola, coordenadas polares |
| 3 | Álgebra Lineal | Matrices, Gauss-Jordan, determinantes, espacios vectoriales, valores propios |
| 4 | Funciones | Dominio y rango, composición, inversa, exponenciales y logaritmos |
| 5 | Límites y Continuidad | Límites laterales, indeterminaciones, L'Hôpital, asíntotas, continuidad |
| 6 | Cálculo Diferencial | Definición, reglas, cadena, implícitas, optimización, Taylor |
| 7 | Cálculo Integral | Antiderivadas, sustitución, partes, fracciones simples, áreas y volúmenes |
| 8 | Cálculo Avanzado | Sucesiones y series, EDO, cálculo vectorial, métodos numéricos |
| 9 | Entrenamiento de Examen | Problemas integradores estilo parcial de la facultad |

## Stack

- **Vite 8 + React 19 + TypeScript** (sin router externo: hash routing propio).
- **KaTeX** para matemática.
- **Motores propios** en `src/engine/`: parser de expresiones, límites, derivadas simbólicas, integración, matrices con aritmética exacta de fracciones, cónicas y análisis de funciones.
- **Vitest** para los motores y **Edge headless + CDP** para el smoke test de interfaz.
- Estado global con `useSyncExternalStore`, sin dependencias de gestión de estado.

## Desarrollo

```bash
npm install
npm run dev        # servidor de desarrollo
npm run test       # pruebas de los motores (Vitest)
npm run build      # tsc --noEmit && vite build
npm run preview    # sirve dist/ en http://localhost:4173
npm run smoke      # smoke test de UI (requiere Edge y preview en 4173)
```

El smoke test abre Edge headless, recorre portada, módulo, lección, ejercicio, buscador y laboratorios, y guarda capturas en `.preview/`.

## Estructura

```
src/
  content/        módulos, lecciones, ejemplos, ejercicios y buscador
  engine/         parser, límites, derivadas, integrales, matrices, cónicas, análisis
  components/     Layout, Math, RichText, Steps, Graph, Exercise, BlockRenderer
  labs/           los seis laboratorios interactivos
  pages/          Home, ModulePage, LessonPage, SearchPage, LabsPage, NotFound
  lib/            router hash y almacén de progreso
  styles.css      sistema de diseño (claro/oscuro, responsive)
scripts/
  smoke.mjs       prueba end-to-end con Edge + CDP
```

## Despliegue

El proyecto es estático: `npm run build` genera `dist/` y puede publicarse en cualquier hosting estático. En Vercel:

```bash
vercel --prod
```

`vercel.json` fija el framework, el comando de build y el directorio de salida.

## Privacidad

Todo el cálculo ocurre en el navegador. No hay backend, cuentas ni envío de datos; el progreso se guarda únicamente en el dispositivo.
