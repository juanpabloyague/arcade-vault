# SPEC 01 — MVP visual: portar las cinco pantallas del prototipo al App Router

> **Estado:** Approved
> **Depende de:** —
> **Fecha:** 2026-08-20
> **Objetivo:** Portar las cinco pantallas del prototipo de `references/templates/` (biblioteca, detalle, reproductor, salón de la fama y acceso) a rutas reales del App Router, sin implementar ningún juego jugable.

---

## Por qué existe este spec

El repositorio es todavía un scaffold de `create-next-app`: `app/page.tsx` es una pantalla de prueba
que solo verifica el tema. El tema visual **ya está portado**: `app/globals.css` cubre los mismos
tokens y las mismas clases de componente que `references/templates/styles.css` (verificado selector a
selector). Lo que falta es el marcado y la interactividad de las pantallas.

El prototipo usa un router por hash y comparte estado por `window.*`. Este spec lo sustituye por
rutas reales del App Router, módulos con `import`/`export` y tipos de TypeScript, conservando el
resultado visual 1:1.

---

## Alcance

**Dentro:**

- Cinco rutas nuevas: biblioteca (`/`), detalle (`/juego/[id]`), reproductor (`/jugar/[id]`),
  salón de la fama (`/salon`) y acceso (`/acceso`).
- Nav compartido con cajón móvil y footer, montados en `app/layout.tsx`.
- Datos mock tipados en `lib/`: los 8 juegos, las categorías y el generador determinista de
  puntuaciones del prototipo.
- Sesión falsa en React Context + `localStorage` (clave `av_user`), con "Jugar como invitado".
- Guardado de puntuaciones falso en `localStorage` (clave `av_scores`).
- Simulación visual del reproductor: temporizador que sube la puntuación, niveles, pausa y modal
  de FIN DEL JUEGO.
- Pantalla 404 propia (`app/not-found.tsx`) para ids de juego inexistentes.
- Accesibilidad básica: `aria-label` en el botón de menú, foco visible, botones reales en lugar de
  los `<a onClick>` del prototipo.

**Fuera de alcance (para specs futuros):**

- Juegos jugables reales (canvas, bucle de juego, controles). El reproductor sigue siendo la demo
  CRT animada por CSS.
- Backend, base de datos y autenticación real. Los botones de Google y GitHub son decorativos.
- Tests automatizados: no hay runner configurado y este spec no añade uno.
- Auditoría WCAG completa e internacionalización.
- Filtros de la biblioteca reflejados en la URL (`?q=`, `?cat=`).
- Puntuaciones reales por usuario: el "TU MEJOR MARCA" del salón sigue siendo un valor derivado del
  mock, como en el prototipo.

---

## Modelo de datos

Tres módulos nuevos en `lib/`. Los identificadores van en inglés; los textos, en español.

```ts
// lib/games.ts
export type Category = "TODOS" | "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type GameColor = "cyan" | "magenta" | "yellow" | "green";

export type Game = {
  id: string; // "bloque-buster" — también el segmento de la URL
  title: string; // "BLOQUE BUSTER"
  short: string; // descripción de la tarjeta
  long: string; // descripción de la página de detalle
  cat: Exclude<Category, "TODOS">;
  cover: string; // clase CSS del cover: "cover-bricks", "cover-tetro", …
  color: GameColor; // variante del botón JUGAR
  best: number; // mejor puntuación global
  plays: string; // "12.4K" — ya viene formateado en el mock
};

export const GAMES: Game[]; // los 8 juegos de data.jsx, sin cambios
export const CATS: Category[]; // ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"]
export function getGame(id: string): Game | undefined;
```

```ts
// lib/scores.ts
export type ScoreRow = {
  rank: number;
  name: string; // "PX_KAI"
  score: number;
  date: string; // "07/03/2026" — formato es-ES, ya renderizado
};

export function seededScores(seed: number, count?: number): ScoreRow[];

// Puntuaciones guardadas por el reproductor — clave localStorage "av_scores"
export type SavedScore = {
  game: string;
  score: number;
  name: string;
  at: number;
};
export function saveScore(entry: Omit<SavedScore, "at">): void;
export function readSavedScores(): SavedScore[];
```

