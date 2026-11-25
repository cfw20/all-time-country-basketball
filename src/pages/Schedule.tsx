import { Link } from "react-router-dom";
import { TEAM_BY_ID } from "../data";
import type { GameResult } from "../data/types";
import { usePantheon } from "../state/store";

export function Schedule() {
  const { tournament } = usePantheon();
  const days: { label: string; games: GameResult[] }[] = [];
  for (const game of tournament.games) {
    const found = days.find((day) => day.label === game.dayLabel);
    if (found) found.games.push(game);
    else days.push({ label: game.dayLabel, games: [game] });
  }
  if (tournament.allStar) days.push({ label: "The interval", games: [tournament.allStar] });

  return (
    <main className="page">
      <p className="kicker">Game center</p>
      <h2 className="display" style={{ fontSize: 68 }}>Every tip</h2>
      <p className="lede">Open a game for the quarter line, the full box, and the possession log. Exhibition nights stay off the standings.</p>
      {days.length === 0 ? <p className="empty">The schedule is empty until the first round is simulated.</p> : null}
      {days.map((day) => (
        <section key={day.label} className="section">
          <div className="section-head"><h3>{day.label}</h3></div>
          <div className="team-grid">
            {day.games.map((game) => {
              const away = label(game, game.awayId);
              const home = label(game, game.homeId);
              return (
                <Link key={game.id} to={`/games/${game.id}`} className="panel">
                  <span className="tag">{game.roundLabel}{game.exhibition ? " · exhibition" : ""}</span>
                  <h3 style={{ fontSize: 26 }}>{winnerName(game)} {Math.max(game.homeScore, game.awayScore)}</h3>
                  <p>{away} {game.awayScore} · {home} {game.homeScore}{game.ot ? ` · ${game.ot} OT` : ""}</p>
                  <p>{game.venue}</p>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}

function label(game: GameResult, id: string): string {
  if (id === game.homeId) return game.homeName ?? TEAM_BY_ID[id]?.code ?? id;
  if (id === game.awayId) return game.awayName ?? TEAM_BY_ID[id]?.code ?? id;
  return TEAM_BY_ID[id]?.code ?? id;
}

function winnerName(game: GameResult): string {
  if (game.winnerId === game.homeId) return game.homeName ?? TEAM_BY_ID[game.homeId]?.name ?? game.homeId;
  return game.awayName ?? TEAM_BY_ID[game.awayId]?.name ?? game.awayId;
}
