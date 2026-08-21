// Tabla lateral de puntuaciones. Server Component: los datos son deterministas.

import type { ScoreRow } from "@/lib/scores";

// Las tres primeras posiciones se pintan en oro, plata y bronce.
const PODIUM_CLASS = ["lb-row top1", "lb-row top2", "lb-row top3"];

export function Leaderboard({ rows }: { rows: ScoreRow[] }) {
  return (
    <div className="leaderboard">
      <h3>MEJORES PUNTUACIONES</h3>
      {rows.map((row, index) => (
        <div key={row.rank} className={PODIUM_CLASS[index] ?? "lb-row"}>
          <div className="rk">#{String(row.rank).padStart(2, "0")}</div>
          <div className="pl">
            {row.name}
            <div className="lb-date">{row.date}</div>
          </div>
          <div className="sc">{row.score.toLocaleString("es-ES")}</div>
        </div>
      ))}
    </div>
  );
}
