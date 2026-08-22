// Puntuaciones mock y persistencia falsa en localStorage.
// El PRNG viene de references/templates/data.jsx y no se toca: es determinista,
// así que servidor y cliente generan las mismas filas y no hay desajuste de hidratación.

export type ScoreRow = {
  rank: number;
  name: string;
  score: number;
  /** Fecha ya renderizada en formato es-ES ("07/03/2026"). */
  date: string;
};

const PLAYERS = [
  "PX_KAI", "NEONFOX", "Z3R0COOL", "M00NRYU", "VAULT_07", "GLITCHA",
  "ATARI_KID", "CYBER_LU", "MAGENTA88", "SCANLINE", "BIT_LORD", "ARKADYA",
  "DROID_X", "RGB_QUEEN", "PIXEL_DAD", "RETROVIRA", "VECTORX", "JOY_STK",
];

export function seededScores(seed: number, count = 12): ScoreRow[] {
  let s = seed;
  const rand = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const used = new Set<string>();
  const rows: ScoreRow[] = [];

  for (let i = 0; i < count; i++) {
    let name: string;
    do {
      name = PLAYERS[Math.floor(rand() * PLAYERS.length)];
    } while (used.has(name) && used.size < PLAYERS.length);
    used.add(name);

    const base = Math.floor(50000 + rand() * 250000);
    const score = base - i * Math.floor(2000 + rand() * 4000);
    const day = String(1 + Math.floor(rand() * 28)).padStart(2, "0");
    const mon = String(1 + Math.floor(rand() * 12)).padStart(2, "0");

    rows.push({ rank: i + 1, name, score: Math.max(score, 1000), date: `${day}/${mon}/2026` });
  }

  return rows
    .sort((a, b) => b.score - a.score)
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

// ===== Puntuaciones guardadas por el reproductor =====

const SCORES_KEY = "av_scores";

export type SavedScore = {
  /** Id del juego. */
  game: string;
  score: number;
  name: string;
  /** Marca de tiempo en milisegundos. */
  at: number;
};

export function readSavedScores(): SavedScore[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SCORES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedScore[]) : [];
  } catch {
    // localStorage deshabilitado o contenido corrupto: seguimos sin persistir.
    return [];
  }
}

export function saveScore(entry: Omit<SavedScore, "at">): void {
  if (typeof window === "undefined") return;
  try {
    const scores = readSavedScores();
    scores.push({ ...entry, at: Date.now() });
    window.localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
  } catch {
    // Sin almacenamiento la partida sigue siendo válida, solo no se recuerda.
  }
}
