import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CONCORD_ID, CONSTRUCT_ID, playerById, sideById } from "../data";
import { Mark } from "../components/Marks";
import type { BoxLine, GameResult, Play } from "../data/types";
import { AfterNight } from "../components/AfterNight";
import { castFromGame } from "../engine/after";
import { periodName } from "../engine/names";
import { findGame } from "../engine/tournament";
import { meetStyles } from "../engine/style";
import { clockMin, estimatePossessions, outLabel, outWhy, pct, shotLine, signed, trueShooting } from "../lib/format";
import { styleForSide } from "../lib/styleFor";
import { usePantheon } from "../state/store";

export function GamePage() {
  const { id } = useParams();
  const { tournament } = usePantheon();
  const [fullLog, setFullLog] = useState(false);
  const game = findGame(tournament, id);
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
  const siegeNight = game.homeId === CONSTRUCT_ID || game.awayId === CONSTRUCT_ID;
  const concordIds = tournament.siege?.concordIds ?? [];
  const awayStyle = styleForSide(game.awayId, concordIds);
  const homeStyle = styleForSide(game.homeId, concordIds);
  const awayTitle = game.awayName ?? sideById(game.awayId)?.name ?? game.awayId;
  const homeTitle = game.homeName ?? sideById(game.homeId)?.name ?? game.homeId;
  const swings = game.plays.filter((play) => play.key && (play.kind === "make" || play.kind === "note" || play.text.includes("blocks") || play.text.includes("Overtime"))).slice(-10);
  const shown = fullLog ? game.plays : game.plays.filter((play) => play.key);
  return (
    <main className="page">
      <p className="kicker">{game.dayLabel} · {game.venue}{siegeNight && game.dayLabel !== "The siege" ? " · the siege" : game.exhibition && !siegeNight ? " · exhibition" : ""}</p>
      <div className="game-top">
        <Club id={game.awayId} name={game.awayName} styleName={awayStyle?.name} />
        <div style={{ textAlign: "center" }}>
          <div className="big mono">{game.awayScore}<span style={{ color: "var(--faint)" }}>–</span>{game.homeScore}</div>
          <div className="quarters"><span>{quarters}</span></div>
        </div>
        <Club id={game.homeId} name={game.homeName} styleName={homeStyle?.name} right />
      </div>
      <div className="facts">
        <span>Lead changes {game.leadChanges}</span>
        <span>Biggest lead {marginName(game)} {game.biggestLead.margin}</span>
        <span>Biggest run {runName(game)} {game.biggestRun.points}</span>
        {game.comeback ? <span>{sideName(game, game.comeback.teamId)} erased a {game.comeback.deficit}-point hole</span> : null}
        {game.buzzerBeater ? <span style={{ color: "var(--ember)" }}>Buzzer</span> : null}
        {game.ot ? <span>{game.ot === 1 ? "Overtime" : `${game.ot} overtimes`}</span> : null}
        <span>{siegeNight ? "NBA rules. Every human on the floor is a real prime. The Construct is the built side." : "Both sides play the prime on the card. NBA rules."}</span>
        {game.seriesId ? <Link to={`/series/${game.seriesId}`}>This series</Link> : null}
      </div>
      {awayStyle && homeStyle ? (
        <p className="note">{awayTitle}: {awayStyle.name}. {homeTitle}: {homeStyle.name}. {meetStyles(awayTitle, awayStyle, homeTitle, homeStyle)} Opening cards only. The night sheet below is the box that was played.</p>
      ) : null}
      <LineScore game={game} />
      <Periods game={game} />
      <NightSheet game={game} />
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
        <div className="section-head"><h3>Box score</h3><span className="quiet">Rebounds list offensive/defensive under the total</span></div>
        <Box title={sideName(game, game.awayId)} lines={game.box.away} />
        <Box title={sideName(game, game.homeId)} lines={game.box.home} />
      </section>
      <AfterNight cast={castFromGame(game)} />
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

function Club({ id, name, right, styleName }: { id: string; name?: string; right?: boolean; styleName?: string }) {
  const team = sideById(id);
  const title = name ?? team?.name ?? id;
  const to = id === CONCORD_ID ? "/siege" : team ? `/teams/${team.id}` : undefined;
  return (
    <div className={`club${right ? " right" : ""}`}>
      {team ? <Mark team={team} size={48} /> : null}
      {to ? <Link to={to} className="display" style={{ fontSize: 36 }}>{title}</Link> : <span className="display" style={{ fontSize: 36 }}>{title}</span>}
      <span className="quiet">{team?.country ?? "Exhibition"}{styleName ? ` · ${styleName}` : ""}</span>
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

function NightSheet({ game }: { game: GameResult }) {
  const away = sumBox(game.box.away);
  const home = sumBox(game.box.home);
  const awayName = sideName(game, game.awayId);
  const homeName = sideName(game, game.homeId);
  const top = (lines: BoxLine[]) => lines.slice().sort((a, b) => b.pts - a.pts || b.sec - a.sec)[0];
  const awayTop = top(game.box.away);
  const homeTop = top(game.box.home);
  const quarters = game.quarters.map((quarter, index) => {
    if (quarter.away === quarter.home) return `${periodName(index + 1)} split ${quarter.away}-${quarter.home}`;
    const winner = quarter.away > quarter.home ? awayName : homeName;
    const margin = Math.abs(quarter.away - quarter.home);
    return `${periodName(index + 1)} ${winner} by ${margin}`;
  });
  const rows: { label: string; away: string; home: string }[] = [
    { label: "FG", away: `${shotLine(away.fgm, away.fga)} ${pct(away.fgm, away.fga)}`, home: `${shotLine(home.fgm, home.fga)} ${pct(home.fgm, home.fga)}` },
    { label: "3P", away: `${shotLine(away.tpm, away.tpa)} ${pct(away.tpm, away.tpa)}`, home: `${shotLine(home.tpm, home.tpa)} ${pct(home.tpm, home.tpa)}` },
    { label: "3 rate", away: pct(away.tpa, away.fga), home: pct(home.tpa, home.fga) },
    { label: "FT", away: `${shotLine(away.ftm, away.fta)} ${pct(away.ftm, away.fta)}`, home: `${shotLine(home.ftm, home.fta)} ${pct(home.ftm, home.fta)}` },
    { label: "TS", away: trueShooting(away.pts, away.fga, away.fta), home: trueShooting(home.pts, home.fga, home.fta) },
    { label: "OReb", away: String(away.orb), home: String(home.orb) },
    { label: "DReb", away: String(away.drb), home: String(home.drb) },
    { label: "Reb", away: String(away.reb), home: String(home.reb) },
    { label: "Ast", away: String(away.ast), home: String(home.ast) },
    { label: "Tov", away: String(away.tov), home: String(home.tov) },
    { label: "Stl", away: String(away.stl), home: String(home.stl) },
    { label: "Blk", away: String(away.blk), home: String(home.blk) },
    { label: "Pf", away: String(away.pf), home: String(home.pf) },
    { label: "Tech", away: String(away.tech), home: String(home.tech) },
    { label: "Drawn", away: String(away.drawn), home: String(home.drawn) },
    { label: "Start", away: String(away.startPts), home: String(home.startPts) },
    { label: "Bench", away: String(away.benchPts), home: String(home.benchPts) },
  ];
  const marks = marksFromLog(game);
  const nameOf = (line: BoxLine | undefined) => (line ? playerById(line.playerId)?.name ?? line.playerId : "—");
  const glass = away.reb === home.reb
    ? "The glass was even."
    : `${away.reb > home.reb ? awayName : homeName} took the glass, ${Math.max(away.reb, home.reb)}–${Math.min(away.reb, home.reb)}.`;
  const trouble = troubleLine(game);
  return (
    <section className="section">
      <div className="section-head"><h3>Night sheet</h3><span className="quiet">The game in one card</span></div>
      <div className="panel" style={{ overflowX: "auto" }}>
        <table className="sheet">
          <thead>
            <tr><th>Line</th><th className="num">{awayName}</th><th className="num">{homeName}</th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}><td>{row.label}</td><td className="num">{row.away}</td><td className="num">{row.home}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="note">
        {quarters.join(" · ")}. {nameOf(awayTop)} {awayTop?.pts ?? 0} led {awayName}. {nameOf(homeTop)} {homeTop?.pts ?? 0} led {homeName}. {glass} Offensive rebounds {away.orb}–{home.orb}. Defensive rebounds {away.drb}–{home.drb}.
      </p>
      <p className="note">{howPlayed(game, away, home, awayName, homeName)}</p>
      <p className="note">
        Dunks, layups, hooks, and putbacks in the log: {marks.paint.away} points for {awayName}, {marks.paint.home} for {homeName}. Putback points, the second-chance scores the log names: {marks.putback.away}–{marks.putback.home}.
      </p>
      {trouble ? <p className="note">{trouble}</p> : null}
    </section>
  );
}

function Periods({ game }: { game: GameResult }) {
  const awayName = sideName(game, game.awayId);
  const homeName = sideName(game, game.homeId);
  let away = 0;
  let home = 0;
  const rows = game.quarters.map((quarter, index) => {
    away += quarter.away;
    home += quarter.home;
    const lead = away === home ? "tied" : away > home ? `${awayName} by ${away - home}` : `${homeName} by ${home - away}`;
    return {
      label: periodName(index + 1),
      scored: `${quarter.away}–${quarter.home}`,
      score: `${away}–${home}`,
      lead,
    };
  });
  return (
    <section className="section periods-block">
      <div className="section-head">
        <h3>Periods</h3>
        <span className="quiet">Away–home · who led when the period ended</span>
      </div>
      <div className="periods">
        {rows.map((row) => (
          <span key={row.label}>
            <b>{row.label} {row.scored}</b>
            <em>{row.score}</em>
            <em>{row.lead}</em>
          </span>
        ))}
      </div>
    </section>
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

interface BoxSum {
  pts: number;
  reb: number;
  orb: number;
  drb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  pf: number;
  tech: number;
  drawn: number;
  fgm: number;
  fga: number;
  tpm: number;
  tpa: number;
  ftm: number;
  fta: number;
  startPts: number;
  benchPts: number;
}

function sumBox(lines: BoxLine[]): BoxSum {
  return lines.reduce(
    (row, line) => {
      row.pts += line.pts;
      row.orb += line.orb;
      row.drb += line.drb;
      row.reb += line.orb + line.drb;
      row.ast += line.ast;
      row.stl += line.stl;
      row.blk += line.blk;
      row.tov += line.tov;
      row.pf += line.pf;
      row.tech += line.tech ?? 0;
      row.drawn += line.drawn ?? 0;
      row.fgm += line.fgm;
      row.fga += line.fga;
      row.tpm += line.tpm;
      row.tpa += line.tpa;
      row.ftm += line.ftm;
      row.fta += line.fta;
      if (line.started) row.startPts += line.pts;
      else row.benchPts += line.pts;
      return row;
    },
    {
      pts: 0, reb: 0, orb: 0, drb: 0, ast: 0, stl: 0, blk: 0, tov: 0, pf: 0, tech: 0, drawn: 0,
      fgm: 0, fga: 0, tpm: 0, tpa: 0, ftm: 0, fta: 0, startPts: 0, benchPts: 0,
    },
  );
}

function howPlayed(game: GameResult, away: BoxSum, home: BoxSum, awayName: string, homeName: string): string {
  const awayPoss = estimatePossessions(away.fga, away.tov, away.fta, away.orb);
  const homePoss = estimatePossessions(home.fga, home.tov, home.fta, home.orb);
  const minutes = 48 + game.ot * 5;
  const per48 = ((awayPoss + homePoss) / 2) * (48 / minutes);
  const num = (value: number) => value.toFixed(1);
  return `How the night was played. Starters scored ${away.startPts} for ${awayName} and ${home.startPts} for ${homeName}. The bench scored ${away.benchPts} for ${awayName} and ${home.benchPts} for ${homeName}. Estimated possessions from the box (FGA + TOV + 0.44×FTA − ORB) were ${num(awayPoss)} for ${awayName} and ${num(homePoss)} for ${homeName}, about ${num(per48)} per 48 minutes. Threes were ${pct(away.tpa, away.fga)} of ${awayName} field-goal attempts and ${pct(home.tpa, home.fga)} of ${homeName} field-goal attempts.`;
}

function marksFromLog(game: GameResult): { paint: { away: number; home: number }; putback: { away: number; home: number } } {
  const paint = { away: 0, home: 0 };
  const putback = { away: 0, home: 0 };
  for (const play of game.plays) {
    if (play.kind !== "make" || !play.teamId) continue;
    const side = play.teamId === game.awayId ? "away" : play.teamId === game.homeId ? "home" : null;
    if (!side) continue;
    if (play.text.includes("offensive rebound and putback")) {
      putback[side] += 2;
      paint[side] += 2;
      continue;
    }
    if (/\b(?:dunk|layup|hook)\./.test(play.text)) paint[side] += 2;
  }
  return { paint, putback };
}

function troubleLine(game: GameResult): string | null {
  const names: { ejected: string[]; sat: string[]; hurt: string[] } = { ejected: [], sat: [], hurt: [] };
  const take = (lines: BoxLine[], teamId: string) => {
    const team = sideName(game, teamId);
    for (const line of lines) {
      const name = `${playerById(line.playerId)?.name ?? line.playerId} (${team})`;
      if (line.suspended) names.sat.push(`${name}: ${outWhy(line)}`);
      else if (line.ejected || line.fouledOut) names.ejected.push(`${name}, ${outWhy(line)}`);
      if (line.injured) names.hurt.push(name);
    }
  };
  take(game.box.away, game.awayId);
  take(game.box.home, game.homeId);
  const parts: string[] = [];
  if (names.sat.length) parts.push(`Suspended: ${names.sat.join("; ")}.`);
  if (names.ejected.length) parts.push(`Ejected: ${names.ejected.join("; ")}.`);
  if (names.hurt.length) parts.push(`Left hurt: ${names.hurt.join(", ")}.`);
  return parts.length ? parts.join(" ") : null;
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
              {["Player", "Min", "Pts", "Reb", "Ast", "Stl", "Blk", "To", "Pf", "Tech", "Drawn", "Fg", "3p", "Ft", "+/−", "Out"].map((label) => (
                <th key={label} className={label === "Player" || label === "Out" ? "" : "num"}>{label}</th>
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
                    {outWhy(line) ? ` · ${outWhy(line)}` : ""}
                    {line.injured ? " · left hurt" : ""}
                  </td>
                  <td className="num">{clockMin(line.sec)}</td>
                  <td className="num">{line.pts}</td>
                  <td className="num">{line.orb + line.drb}<span className="split">{line.orb}/{line.drb}</span></td>
                  <td className="num">{line.ast}</td>
                  <td className="num">{line.stl}</td>
                  <td className="num">{line.blk}</td>
                  <td className="num">{line.tov}</td>
                  <td className="num">{line.pf}</td>
                  <td className="num">{line.tech ?? 0}</td>
                  <td className="num">{line.drawn ?? 0}</td>
                  <td className="num">{shotLine(line.fgm, line.fga)}</td>
                  <td className="num">{shotLine(line.tpm, line.tpa)}</td>
                  <td className="num">{shotLine(line.ftm, line.fta)}</td>
                  <td className="num">{signed(line.pm)}</td>
                  <td>{outLabel(line)}</td>
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
      {row.pts} pts · FG {shotLine(row.fgm, row.fga)} ({pct(row.fgm, row.fga)}) · 3P {shotLine(row.tpm, row.tpa)} ({pct(row.tpm, row.tpa)}) · threes {pct(row.tpa, row.fga)} of FGA · FT {shotLine(row.ftm, row.fta)} ({pct(row.ftm, row.fta)}) · TS {trueShooting(row.pts, row.fga, row.fta)} · {row.reb} reb ({row.orb} off, {row.drb} def) · starters {row.startPts} · bench {row.benchPts} · {row.ast} ast · {row.stl} stl · {row.blk} blk · {row.tov} tov · {row.pf} pf
    </p>
  );
}

function sideName(game: GameResult, id: string): string {
  if (id === game.homeId) return game.homeName ?? sideById(id)?.name ?? id;
  return game.awayName ?? sideById(id)?.name ?? id;
}

function marginName(game: GameResult): string {
  return sideName(game, game.biggestLead.teamId);
}

function runName(game: GameResult): string {
  return sideName(game, game.biggestRun.teamId);
}
