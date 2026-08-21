// Placeholder home screen: a live check of the ported theme (fonts, palette,
// CRT background, component classes). Replaced when `biblioteca.jsx` is ported.
const GAMES = [
  { id: "bricks", cover: "cover-bricks", cat: "Arcade", title: "Rompe Muros", desc: "Rompe cada ladrillo antes de quedarte sin vidas.", score: "12 480" },
  { id: "tetro", cover: "cover-tetro", cat: "Puzzle", title: "Bloques Caídos", desc: "Encaja las piezas y limpia líneas completas.", score: "34 900" },
  { id: "snake", cover: "cover-snake", cat: "Clásico", title: "Serpiente", desc: "Crece con cada bocado y esquiva tu propia cola.", score: "8 120" },
  { id: "invaders", cover: "cover-invaders", cat: "Disparos", title: "Invasores", desc: "Defiende la base de oleadas que bajan sin parar.", score: "21 350" },
];

const SCORES = [
  { rank: 1, player: "PIXELINA", score: "34 900" },
  { rank: 2, player: "R3TROBOY", score: "31 210" },
  { rank: 3, player: "NEONKAT", score: "28 004" },
  { rank: 4, player: "MODO8BIT", score: "19 776" },
];

export default function Home() {
  return (
    <main className="av-main">
      <section className="av-hero">
        <h1>Arcade Vault</h1>
        <p className="sub">
          Inserta una moneda para empezar<span className="blink">_</span>
        </p>
      </section>

      <div className="av-filters">
        <div className="av-search">
          <span className="ico" aria-hidden="true">
            &gt;
          </span>
          <input type="search" placeholder="Buscar un juego" aria-label="Buscar un juego" />
        </div>
        <div className="av-chips">
          <button type="button" className="chip active">
            Todos
          </button>
          <button type="button" className="chip">
            Arcade
          </button>
          <button type="button" className="chip">
            Puzzle
          </button>
          <button type="button" className="chip">
            Clásico
          </button>
        </div>
      </div>

      <section className="av-grid">
        {GAMES.map((game) => (
          <article key={game.id} className="card">
            <div className="cover">
              <div className={`cover-bg ${game.cover}`} />
              <span className="label">{game.cat}</span>
            </div>
            <div className="meta">
              <h2 className="title">{game.title}</h2>
              <p className="desc">{game.desc}</p>
            </div>
            <div className="row">
              <span className="score-badge">
                Récord
                <b>{game.score}</b>
              </span>
              <button type="button" className="btn">
                Jugar
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="av-hall">
        <header className="hall-head">
          <h1>Salón de la Fama</h1>
          <p>Las mejores marcas de la semana</p>
        </header>
        <div className="leaderboard">
          <h3>Bloques Caídos</h3>
          {SCORES.map((row) => (
            <div key={row.rank} className={`lb-row top${row.rank}`}>
              <span className="rk">{row.rank}</span>
              <span className="pl">{row.player}</span>
              <span className="sc">{row.score}</span>
            </div>
          ))}
        </div>
        <div className="detail-actions">
          <button type="button" className="btn lg pulse">
            Jugar ahora
          </button>
          <button type="button" className="btn lg magenta">
            Ver ranking
          </button>
          <button type="button" className="btn lg ghost">
            Cerrar sesión
          </button>
        </div>
      </section>
    </main>
  );
}
