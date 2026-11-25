import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { isConstructed, PLAYERS, TEAM_BY_ID, TEAMS } from "../data";
import { archLabel, dutyLabel, formatHeight, roleRank } from "../data/ratings";
import { Mark } from "../components/Marks";
import { readPlayerStyle } from "../engine/style";
import type { Player, Pos, Role } from "../data/types";
import { kindLabel } from "../lib/format";
import { styleOfTeam } from "../lib/styleFor";

const KINDS = ["All", "Country", "Overflow", "Homeland", "Construct"];
const POSITIONS: Pos[] = ["PG", "SG", "SF", "PF", "C"];
const ROLES: { id: Role; label: string }[] = [
  { id: "star", label: "Stars" },
  { id: "starter", label: "Starters" },
  { id: "rotation", label: "Rotation" },
  { id: "deep", label: "Deep" },
  { id: "two-way", label: "Two-ways" },
];

export function Players() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const kindParam = params.get("kind") ?? "All";
  const kind = KINDS.includes(kindParam) ? kindParam : "All";
  const posParam = params.get("pos") ?? "";
  const pos = POSITIONS.includes(posParam as Pos) ? (posParam as Pos) : "All";
  const roleParam = params.get("role") ?? "";
  const role = ROLES.some((item) => item.id === roleParam) ? (roleParam as Role) : "All";

  const groups = useMemo(() => {
    const needle = fold(query.trim());
    const matched = PLAYERS.filter((player) => {
      const team = TEAM_BY_ID[player.teamId];
      if (kind !== "All" && kindLabel(team.kind) !== kind) return false;
      if (pos !== "All" && player.pos !== pos && player.pos2 !== pos) return false;
      if (role !== "All" && player.role !== role) return false;
      if (!needle) return true;
      return haystack(player).includes(needle);
    });
    return TEAMS.map((team) => ({
      team,
      players: matched
        .filter((player) => player.teamId === team.id)
        .slice()
        .sort((a, b) => Number(b.starts) - Number(a.starts) || roleRank(a.role) - roleRank(b.role) || b.ratings.ovr - a.ratings.ovr || a.name.localeCompare(b.name)),
    })).filter((group) => group.players.length > 0);
  }, [query, kind, pos, role]);

  const count = groups.reduce((sum, group) => sum + group.players.length, 0);
  const filtered = Boolean(query.trim()) || kind !== "All" || pos !== "All" || role !== "All";

  function update(patch: Record<string, string>) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (!value || value === "All") next.delete(key);
      else next.set(key, value);
    }
    setParams(next, { replace: true });
  }

  return (
    <main className="page">
      <p className="kicker">{PLAYERS.filter((player) => !isConstructed(player)).length} primes · 22 constructed units</p>
      <h2 className="display" style={{ fontSize: "clamp(42px, 8vw, 68px)" }}>The book</h2>
      <p className="lede">Every human name is the prime on the card. The Construct is the one built side, and those units are marked Built. Search a name, a side, a country, or a prime year, then open the card. A gold number is the overall.</p>
      <form className="filters" role="search" onSubmit={(event) => event.preventDefault()}>
        <input value={query} onChange={(event) => update({ q: event.target.value })} placeholder="Search the book" aria-label="Search players" />
        {KINDS.map((item) => (
          <button key={item} type="button" className={item === kind ? "on" : ""} aria-pressed={item === kind} onClick={() => update({ kind: item })}>{item}</button>
        ))}
      </form>
      <div className="filters">
        <button type="button" className={pos === "All" ? "on" : ""} aria-pressed={pos === "All"} onClick={() => update({ pos: "All" })}>All spots</button>
        {POSITIONS.map((item) => (
          <button key={item} type="button" className={item === pos ? "on" : ""} aria-pressed={item === pos} onClick={() => update({ pos: item })}>{item}</button>
        ))}
        <button type="button" className={role === "All" ? "on" : ""} aria-pressed={role === "All"} onClick={() => update({ role: "All" })}>All roles</button>
        {ROLES.map((item) => (
          <button key={item.id} type="button" className={item.id === role ? "on" : ""} aria-pressed={item.id === role} onClick={() => update({ role: item.id })}>{item.label}</button>
        ))}
        <select
          aria-label="Jump to a side"
          value=""
          onChange={(event) => {
            const target = event.target.value;
            if (!target) return;
            document.getElementById(`book-${target}`)?.scrollIntoView({ block: "start" });
          }}
        >
          <option value="">Jump to a side</option>
          {groups.map((group) => (
            <option key={group.team.id} value={group.team.id}>{group.team.name}</option>
          ))}
        </select>
        {filtered ? <button type="button" onClick={() => setParams(new URLSearchParams(), { replace: true })}>Clear</button> : null}
      </div>
      <p className="quiet">{count} {count === 1 ? "name" : "names"} · {groups.length} {groups.length === 1 ? "side" : "sides"}</p>
      {groups.map((group) => (
        <section key={group.team.id} className="book-block" id={`book-${group.team.id}`}>
          <h3>
            <Link to={`/teams/${group.team.id}`} className="book-side">
              <Mark team={group.team} size={28} />
              <span>{group.team.name}</span>
            </Link>
            <span className="quiet">{kindLabel(group.team.kind)} · {styleOfTeam(group.team).name} · {group.players.length}</span>
          </h3>
          <div className="book-list">
            {group.players.map((player) => {
              const built = group.team.kind === "construct";
              const look = readPlayerStyle(player);
              return (
                <Link key={player.id} to={`/players/${player.id}`} className="book-row">
                  <strong>{player.name}</strong>
                  <b className="mono">{player.ratings.ovr}</b>
                  <span className="meta">
                    {look.name} · {player.pos}{player.pos2 ? ` / ${player.pos2}` : ""} · {archLabel(player.arch)} · {formatHeight(player.height)} · {built ? "Built" : player.primeYear} · {dutyLabel(player.role, built)} · {player.starts ? "Opens" : "Bench"} · {player.nationality}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
      {count === 0 ? <p className="empty">No one in the book matches that search.</p> : null}
    </main>
  );
}

function haystack(player: Player): string {
  const team = TEAM_BY_ID[player.teamId];
  const built = team.kind === "construct";
  return fold([
    player.name,
    team.name,
    team.nickname,
    team.code,
    team.country,
    player.nationality,
    player.pos,
    player.pos2 ?? "",
    player.arch,
    archLabel(player.arch),
    readPlayerStyle(player).name,
    dutyLabel(player.role, built),
    player.role,
    String(player.primeYear),
    built ? "built construct" : "",
    player.starts ? "opens" : "bench",
  ].join(" "));
}

function fold(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
