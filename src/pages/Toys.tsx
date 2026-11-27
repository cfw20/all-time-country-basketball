import { useMemo, useState } from "react";
import { PlayerLink } from "../components/Marks";
import type { Pos } from "../data/types";
import {
  CUT_RULE,
  CUT_SPOTS,
  cutBoard,
  gradeCut,
  playArc,
  playCloser,
  playGlass,
  playHalfcourt,
  playLadder,
  playShootaround,
  playStreak,
  type CutSeat,
  type ToyNight,
} from "../engine/toys";
import { Board, Floor, useRun } from "./toyShell";

function spectator(slug: string, label: string, lede: string, play: (seed: number, salt?: number) => ToyNight) {
  return function Night() {
    const run = useRun();
    const night = useMemo(() => play(run.seed, run.salt), [play, run.seed, run.salt]);
    return (
      <Floor floor={slug} kicker={run.kicker(label)} title={night.winner} winner={night.winner} lede={lede} onAgain={run.again}>
        <p className="scoreline" data-score={night.scoreLine}>{night.scoreLine}</p>
        <p>{night.line}</p>
        <Board rows={night.rows} log={night.log} />
      </Floor>
    );
  };
}

export const Shootaround = spectator(
  "shootaround",
  "Shootaround",
  "Six primes. Five midrange shots, five threes, and five free throws. The most makes take the floor.",
  playShootaround,
);

export const Ladder = spectator(
  "ladder",
  "The Ladder",
  "Eight primes. One free throw at a time. Miss, and you leave the ladder. The last prime still shooting wins.",
  playLadder,
);

export const Halfcourt = spectator(
  "halfcourt",
  "Halfcourt",
  "Two primes alternate the ball. A basket is 2. First to 11. Shot, athleticism, and the defender on the card decide the make.",
  playHalfcourt,
);

export const Streak = spectator(
  "streak",
  "The Streak",
  "Four shooters. Threes until a miss. The longest run wins.",
  playStreak,
);

export const Glass = spectator(
  "glass",
  "The Glass",
  "Two bigs. Ten trips. A board is one. A block is two. Rebounding and defense on the card do the work.",
  playGlass,
);

export const Arc = spectator(
  "arc",
  "The Arc",
  "One shooter from each decade on the card. Five threes. This is not the Decade Cup.",
  playArc,
);

export function Closer() {
  const run = useRun();
  const night = useMemo(() => playCloser(run.seed, run.salt), [run.seed, run.salt]);
  const [named, setNamed] = useState<string | null>(null);
  const namedRow = night.rows.find((item) => item.playerId === named);
  return (
    <Floor
      floor="closer"
      kicker={run.kicker("The Closer")}
      title={named ? night.winner : "Name the closer"}
      winner={named ? night.winner : undefined}
      lede="Two primes. Five late possessions each. Name one before the shots. Baskets count 2 or 3, from the clutch rating and the shot on the card."
      onAgain={() => { setNamed(null); run.again(); }}
    >
      <div className="doors">
        {night.rows.map((item) => (
          <button
            key={item.playerId}
            type="button"
            className={`panel door${named === item.playerId ? " on" : ""}`}
            onClick={() => setNamed(item.playerId)}
            disabled={named !== null}
          >
            <span className="tag">Late clock</span>
            <h3>{item.name}</h3>
            <p>{item.tag}</p>
          </button>
        ))}
      </div>
      {named ? (
        <>
          <p className="scoreline" data-score={night.scoreLine}>{night.scoreLine}</p>
          <p>{named === night.winnerId ? `You named ${night.winner}. That was the closer.` : `You named ${namedRow?.name}. ${night.winner} was the closer.`}</p>
          <p>{night.line}</p>
          <Board rows={night.rows} log={night.log} />
        </>
      ) : (
        <p className="note">The numbers stay down until you name someone.</p>
      )}
    </Floor>
  );
}

