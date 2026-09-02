# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Arcade Vault — online gaming platform where users play classic arcade games and compete for points on per-game leaderboards. Uses **Spec Driven Design** via the `/spec` and `/spec-impl` skills from `npx skills@latest add Klerith/fernando-skills` (see `skills-lock.json`), más skills y agentes locales de este repo.

## Stack

- **Next.js 16.2.6** with App Router — read `node_modules/next/dist/docs/` before writing Next.js code; APIs differ from training data
- **React 19.2.4**
- **Tailwind CSS v4** (PostCSS plugin via `@tailwindcss/postcss`)
- **TypeScript**
- **Supabase** (`@supabase/ssr`, `@supabase/supabase-js`) — auth + catálogo de juegos + scores
- **Resend** — contact form email delivery
- **Prettier + ESLint** (`eslint-config-next`) — `npm run format`, `npm run format:check`, `npm run lint`

No test runner configured. Env vars documentadas en `.env.template` (Resend, Supabase URL + publishable key, `NEXT_PUBLIC_APP_URL`).

## Tooling del repo

- **Hook `PostToolUse`** (`.claude/settings.json` → `.claude/hooks/format-and-lint.sh`): tras cada `Write`/`Edit`/`MultiEdit` corre Prettier (y ESLint `--fix` en JS/TS) sobre el archivo tocado. No hace falta formatear a mano.
- **MCP Supabase** (`.mcp.json`, habilitado en `.claude/settings.local.json`): acceso al proyecto Supabase para inspeccionar tablas, políticas RLS y advisors. Lo usa `security-auditor`.
- **MCP Playwright**: disponible para verificación visual; capturas en `.playwright-screenshots/` y `.playwright-mcp/` (gitignored).
- **Plugins habilitados**: `security-guidance`, `superpowers`.

## Skills

Usa siempre `/frontend-design` para diseñar la interfaz de usuario.

Skills de spec-driven design (instalados en `.agents/skills/`):

- **`/spec`** — redacta un spec nuevo en `specs/NN-<slug>.md` (estado inicial `Borrador`).
- **`/spec-impl`** — implementa un spec **aprobado**, creando la rama `spec-NN-slug` y avanzando paso a paso.
- **`/spec-impl-game`** — variante para specs de juegos: mismo flujo (Fases 1–4) y al terminar encadena automáticamente `@skin-designer` y luego `@mobile-porter` de forma secuencial (Fase 5). Existe duplicado e idéntico en `.agents/skills/spec-impl-game/` y `.claude/skills/spec-impl-game/`; si lo editas, actualiza ambos.
- **`/add-game`** (`.claude/skills/add-game/`) — genera **solo el spec** de un juego canvas nuevo (componente React, play-page, fila en la tabla `games`, wiring del modal de leaderboard). Acepta una carpeta de `references/started-games/` o una descripción libre. No escribe código; el spec resultante se ejecuta luego con `/spec-impl-game`.

Flujo típico de un juego nuevo: `@game-planner` → `/add-game` → aprobar el spec → `/spec-impl-game NN` (que ya encadena skins + mobile) → `@game-performance-booster`.

## Agentes

- **`game-planner`** — sugiere el próximo juego a implementar evaluando diversidad, factibilidad y reconocimiento clásico. Mantiene `references/game-suggestions-todo.md`. Úsalo con "qué juego sigue". Detalle: `.claude/agents/game-planner.md`.
- **`game-jam`** — dado un tema, genera ≥2 specs completos en `specs/game-jam/<game-id>/`. Úsalo con "game jam: \<tema\>". Detalle: `.claude/agents/game-jam.md`.
- **`skin-designer`** — aplica los 3 skins canónicos (classic, retro, neon) a un juego. Registra estado en `references/game-with-themes.md`. Úsalo con "aplica skins a \<juego\>". Detalle: `.claude/agents/skin-designer.md`.
- **`mobile-porter`** — añade controles táctiles (spec 10) a un juego sin tocar el componente canvas. Úsalo con "porta \<juego\> a mobile". Detalle: `.claude/agents/mobile-porter.md`.
- **`game-performance-booster`** — audita y corrige los 7 patrones de performance (spec 12) en un juego. Úsalo con "optimiza \<juego\>". Detalle: `.claude/agents/game-performance-booster.md`.
- **`security-auditor`** — audita seguridad de DB Supabase (RLS, políticas, funciones SECURITY DEFINER, advisors) y app Next.js (headers, `proxy.ts`, secretos, deps). Solo lectura. Bitácora en `references/security/audit-log.md`. Úsalo con "audita seguridad". Detalle: `.claude/agents/security-auditor.md`.

Todos los agentes de juegos trabajan **un juego por corrida** y no tocan los demás.

## Architecture

App Router exclusively — no `pages/` directory.

### Routes (`app/`)

