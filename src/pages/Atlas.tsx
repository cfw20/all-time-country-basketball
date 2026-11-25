import { Link } from "react-router-dom";
import { isConstructed, PLAYERS, TEAM_BY_ID } from "../data";

const DECADES = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

export function Atlas() {
  const humans = PLAYERS.filter((player) => !isConstructed(player));
  const groups = DECADES.map((start) => ({
    start,
    players: humans.filter((player) => player.primeYear >= start && player.primeYear < start + 10)
      .slice()
      .sort((a, b) => b.ratings.ovr - a.ratings.ovr || a.name.localeCompare(b.name)),
  })).filter((group) => group.players.length > 0);

  return (
    <main className="page">
      <p className="kicker">Prime atlas · {humans.length} human primes</p>
      <h2 className="display" style={{ fontSize: "clamp(48px, 8vw, 76px)" }}>Every body is a prime.</h2>
      <p className="lede">
        The human book is arranged by the year on the card. A player from 1967 and a player from 2025 share the same floor, each at the peak already on record. The highest card in a decade is the plate on that room. Every other prime is still listed. The Construct is a built side and stays off this atlas.
      </p>
      <div className="atlas-grid section">
        {groups.map((group) => {
          const featured = group.players[0];
          const rest = group.players.slice(1);
          const side = featured ? TEAM_BY_ID[featured.teamId] : undefined;
          return (
            <section key={group.start} className="panel decade">
              <p className="tag">{group.players.length} primes</p>
              <h3>{group.start}s</h3>
              {featured ? (
                <Link to={`/players/${featured.id}`} className="decade-feature">
                  <span className="tag">Highest card</span>
                  <strong>{featured.name}</strong>
                  <b>{featured.ratings.ovr}</b>
                  <span>{featured.primeYear} · {featured.pos} · {side?.code}</span>
                </Link>
              ) : null}
              <ol>
                {rest.map((player) => (
                  <li key={player.id}>
                    <Link to={`/players/${player.id}`}>{player.name}</Link>
                    <span> · {player.primeYear} · {player.ratings.ovr} · {TEAM_BY_ID[player.teamId]?.code}</span>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>
      <p className="note">The twenty-two Construct units are on their own side. They have no prime year. <Link to="/teams/cstr">Open The Construct</Link>.</p>
    </main>
  );
}
