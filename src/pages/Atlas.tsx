import { Link } from "react-router-dom";
import { PLAYERS, TEAM_BY_ID } from "../data";

const DECADES = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

export function Atlas() {
  const groups = DECADES.map((start) => ({
    start,
    players: PLAYERS.filter((player) => player.primeYear >= start && player.primeYear < start + 10)
      .slice()
      .sort((a, b) => b.ratings.ovr - a.ratings.ovr || a.name.localeCompare(b.name)),
  })).filter((group) => group.players.length > 0);

  return (
    <main className="page">
      <p className="kicker">Prime atlas · {PLAYERS.length} players</p>
      <h2 className="display" style={{ fontSize: 72 }}>Every body is a prime.</h2>
      <p className="lede">
        The book is arranged by the year on the card. A player from 1967 and a player from 2025 share the same floor, each at the peak already on record. There is no current-age version and no faded season.
      </p>
      <div className="atlas-grid section">
        {groups.map((group) => (
          <section key={group.start} className="panel decade">
            <p className="tag">{group.players.length} primes</p>
            <h3>{group.start}s</h3>
            <ol>
              {group.players.map((player) => (
                <li key={player.id}>
                  <Link to={`/players/${player.id}`}>{player.name}</Link>
                  <span> · {player.primeYear} · {TEAM_BY_ID[player.teamId]?.code}</span>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </main>
  );
}