```tsx
// lib/session.tsx
export type User = { name: string }; // "PX_KAI", máximo 10 caracteres, en mayúsculas

export function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element;
export function useSession(): {
  user: User | null;
  ready: boolean; // false hasta que se lee localStorage en el cliente
  signIn: (user: User | null) => void; // null = invitado
  signOut: () => void;
};
```

Convenciones:

- `seededScores` se porta **sin tocar el PRNG** (`s = (s * 9301 + 49297) % 233280`). Es determinista,
  así que servidor y cliente producen las mismas filas y no hay desajuste de hidratación.
- Las semillas se mantienen idénticas al prototipo: `id.length * 17 + 3` con 10 filas en el detalle,
  `id.length * 23 + 7` con 12 filas en el salón.
- Los números se formatean siempre con `toLocaleString("es-ES")`.
- Claves de `localStorage`: `av_user` y `av_scores`, las mismas del prototipo, sin versionar.

---

## Mapa de rutas

| Prototipo         | Ruta          | Archivo                   | Componente cliente               |
| ----------------- | ------------- | ------------------------- | -------------------------------- |
| `biblioteca.jsx`  | `/`           | `app/page.tsx`            | `LibraryBrowser`, `GameCard`     |
| `detalle.jsx`     | `/juego/[id]` | `app/juego/[id]/page.tsx` | — (solo `Leaderboard`, servidor) |
| `reproductor.jsx` | `/jugar/[id]` | `app/jugar/[id]/page.tsx` | `PlayerScreen`, `GameOverModal`  |
| `salon.jsx`       | `/salon`      | `app/salon/page.tsx`      | `HallOfFameBoard`                |
| `auth.jsx`        | `/acceso`     | `app/acceso/page.tsx`     | `AuthForm`                       |
| `nav.jsx`         | (todas)       | `app/layout.tsx`          | `Nav`, `MobileDrawer`            |

Cada `page.tsx` es Server Component: carga los datos de `lib/` y los pasa por props. Solo los trozos
interactivos llevan `"use client"`.

---

## Plan de implementación

Cada paso deja el proyecto compilando (`npm run build`) y sin errores de `npx tsc --noEmit`.

1. **`lib/games.ts`** — tipos `Game`, `Category`, `GameColor`, la constante `GAMES` con los 8 juegos
   de `data.jsx`, `CATS` y `getGame(id)`.
2. **`lib/scores.ts`** — `ScoreRow`, la lista `PLAYERS`, el port de `seededScores`, y los helpers
   `saveScore` / `readSavedScores` sobre `av_scores` con `try/catch` alrededor de `localStorage`.
3. **`lib/session.tsx`** — `SessionProvider` (`"use client"`) que lee `av_user` en un `useEffect`,
   expone `user`, `ready`, `signIn`, `signOut`, y el hook `useSession` que lanza error fuera del
   provider.
4. **`components/ui/SiteFooter.tsx`** — el footer con el texto
   `© 2026 ARCADE VAULT · HECHO CON PIXELES Y NEÓN · v2.6.0`, usando clases del tema en vez del
   `style` inline del prototipo. Se envuelve `app/layout.tsx` con `SessionProvider`, se añade
   `<main className="av-main">` y el footer. Verificación manual: la página de prueba sigue
   renderizando, ahora con footer.
5. **`components/nav/Nav.tsx`** y **`components/nav/MobileDrawer.tsx`** (`"use client"`) — logo,
   enlaces con `next/link`, contador `CRÉDITOS · 03`, botón de sesión que muestra
   `{user.name} ▾` o `Iniciar Sesión`, y hamburguesa que abre el cajón. El estado activo sale de
   `usePathname()`: `/` y `/juego/*` y `/jugar/*` marcan "Biblioteca". Se montan en el layout.
6. **`components/library/GameCard.tsx`** (`"use client"`) — tarjeta con el efecto de inclinación por
   `onMouseMove` y el botón JUGAR coloreado según `game.color`. Toda la tarjeta es un `next/link`
   hacia `/juego/[id]`.
7. **`components/library/LibraryBrowser.tsx`** (`"use client"`) — hero, buscador, chips de categoría,
   grid filtrado con `useMemo` y el estado vacío "NO HAY RESULTADOS". Se reemplaza el contenido de
   `app/page.tsx` por el Server Component que le pasa `GAMES` y `CATS`.
