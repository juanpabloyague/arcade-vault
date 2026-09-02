# Catálogo de juegos — Arcade Vault

Detalle de los **5 juegos implementados**. Cada ficha recoge la fila de la tabla `games` de
Supabase, el componente canvas, los controles y el estado de skins y soporte móvil.

> **Fuente:** specs (`INSERT INTO games`) + código en `components/games/` y `app/games/<id>/play/`.
> No verificado contra la base de datos en vivo — si una fila se editó a mano en Supabase, este
> documento puede haber quedado desfasado.
> Índice rápido: `implemented-games.md` · Skins: `game-with-themes.md` · Pendientes: `game-suggestions-todo.md`

---

## Resumen

| ID          | Título    | Categoría | Color    | Cover           | Componente          | Spec                                  |
| ----------- | --------- | --------- | -------- | --------------- | ------------------- | ------------------------------------- |
| `asteroids` | ASTEROIDS | SHOOTER   | `yellow` | `cover-rocas`   | `AsteroidsGame.tsx` | `05-asteroids-game.md`                |
| `tetris`    | TETRIS    | PUZZLE    | `cyan`   | `cover-tetro`   | `TetrisGame.tsx`    | `07-tetris-game.md`                   |
| `arkanoid`  | ARKANOID  | ARCADE    | `cyan`   | `cover-bricks`  | `ArkanoidGame.tsx`  | `08-arkanoid-game.md`                 |
| `snake`     | SNAKE     | ARCADE    | `green`  | `cover-snake`   | `SnakeGame.tsx`     | `09-snake-game.md`                    |
| `frogger`   | FROGGER   | ARCADE    | `lime`   | `cover-frogger` | `FroggerGame.tsx`   | `game-jam/frogger/01-frogger-core.md` |

Los 5 comparten: leaderboard top 10 en `/games/<id>`, tab propio en `/hall-of-fame` (top 12),
guardado de score al terminar (`scores.user_id` = usuario logueado o `null` si es invitado),
prop `paused`, y `<MobileGamepad>` cableado en la play-page.

---

## `asteroids` — ASTEROIDS

| Campo   | Valor                             |
| ------- | --------------------------------- |
| `cat`   | `SHOOTER`                         |
| `cover` | `cover-rocas`                     |
| `color` | `yellow`                          |
| `short` | Pulveriza rocas en gravedad cero. |

**long:** Tu nave triangular flota en vacío absoluto. Dispara y rota para dividir rocas en
fragmentos cada vez más pequeños. Supera niveles y acumula puntos antes de que los asteroides
te alcancen.

- **Ruta:** `/games/asteroids/play` · **Componente:** `components/games/AsteroidsGame.tsx`
- **Canvas:** 800 × 600
- **Teclado:** `←`/`→` rotar · `↑` propulsión · `Space` disparar
- **Gamepad:** `up: ArrowUp`, `left: ArrowLeft`, `right: ArrowRight`, `A: Space`, `B: z`
- **Skins:** `classic` (default), `retro`, `neon` — persistidos en `localStorage['asteroids-skin']`
- **HUD:** score · lives · level
- **Notas:** primer juego del proyecto; su spec (05) es anterior a la tabla `games`, cuya fila
  se sembró en el spec 06.

---

## `tetris` — TETRIS

| Campo   | Valor                                              |
| ------- | -------------------------------------------------- |
| `cat`   | `PUZZLE`                                           |
| `cover` | `cover-tetro`                                      |
| `color` | `cyan`                                             |
| `short` | Apila tetrominos antes de que el techo te aplaste. |

**long:** Siete piezas, diez columnas, una sola regla: no dejes que el tablero llegue arriba.
Gira y encaja tetrominos para completar líneas y ganar puntos; cada nivel te las acelera un poco más.

- **Ruta:** `/games/tetris/play` · **Componente:** `components/games/TetrisGame.tsx`
- **Canvas:** tablero 300 × 600 (grid 10 × 20) + preview de "next" 120 × 120
- **Teclado:** `←`/`→` mover · `↓` soft drop · `↑` o `X` rotar · `Space` hard drop
- **Gamepad:** `up/A: ArrowUp`, `down: ArrowDown`, `left: ArrowLeft`, `right: ArrowRight`, `B: Shift`
- **Skins:** `retro` (default), `neon`, `pastel` — `localStorage['tetris-skin']`.
  ⚠️ Único juego **sin skin `classic`**; el `MobileGamepad` ofrece classic/retro/neon, así que
  su selector no coincide del todo con los skins reales.
