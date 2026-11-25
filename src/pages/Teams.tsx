import { Link } from "react-router-dom";
import { useState } from "react";
import { TEAMS } from "../data";
import { Mark } from "../components/Marks";
import { kindLabel } from "../lib/format";

const FILTERS = ["All", "Country", "Overflow", "Homeland"] as const;

export function Teams() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const list = TEAMS.filter((team) => filter === "All" || kindLabel(team.kind) === filter);
  return (
    <main className="page">
      <p className="kicker">32 sides</p>
      <h2 className="display" style={{ fontSize: 68 }}>The field</h2>
      <p className="lede">Invented club names, real countries, real primes. Overflow and the Lantern are the only mixed houses, and only for players who could not make a national roster.</p>
      <div className="filters">
        {FILTERS.map((item) => (
          <button key={item} type="button" className={item === filter ? "on" : ""} onClick={() => setFilter(item)}>{item}</button>
        ))}
      </div>
      <div className="team-grid">
        {list.map((team) => (
          <Link key={team.id} to={`/teams/${team.id}`} className="panel" style={{ borderTop: `3px solid ${team.colors.primary}` }}>
            <Mark team={team} size={42} />
            <span className="tag">{kindLabel(team.kind)} · {team.country}</span>
            <h3>{team.name}</h3>
            <p>{team.motto}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
