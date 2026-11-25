import { Link, useParams } from "react-router-dom";
import { CONCORD_ID, sideById } from "../data";
import { AfterNight } from "../components/AfterNight";
import { Mark } from "../components/Marks";
import { StylePanel } from "../components/StylePanel";
import { castFromSeries } from "../engine/after";
import { meetStyles } from "../engine/style";
import { seriesRecord } from "../engine/series";
import { seriesShape } from "../lib/stats";
import { styleForSide, styleKicker } from "../lib/styleFor";
import { findSeries } from "../engine/tournament";
import { usePantheon } from "../state/store";
import type { SeriesResult } from "../data/types";

export function SeriesPage() {
  const { id } = useParams();
  const { tournament } = usePantheon();
  const series = findSeries(tournament, id);
  if (!series) {
    return (
      <main className="page">
        <p className="kicker">Series</p>
        <h2 className="display" style={{ fontSize: 64 }}>This series has not been played.</h2>
        <p className="lede">Sim the round from the dock, or go back to the schedule.</p>
      </main>
    );
  }
  const { winnerWins, loserWins } = seriesRecord(series);
  const winner = sideById(series.winnerId);
  const loser = sideById(series.loserId);
  const home = sideById(series.homeId);
  const away = sideById(series.awayId);
  const concordIds = tournament.siege?.concordIds ?? [];
  const awayTitle = series.awayName ?? away?.name ?? series.awayId;
  const homeTitle = series.homeName ?? home?.name ?? series.homeId;
  const awayStyle = styleForSide(series.awayId, concordIds);
  const homeStyle = styleForSide(series.homeId, concordIds);
  let homeWins = 0;
  let awayWins = 0;
  const rows = series.games.map((game) => {
    if (game.winnerId === series.homeId) homeWins += 1;
    else awayWins += 1;
    return { game, homeWins, awayWins };
  });
  const holes = series.games.flatMap((game) => {
    if (!game.comeback || game.comeback.teamId !== game.winnerId) return [];
    const name = game.comeback.teamId === game.homeId ? game.homeName : game.awayName;
    return [{ name: name ?? sideById(game.comeback.teamId)?.name ?? "The winner", deficit: game.comeback.deficit }];
  });
  const holeFact = holes.length === 0
    ? "No twelve-point hole closed"
    : holes.length === 1
      ? `${holes[0].name} erased a ${holes[0].deficit}-point hole`
      : `${holes.length} nights erased a hole of 12 or more`;
  const slate = series.roundLabel && !series.dayLabel.toLowerCase().includes(series.roundLabel.toLowerCase())
    ? `${series.roundLabel} · ${series.dayLabel}`
    : series.dayLabel;
  return (
    <main className="page">
      <p className="kicker">{slate} · first to four · neutral floor</p>
      <div className="game-top">
        <Club id={series.awayId} name={awayTitle} styleName={awayStyle?.name} />
        <div style={{ textAlign: "center" }}>
          <div className="big mono">{series.awayWins}<span style={{ color: "var(--faint)" }}>–</span>{series.homeWins}</div>
          <div className="quarters"><span>{winner?.name ?? series.winnerId} take it {winnerWins}–{loserWins}</span></div>
        </div>
        <Club id={series.homeId} name={homeTitle} styleName={homeStyle?.name} right />
      </div>
      <div className="facts">
        <span>{seriesShape(series)}</span>
        <span>{loser?.name ?? series.loserId} took {loserWins}</span>
        <span>{holeFact}</span>
        <span>NBA rules. No home-court scoring bonus.</span>
      </div>
      {awayStyle && homeStyle ? (
        <section className="section">
          <div className="section-head">
            <h3>Styles</h3>
            <span className="quiet">Opening fives. The sim does not play a separate tactic.</span>
          </div>
          <div className="style-pair">
            <StylePanel style={awayStyle} kicker={styleKicker(series.awayId, awayTitle)} />
            <StylePanel style={homeStyle} kicker={styleKicker(series.homeId, homeTitle)} />
          </div>
          <p className="note">{meetStyles(awayTitle, awayStyle, homeTitle, homeStyle)}</p>
        </section>
      ) : null}
      <SeriesSheet series={series} />
      <p className="note">
        The better power seed is listed at home. Games 1, 2, 5, and 7 use that card. Games 3, 4, and 6 flip it. The floor stays neutral either way. The series ends when one side wins four.
      </p>
      <section className="section">
        <div className="section-head"><h3>The games</h3><span className="quiet">Open a night for the box and the possession log</span></div>
        <div className="team-grid">
          {rows.map(({ game, homeWins: hw, awayWins: aw }, index) => {
            const margin = Math.abs(game.homeScore - game.awayScore);
            return (
              <Link key={game.id} to={`/games/${game.id}`} className="panel">
                <span className="tag">Game {index + 1}{game.ot ? ` · ${game.ot === 1 ? "OT" : `${game.ot} OT`}` : ""}{game.buzzerBeater ? " · buzzer" : ""}</span>
                <h3>{game.awayName} {game.awayScore}</h3>
                <p>{game.homeName} {game.homeScore}</p>
                <p>Series {aw}–{hw} · margin {margin} · {game.venue}</p>
              </Link>
            );
          })}
        </div>
      </section>
      <AfterNight cast={castFromSeries(series)} heading="After the series" />
    </main>
  );
}

