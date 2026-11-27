import { formatHeight } from "../data/ratings";
import type { Player, Pos } from "../data/types";
import { shuffle } from "./rng";
import { humans, nightRng, notables, sideName } from "./night";

export interface TriviaChoice {
  id: string;
  label: string;
  note?: string;
}

export interface TriviaQuestion {
  prompt: string;
  choices: TriviaChoice[];
  answerId: string;
  reveal: string;
}

export interface TriviaNight {
  kind: string;
  title: string;
  questions: TriviaQuestion[];
}

const ASKS = 9;
const SPOTS: Pos[] = ["PG", "SG", "SF", "PF", "C"];

function finish(kind: string, title: string, questions: TriviaQuestion[]): TriviaNight {
  if (questions.length < 8 || questions.length > 10) throw new Error(`${kind} built ${questions.length} questions`);
  for (const question of questions) {
    const answer = question.choices.find((choice) => choice.id === question.answerId);
    if (!answer || !question.reveal.includes(answer.label)) throw new Error(`${kind} hid an answer: ${question.prompt}`);
    if (new Set(question.choices.map((choice) => choice.id)).size !== question.choices.length) {
      throw new Error(`${kind} repeated a choice`);
    }
  }
  return { kind, title, questions };
}

function inches(height: string): number {
  const [feet, inch] = height.split("-");
  const whole = Number(feet);
  const part = Number(inch);
  if (!Number.isFinite(whole)) return 0;
  return whole * 12 + (Number.isFinite(part) ? part : 0);
}

export function playPrime(seed: number, salt = 0): TriviaNight {
  const rng = nightRng(seed, salt, "prime");
  const years = [...new Set(humans().map((player) => player.primeYear))];
  const questions: TriviaQuestion[] = [];
  for (const player of shuffle(notables(), rng)) {
    if (questions.length === ASKS) break;
    const distractors = shuffle(years.filter((year) => year !== player.primeYear), rng).slice(0, 3);
    if (distractors.length < 3) continue;
    questions.push({
      prompt: `Which year is ${player.name}'s prime?`,
      choices: shuffle([player.primeYear, ...distractors], rng).map((year) => ({ id: String(year), label: String(year) })),
      answerId: String(player.primeYear),
      reveal: `${player.name}, prime ${player.primeYear}. ${sideName(player)}, ${player.pos}.`,
    });
  }
  return finish("prime", "Prime year", questions);
}

export function playFlag(seed: number, salt = 0): TriviaNight {
  const rng = nightRng(seed, salt, "flag");
  const all = humans();
  const byNat = new Map<string, Player[]>();
  for (const player of all) {
    const list = byNat.get(player.nationality) ?? [];
    list.push(player);
    byNat.set(player.nationality, list);
  }
  const questions: TriviaQuestion[] = [];
  for (const nationality of shuffle([...byNat.keys()], rng)) {
    if (questions.length === ASKS) break;
    const correct = shuffle(byNat.get(nationality) ?? [], rng)[0];
    const distractors = shuffle(all.filter((player) => player.nationality !== nationality), rng).slice(0, 3);
    if (!correct || distractors.length < 3) continue;
    questions.push({
      prompt: `${nationality}. Who wears it?`,
      choices: shuffle([correct, ...distractors], rng).map((player) => ({ id: player.id, label: player.name })),
      answerId: correct.id,
      reveal: `${correct.name}, ${nationality}, ${sideName(correct)}.`,
    });
  }
  return finish("flag", "The Flag", questions);
}

export function playOpens(seed: number, salt = 0): TriviaNight {
  const rng = nightRng(seed, salt, "opens");
  const starters = humans().filter((player) => player.starts);
  const questions: TriviaQuestion[] = [];
  for (const subject of shuffle(starters, rng)) {
    if (questions.length === ASKS) break;
    const mates = starters.filter((player) => player.teamId === subject.teamId && player.id !== subject.id);
    const correct = shuffle(mates, rng)[0];
    const distractors = shuffle(starters.filter((player) => player.teamId !== subject.teamId), rng).slice(0, 3);
    if (!correct || distractors.length < 3) continue;
    questions.push({
      prompt: `Who opens beside ${subject.name}?`,
      choices: shuffle([correct, ...distractors], rng).map((player) => ({
        id: player.id,
        label: player.name,
        note: sideName(player),
      })),
      answerId: correct.id,
      reveal: `${correct.name} opens beside ${subject.name} on ${sideName(correct)}.`,
    });
  }
  return finish("opens", "Opens With", questions);
}

