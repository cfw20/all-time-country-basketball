import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ScoreTable } from "../components/ScoreTable";
import { eraCard } from "../engine/season";
import { freshSeed, formatSeed } from "../engine/rng";
import { playThrone, throneNight } from "../engine/side";

export function Throne() {
  const [seed, setSeed] = useState(() => freshSeed());
  const [watch, setWatch] = useState<number | null>(null);
  const night = useMemo(() => playThrone(seed), [seed]);
  const game = night.games[watch ?? -1];
  const watched = useMemo(() => (game ? throneNight(game) : null), [game]);
  const champion = eraCard(night.champion);
  return (
    <main className="page" data-floor="throne">
      <p className="kicker">Side floor · seed {formatSeed(seed)}</p>
      <h2 className="display" style={{ fontSize: 64 }}>{champion.years} {champion.franchise}</h2>
      <p className="lede">
        Eight era sides, single elimination, one NBA game each. {champion.franchise} leaves holding the throne. Open any night for the line.
      </p>
      <div className="filters">
        <button className="solid" type="button" onClick={() => { setSeed(freshSeed()); setWatch(null); }}>Another bracket</button>
        <Link className="text-btn" to="/play">All floors</Link>
      </div>
      {["Quarter", "Semi", "The throne"].map((round) => (
        <section key={round} className="section">
          <h3>{round}</h3>
          <div className="team-grid">
            {night.games.map((item, index) => item.round === round ? (
              <button key={`${item.a}-${item.b}`} type="button" className={`panel door${watch === index ? " on" : ""}`} onClick={() => setWatch(index)}>
                <span className="tag">{label(item.winner === item.a ? item.a : item.b)}</span>
                <h3>{item.aScore}–{item.bScore}</h3>
                <p>{label(item.a)} · {label(item.b)}</p>
              </button>
            ) : null)}
          </div>
        </section>
      ))}
      {watched ? <ScoreTable game={watched} /> : <p className="empty">Open a night.</p>}
    </main>
  );
}

function label(id: string): string {
  const card = eraCard(id);
  return `${card.years} ${card.franchise}`;
}