function SeriesSheet({ series }: { series: SeriesResult }) {
  const homeName = series.homeName ?? sideById(series.homeId)?.name ?? series.homeId;
  const awayName = series.awayName ?? sideById(series.awayId)?.name ?? series.awayId;
  let ot = 0;
  let close = 0;
  let buzzers = 0;
  let marginSum = 0;
  let biggest = 0;
  let biggestName = homeName;
  const glass = { home: 0, away: 0, homeOrb: 0, awayOrb: 0, homeDrb: 0, awayDrb: 0 };
  const points = { home: 0, away: 0 };
  for (const game of series.games) {
    if (game.ot) ot += 1;
    if (game.buzzerBeater) buzzers += 1;
    const margin = Math.abs(game.homeScore - game.awayScore);
    marginSum += margin;
    if (margin <= 5) close += 1;
    const homeIsSeriesHome = game.homeId === series.homeId;
    const seriesHomePts = homeIsSeriesHome ? game.homeScore : game.awayScore;
    const seriesAwayPts = homeIsSeriesHome ? game.awayScore : game.homeScore;
    points.home += seriesHomePts;
    points.away += seriesAwayPts;
    const homeLines = homeIsSeriesHome ? game.box.home : game.box.away;
    const awayLines = homeIsSeriesHome ? game.box.away : game.box.home;
    for (const line of homeLines) {
      glass.home += line.orb + line.drb;
      glass.homeOrb += line.orb;
      glass.homeDrb += line.drb;
    }
    for (const line of awayLines) {
      glass.away += line.orb + line.drb;
      glass.awayOrb += line.orb;
      glass.awayDrb += line.drb;
    }
    if (margin > biggest) {
      biggest = margin;
      biggestName = game.winnerId === series.homeId ? homeName : awayName;
    }
  }
  const games = series.games.length || 1;
  const glassLine = glass.home === glass.away
    ? "The glass was even across the series."
    : `${glass.home > glass.away ? homeName : awayName} took the glass, ${Math.max(glass.home, glass.away)}–${Math.min(glass.home, glass.away)}.`;
  return (
    <section className="section">
      <div className="section-head"><h3>Series sheet</h3><span className="quiet">Every night of this matchup, added up</span></div>
      <div className="stat-grid">
        <div className="panel"><span className="tag">Margin</span><h3>{(marginSum / games).toFixed(1)}</h3><p>Average. Largest was {biggest}, {biggestName}.</p></div>
        <div className="panel"><span className="tag">Close</span><h3>{close}</h3><p>{close === 1 ? "Game" : "Games"} decided by five or fewer.{ot ? ` ${ot} went to overtime.` : " No overtime."}</p></div>
        <div className="panel"><span className="tag">Points</span><h3>{points.away}–{points.home}</h3><p>{awayName} to {homeName}. {buzzers ? `${buzzers} buzzer${buzzers === 1 ? "" : "s"}.` : "No buzzer."}</p></div>
        <div className="panel"><span className="tag">Glass</span><h3>{glass.away}–{glass.home}</h3><p>{glassLine} Offensive {glass.awayOrb}–{glass.homeOrb}. Defensive {glass.awayDrb}–{glass.homeDrb}.</p></div>
      </div>
    </section>
  );
}

function Club({ id, name, right, styleName }: { id: string; name?: string; right?: boolean; styleName?: string }) {
  const side = sideById(id);
  const title = name ?? side?.name ?? id;
  const to = id === CONCORD_ID ? "/siege" : side ? `/teams/${side.id}` : undefined;
  return (
    <div className={`club${right ? " right" : ""}`}>
      {side ? <Mark team={side} size={48} /> : null}
      {to ? <Link to={to} className="display" style={{ fontSize: 36 }}>{title}</Link> : <span className="display" style={{ fontSize: 36 }}>{title}</span>}
      <span className="quiet">{side?.country ?? "Series"}{styleName ? ` · ${styleName}` : ""}</span>
    </div>
  );
}
