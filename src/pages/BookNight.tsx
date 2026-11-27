import { useMemo, useState } from "react";
import { PlayerLink } from "../components/Marks";
import { AFTER_KINDS, castFromBook, playAfter, type AfterKind } from "../engine/after";
import { Floor, useRun } from "./toyShell";

function night(kind: AfterKind) {
  const card = AFTER_KINDS.find((item) => item.id === kind);
  return function BookNight() {
    const run = useRun();
    const cast = useMemo(() => castFromBook(run.seed, run.salt), [run.seed, run.salt]);
    const result = useMemo(() => playAfter(cast, kind, 0), [cast]);
    const [pick, setPick] = useState<string | null>(null);
    const hit = pick !== null && pick === result.winner;
    return (
      <Floor
        floor={kind}
        kicker={run.kicker(card?.title ?? "After the horn")}
        title={pick ? result.winner : "Pick a prime"}
        winner={pick ? result.winner : undefined}
        lede={`${card?.blurb ?? "A short night from the book."} Drawn from the book, not from a finished box. It does not move the groups.`}
        onAgain={() => { setPick(null); run.again(); }}
      >
        <div className="doors">
          {result.rows.map((row) => (
            <button
              key={row.playerId ?? row.name}
              type="button"
              className={`panel door${pick === row.name ? " on" : ""}`}
              onClick={() => setPick(row.name)}
              disabled={pick !== null}
            >
              <span className="tag">{card?.title}</span>
              <h3>{row.name}</h3>
              <p>{pick ? row.score : "Take this prime"}</p>
            </button>
          ))}
        </div>
        {pick ? (
          <>
            <p className="scoreline" data-score={result.winner}>{result.winner}</p>
            <p>{hit ? `You took ${result.winner}. That was the night.` : `You took ${pick}. ${result.winner} took the night.`}</p>
            <p>{result.line}</p>
            <div className="panel">
              <div className="after-grid">
                {result.rows.map((row) => (
                  <div key={`${row.playerId}-${row.score}`} className="after-row">
                    <span>{row.playerId ? <PlayerLink id={row.playerId} /> : row.name}</span>
                    <span className="mono">{row.score}</span>
                    <span className="quiet">{row.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p className="note">The numbers stay down until you pick.</p>
        )}
      </Floor>
    );
  };
}

export const Rack = night("rack");
export const Stripe = night("stripe");
export const Poster = night("poster");
export const Circuit = night("circuit");
export const Buzzer = night("buzzer");
