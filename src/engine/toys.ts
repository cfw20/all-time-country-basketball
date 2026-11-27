import { playerById } from "../data";
import type { Player, Pos } from "../data/types";
import { shuffle } from "./rng";
import { clamp, humans, nightRng, notables, sideName } from "./night";

/** Instant nights from the book. A seed and a salt. No full game. */

export interface ToyRow {
  playerId: string;
  name: string;
  score: number;
  detail: string;
  tag?: string;
}

export interface ToyNight {
  winner: string;
  winnerId: string;
  score: number;
  scoreLine: string;
  line: string;
  rows: ToyRow[];
  log?: string[];
  cap?: number;
}

export const CUT_SPOTS: Pos[] = ["PG", "SG", "SF", "PF", "C"];

export const CUT_RULE = {
  shootBonus: 18,
  defBonus: 18,
  handleBonus: 14,
  threeAt: 90,
  defAt: 92,
  playAt: 86,
};

type Skill = "shot" | "three" | "play" | "reb" | "def" | "ath" | "ft";

const BIASES: { skill: Skill; label: string }[] = [
  { skill: "def", label: "defense" },
  { skill: "shot", label: "the shot" },
  { skill: "play", label: "the handle" },
  { skill: "reb", label: "the glass" },
  { skill: "three", label: "the three" },
  { skill: "ath", label: "athleticism" },
  { skill: "ft", label: "the line" },
];

const ARC_BANDS = [
  { name: "1955–69", from: 1955, to: 1969 },
  { name: "1970s", from: 1970, to: 1979 },
  { name: "1980s", from: 1980, to: 1989 },
  { name: "1990s", from: 1990, to: 1999 },
  { name: "2000s", from: 2000, to: 2009 },
  { name: "2010s", from: 2010, to: 2019 },
  { name: "2020s", from: 2020, to: 2026 },
];

export interface FiveGrade {
  score: number;
  bonus: number;
  ovr: number;
}

export interface CutSeat {
  playerId: string;
  name: string;
  pos: Pos;
  ovr: number;
  arch: string;
  side: string;
}

export interface CutBoard {
  cap: number;
  bias: string;
  seats: CutSeat[];
  bookIds: string[];
  bookNames: string[];
  bookScore: number;
  bookBonus: number;
  bookOvr: number;
}

function row(player: Player, score: number, detail: string, tag?: string): ToyRow {
  return { playerId: player.id, name: player.name, score, detail, tag };
}

function place(rows: ToyRow[], winnerId: string): ToyRow[] {
  return rows.slice().sort((a, b) => b.score - a.score || Number(b.playerId === winnerId) - Number(a.playerId === winnerId) || a.name.localeCompare(b.name));
}

function ftChance(player: Player): number {
  return clamp(0.58 + (player.ratings.ft - 78) * 0.007, 0.48, 0.93);
}

function threeChance(player: Player): number {
  return clamp(0.4 + (player.ratings.three - 84) * 0.008, 0.26, 0.7);
}

function midChance(player: Player): number {
  return clamp(0.42 + (player.ratings.shot - 82) * 0.006, 0.32, 0.72);
}

function versus(offense: Player, defense: Player): number {
  return clamp(0.46 + (offense.ratings.shot - 80) * 0.004 + (offense.ratings.ath - 80) * 0.002 - (defense.ratings.def - 80) * 0.0035, 0.34, 0.66);
}

function jobScore(player: Player): number {
  const ratings = player.ratings;
  const job = player.pos === "PG" ? ratings.play
    : player.pos === "SG" ? (ratings.shot + ratings.three) / 2
    : player.pos === "SF" ? (ratings.def + ratings.ath) / 2
    : (ratings.reb + ratings.def) / 2;
  return Math.round(ratings.ovr * 0.65 + job * 0.85 + ratings.def * 0.15);
}

export function gradeFive(players: Player[]): FiveGrade {
  const ovr = players.reduce((sum, player) => sum + player.ratings.ovr, 0);
  const base = players.reduce((sum, player) => sum + jobScore(player), 0);
  let bonus = 0;
  if (players.some((player) => player.arch === "shooter" || player.arch === "stretch" || player.ratings.three >= CUT_RULE.threeAt)) bonus += CUT_RULE.shootBonus;
  if (players.some((player) => player.arch === "defender" || player.ratings.def >= CUT_RULE.defAt)) bonus += CUT_RULE.defBonus;
  if (players.some((player) => player.pos === "PG" && player.ratings.play >= CUT_RULE.playAt)) bonus += CUT_RULE.handleBonus;
  return { score: base + bonus, bonus, ovr };
}

