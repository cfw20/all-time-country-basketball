import { playerById } from "../data";
import type { BoxLine, GameResult, Player, SeriesResult } from "../data/types";
import { mixSeed, mulberry32 } from "./rng";

export type AfterKind = "horse" | "rack" | "stripe" | "poster" | "circuit" | "buzzer";

export const AFTER_KINDS: { id: AfterKind; title: string; blurb: string }[] = [
  { id: "horse", title: "Horse", blurb: "The two leading scorers. Call a shot. Match it, or take a letter." },
  { id: "rack", title: "The Rack", blurb: "Four shooters. Five racks. The last ball of each rack counts double." },
  { id: "stripe", title: "The Stripe", blurb: "Free throws. First to seven. Sudden death if it stays even." },
  { id: "poster", title: "The Poster", blurb: "Two leapers. Three dunks each. The floor judges." },
  { id: "circuit", title: "The Circuit", blurb: "Four ballhandlers. Handle, pass, finish." },
  { id: "buzzer", title: "Buzzer", blurb: "Five shots with the clock dying. The last one breaks a tie." },
];

export interface AfterRow {
  name: string;
  playerId?: string;
  score: string;
  detail: string;
}

export interface AfterResult {
  kind: AfterKind;
  title: string;
  winner: string;
  line: string;
  rows: AfterRow[];
}

export interface NightCast {
  seed: number;
  lines: { playerId: string; pts: number; sec: number }[];
}

interface Seat {
  player: Player;
  pts: number;
  sec: number;
}

const CALLS: { name: string; kind: "three" | "logo" | "ft" | "mid" | "dunk" }[] = [
  { name: "corner three", kind: "three" },
  { name: "free throw", kind: "ft" },
  { name: "floater", kind: "mid" },
  { name: "wing three", kind: "three" },
  { name: "turnaround", kind: "mid" },
  { name: "logo three", kind: "logo" },
  { name: "baseline dunk", kind: "dunk" },
  { name: "step-back", kind: "mid" },
];

const DUNKS = ["windmill", "eastbay", "between the legs", "tomahawk", "statue", "cradle", "180", "alley-oop"];

export function castFromGame(game: GameResult): NightCast {
  return { seed: game.seed || 1, lines: pool(game.box.home.concat(game.box.away)) };
}

export function castFromSeries(series: SeriesResult): NightCast {
  const map = new Map<string, { pts: number; sec: number }>();
  for (const game of series.games) {
    for (const line of game.box.home.concat(game.box.away)) {
      const cur = map.get(line.playerId) ?? { pts: 0, sec: 0 };
      cur.pts += line.pts;
      cur.sec += line.sec;
      map.set(line.playerId, cur);
    }
  }
  const seed = series.games[0]?.seed ?? 1;
  return {
    seed: mixSeed(seed, series.id),
    lines: [...map.entries()].filter(([, row]) => row.sec > 0).map(([playerId, row]) => ({ playerId, ...row })),
  };
}

export function playAfter(cast: NightCast, kind: AfterKind, salt = 0): AfterResult {
  const seats = seatsOf(cast);
  const rng = mulberry32(mixSeed(cast.seed || 1, `${kind}:${salt}`));
  if (seats.length < 2) {
    const title = AFTER_KINDS.find((item) => item.id === kind)?.title ?? "After";
    return { kind, title, winner: "Nobody", line: "Not enough players stayed on the floor.", rows: [] };
  }
  if (kind === "horse") return horse(seats, rng);
  if (kind === "rack") return rack(seats, rng);
  if (kind === "stripe") return stripe(seats, rng);
  if (kind === "poster") return poster(seats, rng);
  if (kind === "circuit") return circuit(seats, rng);
  return buzzer(seats, rng);
}

function pool(lines: BoxLine[]): NightCast["lines"] {
  return lines.filter((line) => line.sec > 0).map((line) => ({ playerId: line.playerId, pts: line.pts, sec: line.sec }));
}

function seatsOf(cast: NightCast): Seat[] {
  const rows: Seat[] = [];
  for (const line of cast.lines) {
    const player = playerById(line.playerId);
    if (player && line.sec > 0) rows.push({ player, pts: line.pts, sec: line.sec });
  }
  return rows;
}

function take(rows: Seat[], count: number, score: (seat: Seat) => number): Seat[] {
  return rows
    .slice()
    .sort((a, b) => score(b) - score(a) || b.pts - a.pts || a.player.name.localeCompare(b.player.name))
    .slice(0, count);
}

