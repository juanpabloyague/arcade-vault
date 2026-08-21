"use client";

// Reproductor: HUD, pantalla CRT y la simulación de partida.
// No hay juego real — es la demo animada por CSS del prototipo.

import Link from "next/link";
import { useEffect, useState } from "react";
import { GameOverModal } from "@/components/player/GameOverModal";
import type { Game } from "@/lib/games";
import { saveScore } from "@/lib/scores";
import { useSession } from "@/lib/session";

const TICK_MS = 220;
const POINTS_PER_LEVEL = 2500;
const LIVES = 3;

export function PlayerScreen({ game }: { game: Game }) {
  const { user } = useSession();
  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const [over, setOver] = useState(false);
  // null = el jugador todavía no ha escrito un nombre propio, así que vale el
  // de la sesión. La sesión llega tras hidratar, por eso no sirve como valor
  // inicial de useState.
  const [typedName, setTypedName] = useState<string | null>(null);

  const playerName = typedName ?? user?.name ?? "INVITADO";
  const level = Math.floor(score / POINTS_PER_LEVEL) + 1;

  useEffect(() => {
    if (over || paused) return;
    const timer = setInterval(() => {
      setScore((current) => current + Math.floor(10 + Math.random() * 90));
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [over, paused]);

  const restart = () => {
    setScore(0);
    setPaused(false);
    setOver(false);
  };

  return (
    <div className="av-player fade-in">
      <div className="player-hud">
        <div className="hud-stats">
          <div className="hud-stat player">
            <div className="l">Jugador</div>
            <div className="v">{playerName}</div>
          </div>
          <div className="hud-stat">
            <div className="l">Puntuación</div>
            <div className="v">{score.toLocaleString("es-ES")}</div>
          </div>
          <div className="hud-stat lives">
            <div className="l">Vidas</div>
            <div className="v">{"♥ ".repeat(LIVES).trim()}</div>
          </div>
          <div className="hud-stat level">
            <div className="l">Nivel</div>
            <div className="v">{String(level).padStart(2, "0")}</div>
          </div>
        </div>
        <div className="hud-actions">
          <button type="button" className="btn yellow" onClick={() => setPaused((p) => !p)}>
            {paused ? "REANUDAR" : "PAUSA"}
          </button>
          <button type="button" className="btn magenta" onClick={() => setOver(true)}>
            FIN
          </button>
          <Link className="btn ghost" href={`/juego/${game.id}`}>
            SALIR
          </Link>
        </div>
      </div>

      <div className="crt">
        <div className="crt-screen">
          <div className="game-arena">
            <div className="grid-floor" />
            <div className="enemy e1" />
            <div className="enemy e2" />
            <div className="enemy e3" />
            <div className="player-ship" />
          </div>
          {paused && (
            <div className="crt-content paused">
              <div>
                <div className="pixel neon-yellow paused-title">EN PAUSA</div>
                <div className="mono paused-hint">PULSA REANUDAR PARA CONTINUAR</div>
              </div>
            </div>
          )}
        </div>
        <div className="crt-bottom">
          <span className="led">SEÑAL OK</span>
          <span>{game.title} · CRT-83 · 60 HZ</span>
          <span>CARGA · 1MB</span>
        </div>
      </div>

      {over && (
        <GameOverModal
          score={score}
          name={playerName}
          onNameChange={setTypedName}
          onSave={() => saveScore({ game: game.id, score, name: playerName })}
          onRestart={restart}
        />
      )}
    </div>
  );
}