export function gradeCut(ids: string[], cap: number): { ok: boolean; ovr: number; grade: FiveGrade | null } {
  const players = ids.map((id) => playerById(id)).filter((player): player is Player => Boolean(player));
  const ovr = players.reduce((sum, player) => sum + player.ratings.ovr, 0);
  const spots = new Set(players.map((player) => player.pos));
  const ok = players.length === 5 && CUT_SPOTS.every((pos) => spots.has(pos)) && ovr <= cap;
  return { ok, ovr, grade: ok ? gradeFive(players) : null };
}

function countLegal(groups: Player[][], cap: number): number {
  let count = 0;
  const walk = (index: number, ovr: number) => {
    if (ovr > cap) return;
    if (index === groups.length) {
      count += 1;
      return;
    }
    for (const player of groups[index]) walk(index + 1, ovr + player.ratings.ovr);
  };
  walk(0, 0);
  return count;
}

function bestOnBias(groups: Player[][], cap: number, bias: Skill): Player[] {
  let best: Player[] | null = null;
  let bestKey = -1;
  let bestName = "";
  const walk = (index: number, acc: Player[], ovr: number) => {
    if (ovr > cap) return;
    if (index === groups.length) {
      const key = acc.reduce((sum, player) => sum + player.ratings[bias], 0);
      const name = acc.map((player) => player.name).join("|");
      if (!best || key > bestKey || (key === bestKey && name < bestName)) {
        best = acc.slice();
        bestKey = key;
        bestName = name;
      }
      return;
    }
    for (const player of groups[index]) walk(index + 1, acc.concat(player), ovr + player.ratings.ovr);
  };
  walk(0, [], 0);
  if (!best) throw new Error("no five fits the cap");
  return best;
}

function drawSpot(pool: Player[], pos: Pos, rng: () => number): Player[] {
  const primary = pool.filter((player) => player.pos === pos);
  const drawn = shuffle(primary, rng).slice(0, 4);
  if (drawn.length < 4) throw new Error(`cut short at ${pos}`);
  return drawn.sort((a, b) => b.ratings.ovr - a.ratings.ovr || a.name.localeCompare(b.name));
}

export function cutBoard(seed: number, salt = 0): CutBoard {
  const rng = nightRng(seed, salt, "cut");
  const pool = humans();
  const groups = CUT_SPOTS.map((pos) => drawSpot(pool, pos, rng));
  const cheap = groups.reduce((sum, group) => sum + Math.min(...group.map((player) => player.ratings.ovr)), 0);
  const dear = groups.reduce((sum, group) => sum + Math.max(...group.map((player) => player.ratings.ovr)), 0);
  let cap = cheap === dear ? cheap : Math.round(cheap + (dear - cheap) * 0.42);
  let guard = 0;
  while (cap > cheap && countLegal(groups, cap) > 320 && guard < 50) {
    cap -= 1;
    guard += 1;
  }
  while (cap < dear && countLegal(groups, cap) < 10 && guard < 100) {
    cap += 1;
    guard += 1;
  }
  const bias = BIASES[Math.floor(rng() * BIASES.length)];
  const book = bestOnBias(groups, cap, bias.skill);
  const grade = gradeFive(book);
  return {
    cap,
    bias: bias.label,
    seats: groups.flatMap((group) => group.map((player) => ({
      playerId: player.id,
      name: player.name,
      pos: player.pos,
      ovr: player.ratings.ovr,
      arch: player.arch,
      side: sideName(player),
    }))),
    bookIds: book.map((player) => player.id),
    bookNames: book.map((player) => player.name),
    bookScore: grade.score,
    bookBonus: grade.bonus,
    bookOvr: grade.ovr,
  };
}

export function playCut(seed: number, salt = 0): ToyNight {
  const board = cutBoard(seed, salt);
  const rows = board.bookIds.map((id) => {
    const seat = board.seats.find((item) => item.playerId === id);
    if (!seat) throw new Error("book five left the pool");
    return { playerId: id, name: seat.name, score: seat.ovr, detail: `${seat.pos} · ${seat.arch} · ${seat.side}` };
  });
  return {
    winner: "The book",
    winnerId: board.bookIds[0] ?? "",
    score: board.bookScore,
    scoreLine: String(board.bookScore),
    line: `Cap ${board.cap}. The book chased ${board.bias} and filed ${board.bookNames.join(", ")} for ${board.bookScore}.`,
    rows,
    cap: board.cap,
  };
}

