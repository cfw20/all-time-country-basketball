import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CONSTRUCT_ID, playerById, TEAM_BY_ID } from "../data";
import { formatSeed, parseSeed } from "../engine/rng";
import type { TrialSummary } from "../engine/tournament";
import { finishName, one } from "../lib/format";
import { usePantheon } from "../state/store";

export function Trials() {
  const { trials, busy, progress, runTrials, loadSeed } = usePantheon();
  const [text, setText] = useState("");
  const [focus, setFocus] = useState<string | "">("");
  const [champ, setChamp] = useState("All");
  const rows = useMemo(() => aggregate(trials), [trials]);
  const note = parseSeed(text);
  const focused = rows.find((row) => row.id === focus);
  const listed = champ === "All" ? trials : trials.filter((trial) => trial.championId === champ);
  const champions = [...new Set(trials.map((trial) => trial.championId))];

  return (
    <main className="page">
      <p className="kicker">{trials.length} finished championships</p>
      <h2 className="display" style={{ fontSize: 68 }}>Run the field again</h2>
      <p className="lede">
        Every trial is a full championship: the country draw, then the siege. Same human primes, the same built side, the same NBA rules, a new draw. Play-by-play is skipped so a hundred of them stay in the browser. Open any seed to watch that exact tournament. Title bars are the country championship. The floor is whether the Concord ended the threat. For a single night, a series, or a contest, the side floors are open.
      </p>
      <div className="filters">
        {[10, 25, 50, 100].map((count) => (
          <button key={count} type="button" disabled={busy} onClick={() => runTrials(count)}>
            Run {count}
          </button>
        ))}
        <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Open a seed" aria-label="Seed" />
        <button type="button" disabled={note === null || busy} onClick={() => note !== null && loadSeed(note)}>Load seed</button>
        <Link className="text-btn" to="/play">Side floors</Link>
        {busy ? <span className="quiet">{progress}</span> : null}
      </div>
      {trials.length === 0 ? <p className="empty">Finish the open draw, or run a batch. The lab only counts completed championships.</p> : null}
      {trials.length > 0 ? (
        <div className="stat-grid">
          <div className="panel"><span className="tag">Champions</span><h3>{champions.length}</h3><p>Different sides have won at least once.</p></div>
          <div className="panel"><span className="tag">Final margin</span><h3>{one(trials.reduce((sum, trial) => sum + trial.margin, 0), trials.length)}</h3><p>Average points the champion outscored the runner-up across the final series.</p></div>
          <div className="panel"><span className="tag">Close games</span><h3>{one(trials.reduce((sum, trial) => sum + trial.closeGames, 0), trials.length)}</h3><p>Official games decided by five or fewer, per draw.</p></div>
          <div className="panel"><span className="tag">Comebacks</span><h3>{one(trials.reduce((sum, trial) => sum + trial.comebacks, 0), trials.length)}</h3><p>Wins after trailing by 12 or more, per draw. Upsets by eight seeds: {one(trials.reduce((sum, trial) => sum + trial.upsets, 0), trials.length)}.</p></div>
        </div>
      ) : null}
      {trials.length > 0 ? (
        <div className="stat-grid" style={{ marginTop: 12 }}>
          <div className="panel"><span className="tag">Arrival</span><h3>{share(trials.filter((trial) => trial.arrivalWinnerId === CONSTRUCT_ID).length, trials.length)}</h3><p>Draws where the Construct beat the best group winner.</p></div>
          <div className="panel"><span className="tag">The gate</span><h3>{share(trials.filter((trial) => trial.gateWinnerId === CONSTRUCT_ID).length, trials.length)}</h3><p>Draws where one country champion fell. The rest held.</p></div>
          <div className="panel"><span className="tag">Restored</span><h3>{share(trials.filter((trial) => trial.threatEnded).length, trials.length)}</h3><p>Draws where the Concord beat the Construct and the country champion kept the floor.</p></div>
          <div className="panel"><span className="tag">Construct holds</span><h3>{share(trials.filter((trial) => !trial.threatEnded).length, trials.length)}</h3><p>Draws where the built side still has the floor after the restoration.</p></div>
        </div>
      ) : null}

      {rows.slice(0, 12).map((row, index) => (
        <button key={row.id} type="button" className="rank-row" onClick={() => setFocus(row.id)} style={{ width: "100%", background: "transparent", border: 0, color: "inherit", textAlign: "left" }}>
          <span className="mono">{index + 1}</span>
          <span>{TEAM_BY_ID[row.id]?.name}</span>
          <span className="track"><span style={{ width: `${(row.titles / Math.max(1, trials.length)) * 100}%` }} /></span>
          <span className="mono">{Math.round((100 * row.titles) / trials.length)}%</span>
        </button>
      ))}

      {focused ? (
        <section className="section">
          <div className="section-head">
            <h3>{TEAM_BY_ID[focused.id]?.name}</h3>
            <button type="button" className="text-btn" onClick={() => setFocus("")}>Clear</button>
          </div>
          <div className="stat-grid">
            <div className="panel"><span className="tag">Titles</span><h3>{focused.titles}</h3><p>{share(focused.titles, trials.length)} of these draws.</p></div>
            <div className="panel"><span className="tag">Finals</span><h3>{focused.finals}</h3><p>Final four {focused.top4}. Quarterfinals {focused.top8}.</p></div>
            <div className="panel"><span className="tag">Round of 16</span><h3>{focused.r16}</h3><p>Average finish {one(focused.finishSum, focused.n)}.</p></div>
            <div className="panel"><span className="tag">Record</span><h3>{focused.wins}-{focused.losses}</h3><p>MVP {focused.mvps} · DPOY {focused.dpoys}</p></div>
          </div>
          <div className="team-grid" style={{ marginTop: 12 }}>
            {trials.filter((trial) => trial.championId === focused.id || trial.runnerUpId === focused.id).slice(0, 8).map((trial) => (
              <button key={trial.seed} type="button" className="panel" onClick={() => loadSeed(trial.seed)} style={{ textAlign: "left" }}>
                <span className="tag">{formatSeed(trial.seed)} · {trial.championId === focused.id ? "Champion" : "Finalist"}</span>
                <h3>{TEAM_BY_ID[trial.championId]?.name}</h3>
                <p>Final {trial.finals}{trial.ot ? " · OT" : ""} · {playerById(trial.mvpId)?.name}</p>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {rows.length > 0 ? (
        <div className="lab-scroll" style={{ marginTop: 18 }}>
          <table>
            <thead>
              <tr>
                <th>Side</th>
                <th className="num">Seed</th>
                <th className="num">Titles</th>
                <th className="num">Finals</th>
                <th className="num">Final 4</th>
                <th className="num">Avg finish</th>
                <th className="num">Series</th>
                <th className="num">MVP</th>
                <th className="num">DPOY</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className={row.id === focus ? "me" : ""} onClick={() => setFocus(row.id)} style={{ cursor: "pointer" }}>
                  <td>{TEAM_BY_ID[row.id]?.name}</td>
                  <td className="num">{row.seed}</td>
                  <td className="num">{row.titles}</td>
                  <td className="num">{row.finals}</td>
                  <td className="num">{row.top4}</td>
                  <td className="num">{one(row.finishSum, row.n)}</td>
                  <td className="num">{row.wins + row.losses ? `${Math.round((100 * row.wins) / (row.wins + row.losses))}%` : "—"}</td>
                  <td className="num">{row.mvps}</td>
                  <td className="num">{row.dpoys}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {trials.length > 0 ? (
        <section className="section">
          <div className="section-head">
            <h3>Every draw</h3>
            <span className="quiet">{listed.length} shown · click a row to open the full log</span>
          </div>
          <div className="filters">
            <button type="button" className={champ === "All" ? "on" : ""} onClick={() => setChamp("All")}>All champions</button>
            {champions.map((id) => (
              <button key={id} type="button" className={champ === id ? "on" : ""} onClick={() => setChamp(id)}>{TEAM_BY_ID[id]?.code ?? id}</button>
            ))}
          </div>
          <div className="lab-scroll">
            <table>
              <thead>
                <tr>
                  <th>Seed</th><th>Champion</th><th>Final</th><th className="num">Margin</th><th>MVP</th><th>Floor</th><th>Finish of focus</th>
                </tr>
              </thead>
              <tbody>
                {listed.map((trial) => {
                  const place = focus ? trial.teams.find((team) => team.id === focus)?.finish : undefined;
                  return (
                    <tr key={trial.seed} onClick={() => loadSeed(trial.seed)} style={{ cursor: "pointer" }}>
                      <td className="mono">{formatSeed(trial.seed)}</td>
                      <td>{TEAM_BY_ID[trial.championId]?.name}</td>
                      <td>{trial.finals}{trial.ot ? " OT" : ""} vs {TEAM_BY_ID[trial.runnerUpId]?.code}</td>
                      <td className="num">{trial.margin}</td>
                      <td>{playerById(trial.mvpId)?.name}</td>
                      <td>{trial.threatEnded ? "Restored" : "Construct"}</td>
                      <td>{place ? finishName(place) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
      <p className="note">The book keeps the latest 400 championships in this browser. Power seeds do not change between draws. The results do. Thirty-two human sides play the country tournament in every one of them. The Construct is outside that draw, and the Concord is named fresh each time.</p>
    </main>
  );
}

function share(n: number, total: number): string {
  if (!total) return "0%";
  return `${Math.round((100 * n) / total)}%`;
}

interface Agg {
  id: string;
  seed: number;
  titles: number;
  finals: number;
  top4: number;
  top8: number;
  r16: number;
  finishSum: number;
  wins: number;
  losses: number;
  n: number;
  mvps: number;
  dpoys: number;
}

function aggregate(trials: TrialSummary[]): Agg[] {
  const map = new Map<string, Agg>();
  for (const trial of trials) {
    for (const team of trial.teams) {
      const row = map.get(team.id) ?? {
        id: team.id, seed: team.seed, titles: 0, finals: 0, top4: 0, top8: 0, r16: 0,
        finishSum: 0, wins: 0, losses: 0, n: 0, mvps: 0, dpoys: 0,
      };
      row.n += 1;
      row.finishSum += team.finish;
      row.wins += team.wins;
      row.losses += team.losses;
      if (team.finish === 1) row.titles += 1;
      if (team.finish <= 2) row.finals += 1;
      if (team.finish <= 4) row.top4 += 1;
      if (team.finish <= 8) row.top8 += 1;
      if (team.finish <= 16) row.r16 += 1;
      if (playerById(trial.mvpId)?.teamId === team.id) row.mvps += 1;
      if (playerById(trial.dpoyId)?.teamId === team.id) row.dpoys += 1;
      map.set(team.id, row);
    }
  }
  return [...map.values()].sort((a, b) => b.titles - a.titles || a.finishSum / a.n - b.finishSum / b.n);
}
