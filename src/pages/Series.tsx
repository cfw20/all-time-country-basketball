import { Link, useParams } from "react-router-dom";
import { CONCORD_ID, sideById } from "../data";
import { Mark } from "../components/Marks";
import { seriesRecord } from "../engine/series";
import { findSeries } from "../engine/tournament";
import { usePantheon } from "../state/store";

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
    </main>
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
