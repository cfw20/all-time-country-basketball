import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { PlayerLink } from "../components/Marks";
import type { ToyNight } from "../engine/toys";
import { formatSeed, freshSeed } from "../engine/rng";

export function useRun() {
  const [seed] = useState(() => freshSeed());
  const [salt, setSalt] = useState(0);
  return {
    seed,
    salt,
    again: () => setSalt((value) => value + 1),
    kicker: (label: string) => `${label} · seed ${formatSeed(seed)} · run ${salt + 1}`,
  };
}

export function Floor({
  floor,
  kicker,
  title,
  winner,
  lede,
  onAgain,
  children,
}: {
  floor: string;
  kicker: string;
  title: string;
  winner?: string;
  lede: string;
  onAgain: () => void;
  children: ReactNode;
}) {
  return (
    <main className="page" data-floor={floor} data-night="short">
      <p className="kicker">{kicker}</p>
      <h2 className="display toy-title" data-winner={winner}>{title}</h2>
      <p className="lede">{lede}</p>
      <div className="filters">
        <button className="solid" type="button" onClick={onAgain}>Run it again</button>
        <Link className="text-btn" to="/play">All floors</Link>
      </div>
      {children}
    </main>
  );
}

export function Board({ rows, log }: { rows: ToyNight["rows"]; log?: string[] }) {
  return (
    <div className="panel">
      <div className="after-grid">
        {rows.map((item) => (
          <div key={item.playerId} className="after-row">
            <span><PlayerLink id={item.playerId} /></span>
            <span className="mono">{item.score}</span>
            <span className="quiet">{item.detail}</span>
          </div>
        ))}
      </div>
      {log && log.length > 0 ? (
        <ol className="toy-log">
          {log.map((line, index) => <li key={`${index}-${line}`}>{line}</li>)}
        </ol>
      ) : null}
    </div>
  );
}