export function playShootaround(seed: number, salt = 0): ToyNight {
  const rng = nightRng(seed, salt, "shootaround");
  const eligible = humans().filter((player) => player.ratings.ovr >= 86);
  const field = shuffle(eligible.length >= 6 ? eligible : humans(), rng).slice(0, 6);
  if (field.length < 6) throw new Error("shootaround short");
  const stations = field.map((player) => ({
    player,
    mid: Array.from({ length: 5 }, () => rng() < midChance(player)).filter(Boolean).length,
    three: Array.from({ length: 5 }, () => rng() < threeChance(player)).filter(Boolean).length,
    line: Array.from({ length: 5 }, () => rng() < ftChance(player)).filter(Boolean).length,
    extra: 0,
  }));
  const total = (item: (typeof stations)[number]) => item.mid + item.three + item.line + item.extra;
  let guard = 0;
  while (guard < 18) {
    const top = Math.max(...stations.map(total));
    const leaders = stations.filter((item) => total(item) === top);
    if (leaders.length <= 1) break;
    guard += 1;
    let hits = 0;
    for (const leader of leaders) {
      if (rng() < threeChance(leader.player)) {
        leader.extra += 1;
        hits += 1;
      }
    }
    if (hits > 0 && hits < leaders.length) break;
  }
  const top = Math.max(...stations.map(total));
  let leaders = stations.filter((item) => total(item) === top);
  let broke = false;
  if (leaders.length > 1) {
    broke = true;
    leaders = leaders.slice().sort((a, b) => b.player.ratings.three - a.player.ratings.three || a.player.name.localeCompare(b.player.name));
  }
  const winner = leaders[0];
  const rows = place(stations.map((item) => row(
    item.player,
    total(item),
    `mid ${item.mid}/5 · three ${item.three}/5 · line ${item.line}/5${item.extra ? ` · +${item.extra}` : ""} · ${sideName(item.player)}`,
  )), winner.player.id);
  const next = rows.find((item) => item.playerId !== winner.player.id);
  return {
    winner: winner.player.name,
    winnerId: winner.player.id,
    score: total(winner),
    scoreLine: `${total(winner)} makes`,
    line: broke
      ? `${winner.player.name} finished level at ${total(winner)}. The three on the card broke the tie.`
      : `${winner.player.name} made ${total(winner)}. ${next ? `${next.name} made ${next.score}.` : ""}`.trim(),
    rows,
  };
}

export function playLadder(seed: number, salt = 0): ToyNight {
  const rng = nightRng(seed, salt, "ladder");
  const eligible = humans().filter((player) => player.ratings.ovr >= 84);
  const field = shuffle(eligible.length >= 8 ? eligible : humans(), rng).slice(0, 8);
  if (field.length < 2) throw new Error("ladder short");
  const makes = new Map(field.map((player) => [player.id, 0]));
  let alive = field.slice();
  const log: string[] = [];
  let blanks = 0;
  let rung = 0;
  while (alive.length > 1 && rung < 16) {
    rung += 1;
    const hitters = alive.filter((player) => rng() < ftChance(player));
    if (hitters.length === 0) {
      blanks += 1;
      log.push(`Rung ${rung}: nobody made it.`);
      if (blanks >= 4) break;
      continue;
    }
    blanks = 0;
    for (const player of hitters) makes.set(player.id, (makes.get(player.id) ?? 0) + 1);
    if (hitters.length === alive.length) {
      log.push(`Rung ${rung}: all ${alive.length} made it.`);
      continue;
    }
    const out = alive.filter((player) => !hitters.includes(player));
    log.push(`Rung ${rung}: out ${out.map((player) => player.name).join(", ")}.`);
    alive = hitters;
  }
  let extra = 0;
  while (alive.length > 1 && extra < 24) {
    extra += 1;
    const hitters = alive.filter((player) => rng() < ftChance(player));
    if (hitters.length === 0 || hitters.length === alive.length) continue;
    for (const player of hitters) makes.set(player.id, (makes.get(player.id) ?? 0) + 1);
    alive = hitters;
    log.push(`Sudden death: ${alive.map((player) => player.name).join(", ")} still in.`);
  }
  let broke = false;
  if (alive.length > 1) {
    broke = true;
    alive = alive.slice().sort((a, b) => b.ratings.ft - a.ratings.ft || a.name.localeCompare(b.name)).slice(0, 1);
  }
  const winner = alive[0];
  const score = makes.get(winner.id) ?? 0;
  const rows = place(field.map((player) => row(player, makes.get(player.id) ?? 0, `${makes.get(player.id) ?? 0} cleared · ${sideName(player)}`)), winner.id);
  return {
    winner: winner.name,
    winnerId: winner.id,
    score,
    scoreLine: `${score} ${score === 1 ? "rung" : "rungs"}`,
    line: broke
      ? `${winner.name} finished level. The free-throw rating on the card broke the tie.`
      : `${winner.name} cleared ${score} ${score === 1 ? "rung" : "rungs"}.`,
    rows,
    log,
  };
}

