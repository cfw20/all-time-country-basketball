import { Link } from "react-router-dom";
import { usePantheon } from "../state/store";

export function Wire() {
  const { tournament } = usePantheon();
  return (
    <main className="page">
      <p className="kicker">Written from the box</p>
      <h2 className="display" style={{ fontSize: 68 }}>The wire</h2>
      <p className="lede">Blowouts, buzzers, upsets, injury scares, and short-deal nights. If it is here, it happened in this draw.</p>
      {tournament.news.length === 0 ? <p className="empty">The wire is quiet until a game is played.</p> : null}
      <div className="news-grid" style={{ marginTop: 18 }}>
        {tournament.news.map((item) => (
          <article key={item.id} className="panel">
            <span className="tag">{item.kicker}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
            {item.gameId ? <p style={{ marginTop: 8 }}><Link to={`/games/${item.gameId}`}>Open the game</Link></p> : null}
          </article>
        ))}
      </div>
    </main>
  );
}