8. **`app/not-found.tsx`** — pantalla 404 con estética arcade y un enlace de vuelta a la biblioteca.
9. **`components/ui/Leaderboard.tsx`** (servidor) — la tabla lateral `MEJORES PUNTUACIONES` que recibe
   `ScoreRow[]` y marca las tres primeras posiciones.
10. **`app/juego/[id]/page.tsx`** — portada, etiquetas, descripción larga, `stat-strip`, botones
    JUGAR AHORA / VOLVER AL VAULT y el `Leaderboard`. Llama a `notFound()` si `getGame(id)` es
    `undefined`, y expone `generateStaticParams` y `generateMetadata` (título por juego).
11. **`components/player/GameOverModal.tsx`** (`"use client"`) — modal con la puntuación final, el
    input de nombre (mayúsculas, 10 caracteres), el botón de guardar, el toast
    `▸ PUNTUACIÓN GUARDADA_` y las acciones JUGAR DE NUEVO / VOLVER AL VAULT.
12. **`components/player/PlayerScreen.tsx`** (`"use client"`) — HUD, pantalla CRT con la arena
    animada, overlay de pausa y la simulación: `setInterval` de 220 ms que suma entre 10 y 99 puntos,
    subida de nivel cada 2500 puntos, y los botones PAUSA / FIN / SALIR. El nombre por defecto sale
    de `useSession()` o es `INVITADO`.
13. **`app/jugar/[id]/page.tsx`** — Server Component que resuelve el juego, llama a `notFound()` si no
    existe y renderiza `PlayerScreen`.
14. **`components/hall/HallOfFameBoard.tsx`** (`"use client"`) — pestañas por juego, podio de tres
    posiciones y tabla de 12 filas con la animación escalonada. Si hay usuario, añade las filas
    `▸ TU MEJOR MARCA EN …` y la fila destacada en amarillo.
15. **`app/salon/page.tsx`** — Server Component que pasa `GAMES` al tablero.
16. **`components/auth/AuthForm.tsx`** (`"use client"`) — pestañas INICIAR SESIÓN / CREAR CUENTA,
    campos de usuario, correo (solo en alta) y contraseña, botón de envío que llama a `signIn` y
    navega a `/`, botón de invitado, separador y los dos botones sociales decorativos
    (`type="button"`, `disabled` con `title` explicativo).
17. **`app/acceso/page.tsx`** — Server Component que renderiza `AuthForm`.
18. **Limpieza de documentación** — `CLAUDE.md` apunta a `resources/templates/`, pero la carpeta real
    es `references/templates/`. Se corrige la ruta en las dos menciones.

---

## Criterios de aceptación

- [ ] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores ni advertencias nuevas.
- [ ] `/` muestra el hero ARCADE VAULT y las 8 tarjetas de juego.
- [ ] Escribir `serp` en el buscador deja visible solo SERPENTINA.
- [ ] Pulsar el chip `PUZZLE` deja visible solo CAÍDA.
- [ ] Una búsqueda sin resultados muestra el bloque "NO HAY RESULTADOS".
- [ ] Hacer clic en una tarjeta navega a `/juego/<id>` y la URL cambia en la barra del navegador.
- [ ] `/juego/caida` muestra la descripción larga, `184.220` como mejor global y 10 filas de
      puntuaciones.
- [ ] `/juego/no-existe` muestra la pantalla 404, no un error de servidor.
- [ ] `/jugar/caida` muestra el HUD y la puntuación sube sola de forma continua.
- [ ] Pulsar PAUSA detiene el contador y muestra el overlay "EN PAUSA"; REANUDAR lo reanuda.
- [ ] Pulsar FIN abre el modal con la puntuación final formateada como `es-ES`.
- [ ] Guardar la puntuación muestra el toast y añade una entrada a `av_scores` en `localStorage`.
- [ ] `/salon` muestra el podio, 12 filas y cambia el contenido al pulsar otra pestaña de juego.
- [ ] Enviar el formulario de `/acceso` con el usuario `px_kai` navega a `/` y el Nav muestra
      `PX_KAI ▾`.