- `layout.tsx` — root layout (Geist fonts, global CSS, `UserProvider`, `Nav`)
- `page.tsx` — home / landing
- `about/` — about + contact form
- `api/contact/` — Resend-backed contact endpoint
- `auth/` — página de auth (login / signup / forgot password, en un solo componente cliente con tabs)
  - `auth/callback/route.ts` — intercambia el `code` OAuth/email por sesión (`exchangeCodeForSession`)
  - `auth/reset-password/` — formulario de cambio de contraseña tras el email de recuperación
- `games/` — games index (`GamesGrid.tsx`, alimentado desde la tabla `games` de Supabase) + rutas por juego: `arkanoid`, `asteroids`, `frogger`, `snake`, `tetris`
  (ver `references/implemented-games.md` para el catálogo actual; el patrón de implementación está en el spec del juego correspondiente)
- `games/[id]/` — detalle dinámico del juego con ruta anidada `play/` (la `play/` genérica es el placeholder visual/CRT; cada juego real tiene su propia `app/games/<id>/play/page.tsx`)
- `hall-of-fame/` — leaderboard (`page.tsx` RSC + `HallOfFameClient.tsx` con tabs por juego)
- `context/UserContext.tsx` — contexto cliente de auth: `user`, `session`, `username`, `avatarUrl`, `signOut`
- `data/` — `games.ts`, `scores.ts`, `index.ts` quedaron **vacíos**: el catálogo y los scores viven ahora en Supabase. No reintroducir datos estáticos aquí.
- `pokemon-counter/` y `demos/Demo.tsx` — scratch de demos, ajenos al producto
- `RevealObserver.tsx` — scroll-reveal animations

### Raíz

- `proxy.ts` — proxy de Next 16 (el antiguo middleware). Redirige a `/` si ya hay cookie de sesión Supabase; `matcher: '/auth'`.
- `next.config.ts` — headers de seguridad globales (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `X-DNS-Prefetch-Control`) y `allowedDevOrigins`.

### Shared code

- `components/Nav.tsx` — top navigation (avatar + sign-out cuando hay sesión)
- `components/MobileGamepad.tsx` + `MobileGamepad.module.css` — gamepad táctil reutilizable
- `components/games/` — canvas game implementations (`ArkanoidGame`, `AsteroidsGame`, `FroggerGame`, `SnakeGame`, `TetrisGame`)
- `lib/supabase/` — `client.ts` (browser), `server.ts` (RSC/route handlers), `types.ts` (`GameRow`, `ScoreRow`)
- `public/` — sprite sheets (`spritesheet-breakout.png`, `fruits.png`) and audio (`ball-bounce.mp3`, `break-sound.mp3`)

### Base de datos (Supabase)

- `games` — catálogo: `id` (slug, PK), `title`, `short`, `long`, `cat` (`ARCADE|PUZZLE|SHOOTER`), `cover` (clase CSS), `color` (union en `types.ts`: `cyan|magenta|yellow|green`; ojo: la fila `frogger` usa `lime`, que aún no está en el union).
- `scores` — `game_id`, `player_name`, `score`, `user_id` (nullable para invitados).
- RLS activo en ambas tablas; lectura pública, inserción de scores desde el cliente. Ver `references/security/`.

### Specs

`specs/` holds the spec-driven design history (`NN-slug.md`, numerados), plus `specs/game-jam/<game-id>/` for thematic jams. Un spec solo se implementa cuando su estado dice `Aprobado`.

### References (`references/`)

- `implemented-games.md` — índice rápido del catálogo de juegos implementados (id, título, categoría, color, descripción)
- `games-catalog.md` — ficha detallada por juego: fila de `games`, componente, canvas, controles teclado/gamepad, skins y assets
- `game-with-themes.md` — estado de skins (classic/retro/neon) por juego — lo mantiene `skin-designer`
- `game-suggestions-todo.md` — to-do persistente de juegos propuestos — lo mantiene `game-planner`
- `security/` — `security-checklist.md` + `audit-log.md` (bitácora de `security-auditor`)
- `started-games/` — código vanilla original (asteroids, tetris, arkanoid) usado como fuente para `/add-game`
- `templates/` — prototipo visual de referencia (JSX/HTML/CSS) contra el que se compara la UI
- `gamepad-assets/`, `source-assets/` — assets fuente del gamepad y de los sprites

## Conventions

- Server Components by default; add `"use client"` only when needed (game canvases, auth context, interactive forms).
- New routes: folder under `app/` with `page.tsx`.
- Shared UI in `components/`; game logic colocated in `components/games/<Game>.tsx`.
- Supabase: import from `lib/supabase/server` in RSC / route handlers, `lib/supabase/client` in client components.
- New games follow the existing pattern: spec in `specs/`, canvas component in `components/games/`, route under `app/games/<name>/play/page.tsx`, fila en la tabla `games`, score writes through `lib/supabase`.
- El componente canvas recibe `paused` y expone score/lives/level al HUD React; los controles táctiles se cablean en la play-page, nunca dentro del canvas.
