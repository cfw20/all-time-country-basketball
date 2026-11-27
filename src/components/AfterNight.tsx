import { useState } from "react";
import { Link } from "react-router-dom";
import { AFTER_KINDS, playAfter, type AfterKind, type NightCast } from "../engine/after";

export function AfterNight({ cast, heading }: { cast: NightCast; heading?: string }) {
  const [kind, setKind] = useState<AfterKind | null>(null);
  const [salt, setSalt] = useState(0);
  if (cast.lines.length < 2) return null;
  const result = kind ? playAfter(cast, kind, salt) : null;
  return (
    <section className="section">
      <div className="section-head">
        <h3>{heading ?? "After the horn"}</h3>
        <span className="quiet">Tiny games with the players who just played</span>
      </div>
      <div className="filters">
        {AFTER_KINDS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={kind === item.id ? "on" : ""}
            onClick={() => {
              setKind(item.id);
              setSalt(0);
            }}
          >
            {item.title}
          </button>
        ))}
      </div>
      {result ? (
        <div className="panel">
          <span className="tag">{result.title}</span>
          <h3 style={{ marginTop: 8 }}>{result.winner}</h3>
          <p>{result.line}</p>
          <div className="after-grid">
            {result.rows.map((row) => (
              <div key={row.playerId ?? row.name} className="after-row">
                <span>{row.playerId ? <Link to={`/players/${row.playerId}`}>{row.name}</Link> : row.name}</span>
                <span className="mono">{row.score}</span>
                <span className="quiet">{row.detail}</span>
              </div>
            ))}
          </div>
          <button type="button" className="text-btn" onClick={() => setSalt((value) => value + 1)}>
            Run it again
          </button>
        </div>
      ) : (
        <p className="note">Pick a game. Same night, same players, a different toy. Run it again reshuffles that toy only.</p>
      )}
    </section>
  );
}
