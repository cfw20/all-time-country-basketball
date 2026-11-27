import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { StylePanel } from "../components/StylePanel";
import { ScoreTable } from "../components/ScoreTable";
import { eraCard, eraSide } from "../engine/season";
import { drawClash, playClash } from "../engine/side";
import { freshSeed, formatSeed, mixSeed } from "../engine/rng";
import { meetStyles, readStyle } from "../engine/style";

export function Clash() {
  const [seed, setSeed] = useState(() => freshSeed());
  const drawn = useMemo(() => drawClash(seed), [seed]);
  const game = useMemo(() => playClash(drawn.a, drawn.b, seed, true), [drawn.a, drawn.b, seed]);
  const left = eraCard(drawn.a);
  const right = eraCard(drawn.b);
  const leftSide = useMemo(() => eraSide(drawn.a, new Set(), mixSeed(seed, "clash-left")), [drawn.a, seed]);
  const rightSide = useMemo(
    () => eraSide(drawn.b, new Set(leftSide.players.map((player) => player.id)), mixSeed(seed, "clash-right")),
    [drawn.b, leftSide, seed],
  );
  const leftStyle = readStyle({ pace: leftSide.pace, players: leftSide.players });
  const rightStyle = readStyle({ pace: rightSide.pace, players: rightSide.players });
  const leftName = `${left.years} ${left.franchise}`;
  const rightName = `${right.years} ${right.franchise}`;
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
      <div className="style-pair">
        <StylePanel style={leftStyle} kicker={`${leftName} · mixed`} />
        <StylePanel style={rightStyle} kicker={`${rightName} · mixed`} />
      </div>
      <p className="note">{meetStyles(leftName, leftStyle, rightName, rightStyle)}</p>
      <ScoreTable game={game} />
    </main>
  );
}