export function Cut() {
  const run = useRun();
  const board = useMemo(() => cutBoard(run.seed, run.salt), [run.seed, run.salt]);
  const [picked, setPicked] = useState<string[]>([]);
  const [filed, setFiled] = useState(false);
  const grade = gradeCut(picked, board.cap);
  const yours = filed ? grade.grade : null;
  const ahead = Boolean(yours && yours.score > board.bookScore);
  const tied = Boolean(yours && yours.score === board.bookScore);
  const title = !yours ? "The Cut" : tied ? "Split night" : ahead ? "Your five" : "The book";
  const scoreLine = yours ? `${yours.score}–${board.bookScore}` : `${grade.ovr} of ${board.cap}`;
  const mine = CUT_SPOTS.map((pos) => board.seats.find((seat) => seat.pos === pos && picked.includes(seat.playerId))).filter((seat): seat is CutSeat => Boolean(seat));

  function toggle(id: string, pos: Pos) {
    if (filed) return;
    setPicked((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      const same = board.seats.filter((seat) => seat.pos === pos).map((seat) => seat.playerId);
      return [...current.filter((item) => !same.includes(item)), id];
    });
  }

  return (
    <Floor
      floor="cut"
      kicker={run.kicker("The Cut")}
      title={title}
      winner={yours ? title : undefined}
      lede="One prime at each position, under the overall cap. The book spends the cap on one skill. The night pays the job on the card: handle for a point guard, shot for a two, defense and athleticism for a wing, glass and defense for a big."
      onAgain={() => { setPicked([]); setFiled(false); run.again(); }}
    >
      <p className="scoreline" data-score={scoreLine}>{scoreLine}</p>
      <p>The book is chasing {board.bias}. Overall cap {board.cap}.</p>
      <p className="note">
        Bonus {CUT_RULE.shootBonus} for a shooter or a {CUT_RULE.threeAt} three, {CUT_RULE.defBonus} for a defender or a {CUT_RULE.defAt} on defense, {CUT_RULE.handleBonus} for a point guard at {CUT_RULE.playAt} playmaking.
      </p>
      <div className="cut-board">
        {CUT_SPOTS.map((pos) => (
          <div key={pos} className="cut-col">
            <h3>{pos}</h3>
            {board.seats.filter((seat) => seat.pos === pos).map((seat) => (
              <button
                key={seat.playerId}
                type="button"
                data-pos={pos}
                data-ovr={seat.ovr}
                className={`panel pick${picked.includes(seat.playerId) ? " on" : ""}`}
                onClick={() => toggle(seat.playerId, pos)}
                disabled={filed}
              >
                <strong>{seat.name}</strong>
                <span className="meta">{seat.arch} · {seat.ovr}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
      {!filed ? (
        <div className="filters">
          <button className="solid" type="button" disabled={!grade.ok} onClick={() => setFiled(true)}>File the five</button>
          <button className="text-btn" type="button" onClick={() => setPicked([])}>Clear</button>
        </div>
      ) : null}
      {grade.ovr > board.cap ? <p className="note">That five is over the cap by {grade.ovr - board.cap}.</p> : null}
      {yours ? (
        <div className="panel">
          <p>{ahead ? "Your five took the night." : tied ? "Split night. Same rating total." : "The book took the night."}</p>
          <p className="scoreline">You {yours.score} · bonus {yours.bonus}. The book {board.bookScore} · bonus {board.bookBonus}.</p>
          <p>
            Yours: {mine.map((seat, index) => (
              <span key={seat.playerId}><PlayerLink id={seat.playerId} />{index < mine.length - 1 ? ", " : ""}</span>
            ))}. The book: {board.bookIds.map((id, index) => (
              <span key={id}><PlayerLink id={id} />{index < board.bookIds.length - 1 ? ", " : ""}</span>
            ))}.
          </p>
        </div>
      ) : null}
    </Floor>
  );
}