const EDGE = [
  { prompt: "Who has the higher overall?", stat: "overall", read: (player: Player) => player.ratings.ovr },
  { prompt: "Who is the better shooter on the card?", stat: "shot", read: (player: Player) => player.ratings.shot },
  { prompt: "Who is the better defender on the card?", stat: "defense", read: (player: Player) => player.ratings.def },
];

export function playEdge(seed: number, salt = 0): TriviaNight {
  const rng = nightRng(seed, salt, "edge");
  const bag = shuffle(notables(), rng);
  const questions: TriviaQuestion[] = [];
  let cursor = 0;
  let kind = 0;
  while (questions.length < ASKS && cursor + 1 < bag.length) {
    const ask = EDGE[kind % EDGE.length];
    kind += 1;
    const left = bag[cursor];
    const right = bag[cursor + 1];
    cursor += 2;
    if (ask.read(left) === ask.read(right)) continue;
    const better = ask.read(left) > ask.read(right) ? left : right;
    const worse = better === left ? right : left;
    questions.push({
      prompt: ask.prompt,
      choices: shuffle(
        [
          { id: better.id, label: better.name, note: `${better.pos} · ${better.arch}` },
          { id: worse.id, label: worse.name, note: `${worse.pos} · ${worse.arch}` },
        ],
        rng,
      ),
      answerId: better.id,
      reveal: `${better.name} ${ask.stat} ${ask.read(better)}. ${worse.name} ${ask.stat} ${ask.read(worse)}.`,
    });
  }
  return finish("edge", "The Edge", questions);
}

export function playTape(seed: number, salt = 0): TriviaNight {
  const rng = nightRng(seed, salt, "tape");
  const pool = shuffle(notables(), rng);
  const questions: TriviaQuestion[] = [];
  let cursor = 0;
  let posCursor = 0;
  const plan = ["height", "pos", "height", "pos", "height", "pos", "height", "pos", "height"] as const;
  for (const step of plan) {
    if (questions.length >= ASKS) break;
    if (step === "height") {
      let placed = false;
      while (cursor + 1 < pool.length) {
        const left = pool[cursor];
        const right = pool[cursor + 1];
        cursor += 2;
        const leftIn = inches(left.height);
        const rightIn = inches(right.height);
        if (!leftIn || !rightIn || leftIn === rightIn) continue;
        const taller = leftIn > rightIn ? left : right;
        const shorter = taller === left ? right : left;
        questions.push({
          prompt: "Who is taller on the card?",
          choices: shuffle(
            [
              { id: taller.id, label: taller.name, note: taller.pos },
              { id: shorter.id, label: shorter.name, note: shorter.pos },
            ],
            rng,
          ),
          answerId: taller.id,
          reveal: `${taller.name} at ${formatHeight(taller.height)}. ${shorter.name} at ${formatHeight(shorter.height)}.`,
        });
        placed = true;
        break;
      }
      if (!placed) break;
      continue;
    }
    const target = SPOTS[posCursor % SPOTS.length];
    posCursor += 1;
    const correct = pool.find((player) => player.pos === target && !questions.some((question) => question.answerId === player.id));
    if (!correct) continue;
    const distractors = shuffle(
      pool.filter((player) => player.id !== correct.id && player.pos !== target && player.pos2 !== target),
      rng,
    ).slice(0, 3);
    if (distractors.length < 3) continue;
    questions.push({
      prompt: `Who is listed at ${target}?`,
      choices: shuffle([correct, ...distractors], rng).map((player) => ({ id: player.id, label: player.name })),
      answerId: correct.id,
      reveal: `${correct.name} is listed at ${correct.pos}, ${formatHeight(correct.height)}.`,
    });
  }
  return finish("tape", "The Tape", questions);
}

export const TRIVIA_PLAYS = {
  prime: playPrime,
  flag: playFlag,
  opens: playOpens,
  edge: playEdge,
  tape: playTape,
} as const;
