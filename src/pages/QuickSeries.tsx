import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ScoreTable } from "../components/ScoreTable";
import { TEAMS } from "../data";
import { freshSeed, formatSeed } from "../engine/rng";
import { seriesRecord } from "../engine/series";
import { playQuick } from "../engine/side";

export function QuickSeries() {
  const [home, setHome] = useState("cont");
  const [away, setAway] = useState("vngd");
  const [seed, setSeed] = useState(() => freshSeed());
  const [watch, setWatch] = useState<number | null>(null);
  const ready = home !== away;
  const series = useMemo(() => (ready ? playQuick(home, away, seed, false) : null), [home, away, seed, ready]);
  const watched = useMemo(() => (ready && watch !== null ? playQuick(home, away, seed, true).games[watch] : null), [home, away, seed, watch, ready]);
  const record = series ? seriesRecord(series) : null;
  return (
    <main className="page" data-floor="quick">
      <p className="kicker">Side floor · seed {formatSeed(seed)}</p>
      <h2 className="display" style={{ fontSize: 64 }}>A series tonight</h2>
      <p className="lede">
        Pick two sides and play a best-of-seven. First to four. Neutral floors. The Construct can be called. The championship book stays on its own floor.
      </p>
      <div className="filters">
        <select aria-label="Home side" value={home} onChange={(event) => { setHome(event.target.value); setWatch(null); }}>
          {TEAMS.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
        </select>
        <select aria-label="Away side" value={away} onChange={(event) => { setAway(event.target.value); setWatch(null); }}>
          {TEAMS.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
        </select>
        <button className="solid" type="button" disabled={!ready} onClick={() => { setSeed(freshSeed()); setWatch(null); }}>Run it again</button>
        <Link className="text-btn" to="/play">All floors</Link>
      </div>
      {series && record ? (
        <>
          <p className="scoreline">{series.winnerId === series.homeId ? series.homeName : series.awayName} {record.winnerWins}–{record.loserWins}</p>
          <div className="pips short" role="list">
            {series.games.map((game, index) => (
              <button
                key={game.id}
                type="button"
                className={`pip${game.winnerId === series.homeId ? " win" : ""}${watch === index ? " on" : ""}`}
                onClick={() => setWatch(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <p className="quiet">Gold is a win for {series.homeName}. Open a game for the line.</p>
          {watched ? <ScoreTable game={watched} /> : <p className="empty">The series is in. Open a game.</p>}
        </>
      ) : (
        <p className="empty">Pick two different sides.</p>
      )}
    </main>
  );
}
