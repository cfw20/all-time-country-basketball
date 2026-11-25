import { Link, useParams } from "react-router-dom";
import { CONCORD_ID, sideById } from "../data";
import { AfterNight } from "../components/AfterNight";
import { Mark } from "../components/Marks";
import { castFromSeries } from "../engine/after";
import { seriesRecord } from "../engine/series";
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
  let homeWins = 0;
  let awayWins = 0;
  const rows = series.games.map((game) => {
    if (game.winnerId === series.homeId) homeWins += 1;
    else awayWins += 1;
    return { game, homeWins, awayWins };
  });
  return (
    <main className="page">
      <p className="kicker">{series.dayLabel} · first to four · neutral floor</p>
      <div className="game-top">
        <Club id={series.awayId} name={series.awayName ?? away?.name} />
        <div style={{ textAlign: "center" }}>
          <div className="big mono">{series.awayWins}<span style={{ color: "var(--faint)" }}>–</span>{series.homeWins}</div>
          <div className="quarters"><span>{winner?.name ?? series.winnerId} take it {winnerWins}–{loserWins}</span></div>
        </div>
        <Club id={series.homeId} name={series.homeName ?? home?.name} right />
      </div>
      <div className="facts">
        <span>{series.games.length === 4 ? "Sweep" : series.games.length === 7 ? "Went the distance" : `${series.games.length} games`}</span>
        <span>{loser?.name ?? series.loserId} took {loserWins}</span>
        <span>NBA rules. No home-court scoring bonus.</span>
      </div>
      <SeriesSheet series={series} />
      <p className="note">
        The better power seed is listed at home. Games 1, 2, 5, and 7 use that card. Games 3, 4, and 6 flip it. The floor stays neutral either way. The series ends when one side wins four.
      </p>
      <section className="section">
        <div className="section-head"><h3>The games</h3><span className="quiet">Open a night for the box and the possession log</span></div>
        <div className="team-grid">
          {rows.map(({ game, homeWins: hw, awayWins: aw }, index) => (
            <Link key={game.id} to={`/games/${game.id}`} className="panel">
              <span className="tag">Game {index + 1}{game.ot ? " · OT" : ""}{game.buzzerBeater ? " · buzzer" : ""}</span>
              <h3>{game.awayName} {game.awayScore}</h3>
              <p>{game.homeName} {game.homeScore}</p>
              <p>Series {aw}–{hw} · {game.venue}</p>
            </Link>
          ))}
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
  const glass = { home: 0, away: 0 };
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
    const homeReb = (homeIsSeriesHome ? game.box.home : game.box.away).reduce((sum, line) => sum + line.orb + line.drb, 0);
    const awayReb = (homeIsSeriesHome ? game.box.away : game.box.home).reduce((sum, line) => sum + line.orb + line.drb, 0);
    glass.home += homeReb;
    glass.away += awayReb;
    if (margin > biggest) {
      biggest = margin;
      biggestName = game.winnerId === series.homeId ? homeName : awayName;
    }
  }
  const games = series.games.length || 1;
  const glassLine = glass.home === glass.away
    ? "The glass was even across the series."
    : `${glass.home > glass.away ? homeName : awayName} took the glass, ${Math.max(glass.home, glass.away)}-${Math.min(glass.home, glass.away)}.`;
  return (
    <section className="section">
      <div className="section-head"><h3>Series sheet</h3><span className="quiet">Every night of this matchup, added up</span></div>
      <div className="stat-grid">
        <div className="panel"><span className="tag">Margin</span><h3>{(marginSum / games).toFixed(1)}</h3><p>Average. Largest was {biggest}, {biggestName}.</p></div>
        <div className="panel"><span className="tag">Close</span><h3>{close}</h3><p>{close === 1 ? "Game" : "Games"} decided by five or fewer.{ot ? ` ${ot} went to overtime.` : " No overtime."}</p></div>
        <div className="panel"><span className="tag">Points</span><h3>{points.away}–{points.home}</h3><p>{awayName} to {homeName}. {buzzers ? `${buzzers} buzzer${buzzers === 1 ? "" : "s"}.` : "No buzzer."}</p></div>
        <div className="panel"><span className="tag">Glass</span><h3>{glass.away}–{glass.home}</h3><p>{glassLine}</p></div>
      </div>
    </section>
  );
}

function Club({ id, name, right }: { id: string; name?: string; right?: boolean }) {
  const side = sideById(id);
  const title = name ?? side?.name ?? id;
  const to = id === CONCORD_ID ? "/siege" : side ? `/teams/${side.id}` : undefined;
  return (
    <div className={`club${right ? " right" : ""}`}>
      {side ? <Mark team={side} size={48} /> : null}
      {to ? <Link to={to} className="display" style={{ fontSize: 36 }}>{title}</Link> : <span className="display" style={{ fontSize: 36 }}>{title}</span>}
      <span className="quiet">{side?.country ?? "Series"}</span>
    </div>
  );
}
