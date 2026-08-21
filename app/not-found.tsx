import Link from "next/link";

// 404: la máquina no encuentra el cartucho. El prototipo renderizaba null,
// que en una aplicación real es una pantalla en blanco sin explicación.

export default function NotFound() {
  return (
    <div className="fade-in av-notfound">
      <div className="crt">
        <div className="crt-screen">
          <div className="crt-content">
            <div className="notfound-log">
              <div>&gt; BUSCANDO CARTUCHO…</div>
              <div className="neon-magenta">&gt; ERROR 404</div>
              <div className="dim">
                &gt; RANURA VACÍA <span className="blink">_</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="notfound-copy">
        <div className="pixel notfound-title">ESTE JUEGO NO ESTÁ EN EL VAULT</div>
        <p>Comprueba la dirección o vuelve a la biblioteca para elegir otro.</p>
      </div>

      <Link className="btn" href="/">
        VOLVER AL VAULT
      </Link>
    </div>
  );
}
