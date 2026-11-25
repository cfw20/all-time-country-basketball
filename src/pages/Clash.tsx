import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ScoreTable } from "../components/ScoreTable";
import { eraCard } from "../engine/season";
import { drawClash, playClash } from "../engine/side";
import { freshSeed, formatSeed } from "../engine/rng";

export function Clash() {
  const [seed, setSeed] = useState(() => freshSeed());
  const drawn = useMemo(() => drawClash(seed), [seed]);
  const game = useMemo(() => playClash(drawn.a, drawn.b, seed, true), [drawn.a, drawn.b, seed]);
  const left = eraCard(drawn.a);
  const right = eraCard(drawn.b);
  return (
    <main className="page" data-floor="clash">
      <p className="kicker">Side floor · seed {formatSeed(seed)}</p>
      <h2 className="display" style={{ fontSize: 64 }}>Era Clash</h2>
      <p className="lede">
        {left.years} {left.franchise} against {right.years} {right.franchise}. One NBA game. The primes from each card, with the rotation filled from that era.
      </p>
      <div className="filters">
        <button className="solid" type="button" onClick={() => setSeed(freshSeed())}>Another night</button>
        <Link className="text-btn" to="/play">All floors</Link>
      </div>
      <ScoreTable game={game} />
    </main>
  );
}