export function playHalfcourt(seed: number, salt = 0): ToyNight {
  const rng = nightRng(seed, salt, "halfcourt");
  const pool = shuffle(notables().filter((player) => player.ratings.ovr >= 86), rng);
  const source = pool.length >= 2 ? pool : shuffle(notables(), rng);
  const first = source[0];
  const second = source.find((player) => player.id !== first?.id && player.pos !== first?.pos) ?? source.find((player) => player.id !== first?.id);
  if (!first || !second) throw new Error("halfcourt short");
  const pair = [first, second];
  const scores = [0, 0];
  const makes = [0, 0];
  let turn = rng() < 0.5 ? 0 : 1;
  const log = [`${pair[turn].name} starts with the ball.`];
  let plays = 0;
  while (scores[0] < 11 && scores[1] < 11 && plays < 40) {
    const offense = turn % 2;
    const defense = 1 - offense;
    if (rng() < versus(pair[offense], pair[defense])) {
      scores[offense] += 2;
      makes[offense] += 1;
      log.push(`${pair[offense].name} scores. ${pair[0].name} ${scores[0]}, ${pair[1].name} ${scores[1]}.`);
    } else {
      log.push(`${pair[defense].name} gets the stop.`);
    }
    turn += 1;
    plays += 1;
  }
  const winner = scores[0] === scores[1]
    ? (pair[0].ratings.shot === pair[1].ratings.shot ? (pair[0].name < pair[1].name ? 0 : 1) : (pair[0].ratings.shot > pair[1].ratings.shot ? 0 : 1))
    : (scores[0] > scores[1] ? 0 : 1);
  const loser = 1 - winner;
  const scoreLine = `${scores[winner]}–${scores[loser]}`;
  return {
    winner: pair[winner].name,
    winnerId: pair[winner].id,
    score: scores[winner],
    scoreLine,
    line: `${pair[winner].name} took the halfcourt, ${scoreLine}.`,
    rows: place(pair.map((player, index) => row(player, scores[index], `${makes[index]} baskets · ${sideName(player)}`)), pair[winner].id),
    log,
  };
}

export function playStreak(seed: number, salt = 0): ToyNight {
  const rng = nightRng(seed, salt, "streak");
  const ranked = humans().slice().sort((a, b) => b.ratings.three - a.ratings.three || a.name.localeCompare(b.name)).slice(0, 32);
  const field = shuffle(ranked, rng).slice(0, 4).map((player) => ({ player, makes: 0, misses: 0 }));
  if (field.length < 2) throw new Error("streak short");
  for (const heat of field) {
    for (let shot = 0; shot < 12; shot += 1) {
      if (rng() < threeChance(heat.player)) heat.makes += 1;
      else {
        heat.misses += 1;
        break;
      }
    }
  }
  let guard = 0;
  while (guard < 16) {
    const top = Math.max(...field.map((heat) => heat.makes));
    const leaders = field.filter((heat) => heat.makes === top);
    if (leaders.length <= 1) break;
    guard += 1;
    let hits = 0;
    for (const heat of leaders) {
      if (rng() < threeChance(heat.player)) {
        heat.makes += 1;
        hits += 1;
      } else heat.misses += 1;
    }
    if (hits > 0 && hits < leaders.length) break;
  }
  const top = Math.max(...field.map((heat) => heat.makes));
  let leaders = field.filter((heat) => heat.makes === top);
  let broke = false;
  if (leaders.length > 1) {
    broke = true;
    leaders = leaders.slice().sort((a, b) => b.player.ratings.three - a.player.ratings.three || a.player.name.localeCompare(b.player.name));
  }
  const winner = leaders[0];
  const marks = (makes: number, misses: number) => `${"●".repeat(makes)}${"○".repeat(Math.min(misses, 3))}`;
  const rows = place(field.map((heat) => row(heat.player, heat.makes, `${marks(heat.makes, heat.misses)} · ${sideName(heat.player)}`)), winner.player.id);
  const line = broke
    ? `${winner.player.name} finished level at ${winner.makes}. The three on the card broke the tie.`
    : winner.misses === 0
      ? `${winner.player.name} ran ${winner.makes} without a miss.`
      : `${winner.player.name} ran ${winner.makes} before a miss.`;
  return {
    winner: winner.player.name,
    winnerId: winner.player.id,
    score: winner.makes,
    scoreLine: `${winner.makes} in a row`,
    line,
    rows,
  };
}

