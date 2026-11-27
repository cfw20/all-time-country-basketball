import { Link } from "react-router-dom";
import { useState } from "react";
import { rosterOf, TEAMS } from "../data";
import { Mark } from "../components/Marks";
import { teamPower } from "../engine/tournament";
import { kindLabel, placeLine } from "../lib/format";
import { styleOfTeam } from "../lib/styleFor";

const FILTERS = ["All", "Country", "Overflow", "Homeland", "Construct"] as const;

export function Teams() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const list = TEAMS.filter((team) => filter === "All" || kindLabel(team.kind) === filter);
  return (
    <main className="page">
      <p className="kicker">{TEAMS.filter((team) => team.kind !== "construct").length} human sides · 1 constructed</p>
      <h2 className="display" style={{ fontSize: 68 }}>The field</h2>
      <p className="lede">Invented club names, real countries, real primes. Overflow houses are Americans the houses above them could not minute. Homeland houses are primes whose country cannot fill a competitive book. The Construct is the built side, outside the groups.</p>
      <div className="filters">
        {FILTERS.map((item) => (
          <button key={item} type="button" className={item === filter ? "on" : ""} onClick={() => setFilter(item)}>{item}</button>
        ))}
      </div>
      <div className="team-grid">
        {list.map((team) => (
          <Link key={team.id} to={`/teams/${team.id}`} className="panel" style={{ borderTop: `3px solid ${team.colors.primary}` }}>
            <Mark team={team} size={42} />
            <span className="tag">{kindLabel(team.kind)} · {team.country}{placeLine(team) ? ` · ${placeLine(team)}` : ""}</span>
            <h3>{team.name}</h3>
            <p className="style-name">{styleOfTeam(team).name}</p>
            <p>{team.motto}</p>
            <p className="openers">{rosterOf(team.id).filter((player) => player.starts).map((player) => player.name.split(" ").at(-1)).join(" · ")}</p>
            <p className="quiet">Pace {team.pace.toFixed(2)} · power {Math.round(teamPower(team.id))}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
