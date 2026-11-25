import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { playerById, TEAM_BY_ID } from "../data";
import { Mark } from "../components/Marks";
import type { BoxLine, GameResult, Play } from "../data/types";
import { periodName } from "../engine/names";
import { clockMin, pct, shotLine, signed, trueShooting } from "../lib/format";
import { usePantheon } from "../state/store";

export function GamePage() {
  const { id } = useParams();
  const { tournament } = usePantheon();
  const [fullLog, setFullLog] = useState(false);
  const game = tournament.games.find((item) => item.id === id) ?? (tournament.allStar?.id === id ? tournament.allStar : undefined);
  if (!game) {
    return (
      <main className="page">
        <p className="kicker">Game</p>
        <h2 className="display" style={{ fontSize: 64 }}>This tip has not been played.</h2>
        <p className="lede">Sim the round from the dock, or go back to the schedule.</p>
      </main>
    );
  }
  const quarters = game.quarters.map((q, index) => `${periodName(index + 1)} ${q.away}-${q.home}`).join("  ·  ");
  const swings = game.plays.filter((play) => play.key && (play.kind === "make" || play.kind === "note" || play.text.includes("blocks") || play.text.includes("Overtime"))).slice(-10);
  const shown = fullLog ? game.plays : game.plays.filter((play) => play.key);
  return (
    <main className="page">
      <p className="kicker">{game.dayLabel} · {game.venue}{game.exhibition ? " · exhibition" : ""}</p>
      <div className="game-top">
        <Club id={game.awayId} name={game.awayName} />
        <div style={{ textAlign: "center" }}>
          <div className="big mono">{game.awayScore}<span style={{ color: "var(--faint)" }}>–</span>{game.homeScore}</div>
          <div className="quarters"><span>{quarters}</span></div>
        </div>
        <Club id={game.homeId} name={game.homeName} right />
      </div>
      <div className="facts">
        <span>Lead changes {game.leadChanges}</span>
        <span>Biggest lead {marginName(game)} {game.biggestLead.margin}</span>
        <span>Biggest run {runName(game)} {game.biggestRun.points}</span>
        {game.buzzerBeater ? <span style={{ color: "var(--ember)" }}>Buzzer</span> : null}
        {game.ot ? <span>{game.ot === 1 ? "Overtime" : `${game.ot} overtimes`}</span> : null}
        <span>Both sides play the prime on the card. NBA rules.</span>
      </div>
      <LineScore game={game} />
      {swings.length > 0 ? (
        <section className="section">
          <div className="section-head"><h3>Plays that swung it</h3><span className="quiet">Runs, lead changes, blocks, and late makes</span></div>
          <div className="log">
            {swings.map((play, index) => (
              <PlayRow key={`swing-${index}`} play={play} />
            ))}
          </div>
        </section>
      ) : null}
      <section className="section">
        <div className="section-head"><h3>Box score</h3></div>
        <Box title={sideName(game, game.awayId)} lines={game.box.away} />
        <Box title={sideName(game, game.homeId)} lines={game.box.home} />
      </section>
      <section className="section">
        <div className="section-head">
          <h3>{fullLog ? "Every possession" : "Key possessions"}</h3>
          <button type="button" className="text-btn" onClick={() => setFullLog((value) => !value)}>
            {fullLog ? "Show the swings" : `Show all ${game.plays.length} lines`}
          </button>
        </div>
        <p className="note">Score is away–home. Highlighted rows changed the game: a lead, a tie, a run, a block, a dunk, or the last two minutes.</p>
        <div className="log">
          {shown.map((play, index) => {
            const head = index === 0 || play.q !== shown[index - 1].q;
            return (
              <div key={`${play.q}-${play.clock}-${index}`}>
                {head ? <div className="qhead">{periodName(play.q)}</div> : null}
                <PlayRow play={play} />
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function Club({ id, name, right }: { id: string; name?: string; right?: boolean }) {
  const team = TEAM_BY_ID[id];
  const title = name ?? team?.name ?? id;
  return (
    <div className={`club${right ? " right" : ""}`}>
      {team ? <Mark team={team} size={48} /> : null}
      {team ? <Link to={`/teams/${team.id}`} className="display" style={{ fontSize: 36 }}>{title}</Link> : <span className="display" style={{ fontSize: 36 }}>{title}</span>}
      <span className="quiet">{team?.country ?? "Exhibition"}</span>
    </div>
  );
}

function PlayRow({ play }: { play: Play }) {
  return (
    <div className={`play${play.key ? " key" : ""}`}>
      <span className="clock">{play.clock}</span>
      <span>{play.text}</span>
      <span className="mono">{play.away}–{play.home}</span>
    </div>
  );
}

function LineScore({ game }: { game: GameResult }) {
  const labels = game.quarters.map((_, index) => periodName(index + 1));
  return (
    <div className="panel" style={{ marginTop: 8, overflowX: "auto" }}>
      <table>
        <thead>
          <tr>
            <th>Line</th>
            {labels.map((label) => <th key={label} className="num">{label}</th>)}
            <th className="num">Tot</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{sideName(game, game.awayId)}</td>
            {game.quarters.map((quarter, index) => <td key={index} className="num">{quarter.away}</td>)}
            <td className="num">{game.awayScore}</td>
          </tr>
          <tr>
            <td>{sideName(game, game.homeId)}</td>
            {game.quarters.map((quarter, index) => <td key={index} className="num">{quarter.home}</td>)}
            <td className="num">{game.homeScore}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function sumBox(lines: BoxLine[]) {
  return lines.reduce(
    (row, line) => {
      row.pts += line.pts;
      row.reb += line.orb + line.drb;
      row.ast += line.ast;
      row.stl += line.stl;
      row.blk += line.blk;
      row.tov += line.tov;
      row.pf += line.pf;
      row.fgm += line.fgm;
      row.fga += line.fga;
      row.tpm += line.tpm;
      row.tpa += line.tpa;
      row.ftm += line.ftm;
      row.fta += line.fta;
      return row;
    },
    { pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, tov: 0, pf: 0, fgm: 0, fga: 0, tpm: 0, tpa: 0, ftm: 0, fta: 0 },
  );
}

function Box({ title, lines }: { title: string; lines: BoxLine[] }) {
  const ordered = lines.slice().sort((a, b) => Number(b.started) - Number(a.started) || b.sec - a.sec);
  return (
    <div style={{ marginBottom: 18 }}>
      <h4 style={{ fontFamily: "var(--serif)", fontSize: 26, margin: "8px 0" }}>{title}</h4>
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              {["Player", "Min", "Pts", "Reb", "Ast", "Stl", "Blk", "To", "Pf", "Fg", "3p", "Ft", "+/−"].map((label) => (
                <th key={label} className={label === "Player" ? "" : "num"}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ordered.map((line) => {
              const player = playerById(line.playerId);
              return (
                <tr key={line.playerId}>
                  <td className="name-cell">
                    <Link to={`/players/${line.playerId}`}>{player?.name ?? line.playerId}</Link>
                    {line.started ? " · start" : ""}
                    {line.fouledOut ? " · fouled out" : ""}
                    {line.injured ? " · left hurt" : ""}
                  </td>
                  <td className="num">{clockMin(line.sec)}</td>
                  <td className="num">{line.pts}</td>
                  <td className="num">{line.orb + line.drb}</td>
                  <td className="num">{line.ast}</td>
                  <td className="num">{line.stl}</td>
                  <td className="num">{line.blk}</td>
                  <td className="num">{line.tov}</td>
                  <td className="num">{line.pf}</td>
                  <td className="num">{shotLine(line.fgm, line.fga)}</td>
                  <td className="num">{shotLine(line.tpm, line.tpa)}</td>
                  <td className="num">{shotLine(line.ftm, line.fta)}</td>
                  <td className="num">{signed(line.pm)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <TeamLine lines={lines} />
    </div>
  );
}

function TeamLine({ lines }: { lines: BoxLine[] }) {
  const row = sumBox(lines);
  return (
    <p className="note">
      {row.pts} pts · FG {shotLine(row.fgm, row.fga)} ({pct(row.fgm, row.fga)}) · 3P {shotLine(row.tpm, row.tpa)} ({pct(row.tpm, row.tpa)}) · FT {shotLine(row.ftm, row.fta)} ({pct(row.ftm, row.fta)}) · TS {trueShooting(row.pts, row.fga, row.fta)} · {row.reb} reb · {row.ast} ast · {row.stl} stl · {row.blk} blk · {row.tov} tov · {row.pf} pf
    </p>
  );
}

function sideName(game: GameResult, id: string): string {
  if (id === game.homeId) return game.homeName ?? TEAM_BY_ID[id]?.name ?? id;
  return game.awayName ?? TEAM_BY_ID[id]?.name ?? id;
}

function marginName(game: GameResult): string {
  return sideName(game, game.biggestLead.teamId);
}

function runName(game: GameResult): string {
  return sideName(game, game.biggestRun.teamId);
}
