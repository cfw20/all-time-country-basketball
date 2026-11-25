import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CONSTRUCT_ID, TEAMS } from "../data";
import { Mark } from "../components/Marks";
import type { SeriesResult, Siege } from "../data/types";
import type { TrialSummary } from "../engine/tournament";
import { teamPower } from "../engine/tournament";
import { finishName, kindLabel, signed } from "../lib/format";
import { teamLine } from "../lib/stats";
import { usePantheon } from "../state/store";

type SortKey = "power" | "draw" | "titles";

export function Rankings() {
  const { tournament, trials } = usePantheon();
  const played = tournament.series.some((series) => !series.exhibition);
  const [sort, setSort] = useState<SortKey>(played ? "draw" : "power");
  const titles = useMemo(() => titleBook(trials), [trials]);
  const siege = siegeSeries(tournament.siege);
  const rows = TEAMS.map((team) => {
    const built = team.kind === "construct";
    const official = tournament.series.filter((series) => !series.exhibition && inSeries(series, team.id));
    const nights = siege.filter((series) => inSeries(series, team.id));
    const book = built ? nights : official;
    const wins = book.filter((series) => series.winnerId === team.id).length;
    const games = teamLine(built ? siegeGamesOf(tournament.siege) : tournament.games, team.id, built);
    const trial = titles.get(team.id);
    return {
      team,
      built,
      power: teamPower(team.id),
      wins,
      losses: book.length - wins,
      games,
      diff: games.pf - games.pa,
      finish: tournament.finishes[team.id],
      siegeWins: nights.filter((series) => series.winnerId === team.id).length,
      siegePlayed: nights.length,
      titles: trial?.titles ?? 0,
      finals: trial?.finals ?? 0,
      top4: trial?.top4 ?? 0,
      trialN: trial?.n ?? 0,
    };
  });
  const ordered = rows.slice().sort((a, b) => {
    if (sort === "titles") {
      return b.titles - a.titles || b.finals - a.finals || b.top4 - a.top4 || b.power - a.power;
    }
    if (sort === "draw") {
      const aRate = a.wins + a.losses ? a.wins / (a.wins + a.losses) : -1;
      const bRate = b.wins + b.losses ? b.wins / (b.wins + b.losses) : -1;
      return bRate - aRate || b.diff - a.diff || b.power - a.power || a.team.name.localeCompare(b.team.name);
    }
    return b.power - a.power;
  });
  const podium = ordered.filter((row) => (sort === "titles" ? !row.built : true)).slice(0, 3);

  return (
    <main className="page">
      <p className="kicker">The board</p>
      <h2 className="display" style={{ fontSize: "clamp(48px, 8vw, 76px)" }}>Who is best</h2>
      <p className="lede">
        Power is the card before a ball is tipped. This draw is the series record and the point margin once the nights are played. Titles are country championships across the trials in this browser. The siege column is how a side sits against the Construct, off the country table. Set two sides, or two primes, beside each other when the argument needs both columns.
      </p>
      <div className="filters">
        <button type="button" className={sort === "power" ? "on" : ""} onClick={() => setSort("power")}>Power</button>
        <button type="button" className={sort === "draw" ? "on" : ""} onClick={() => setSort("draw")}>This draw</button>
        <button type="button" className={sort === "titles" ? "on" : ""} onClick={() => setSort("titles")} disabled={trials.length === 0}>Titles</button>
        <Link className="text-btn" to="/compare">Set two beside each other</Link>
        <Link className="text-btn" to="/leaders">Leaders</Link>
        <Link className="text-btn" to="/schedule">Series</Link>
        <Link className="text-btn" to="/trials">Trials</Link>
      </div>

      <div className="podium">
        {podium.map((row, index) => (
          <Link key={row.team.id} to={`/teams/${row.team.id}`} className="panel podium-card" style={{ borderTop: `3px solid ${row.team.colors.primary}` }}>
            <span className="tag">{index === 0 ? "First on this board" : index === 1 ? "Next" : "Still in the light"}</span>
            <div className="champion-mark" style={{ marginTop: 8 }}>
              <Mark team={row.team} size={42} />
              <h3>{row.team.name}</h3>
            </div>
            <p>{Math.round(row.power)} power · series {row.wins}-{row.losses} · {signed(row.diff)}</p>
            <p className="quiet">{row.trialN ? `${row.titles} titles · ${row.finals} finals · ${row.top4} final fours` : kindLabel(row.team.kind)}</p>
          </Link>
        ))}
      </div>

      <div className="lab-scroll" style={{ marginTop: 18 }}>
        <table>
          <thead>
            <tr>
              <th className="num">#</th>
              <th>Side</th>
              <th className="num">Power</th>
              <th className="num">Series</th>
              <th className="num">Games</th>
              <th className="num">Diff</th>
              <th>Finish</th>
              <th className="num">Siege</th>
              {trials.length > 0 ? <th className="num">Titles</th> : null}
              <th />
            </tr>
          </thead>
          <tbody>
            {ordered.map((row, index) => (
              <tr key={row.team.id} className={row.team.id === CONSTRUCT_ID ? "me" : ""}>
                <td className="num">{index + 1}</td>
                <td>
                  <Link to={`/teams/${row.team.id}`}>{row.team.name}</Link>
                  <div className="split">{kindLabel(row.team.kind)} · {row.team.code}</div>
                </td>
                <td className="num">{Math.round(row.power)}</td>
                <td className="num">{row.wins}-{row.losses}</td>
                <td className="num">{row.games.w + row.games.l ? `${row.games.w}-${row.games.l}` : "—"}</td>
                <td className="num">{row.games.w + row.games.l ? signed(row.diff) : "—"}</td>
                <td>{row.built ? "Outside the draw" : row.finish ? finishName(row.finish) : "—"}</td>
                <td className="num">{row.siegePlayed ? `${row.siegeWins}-${row.siegePlayed - row.siegeWins}` : "—"}</td>
                {trials.length > 0 ? <td className="num">{row.built ? "—" : `${row.titles}/${row.trialN || trials.length}`}</td> : null}
                <td><Link to={`/compare?side=${row.team.id}`}>Beside</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="note">
        Series on a human row are the country draw, first to four. The Construct’s series line is the siege: arrival, the gate, and the restoration. Honors stay on the country games. Open a side for the series list, then a prime, then the night.
        {" "}<Link to="/standings">Group tables</Link>
        {" · "}
        <Link to="/leaders">Per-game leaders</Link>
      </p>
    </main>
  );
}

function inSeries(series: SeriesResult, teamId: string): boolean {
  return series.homeId === teamId || series.awayId === teamId;
}

function siegeSeries(siege: Siege | null): SeriesResult[] {
  if (!siege) return [];
  return [siege.arrival, siege.gate, siege.restoration].filter((series): series is SeriesResult => Boolean(series));
}

function siegeGamesOf(siege: Siege | null) {
  return siegeSeries(siege).flatMap((series) => series.games);
}

function titleBook(trials: TrialSummary[]): Map<string, { titles: number; finals: number; top4: number; n: number }> {
  const map = new Map<string, { titles: number; finals: number; top4: number; n: number }>();
  for (const trial of trials) {
    for (const team of trial.teams) {
      const row = map.get(team.id) ?? { titles: 0, finals: 0, top4: 0, n: 0 };
      row.n += 1;
      if (team.finish === 1) row.titles += 1;
      if (team.finish <= 2) row.finals += 1;
      if (team.finish <= 4) row.top4 += 1;
      map.set(team.id, row);
    }
  }
  return map;
}
