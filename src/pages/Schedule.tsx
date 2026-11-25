import { Link } from "react-router-dom";
import { sideById } from "../data";
import type { SeriesResult } from "../data/types";
import { seriesRecord } from "../engine/series";
import { usePantheon } from "../state/store";

export function Schedule() {
  const { tournament } = usePantheon();
  const days: { label: string; series: SeriesResult[] }[] = [];
  for (const item of tournament.series) {
    const found = days.find((day) => day.label === item.dayLabel);
    if (found) found.series.push(item);
    else days.push({ label: item.dayLabel, series: [item] });
  }
  const arrival = tournament.siege?.arrival;
  if (arrival) {
    const at = days.findIndex((day) => day.label === "Round of 16");
    const block = { label: "The arrival", series: [arrival] };
    if (at >= 0) days.splice(at, 0, block);
    else days.push(block);
  }
  const climax = [tournament.siege?.gate, tournament.siege?.restoration].filter((item): item is SeriesResult => Boolean(item));
  if (climax.length) days.push({ label: "The siege", series: climax });

  return (
    <main className="page">
      <p className="kicker">Series center</p>
      <h2 className="display" style={{ fontSize: 68 }}>Every series</h2>
      <p className="lede">
        Group matchups and the knockout are best-of-seven. A side needs four wins. Open a series for the games, then a game for the box and the possession log. The siege stays off the country standings.
      </p>
      {tournament.allStar ? (
        <p className="note">
          The interval is still one exhibition: <Link to={`/games/${tournament.allStar.id}`}>All-Star, {tournament.allStar.awayName} {tournament.allStar.awayScore}–{tournament.allStar.homeScore} {tournament.allStar.homeName}</Link>.
        </p>
      ) : null}
      {days.length === 0 ? <p className="empty">The schedule is empty until the first round is simulated.</p> : null}
      {days.map((day) => (
        <section key={day.label} className="section">
          <div className="section-head"><h3>{day.label}</h3></div>
          <div className="team-grid">
            {day.series.map((item) => {
              const { winnerWins, loserWins } = seriesRecord(item);
              const winner = nameOf(item, item.winnerId);
              const loser = nameOf(item, item.loserId);
              return (
                <Link key={item.id} to={`/series/${item.id}`} className="panel">
                  <span className="tag">{item.roundLabel}{item.exhibition ? " · the siege" : ""} · {item.games.length} games</span>
                  <h3 style={{ fontSize: 26 }}>{winner} {winnerWins}–{loserWins}</h3>
                  <p>{loser}</p>
                  <p>{item.games.length === 7 ? "Went the distance" : item.games.length === 4 ? "Sweep" : `Decided in ${item.games.length}`}</p>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}

function nameOf(series: SeriesResult, id: string): string {
  if (id === series.homeId) return series.homeName ?? sideById(id)?.name ?? id;
  if (id === series.awayId) return series.awayName ?? sideById(id)?.name ?? id;
  return sideById(id)?.name ?? id;
}
