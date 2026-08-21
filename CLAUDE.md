# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

# Skills

Always use /frontend-design to do user interfaces.

## Commands

```bash
npm run dev      # dev server (also rewrites the nextjs-agent-rules block in AGENTS.md)
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint (flat config, next core-web-vitals + typescript)
npx tsc --noEmit # typecheck; there is no `typecheck` script
```

No test runner is configured yet.

## What this project is

Arcade Vault is a Spanish-language retro-arcade portal: a library of mini-games,
a per-game player with scoring, and a "Salón de la Fama" leaderboard. UI copy is
in Spanish — keep it that way; code identifiers stay in English.

The repo is currently a bare `create-next-app` scaffold (`app/page.tsx` is still
the starter page). The real work is porting the prototype into the App Router.

## Architecture

- **Next.js 16.3.1 / React 19.2.8 / Tailwind CSS v4**, TypeScript strict, App Router.
  Next 16 diverges from older App Router conventions — consult
  `node_modules/next/dist/docs/01-app/` before writing routing, layout, or data-fetching
  code. Example already in the tree: `app/layout.tsx` types its props with the
  globally-generated `LayoutProps<"/">`, not a hand-written interface.
- **Tailwind v4** is configured through PostCSS only (`postcss.config.mjs`); there is no
  `tailwind.config.*`. Theme tokens live in `app/globals.css` under `@theme inline`.
- `@/*` maps to the repo root (`tsconfig.json` paths).

## `resources/templates/` — the design prototype

A standalone, non-buildable React 18 UMD + Babel-in-browser mockup (open
`resources/templates/Arcade Vault.html` directly in a browser). It is the visual and
behavioral spec for the app, **not** code to import: scripts share globals via `window.*`,
alias hooks per file (`useStateB`, `useStateP`, …) to dodge redeclaration, and never
import/export.

Map from prototype to App Router routes:

| Template          | Component                         | Intended route                                               |
| ----------------- | --------------------------------- | ------------------------------------------------------------ |
| `biblioteca.jsx`  | `Library`, `GameCard`             | game library / catalog with category filter                  |
| `detalle.jsx`     | `GameDetail`                      | per-game detail page                                         |
| `reproductor.jsx` | `GamePlayer`                      | play screen (HUD: score, lives, level)                       |
| `salon.jsx`       | `HallOfFame`                      | leaderboard, tabbed per game                                 |
| `auth.jsx`        | `Auth`                            | sign-in / sign-up                                            |
| `nav.jsx`         | `Nav`                             | shared nav + mobile drawer                                   |
| `app.jsx`         | `App`                             | hash-based router + `localStorage` session/score persistence |
| `data.jsx`        | `GAMES`, `CATS`, `seededScores()` | mock data — 8 games, deterministic fake scores               |

`styles.css` (950 lines) holds the visual language: dark neon palette
(`--cyan #00f5ff`, `--magenta #ff006e`, `--yellow`, `--green`, gold/silver/bronze ranks),
`Press Start 2P` for pixel headings and `JetBrains Mono` for body, plus a CRT treatment
(perspective grid, scanlines, vignette, noise). When porting, translate these CSS custom
properties into `@theme inline` tokens in `app/globals.css` rather than copying the
stylesheet verbatim.

Auth, scores, and gameplay in the prototype are all faked (`localStorage`, timers,
seeded PRNG). Real persistence is unimplemented.

## Workflow

Per `README.md`, this project follows spec-driven development using the `/spec` and
`/spec-impl` skills from [Klerith/fernando-skills](https://github.com/Klerith/fernando-skills),
installed with `npx skills@latest add Klerith/fernando-skills`. Those skills are not
currently present in this environment.
