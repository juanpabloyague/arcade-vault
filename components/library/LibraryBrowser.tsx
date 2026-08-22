"use client";

// Biblioteca: hero, buscador, chips de categoría y grid filtrado.

import { useMemo, useState } from "react";
import { GameCard } from "@/components/library/GameCard";
import type { Category, Game } from "@/lib/games";

type LibraryBrowserProps = {
  games: Game[];
  cats: Category[];
};

export function LibraryBrowser({ games, cats }: LibraryBrowserProps) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Category>("TODOS");

  const filtered = useMemo(
    () =>
      games.filter(
        (game) =>
          (cat === "TODOS" || game.cat === cat) &&
          game.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [games, query, cat],
  );

  return (
    <div className="fade-in">
      <section className="av-hero">
        <h1 className="flicker">ARCADE VAULT</h1>
        <div className="sub">
          INSERTA UNA MONEDA PARA JUGAR <span className="blink">_</span>
        </div>
      </section>

      <div className="av-filters">
        <div className="av-search">
          <span className="ico" aria-hidden="true">
            ⌕
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar un juego por nombre…"
            aria-label="Buscar un juego por nombre"
          />
        </div>
        <div className="av-chips">
          {cats.map((option) => (
            <button
              key={option}
              type="button"
              className={option === cat ? "chip active" : "chip"}
              onClick={() => setCat(option)}
              aria-pressed={option === cat}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="av-grid">
        {filtered.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
        {filtered.length === 0 && (
          <div className="av-empty">
            <div className="pixel empty-title">NO HAY RESULTADOS</div>
            <div>Intenta otra búsqueda o categoría.</div>
          </div>
        )}
      </div>
    </div>
  );
}