- [ ] Tras recargar la página, el Nav sigue mostrando `PX_KAI ▾` (persistencia en `av_user`).
- [ ] Pulsar el botón de usuario en el Nav cierra la sesión y vuelve a mostrar `Iniciar Sesión`.
- [ ] "JUGAR COMO INVITADO" navega a `/` sin sesión iniciada.
- [ ] Con el usuario iniciado, `/salon` muestra la fila `▸ TU MEJOR MARCA EN …`.
- [ ] A 375 px de ancho, la hamburguesa abre el cajón lateral y sus enlaces navegan y lo cierran.
- [ ] La consola del navegador no muestra errores de hidratación en ninguna de las cinco pantallas.
- [ ] Ningún archivo importa desde `references/templates/`.

---

## Decisiones

- **Sí:** rutas con segmentos en español (`/juego`, `/jugar`, `/salon`, `/acceso`). La interfaz es en
  español y coincide con los nombres del prototipo. Los identificadores de código siguen en inglés.
- **No:** router por hash con estado serializado en la URL, como en `app.jsx`. El App Router ya da
  navegación, historial y prerenderizado reales.
- **Sí:** `page.tsx` como Server Component con islas cliente. Los datos son estáticos, así que la
  biblioteca, el detalle y el salón se pueden prerenderizar.
- **No:** marcar cada página con `"use client"`. Sería más rápido de portar pero renuncia al
  prerenderizado sin ganar nada.
- **Sí:** sesión con React Context + `localStorage`, replicando `av_user`. Mantiene el comportamiento
  del prototipo sin introducir backend.
- **Sí:** leer `localStorage` dentro de `useEffect` y exponer `ready`. Leer durante el render
  provocaría desajuste de hidratación.
- **No:** cookies o middleware para la sesión. Sería infraestructura de autenticación real, que está
  fuera de alcance.
- **Sí:** conservar la simulación del reproductor (temporizador, niveles, modal). Es parte de la
  especificación visual, no un juego.
- **Sí:** las clases del tema ya existentes en `app/globals.css` (`.card`, `.btn`, `.crt`, …) como
  API de estilos. Están portadas y verificadas; duplicarlas en utilidades de Tailwind desincronizaría
  el diseño.
- **Sí:** `notFound()` con `app/not-found.tsx` propio. El prototipo renderizaba `null`, que en una
  aplicación real es una pantalla en blanco sin explicación.
- **No:** filtros de la biblioteca en la URL. Añade un límite de Suspense y código extra sin valor
  para un MVP visual.
- **Sí:** `components/` en la raíz del repositorio, importado como `@/components/...`. Separa la UI
  compartida del árbol de rutas.
- **Sí:** los botones de Google y GitHub se renderizan `disabled`. Un botón decorativo que parece
  funcional es un error de interfaz, no una decisión de diseño.

---

## Riesgos

| Riesgo                                                                      | Mitigación                                                                                                                                                                      |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Desajuste de hidratación al leer `av_user` durante el render                | El provider arranca con `user: null` y `ready: false`, y lee `localStorage` en `useEffect`.                                                                                     |
| `localStorage` deshabilitado (modo privado)                                 | Todo acceso va envuelto en `try/catch`; la aplicación funciona sin persistir, igual que en el prototipo.                                                                        |
| Next 16 diverge de las convenciones del App Router conocidas                | Antes de escribir cada ruta se consulta `node_modules/next/dist/docs/01-app/`; los props de página usan los tipos generados (`PageProps<"/juego/[id]">`), no interfaces a mano. |
| El `setInterval` del reproductor sigue vivo al salir de la pantalla         | El `useEffect` devuelve `clearInterval`, y las dependencias incluyen los estados de pausa y fin.                                                                                |
| El efecto de inclinación de las tarjetas usa el ratón y no existe en táctil | Es una mejora progresiva: sin ratón la tarjeta se renderiza igual, solo sin transformación.                                                                                     |

---

## Lo que **no** entra en este spec

- Juegos jugables: ni canvas, ni bucle de juego, ni controles de teclado.
- Backend, base de datos, API y autenticación real (incluido OAuth de Google y GitHub).
- Tests automatizados y la configuración de un runner de tests.
- Puntuaciones reales por usuario y un salón de la fama con datos persistidos.
- Auditoría de accesibilidad completa e internacionalización.

Cada uno de esos, si llega, va en su propio spec.
