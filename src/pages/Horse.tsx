import { useMemo, useRef, useState } from "react";
import { drawHorsePair, HORSE_SHOTS, shotChance, type ShotKind } from "../engine/after";
import { formatSeed, mixSeed, mulberry32 } from "../engine/rng";
import { Floor, useRun } from "./toyShell";

const WORD = "HORSE";

function mark(n: number) {
  return n <= 0 ? "clear" : WORD.slice(0, n);
}

export function Horse() {
  const run = useRun();
  return <HorseBoard key={`${run.seed}-${run.salt}`} seed={run.seed} salt={run.salt} onAgain={run.again} />;
}

function HorseBoard({ seed, salt, onAgain }: { seed: number; salt: number; onAgain: () => void }) {
  const pair = useMemo(() => drawHorsePair(seed, salt), [seed, salt]);
  const rngRef = useRef<(() => number) | null>(null);
  if (!rngRef.current) rngRef.current = mulberry32(mixSeed(mixSeed(seed || 1, "horse-ui"), `salt:${salt}`));
  const [you, setYou] = useState<number | null>(null);
  const [caller, setCaller] = useState(0);
  const [letters, setLetters] = useState<[number, number]>([0, 0]);
  const [log, setLog] = useState<string[]>([]);
  const [over, setOver] = useState(false);

  const winner = over ? (letters[0] < letters[1] ? 0 : 1) : null;

  function shoot(kind: ShotKind, name: string) {
    if (over || you === null) return;
    const offense = caller;
    const defense = 1 - offense;
    const made = rngRef.current!() < shotChance(pair[offense], kind);
    if (!made) {
      setLog((rows) => [...rows, `${pair[offense].name} missed the ${name}. No letter.`]);
      setCaller(defense);
      return;
    }
    const matched = rngRef.current!() < shotChance(pair[defense], kind);
    if (matched) {
      setLog((rows) => [...rows, `${pair[offense].name} hit the ${name}. ${pair[defense].name} matched it.`]);
      return;
    }
    const next: [number, number] = [letters[0], letters[1]];
    next[defense] += 1;
    setLetters(next);
    setLog((rows) => [...rows, `${pair[offense].name} hit the ${name}. ${pair[defense].name} missed the copy and takes ${mark(next[defense])}.`]);
    if (next[defense] >= 5) setOver(true);
  }

  function theirCall() {
    const shot = HORSE_SHOTS[Math.floor(rngRef.current!() * HORSE_SHOTS.length)];
    shoot(shot.id, shot.name);
  }

  const yourTurn = you !== null && caller === you && !over;

  return (
    <Floor
      floor="horse"
      kicker={`Horse · seed ${formatSeed(seed)} · run ${salt + 1}`}
      title={winner === null ? "Call a shot" : pair[winner].name}
      winner={winner === null ? undefined : pair[winner].name}
      lede="Two primes. You take one. Call the shot, and the other has to match it. A miss on the copy takes a letter. Same makes Horse already uses. Nothing here is written into the groups."
      onAgain={onAgain}
    >
      <div className="call-pair">
        {pair.map((player, index) => (
          <button
            key={player.id}
            type="button"
            className={`panel door${you === index ? " on" : ""}`}
            onClick={() => setYou(index)}
            disabled={you !== null}
          >
            <span className="tag">{mark(letters[index])}</span>
            <h3>{player.name}</h3>
            <p>{you === null ? "Play as this prime" : you === index ? "You" : "The other prime"}</p>
          </button>
        ))}
      </div>
      {you === null ? <p className="note">Pick who you have before the first call.</p> : null}
      {yourTurn ? (
        <div className="filters">
          {HORSE_SHOTS.map((shot) => (
            <button key={shot.id} type="button" className="solid" onClick={() => shoot(shot.id, shot.name)}>{shot.name}</button>
          ))}
        </div>
      ) : null}
      {you !== null && !over && caller !== you ? (
        <div className="filters">
          <button type="button" className="solid" onClick={theirCall}>Their call</button>
        </div>
      ) : null}
      {over && winner !== null ? (
        <p>{pair[winner].name} leaves {pair[1 - winner].name} on {mark(letters[1 - winner])}.</p>
      ) : null}
      {log.length > 0 ? (
        <ol className="toy-log">
          {log.map((line, index) => <li key={`${index}-${line}`}>{line}</li>)}
        </ol>
      ) : null}
    </Floor>
  );
}
