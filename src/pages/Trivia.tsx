import { useMemo, useState } from "react";
import { playEdge, playFlag, playOpens, playPrime, playTape, type TriviaNight } from "../engine/trivia";
import { Floor, useRun } from "./toyShell";

function TriviaGame({
  floor,
  label,
  lede,
  play,
}: {
  floor: string;
  label: string;
  lede: string;
  play: (seed: number, salt?: number) => TriviaNight;
}) {
  const run = useRun();
  const night = useMemo(() => play(run.seed, run.salt), [play, run.seed, run.salt]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const done = index >= night.questions.length;
  const question = night.questions[index];
  const scoreLine = `${correct} of ${night.questions.length}`;

  function again() {
    setIndex(0);
    setPicked(null);
    setCorrect(0);
    run.again();
  }

  return (
    <Floor
      floor={floor}
      kicker={run.kicker(label)}
      title={done ? scoreLine : label}
      winner={done ? scoreLine : undefined}
      lede={lede}
      onAgain={again}
    >
      <p className="scoreline" data-score={scoreLine}>{scoreLine}</p>
      {done || !question ? (
        <p>That is the set. Run it again for another {night.questions.length} from the book.</p>
      ) : (
        <section>
          <p className="kicker">Question {index + 1} of {night.questions.length}</p>
          <h3 className="toy-prompt">{question.prompt}</h3>
          <div className="toy-list">
            {question.choices.map((choice) => {
              const locked = picked !== null;
              const right = locked && choice.id === question.answerId;
              const wrong = locked && picked === choice.id && choice.id !== question.answerId;
              return (
                <button
                  key={choice.id}
                  type="button"
                  className={`panel pick${right ? " right" : ""}${wrong ? " wrong" : ""}`}
                  disabled={locked}
                  onClick={() => {
                    setPicked(choice.id);
                    if (choice.id === question.answerId) setCorrect((value) => value + 1);
                  }}
                >
                  <strong>{choice.label}</strong>
                  {choice.note ? <span className="meta">{choice.note}</span> : null}
                </button>
              );
            })}
          </div>
          {picked !== null ? (
            <>
              <p className="scoreline" aria-live="polite">
                {picked === question.answerId ? "Right." : "Not that one."} {question.reveal}
              </p>
              <div className="filters">
                <button
                  className="solid"
                  type="button"
                  onClick={() => {
                    setIndex((value) => value + 1);
                    setPicked(null);
                  }}
                >
                  {index + 1 === night.questions.length ? "See the score" : "Next question"}
                </button>
              </div>
            </>
          ) : null}
        </section>
      )}
    </Floor>
  );
}

export function PrimeYear() {
  return (
    <TriviaGame
      floor="prime"
      label="Prime year"
      lede="Nine names from the book. Four years. Pick the prime printed on the card."
      play={playPrime}
    />
  );
}

export function Flag() {
  return (
    <TriviaGame
      floor="flag"
      label="The Flag"
      lede="A nationality from the book. Which prime wears it? Nine questions. Wrong answers show the right name."
      play={playFlag}
    />
  );
}

export function Opens() {
  return (
    <TriviaGame
      floor="opens"
      label="Opens With"
      lede="That prime starts. Which of these is in the same opening five? The side is on the choice. Nine questions."
      play={playOpens}
    />
  );
}

export function Edge() {
  return (
    <TriviaGame
      floor="edge"
      label="The Edge"
      lede="Two cards. Higher overall, the better shot rating, or the better defense. The number stays down until you answer."
      play={playEdge}
    />
  );
}

export function Tape() {
  return (
    <TriviaGame
      floor="tape"
      label="The Tape"
      lede="Who is taller on the card, or who is listed at that position. Nine questions. Nothing here is outside the book."
      play={playTape}
    />
  );
}
