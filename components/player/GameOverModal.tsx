"use client";

// Modal de fin de partida: puntuación final, guardado falso y acciones.

import Link from "next/link";
import { useState, type ChangeEvent } from "react";

type GameOverModalProps = {
  score: number;
  name: string;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onRestart: () => void;
};

export function GameOverModal({
  score,
  name,
  onNameChange,
  onSave,
  onRestart,
}: GameOverModalProps) {
  const [saved, setSaved] = useState(false);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    onNameChange(event.target.value.toUpperCase().slice(0, 10));
  };

  const handleSave = () => {
    onSave();
    setSaved(true);
  };

  return (
    <div className="modal-bd">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="game-over-title">
        <h2 id="game-over-title">FIN DEL JUEGO</h2>
        <div className="final-label">PUNTUACIÓN FINAL</div>
        <div className="final">{score.toLocaleString("es-ES")}</div>

        {saved ? (
          <div className="toast-saved">▸ PUNTUACIÓN GUARDADA_</div>
        ) : (
          <div className="input-row">
            <input
              value={name}
              onChange={handleNameChange}
              maxLength={10}
              placeholder="TUS INICIALES"
              aria-label="Tus iniciales"
            />
            <button type="button" className="btn yellow" onClick={handleSave}>
              GUARDAR PUNTUACIÓN
            </button>
          </div>
        )}

        <div className="actions">
          <button type="button" className="btn" onClick={onRestart}>
            JUGAR DE NUEVO
          </button>
          <Link className="btn magenta" href="/">
            VOLVER AL VAULT
          </Link>
        </div>
      </div>
    </div>
  );
}