function clamp(lo: number, hi: number, n: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function chance(player: Player, kind: "three" | "logo" | "ft" | "mid" | "dunk"): number {
  const r = player.ratings;
  if (kind === "three") return clamp(0.22, 0.64, 0.26 + (r.three - 70) * 0.008);
  if (kind === "logo") return clamp(0.08, 0.42, 0.08 + (r.three - 74) * 0.006);
  if (kind === "ft") return clamp(0.55, 0.94, 0.58 + (r.ft - 70) * 0.008);
  if (kind === "dunk") return clamp(0.42, 0.94, 0.38 + (r.ath - 70) * 0.011);
  return clamp(0.34, 0.78, 0.38 + (r.shot - 70) * 0.007);
}

function letters(n: number): string {
  return n === 0 ? "clear" : "HORSE".slice(0, n);
}

function horse(seats: Seat[], rng: () => number): AfterResult {
  const pair = take(seats, 2, (seat) => seat.pts);
  const taken = [0, 0];
  let caller = 0;
  const beats: string[] = [];
  for (let n = 0; n < 16 && taken[0] < 5 && taken[1] < 5; n++) {
    const call = CALLS[n % CALLS.length];
    const offense = pair[caller];
    const defense = pair[1 - caller];
    if (rng() < chance(offense.player, call.kind)) {
      if (rng() < chance(defense.player, call.kind)) {
        beats.push(`${offense.player.name} hit the ${call.name}. ${defense.player.name} matched it.`);
      } else {
        taken[1 - caller] += 1;
        beats.push(`${offense.player.name} hit the ${call.name}. ${defense.player.name} missed the copy and takes ${letters(taken[1 - caller])}.`);
      }
    } else {
      beats.push(`${offense.player.name} missed the ${call.name}. No letter.`);
      caller = 1 - caller;
    }
  }
  const winner = taken[0] === taken[1] ? (rng() < 0.5 ? 0 : 1) : taken[0] < taken[1] ? 0 : 1;
  const loser = 1 - winner;
  return {
    kind: "horse",
    title: "Horse",
    winner: pair[winner].player.name,
    line: `${pair[winner].player.name} leaves ${pair[loser].player.name} on ${letters(taken[loser])}. ${beats.at(-1) ?? ""}`,
    rows: pair.map((seat, index) => ({
      name: seat.player.name,
      playerId: seat.player.id,
      score: letters(taken[index]),
      detail: `${seat.pts} pts in the game`,
    })),
  };
}

function rack(seats: Seat[], rng: () => number): AfterResult {
  const field = take(seats, Math.min(4, seats.length), (seat) => seat.player.ratings.three * 2 + seat.pts);
  const rows = field.map((seat) => {
    let score = 0;
    let money = 0;
    const make = clamp(0.28, 0.7, 0.36 + (seat.player.ratings.three - 78) * 0.005);
    for (let i = 0; i < 25; i++) {
      const last = i % 5 === 4;
      if (rng() < make - (last ? 0.04 : 0)) {
        score += last ? 2 : 1;
        if (last) money += 1;
      }
    }
    return { seat, score, money };
  });
  rows.sort((a, b) => b.score - a.score || b.money - a.money || a.seat.player.name.localeCompare(b.seat.player.name));
  const winner = rows[0];
  return {
    kind: "rack",
    title: "The Rack",
    winner: winner.seat.player.name,
    line: `${winner.seat.player.name} puts up ${winner.score}. Money ball ${winner.money} of 5.`,
    rows: rows.map((row) => ({
      name: row.seat.player.name,
      playerId: row.seat.player.id,
      score: String(row.score),
      detail: `money ${row.money}/5`,
    })),
  };
}

function stripe(seats: Seat[], rng: () => number): AfterResult {
  const pair = take(seats, 2, (seat) => seat.pts + seat.player.ratings.ft);
  const made = [0, 0];
  const tried = [0, 0];
  let turn = 0;
  for (let shots = 0; shots < 48; shots++) {
    tried[turn] += 1;
    if (rng() < chance(pair[turn].player, "ft")) made[turn] += 1;
    turn = 1 - turn;
    if (tried[0] !== tried[1]) continue;
    const settled = made[0] !== made[1];
    const reached = made[0] >= 7 || made[1] >= 7;
    if (settled && (reached || tried[0] >= 12)) break;
    if (tried[0] >= 20) break;
  }
  const winner = made[0] === made[1] ? (pair[0].player.ratings.ft >= pair[1].player.ratings.ft ? 0 : 1) : made[0] > made[1] ? 0 : 1;
  const sudden = tried[0] > 12;
  return {
    kind: "stripe",
    title: "The Stripe",
    winner: pair[winner].player.name,
    line: `${pair[winner].player.name} takes the stripe${sudden ? " in sudden death" : ""}. ${pair[0].player.name} ${made[0]} of ${tried[0]}, ${pair[1].player.name} ${made[1]} of ${tried[1]}.`,
    rows: pair.map((seat, index) => ({
      name: seat.player.name,
      playerId: seat.player.id,
      score: `${made[index]}-${tried[index]}`,
      detail: `free throw ${seat.player.ratings.ft}`,
    })),
  };
}

function dunkGrade(score: number): string {
  if (score >= 48) return "perfect";
  if (score >= 44) return "violent";
  if (score >= 40) return "clean";
  if (score >= 36) return "held";
  return "shook";
}

function poster(seats: Seat[], rng: () => number): AfterResult {
  const pair = take(seats, 2, (seat) => seat.player.ratings.ath * 2 + seat.pts);
  const rows = pair.map((seat) => {
    const dunks = [0, 1, 2].map(() => {
      const name = DUNKS[Math.floor(rng() * DUNKS.length)];
      const score = Math.round(clamp(30, 50, 33 + (seat.player.ratings.ath - 78) * 0.42 + rng() * 10));
      return { name, score };
    });
    const total = dunks.reduce((sum, dunk) => sum + dunk.score, 0);
    return { seat, dunks, total };
  });
  rows.sort((a, b) => b.total - a.total || b.seat.player.ratings.ath - a.seat.player.ratings.ath);
  const winner = rows[0];
  return {
    kind: "poster",
    title: "The Poster",
    winner: winner.seat.player.name,
    line: `${winner.seat.player.name} takes the poster, ${winner.total}. Last dunk: ${winner.dunks[2].name}, ${dunkGrade(winner.dunks[2].score)}.`,
    rows: rows.map((row) => ({
      name: row.seat.player.name,
      playerId: row.seat.player.id,
      score: String(row.total),
      detail: row.dunks.map((dunk) => `${dunk.name} ${dunk.score}`).join(" · "),
    })),
  };
}

function station(base: number, rng: () => number): number {
  return Math.round(clamp(4, 20, base + rng() * 6));
}

function circuit(seats: Seat[], rng: () => number): AfterResult {
  const field = take(seats, Math.min(4, seats.length), (seat) => seat.player.ratings.play * 1.4 + seat.player.ratings.ath * 0.4 + seat.pts * 0.2);
  const rows = field.map((seat) => {
    const r = seat.player.ratings;
    const handle = station(7 + (r.play - 74) * 0.26, rng);
    const pass = station(7 + (r.play - 76) * 0.24, rng);
    const finish = station(7 + ((r.ath + r.shot) / 2 - 76) * 0.24, rng);
    return { seat, handle, pass, finish, total: handle + pass + finish };
  });
  rows.sort((a, b) => b.total - a.total || a.seat.player.name.localeCompare(b.seat.player.name));
  return {
    kind: "circuit",
    title: "The Circuit",
    winner: rows[0].seat.player.name,
    line: `${rows[0].seat.player.name} runs the circuit in ${rows[0].total}. Handle, pass, finish.`,
    rows: rows.map((row) => ({
      name: row.seat.player.name,
      playerId: row.seat.player.id,
      score: String(row.total),
      detail: `handle ${row.handle} · pass ${row.pass} · finish ${row.finish}`,
    })),
  };
}

function buzzer(seats: Seat[], rng: () => number): AfterResult {
  const pair = take(seats, 2, (seat) => seat.pts + seat.player.ratings.clutch);
  const marks = pair.map((seat) => {
    const make = clamp(0.28, 0.72, 0.32 + (seat.player.ratings.clutch - 70) * 0.008);
    return [0, 1, 2, 3, 4].map((index) => {
      const late = index === 4 ? 0.04 : 0;
      return rng() < make - late;
    });
  });
  const totals = marks.map((row) => row.filter(Boolean).length);
  let winner = totals[0] === totals[1] ? (marks[0][4] === marks[1][4] ? (rng() < 0.5 ? 0 : 1) : marks[0][4] ? 0 : 1) : totals[0] > totals[1] ? 0 : 1;
  if (totals[0] === totals[1] && marks[0][4] !== marks[1][4]) winner = marks[0][4] ? 0 : 1;
  const paint = (row: boolean[]) => row.map((made) => (made ? "make" : "miss")).join(" ");
  return {
    kind: "buzzer",
    title: "Buzzer",
    winner: pair[winner].player.name,
    line: `${pair[winner].player.name} hits ${totals[winner]} of 5 with the clock dying.${totals[0] === totals[1] ? " The last shot breaks it." : ""}`,
    rows: pair.map((seat, index) => ({
      name: seat.player.name,
      playerId: seat.player.id,
      score: `${totals[index]}/5`,
      detail: paint(marks[index]),
    })),
  };
}