export function playGlass(seed: number, salt = 0): ToyNight {
  const rng = nightRng(seed, salt, "glass");
  const bigs = humans().filter((player) => player.pos === "C" || player.pos === "PF" || player.pos2 === "C" || player.pos2 === "PF");
  const ranked = bigs.slice().sort((a, b) => (b.ratings.reb + b.ratings.def) - (a.ratings.reb + a.ratings.def) || a.name.localeCompare(b.name)).slice(0, 24);
  const pair = shuffle(ranked, rng).slice(0, 2);
  if (pair.length < 2) throw new Error("glass short");
  const boards = [0, 0];
  const blocks = [0, 0];
  const log: string[] = [];
  const playTrip = (shooter: number) => {
    const protector = 1 - shooter;
    const blockP = clamp(0.08 + (pair[protector].ratings.def - 80) * 0.005 + (pair[protector].ratings.ath - 80) * 0.002, 0.06, 0.38);
    if (rng() < blockP) {
      blocks[protector] += 1;
      log.push(`${pair[protector].name} blocks ${pair[shooter].name}.`);
      return;
    }
    const weight = (player: Player) => player.ratings.reb + player.ratings.ath * 0.15;
    const share = weight(pair[0]) / (weight(pair[0]) + weight(pair[1]));
    const taker = rng() < share ? 0 : 1;
    boards[taker] += 1;
    log.push(`${pair[taker].name} takes the board.`);
  };
  for (let trip = 0; trip < 10; trip += 1) playTrip(trip % 2);
  const glass = (index: number) => boards[index] + blocks[index] * 2;
  let extra = 0;
  while (glass(0) === glass(1) && extra < 8) {
    extra += 1;
    playTrip(extra % 2);
  }
  let winner = glass(0) === glass(1)
    ? ((pair[0].ratings.reb + pair[0].ratings.def) === (pair[1].ratings.reb + pair[1].ratings.def)
      ? (pair[0].name < pair[1].name ? 0 : 1)
      : ((pair[0].ratings.reb + pair[0].ratings.def) > (pair[1].ratings.reb + pair[1].ratings.def) ? 0 : 1))
    : (glass(0) > glass(1) ? 0 : 1);
  const loser = 1 - winner;
  const broke = glass(winner) === glass(loser);
  const scoreLine = `${glass(winner)}–${glass(loser)}`;
  return {
    winner: pair[winner].name,
    winnerId: pair[winner].id,
    score: glass(winner),
    scoreLine,
    line: broke
      ? `${pair[winner].name} finished level at ${glass(winner)}. Glass and defense on the card broke the tie.`
      : `${pair[winner].name} ${glass(winner)}, ${pair[loser].name} ${glass(loser)}. A block counts two.`,
    rows: place(pair.map((player, index) => row(player, glass(index), `${boards[index]} boards · ${blocks[index]} blocks · ${sideName(player)}`)), pair[winner].id),
    log,
  };
}

