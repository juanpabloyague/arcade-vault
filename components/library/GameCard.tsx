"use client";

// Tarjeta de la biblioteca. Toda la tarjeta navega al detalle del juego.

import Link from "next/link";
import { useRef, type MouseEvent } from "react";
import type { Game, GameColor } from "@/lib/games";

// El tema solo define variantes de .btn para magenta y amarillo; cian y verde
// se quedan con el borde cian por defecto, igual que en el prototipo.
const PLAY_BUTTON_CLASS: Record<GameColor, string> = {
  cyan: "btn",
  green: "btn",
  magenta: "btn magenta",
  yellow: "btn yellow",
};

export function GameCard({ game }: { game: Game }) {
  const cardRef = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = (event: MouseEvent<HTMLAnchorElement>) => {
    const card = cardRef.current;
    if (!card) return;
    // El tema ya anula el transform de .card con reduced-motion, y un estilo
    // inline lo pisaría: aquí no inclinamos nada.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-6px) rotateX(${-py * 6}deg) rotateY(${px * 8}deg)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (card) card.style.transform = "";
  };

  return (
    <Link
      ref={cardRef}
      className="card"
      href={`/juego/${game.id}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="cover">
        <div className={`cover-bg ${game.cover}`} />
        <div className="label">{game.cat}</div>
      </div>
      <div className="meta">
        <div className="title">{game.title}</div>
        <div className="desc">{game.short}</div>
        <div className="row">
          <div className="score-badge">
            <span>MEJOR PUNTUACIÓN</span>
            <b>{game.best.toLocaleString("es-ES")}</b>
          </div>
          {/* Decorativo: la tarjeta entera ya es el enlace, y un <button>
              dentro de un <a> sería marcado inválido. */}
          <span className={PLAY_BUTTON_CLASS[game.color]}>JUGAR</span>
        </div>
      </div>
    </Link>
  );
}
