import { useState } from "react";
import { playerById, TEAM_BY_ID } from "../data";
import { formatSeed, parseSeed } from "../engine/rng";
import type { TrialSummary } from "../engine/tournament";
import { one } from "../lib/format";
import { usePantheon } from "../state/store";

export function Trials() {
  const { trials, busy, progress, runTrials, loadSeed } = usePantheon();
  const [text, setText] = useState("");
  const rows = aggregate(trials);
  const note = parseSeed(text);
  return (
    <main className="page">
      <p className="kicker">{trials.length} finished draws</p>
      <h2 className="display" style={{ fontSize: 68 }}>Who keeps winning</h2>
      <p className="lede">
        Each trial is a full championship with a new seed: groups, knockout, honors. Play-by-play is skipped so a batch stays quick. Open a seed to watch that exact draw, logs included. Power seed does not change. Finish does.
      </p>
      <div className="filters">
        <button type="button" className="on" disabled={busy} onClick={() => runTrials(10)}>Run 10</button>
        <button type="button" disabled={busy} onClick={() => runTrials(20)}>Run 20</button>
        <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Open a seed" aria-label="Seed" />
        <button type="button" disabled={note === null} onClick={() => note !== null && loadSeed(note)}>Load seed</button>
        {busy ? <span className="quiet">{progress}</span> : null}
      </div>
      {rows.length === 0 ? <p className="empty">Finish a draw, or run a batch. The comparison table fills from completed championships only.</p> : null}
      {rows.slice(0, 12).map((row, index) => (
        <div key={row.id} className="rank-row">
          <span className="mono">{index + 1}</span>
          <span>{TEAM_BY_ID[row.id]?.name}</span>
          <span className="track"><span style={{ width: `${row.titles / Math.max(1, trials.length) * 100}%` }} /></span>
          <span className="mono">{Math.round((100 * row.titles) / trials.length)}%</span>
        </div>
      ))}
      {rows.length > 0 ? (
        <div style={{ overflowX: "auto", marginTop: 18 }}>
          <table>
            <thead>
              <tr>
                <th>Side</th>
                <th className="num">Seed</th>
                <th className="num">Titles</th>
                <th className="num">Finals</th>
                <th className="num">Avg finish</th>
                <th className="num">Win%</th>
                <th className="num">MVP</th>
                <th className="num">DPOY</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{TEAM_BY_ID[row.id]?.name}</td>
                  <td className="num">{row.seed}</td>
                  <td className="num">{row.titles}</td>
                  <td className="num">{row.finals}</td>
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
          <div className="section-head"><h3>Draws</h3></div>
          <div className="team-grid">
            {trials.slice(0, 12).map((trial) => (
              <button key={trial.seed} type="button" className="panel" onClick={() => loadSeed(trial.seed)} style={{ textAlign: "left" }}>
                <span className="tag">{formatSeed(trial.seed)}</span>
                <h3>{TEAM_BY_ID[trial.championId]?.name}</h3>
                <p>Final {trial.finals} · {TEAM_BY_ID[trial.runnerUpId]?.code}</p>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

interface Agg {
  id: string;
  seed: number;
  titles: number;
  finals: number;
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
      const row = map.get(team.id) ?? { id: team.id, seed: team.seed, titles: 0, finals: 0, finishSum: 0, wins: 0, losses: 0, n: 0, mvps: 0, dpoys: 0 };
      row.n += 1;
      row.finishSum += team.finish;
      row.wins += team.wins;
      row.losses += team.losses;
      if (team.finish === 1) row.titles += 1;
      if (team.finish <= 2) row.finals += 1;
      if (playerById(trial.mvpId)?.teamId === team.id) row.mvps += 1;
      if (playerById(trial.dpoyId)?.teamId === team.id) row.dpoys += 1;
      map.set(team.id, row);
    }
  }
  return [...map.values()].sort((a, b) => b.titles - a.titles || a.finishSum / a.n - b.finishSum / b.n);
}