- **HUD:** score · lives · level

---

## `arkanoid` — ARKANOID

| Campo   | Valor                                                |
| ------- | ---------------------------------------------------- |
| `cat`   | `ARCADE`                                             |
| `cover` | `cover-bricks`                                       |
| `color` | `cyan`                                               |
| `short` | Rompe todos los bloques antes de perder tus 3 vidas. |

**long:** Controla la paleta y rebota la pelota para destruir todos los bloques. Cinco niveles con
patrones distintos y velocidad creciente ponen a prueba tus reflejos. Completa el nivel 5 sin
agotar tus vidas para ganar.

- **Ruta:** `/games/arkanoid/play` · **Componente:** `components/games/ArkanoidGame.tsx`
- **Canvas:** 800 × 600
- **Teclado:** `←`/`→` mover paleta · **ratón:** `mousemove` sobre el canvas también mueve la paleta
- **Gamepad:** `left: ArrowLeft`, `right: ArrowRight`, `A: Space`
- **Skins:** `classic` (default), `retro`, `neon` — `localStorage['arkanoid-skin']`
- **HUD:** score · lives (3) · level (5 niveles)
- **Assets:** `public/spritesheet-breakout.png`, `public/ball-bounce.mp3`, `public/break-sound.mp3`

---

## `snake` — SNAKE

| Campo   | Valor                                       |
| ------- | ------------------------------------------- |
| `cat`   | `ARCADE`                                    |
| `cover` | `cover-snake`                               |
| `color` | `green`                                     |
| `short` | Come frutas, crece y no te muerdas la cola. |

**long:** Guía a la serpiente por el tablero comiendo frutas que aparecen aleatoriamente. Cada
fruta que comes hace crecer tu cuerpo y sube tu puntuación. La partida termina si chocas contra
una pared o contra ti mismo.

- **Ruta:** `/games/snake/play` · **Componente:** `components/games/SnakeGame.tsx`
- **Canvas:** 800 × 800 (grid 20 × 20, celda 40 px)
- **Teclado:** flechas o `WASD`; los giros de 180° se ignoran
- **Gamepad:** `up: w`, `down: s`, `left: a`, `right: d`
- **Skins:** `classic` (default), `retro`, `neon` — `localStorage['snake-skin']`
- **HUD:** score · lives · level
- **Game over:** choque contra pared o contra el propio cuerpo
- **Assets:** `public/fruits.png`

---

## `frogger` — FROGGER

| Campo   | Valor                                                   |
| ------- | ------------------------------------------------------- |
| `cat`   | `ARCADE`                                                |
| `cover` | `cover-frogger`                                         |
| `color` | `lime`                                                  |
| `short` | Cruza la carretera y el río sin convertirte en papilla. |

**long:** Guía a tu rana a través de una carretera repleta de coches y un río de troncos y tortugas
flotantes. Llena las cinco bocas del otro lado para completar la ronda; cada nivel acelera el
tráfico y acorta el tiempo. Tres vidas y mucho asfalto por delante.

- **Ruta:** `/games/frogger/play` · **Componente:** `components/games/FroggerGame.tsx`
- **Canvas:** 640 × 560 (grid 16 × 14, celda 40 px)
- **Teclado:** flechas o `WASD` (movimiento discreto por celda)
- **Gamepad:** `up: w`, `down: s`, `left: a`, `right: d`
- **Skins:** `classic` (default), `retro`, `neon` — `localStorage['frogger-skin']`
- **HUD:** score · lives (3) · level + barra de tiempo interna en el canvas
- **Render:** 100 % primitivas canvas, sin sprites bitmap
- **Notas:** salió de un game jam (`specs/game-jam/frogger/`) y es el juego sobre el que se
  definieron los 7 patrones de performance del spec `12-frogger-performance.md`.
- ⚠️ El `color` de su fila es `lime`, que **no está** en el union `GameRow['color']` de
  `lib/supabase/types.ts` (`cyan | magenta | yellow | green`).

---

## No implementados

- **`space-invaders`** — tiene specs completos en `specs/game-jam/space-invaders/`
  (`01-space-invaders-core.md`, `02-space-invaders-sfx.md`) pero no hay componente ni ruta.
- El resto de candidatos vive en `references/game-suggestions-todo.md` (`game-planner`).
