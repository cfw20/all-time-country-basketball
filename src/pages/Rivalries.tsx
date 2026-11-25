import { Link } from "react-router-dom";
import { TEAM_BY_ID } from "../data";
import { usePantheon } from "../state/store";

export function Rivalries() {
  const { tournament } = usePantheon();
  const official = tournament.games.filter((game) => !game.exhibition);
  const pairs = new Map<string, { a: string; b: string; games: typeof official }>();
  for (const game of official) {
    const [a, b] = [game.homeId, game.awayId].sort();
    const key = `${a}:${b}`;
    const row = pairs.get(key) ?? { a, b, games: [] };
    row.games.push(game);
    pairs.set(key, row);
  }
  const rematches = [...pairs.values()].filter((row) => row.games.length > 1);
  const close = official
    .filter((game) => Math.abs(game.homeScore - game.awayScore) <= 6)
    .sort((a, b) => Math.abs(a.homeScore - a.awayScore) - Math.abs(b.homeScore - b.awayScore));
  const buzzers = official.filter((game) => game.buzzerBeater);
  const blowouts = official
    .filter((game) => Math.abs(game.homeScore - game.awayScore) >= 24)
    .sort((a, b) => Math.abs(b.homeScore - b.awayScore) - Math.abs(a.homeScore - a.awayScore))
    .slice(0, 6);

  return (
    <main className="page">
      <p className="kicker">This draw only</p>
      <h2 className="display" style={{ fontSize: 72 }}>Nights that argued.</h2>
      <p className="lede">
        Rivalries here are whatever this seed actually played: rematches, one-possession games, buzzers, and the nights that got away. Another draw writes a different argument.
      </p>
      {official.length === 0 ? (
        <p className="empty">Sim a round and the nights will collect here.</p>
      ) : (
        <div className="rival-grid section">
          <article className="panel rival">
            <p className="tag">Rematches</p>
            <h3>{rematches.length ? `${rematches.length} pairs met again` : "No pair has met twice"}</h3>
            {rematches.length === 0 ? (
              <p>No two sides met more than once in this draw.</p>
            ) : (
              rematches.map((row) => (
                <p key={`${row.a}-${row.b}`}>
                  {TEAM_BY_ID[row.a]?.name} and {TEAM_BY_ID[row.b]?.name} · {row.games.length} games
                  {row.games.map((game) => (
                    <span key={game.id}>
                      {" "}· <Link to={`/games/${game.id}`}>{game.roundLabel}</Link>
                    </span>
                  ))}
                </p>
              ))
            )}
          </article>
          <article className="panel rival">
            <p className="tag">Within six</p>
            <h3>{close.length ? `${close.length} close nights` : "No game inside six"}</h3>
            {close.slice(0, 8).map((game) => (
              <p key={game.id}>
                <Link to={`/games/${game.id}`}>{game.awayName} {game.awayScore}–{game.homeScore} {game.homeName}</Link>
                <span> · {game.roundLabel}</span>
              </p>
            ))}
          </article>
          <article className="panel rival">
            <p className="tag">Buzzer</p>
            <h3>{buzzers.length ? "The ball left late" : "No buzzer yet"}</h3>
            {buzzers.length === 0 ? <p>When a shot wins it at the horn, it lands here.</p> : buzzers.map((game) => (
              <p key={game.id}><Link to={`/games/${game.id}`}>{game.roundLabel} · {game.awayName} at {game.homeName}</Link></p>
            ))}
          </article>
          <article className="panel rival">
            <p className="tag">Margin</p>
            <h3>Nights that opened up</h3>
            {blowouts.length === 0 ? <p>Nothing by 24 or more in this draw.</p> : blowouts.map((game) => (
              <p key={game.id}>
                <Link to={`/games/${game.id}`}>{Math.abs(game.homeScore - game.awayScore)} · {game.awayName} {game.awayScore}–{game.homeScore} {game.homeName}</Link>
              </p>
            ))}
          </article>
        </div>
      )}
    </main>
  );
}
