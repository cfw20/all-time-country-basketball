import { Link } from "react-router-dom";
import { TEAM_BY_ID } from "../data";
import { usePantheon } from "../state/store";

export function Rivalries() {
  const { tournament } = usePantheon();
  const official = tournament.series.filter((item) => !item.exhibition);
  const games = tournament.games.filter((game) => !game.exhibition);
  const sevens = official.filter((item) => item.games.length === 7);
  const decided = official.filter((item) => Math.min(item.homeWins, item.awayWins) === 3);
  const sweeps = official.filter((item) => item.games.length === 4).slice(0, 8);
  const close = games
    .filter((game) => Math.abs(game.homeScore - game.awayScore) <= 5)
    .sort((a, b) => Math.abs(a.homeScore - a.awayScore) - Math.abs(b.homeScore - b.awayScore))
    .slice(0, 8);
  const buzzers = games.filter((game) => game.buzzerBeater).slice(0, 8);

  return (
    <main className="page">
      <p className="kicker">This draw only</p>
      <h2 className="display" style={{ fontSize: 72 }}>How this draw was played.</h2>
      <p className="lede">
        Series that went seven, series won 4–3, sweeps, games inside five, and buzzers. Every number is from this seed. Another draw writes a different book.
      </p>
      {official.length === 0 ? (
        <p className="empty">Sim a round and the series will collect here.</p>
      ) : (
        <div className="rival-grid section">
          <article className="panel rival">
            <p className="tag">Seven</p>
            <h3>{sevens.length ? `${sevens.length} series went the distance` : "No series needed seven"}</h3>
            {sevens.map((item) => (
              <p key={item.id}>
                <Link to={`/series/${item.id}`}>{label(item.winnerId)} 4–3 {label(item.loserId)}</Link>
                <span> · {item.roundLabel}</span>
              </p>
            ))}
          </article>
          <article className="panel rival">
            <p className="tag">Four–three</p>
            <h3>{decided.length ? `${decided.length} series decided by one` : "No 4–3 series yet"}</h3>
            {decided.slice(0, 8).map((item) => (
              <p key={item.id}>
                <Link to={`/series/${item.id}`}>{label(item.winnerId)} over {label(item.loserId)}</Link>
                <span> · {item.roundLabel}</span>
              </p>
            ))}
          </article>
          <article className="panel rival">
            <p className="tag">Sweeps</p>
            <h3>{sweeps.length ? "Taken in four" : "No sweep yet"}</h3>
            {sweeps.map((item) => (
              <p key={item.id}>
                <Link to={`/series/${item.id}`}>{label(item.winnerId)} swept {label(item.loserId)}</Link>
              </p>
            ))}
          </article>
          <article className="panel rival">
            <p className="tag">Inside five</p>
            <h3>{close.length ? "Tight games" : "No game inside five"}</h3>
            {close.map((game) => (
              <p key={game.id}>
                <Link to={`/games/${game.id}`}>{game.awayName} {game.awayScore}–{game.homeScore} {game.homeName}</Link>
                <span> · game {gameNumber(game.id)}</span>
              </p>
            ))}
          </article>
          <article className="panel rival">
            <p className="tag">Buzzer</p>
            <h3>{buzzers.length ? "Won at the horn" : "No buzzer yet"}</h3>
            {buzzers.map((game) => (
              <p key={game.id}><Link to={`/games/${game.id}`}>{game.roundLabel} · game {gameNumber(game.id)} · {game.awayName} at {game.homeName}</Link></p>
            ))}
          </article>
        </div>
      )}
    </main>
  );
}

function label(id: string): string {
  return TEAM_BY_ID[id]?.name ?? id;
}

function gameNumber(id: string): string {
  const n = id.split("-").at(-1);
  return n ?? id;
}
