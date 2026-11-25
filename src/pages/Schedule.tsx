import { Link } from "react-router-dom";
import { sideById } from "../data";
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
  const arrival = tournament.siege?.arrival;
  if (arrival) {
    const at = days.findIndex((day) => day.label === "Round of 16");
    const block = { label: "The arrival", games: [arrival] };
    if (at >= 0) days.splice(at, 0, block);
    else days.push(block);
  }
  const climax = [tournament.siege?.gate, tournament.siege?.restoration].filter((game): game is GameResult => Boolean(game));
  if (climax.length) days.push({ label: "The siege", games: climax });

  return (
    <main className="page">
      <p className="kicker">Game center</p>
      <h2 className="display" style={{ fontSize: 68 }}>Every tip</h2>
      <p className="lede">Open a game for the quarter line, the full box, and the possession log. The siege is on this list and stays off the country standings. Exhibition nights stay off them too.</p>
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
                  <span className="tag">{game.roundLabel}{game.round === "arrival" || game.round === "gate" || game.round === "restoration" ? " · the siege" : game.exhibition ? " · exhibition" : ""}</span>
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
  if (id === game.homeId) return game.homeName ?? sideById(id)?.code ?? id;
  if (id === game.awayId) return game.awayName ?? sideById(id)?.code ?? id;
  return sideById(id)?.code ?? id;
}

function winnerName(game: GameResult): string {
  if (game.winnerId === game.homeId) return game.homeName ?? sideById(game.homeId)?.name ?? game.homeId;
  return game.awayName ?? sideById(game.awayId)?.name ?? game.awayId;
}
