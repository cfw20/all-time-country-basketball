import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PLAYERS, TEAM_BY_ID } from "../data";
import { kindLabel } from "../lib/format";

export function Players() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("All");
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PLAYERS.filter((player) => {
      const team = TEAM_BY_ID[player.teamId];
      if (kind !== "All" && kindLabel(team.kind) !== kind) return false;
      if (!q) return true;
      return player.name.toLowerCase().includes(q) || team.name.toLowerCase().includes(q) || player.nationality.toLowerCase().includes(q);
    }).slice().sort((a, b) => b.ratings.ovr - a.ratings.ovr || a.name.localeCompare(b.name));
  }, [query, kind]);

  return (
    <main className="page">
      <p className="kicker">{PLAYERS.length} primes</p>
      <h2 className="display" style={{ fontSize: 68 }}>The book</h2>
      <p className="lede">Real players, rated at a prime already on record. Search a name, a side, or a nationality.</p>
      <div className="filters">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the book" aria-label="Search players" />
        {["All", "Country", "Overflow", "Homeland"].map((item) => (
          <button key={item} type="button" className={item === kind ? "on" : ""} onClick={() => setKind(item)}>{item}</button>
        ))}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Player</th><th>Side</th><th>Pos</th><th className="num">Prime</th><th>Path</th><th className="num">Ovr</th>
            </tr>
          </thead>
          <tbody>
            {list.map((player) => {
              const team = TEAM_BY_ID[player.teamId];
              return (
                <tr key={player.id}>
                  <td className="name-cell"><Link to={`/players/${player.id}`}>{player.name}</Link></td>
                  <td><Link to={`/teams/${team.id}`}>{team.name}</Link></td>
                  <td>{player.pos}</td>
                  <td className="num">{player.primeYear}</td>
                  <td>{team.kind === "country" ? "Country" : team.kind === "overflow" ? "Overflow" : "Homeland"}</td>
                  <td className="num">{player.ratings.ovr}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {list.length === 0 ? <p className="empty">No one in the book matches that search.</p> : null}
    </main>
  );
}