export function playCloser(seed: number, salt = 0): ToyNight {
  const rng = nightRng(seed, salt, "closer");
  const ranked = notables().slice().sort((a, b) => b.ratings.clutch - a.ratings.clutch || a.name.localeCompare(b.name)).slice(0, 28);
  const pair = shuffle(ranked, rng).slice(0, 2);
  if (pair.length < 2) throw new Error("closer short");
  const points = [0, 0];
  const makes = [0, 0];
  const log: string[] = [];
  const shoot = (index: number, extra: boolean) => {
    const player = pair[index];
    const three = rng() < (player.ratings.threeRate >= 32 || player.arch === "shooter" || player.arch === "stretch" ? 0.55 : 0.22);
    const worth = three ? 3 : 2;
    const skill = three ? player.ratings.three : player.ratings.shot;
    const chance = clamp(0.4 + (player.ratings.clutch - 84) * 0.008 + (skill - 84) * 0.004, 0.3, 0.78);
    const prefix = extra ? "Extra. " : "";
    if (rng() < chance) {
      points[index] += worth;
      makes[index] += 1;
      log.push(`${prefix}${player.name} hits the ${three ? "three" : "pull-up"} for ${worth}. ${points[0]}–${points[1]}.`);
    } else {
      log.push(`${prefix}${player.name} misses the ${three ? "three" : "pull-up"}.`);
    }
  };
  for (let trip = 0; trip < 5; trip += 1) {
    shoot(0, false);
    shoot(1, false);
  }
  let extra = 0;
  while (points[0] === points[1] && extra < 6) {
    extra += 1;
    shoot(0, true);
    shoot(1, true);
  }
  const winner = points[0] === points[1]
    ? (pair[0].ratings.clutch === pair[1].ratings.clutch ? (pair[0].name < pair[1].name ? 0 : 1) : (pair[0].ratings.clutch > pair[1].ratings.clutch ? 0 : 1))
    : (points[0] > points[1] ? 0 : 1);
  const loser = 1 - winner;
  const broke = points[0] === points[1];
  const scoreLine = `${points[winner]}–${points[loser]}`;
  return {
    winner: pair[winner].name,
    winnerId: pair[winner].id,
    score: points[winner],
    scoreLine,
    line: broke
      ? `${pair[winner].name} got the nod. Clutch on the card broke the tie, ${points[0]}–${points[1]}.`
      : `${pair[winner].name} closed it, ${scoreLine}.`,
    rows: pair.map((player, index) => row(
      player,
      points[index],
      `${makes[index]} makes`,
      `${player.pos} · ${player.primeYear} · ${sideName(player)}`,
    )),
    log,
  };
}

export function playArc(seed: number, salt = 0): ToyNight {
  const rng = nightRng(seed, salt, "arc");
  const shots = ARC_BANDS.flatMap((band) => {
    const pool = humans().filter((player) => player.primeYear >= band.from && player.primeYear <= band.to);
    if (!pool.length) return [];
    const ranked = pool.slice().sort((a, b) => b.ratings.three - a.ratings.three || a.name.localeCompare(b.name)).slice(0, 8);
    const player = shuffle(ranked, rng)[0];
    let makes = 0;
    for (let shot = 0; shot < 5; shot += 1) if (rng() < threeChance(player)) makes += 1;
    return [{ player, band: band.name, makes, extra: 0 }];
  });
  if (shots.length < 2) throw new Error("arc short");
  const total = (item: (typeof shots)[number]) => item.makes + item.extra;
  let guard = 0;
  while (guard < 18) {
    const top = Math.max(...shots.map(total));
    const leaders = shots.filter((item) => total(item) === top);
    if (leaders.length <= 1) break;
    guard += 1;
    let hits = 0;
    for (const leader of leaders) {
      if (rng() < threeChance(leader.player)) {
        leader.extra += 1;
        hits += 1;
      }
    }
    if (hits > 0 && hits < leaders.length) break;
  }
  const top = Math.max(...shots.map(total));
  let leaders = shots.filter((item) => total(item) === top);
  let broke = false;
  if (leaders.length > 1) {
    broke = true;
    leaders = leaders.slice().sort((a, b) => b.player.ratings.three - a.player.ratings.three || a.player.name.localeCompare(b.player.name));
  }
  const winner = leaders[0];
  const rows = shots.map((item) => row(
    item.player,
    total(item),
    `${item.band} · ${item.makes}/5${item.extra ? ` · +${item.extra}` : ""}`,
  ));
  return {
    winner: winner.player.name,
    winnerId: winner.player.id,
    score: total(winner),
    scoreLine: `${total(winner)} threes`,
    line: broke
      ? `${winner.player.name} finished level for the ${winner.band}. The three on the card broke the tie.`
      : `${winner.player.name} made ${total(winner)} for the ${winner.band}.`,
    rows,
  };
}

export const TOY_PLAYS = {
  shootaround: playShootaround,
  ladder: playLadder,
  halfcourt: playHalfcourt,
  cut: playCut,
  streak: playStreak,
  glass: playGlass,
  closer: playCloser,
  arc: playArc,
} as const;
