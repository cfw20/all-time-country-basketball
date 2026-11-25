import { PLAYERS, rosterOf, teamById } from "../data";
import { minuteTarget } from "../data/ratings";
import type {
  Awards,
  Contest,
  ContestEntry,
  GameResult,
  GroupStanding,
  Player,
  Pos,
  Tournament,
} from "../data/types";
import { simulateGame, type SideInput } from "./game";
import { buildNews } from "./news";
import { mixSeed, mulberry32, shuffle } from "./rng";

export const STAGE_LABELS = [
  "Draw",
  "Group day 1",
  "Group day 2",
  "Group day 3",
  "The interval",
  "Round of 16",
  "Quarterfinals",
  "Semifinals",
  "Final night",
];

const VENUES = [
  "Lampblack Dome, Lisbon",
  "The Copper Vault, Milan",
  "Northglass, Montreal",
  "Amber Hall, Vilnius",
  "Riverside Bowl, Rosario",
  "Sable Arena, Marseille",
  "The Long House, Lagos",
  "Cinder Court, Istanbul",
  "White Harbor, Split",
  "Orchard Roof, Melbourne",
  "King's Meridian, Madrid",
  "Blackpine Field, Belgrade",
  "The Salt Arch, Athens",
  "Harbor Nine, San Juan",
  "Red Kiln, Munich",
  "The Quiet Coliseum, Rome",
];

const GROUP_DAYS: [number, number][][] = [
  [[0, 3], [1, 2]],
  [[0, 2], [3, 1]],
  [[0, 1], [2, 3]],
];

export interface SimOptions {
  through?: number;
  log?: boolean;
  exhibitions?: boolean;
}

export function teamPower(teamId: string): number {
  let score = 0;
  for (const player of rosterOf(teamId)) {
    const minutes = minuteTarget(player) / 36;
    const bump = player.role === "star" ? 1.16 : player.role === "starter" ? 1.05 : 1;
    score += player.ratings.ovr * minutes * bump;
  }
  return score;
}

export function simulateTournament(seed: number, options: SimOptions = {}): Tournament {
  const through = options.through ?? 8;
  const log = options.log !== false;
  const exhibitions = options.exhibitions !== false;
  const ranking = rankTeams();
  const seedOf = new Map(ranking.map((row) => [row.teamId, row.seed]));
  const groups = drawGroups(seed, ranking.map((row) => row.teamId));
  const games: GameResult[] = [];

  const days = Math.min(3, through);
  for (let day = 0; day < days; day++) {
    for (const group of groups) {
      for (let p = 0; p < GROUP_DAYS[day].length; p++) {
        const [i, j] = GROUP_DAYS[day][p];
        const a = group.teamIds[i];
        const b = group.teamIds[j];
        const [awayId, homeId] = betterHome(a, b, seedOf);
        const id = `g${day + 1}-${group.id}-${p}`;
        games.push(playGame({
          id,
          round: `group-${day + 1}`,
          roundLabel: "Group stage",
          dayLabel: `Group day ${day + 1}`,
          seed: mixSeed(seed, id),
          awayId,
          homeId,
          log,
        }));
      }
    }
  }

  let allStar: GameResult | null = null;
  let allStarRosters: Tournament["allStarRosters"] = null;
  let three: Contest | null = null;
  let dunk: Contest | null = null;
  if (through >= 4 && exhibitions && days === 3) {
    const built = buildExhibitions(seed, games);
    allStar = built.allStar;
    allStarRosters = built.rosters;
    three = built.three;
    dunk = built.dunk;
  }

  if (through >= 5 && days === 3) {
    const tables = new Map(groups.map((g) => [g.id, standingsFor(g.teamIds, games)]));
    const top = (letter: string, place: number) => tables.get(letter)![place].teamId;
    const r16pairs: [string, string][] = [
      [top("A", 0), top("B", 1)],
      [top("C", 0), top("D", 1)],
      [top("E", 0), top("F", 1)],
      [top("G", 0), top("H", 1)],
      [top("B", 0), top("A", 1)],
      [top("D", 0), top("C", 1)],
      [top("F", 0), top("E", 1)],
      [top("H", 0), top("G", 1)],
    ];
    r16pairs.forEach((pair, index) => {
      const [awayId, homeId] = betterHome(pair[0], pair[1], seedOf);
      const id = `r16-${index}`;
      games.push(playGame({
        id, round: "r16", roundLabel: "Round of 16", dayLabel: "Round of 16",
        seed: mixSeed(seed, id), awayId, homeId, log,
      }));
    });
    if (through >= 6) playRound(games, seed, log, seedOf, "qf", "Quarterfinals", "Quarterfinals", [0, 1, 2, 3, 4, 5, 6, 7], "r16");
    if (through >= 7) playRound(games, seed, log, seedOf, "sf", "Semifinals", "Semifinals", [0, 1, 2, 3], "qf");
    if (through >= 8) {
      const sf0 = games.find((g) => g.id === "sf-0")!;
      const sf1 = games.find((g) => g.id === "sf-1")!;
      const [awayF, homeF] = betterHome(sf0.winnerId, sf1.winnerId, seedOf);
      games.push(playGame({
        id: "final", round: "final", roundLabel: "Final", dayLabel: "Final night",
        seed: mixSeed(seed, "final"), awayId: awayF, homeId: homeF, log,
      }));
      const [awayT, homeT] = betterHome(sf0.loserId, sf1.loserId, seedOf);
      games.push(playGame({
        id: "third", round: "third", roundLabel: "Third place", dayLabel: "Final night",
        seed: mixSeed(seed, "third"), awayId: awayT, homeId: homeT, log,
      }));
    }
  }

  const finishes = through >= 8 ? assignFinishes(games, groups) : {};
  const awards = through >= 8 ? computeAwards(games, finishes) : null;
  const news = buildNews({ games, seedOf, allStar, three, dunk, finishes });
  return { seed, through, ranking, groups, games, allStar, allStarRosters, three, dunk, awards, news, finishes };
}

export function standingsFor(teamIds: string[], games: GameResult[]): GroupStanding[] {
  const rows = new Map<string, GroupStanding>();
  for (const id of teamIds) rows.set(id, { teamId: id, w: 0, l: 0, pf: 0, pa: 0, h2h: {} });
  for (const game of games) {
    if (!game.round.startsWith("group")) continue;
    if (!rows.has(game.homeId) || !rows.has(game.awayId)) continue;
    const home = rows.get(game.homeId)!;
    const away = rows.get(game.awayId)!;
    home.pf += game.homeScore;
    home.pa += game.awayScore;
    away.pf += game.awayScore;
    away.pa += game.homeScore;
    if (game.winnerId === home.teamId) {
      home.w += 1;
      away.l += 1;
      home.h2h[away.teamId] = (home.h2h[away.teamId] ?? 0) + 1;
    } else {
      away.w += 1;
      home.l += 1;
      away.h2h[home.teamId] = (away.h2h[home.teamId] ?? 0) + 1;
    }
  }
  const list = [...rows.values()];
  const byWins = new Map<number, GroupStanding[]>();
  for (const row of list) {
    const bucket = byWins.get(row.w) ?? [];
    bucket.push(row);
    byWins.set(row.w, bucket);
  }
  const ordered: GroupStanding[] = [];
  for (const wins of [...byWins.keys()].sort((a, b) => b - a)) {
    const tied = byWins.get(wins)!;
    tied.sort((a, b) => {
      if (tied.length === 2) {
        const edge = (a.h2h[b.teamId] ?? 0) - (b.h2h[a.teamId] ?? 0);
        if (edge !== 0) return -edge;
      }
      const diff = b.pf - b.pa - (a.pf - a.pa);
      if (diff !== 0) return diff;
      if (b.pf !== a.pf) return b.pf - a.pf;
      return teamPower(b.teamId) - teamPower(a.teamId);
    });
    ordered.push(...tied);
  }
  return ordered;
}

function rankTeams(): Tournament["ranking"] {
  return [...teamIds()]
    .map((teamId) => ({ teamId, power: teamPower(teamId) }))
    .sort((a, b) => b.power - a.power)
    .map((row, index) => ({ ...row, seed: index + 1 }));
}

function teamIds(): string[] {
  return ["cont","vngd","aftr","pall","lant","nrth","oro","roya","eagl","fire","alps","ambr","ordr","plat","auri","sun","iron","atlr","grns","crsc","fueg","quis","tera","gate","peak","cauc","brdg","drgn","arch","flve","oliv","nvsk"];
}

function drawGroups(seed: number, ranked: string[]): Tournament["groups"] {
  const rng = mulberry32(seed);
  const groups = "ABCDEFGH".split("").map((id) => ({ id, teamIds: [] as string[] }));
  for (let pot = 0; pot < 4; pot++) {
    const slice = shuffle(ranked.slice(pot * 8, pot * 8 + 8), rng);
    slice.forEach((teamId, index) => groups[index].teamIds.push(teamId));
  }
  return groups;
}

function betterHome(a: string, b: string, seedOf: Map<string, number>): [string, string] {
  const sa = seedOf.get(a) ?? 99;
  const sb = seedOf.get(b) ?? 99;
  return sa <= sb ? [b, a] : [a, b];
}

function playGame(input: {
  id: string;
  round: string;
  roundLabel: string;
  dayLabel: string;
  seed: number;
  awayId: string;
  homeId: string;
  log: boolean;
}): GameResult {
  return simulateGame({
    id: input.id,
    round: input.round,
    roundLabel: input.roundLabel,
    dayLabel: input.dayLabel,
    venue: VENUES[mixSeed(input.seed, input.id) % VENUES.length],
    seed: input.seed,
    away: sideOf(input.awayId),
    home: sideOf(input.homeId),
    log: input.log,
  });
}

function sideOf(teamId: string): SideInput {
  const team = teamById(teamId);
  return { id: team.id, name: team.name, pace: team.pace, players: rosterOf(team.id) };
}

function playRound(
  games: GameResult[],
  seed: number,
  log: boolean,
  seedOf: Map<string, number>,
  round: string,
  label: string,
  day: string,
  indexes: number[],
  prev: string,
) {
  for (let i = 0; i < indexes.length; i += 2) {
    const g1 = games.find((g) => g.id === `${prev}-${indexes[i]}`)!;
    const g2 = games.find((g) => g.id === `${prev}-${indexes[i + 1]}`)!;
    const id = `${round}-${i / 2}`;
    const [awayId, homeId] = betterHome(g1.winnerId, g2.winnerId, seedOf);
    games.push(playGame({ id, round, roundLabel: label, dayLabel: day, seed: mixSeed(seed, id), awayId, homeId, log }));
  }
}

function assignFinishes(games: GameResult[], groups: Tournament["groups"]): Record<string, number> {
  const finishes: Record<string, number> = {};
  const final = games.find((g) => g.id === "final");
  const third = games.find((g) => g.id === "third");
  if (!final || !third) return finishes;
  finishes[final.winnerId] = 1;
  finishes[final.loserId] = 2;
  finishes[third.winnerId] = 3;
  finishes[third.loserId] = 4;
  const rankedLosers = (round: string, start: number) => {
    const losers = games
      .filter((g) => g.round === round)
      .map((g) => ({ id: g.loserId, margin: Math.abs(g.homeScore - g.awayScore) }))
      .sort((a, b) => a.margin - b.margin);
    losers.forEach((row, index) => {
      finishes[row.id] = start + index;
    });
  };
  rankedLosers("qf", 5);
  rankedLosers("r16", 9);
  const alive = new Set(Object.keys(finishes));
  const rest = groups
    .flatMap((g) => standingsFor(g.teamIds, games))
    .filter((row) => !alive.has(row.teamId))
    .sort((a, b) => b.w - a.w || b.pf - b.pa - (a.pf - a.pa) || b.pf - a.pf);
  rest.forEach((row, index) => {
    finishes[row.teamId] = 17 + index;
  });
  return finishes;
}

function computeAwards(games: GameResult[], finishes: Record<string, number>): Awards {
  const acc = new Map<string, { pts: number; reb: number; ast: number; stl: number; blk: number; tov: number; sec: number; gs: number; g: number; teamId: string }>();
  for (const game of games) {
    for (const [teamId, lines] of [[game.homeId, game.box.home], [game.awayId, game.box.away]] as const) {
      for (const line of lines) {
        const row = acc.get(line.playerId) ?? { pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, tov: 0, sec: 0, gs: 0, g: 0, teamId };
        row.pts += line.pts;
        row.reb += line.orb + line.drb;
        row.ast += line.ast;
        row.stl += line.stl;
        row.blk += line.blk;
        row.tov += line.tov;
        row.sec += line.sec;
        row.g += 1;
        if (line.started) row.gs += 1;
        acc.set(line.playerId, row);
      }
    }
  }
  const scoreOf = (id: string) => {
    const row = acc.get(id);
    if (!row || row.sec < 60) return -1;
    let score = row.pts + row.reb * 1.15 + row.ast * 1.45 + row.stl * 1.35 + row.blk * 1.25 - row.tov * 0.7;
    const finish = finishes[row.teamId] ?? 24;
    if (finish === 1) score *= 1.12;
    else if (finish === 2) score *= 1.06;
    else if (finish <= 4) score *= 1.03;
    return score;
  };
  const ranked = [...acc.keys()].sort((a, b) => scoreOf(b) - scoreOf(a));
  const mvpId = ranked[0];
  const final = games.find((g) => g.id === "final")!;
  const champLines = final.winnerId === final.homeId ? final.box.home : final.box.away;
  const finalsMvpId = champLines.slice().sort((a, b) => (b.pts + b.orb + b.drb + b.ast * 1.2) - (a.pts + a.orb + a.drb + a.ast * 1.2))[0]?.playerId ?? mvpId;
  const dpoyId = [...acc.keys()].sort((a, b) => defScore(b, acc) - defScore(a, acc))[0] ?? mvpId;
  const sixthId = ranked.find((id) => {
    const row = acc.get(id)!;
    return row.g > 0 && row.gs * 2 <= row.g && row.sec > 120;
  }) ?? ranked[1] ?? mvpId;
  const breakoutId = [...acc.keys()].sort((a, b) => breakout(b, acc) - breakout(a, acc))[0] ?? mvpId;
  const used = new Set<string>();
  const firstTeam = takeFive(ranked, used);
  const secondTeam = takeFive(ranked, used);
  return { mvpId, finalsMvpId, dpoyId, sixthId, breakoutId, firstTeam, secondTeam };
}

function defScore(id: string, acc: Map<string, { stl: number; blk: number; reb: number; sec: number }>): number {
  const row = acc.get(id);
  const player = PLAYERS.find((p) => p.id === id);
  if (!row || !player || row.sec < 240) return -1;
  return row.stl * 1.7 + row.blk * 1.6 + row.reb * 0.25 + player.ratings.def * (row.sec / 60) * 0.05;
}

function breakout(id: string, acc: Map<string, { pts: number; sec: number }>): number {
  const row = acc.get(id);
  const player = PLAYERS.find((p) => p.id === id);
  if (!row || !player || row.sec < 300 || player.ratings.ovr > 90) return -1;
  const per36 = (row.pts / (row.sec / 60)) * 36;
  const expected = (player.ratings.ovr - 68) * 0.62;
  return (per36 - expected) * Math.sqrt(row.sec / 60);
}

function takeFive(ranked: string[], used: Set<string>): string[] {
  const picked: string[] = [];
  const need = { G: 1, W: 1, B: 1 };
  const consider = (require: boolean) => {
    for (const id of ranked) {
      if (picked.length >= 5) return;
      if (used.has(id)) continue;
      const player = PLAYERS.find((p) => p.id === id);
      if (!player) continue;
      const b = band(player.pos);
      if (require && need[b] <= 0) continue;
      picked.push(id);
      used.add(id);
      if (need[b] > 0) need[b] -= 1;
      if (require && need.G + need.W + need.B === 0) return;
    }
  };
  consider(true);
  consider(false);
  return picked;
}

function band(pos: Pos): "G" | "W" | "B" {
  if (pos === "PG" || pos === "SG") return "G";
  if (pos === "SF") return "W";
  return "B";
}

function buildExhibitions(seed: number, games: GameResult[]) {
  const totals = new Map<string, number>();
  for (const game of games) {
    for (const line of game.box.home.concat(game.box.away)) {
      const value = line.pts + (line.orb + line.drb) * 1.1 + line.ast * 1.4 + line.stl + line.blk;
      totals.set(line.playerId, (totals.get(line.playerId) ?? 0) + value);
    }
  }
  for (const [id, value] of totals) {
    const player = PLAYERS.find((item) => item.id === id);
    if (player) totals.set(id, value + player.ratings.ovr * 1.35);
  }
  const ranked = [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => PLAYERS.find((p) => p.id === id)!).filter(Boolean);
  const captainA = ranked[0];
  const captainB = ranked.find((p) => p.teamId !== captainA.teamId) ?? ranked[1];
  const a: Player[] = [captainA];
  const b: Player[] = [captainB];
  const taken = new Set([captainA.id, captainB.id]);
  let side = 1;
  let guard = 0;
  while ((a.length < 12 || b.length < 12) && guard < 400) {
    guard += 1;
    const list = side === 0 ? a : b;
    if (list.length >= 12) {
      side = 1 - side;
      continue;
    }
    const counts = countBands(list);
    const choice = ranked.find((p) => !taken.has(p.id) && counts[band(p.pos)] < 5) ?? ranked.find((p) => !taken.has(p.id));
    if (!choice) break;
    list.push(choice);
    taken.add(choice.id);
    side = 1 - side;
  }
  const snubs = PLAYERS
    .filter((player) => player.ratings.ovr >= 97 && !taken.has(player.id))
    .sort((a, b) => b.ratings.ovr - a.ratings.ovr)
    .slice(0, 4);
  for (const god of snubs) {
    const host = [a, b].sort((left, right) => weakestOvr(left, captainA.id, captainB.id) - weakestOvr(right, captainA.id, captainB.id))[0];
    const weakest = host
      .filter((player) => player.id !== captainA.id && player.id !== captainB.id)
      .sort((left, right) => left.ratings.ovr - right.ratings.ovr)[0];
    if (!weakest || weakest.ratings.ovr >= god.ratings.ovr) continue;
    host[host.indexOf(weakest)] = god;
    taken.delete(weakest.id);
    taken.add(god.id);
  }
  const allStar = simulateGame({
    id: "all-star",
    round: "allstar",
    roundLabel: "All-Star",
    dayLabel: "The interval",
    venue: "Lampblack Dome, Lisbon",
    seed: mixSeed(seed, "all-star"),
    away: { id: "light-b", name: "Second Light", pace: 1.05, players: b },
    home: { id: "light-a", name: "First Light", pace: 1.05, players: a },
    log: true,
    defNerf: 5,
    exhibition: true,
  });
  const three = simThree(seed, ranked);
  const dunk = simDunk(seed);
  return { allStar, rosters: { a: a.map((p) => p.id), b: b.map((p) => p.id), captainA: captainA.id, captainB: captainB.id }, three, dunk };
}

function weakestOvr(list: Player[], captainA: string, captainB: string): number {
  const pool = list.filter((player) => player.id !== captainA && player.id !== captainB);
  if (!pool.length) return 99;
  return Math.min(...pool.map((player) => player.ratings.ovr));
}

function countBands(list: Player[]): Record<"G" | "W" | "B", number> {
  const counts = { G: 0, W: 0, B: 0 };
  for (const p of list) counts[band(p.pos)] += 1;
  return counts;
}

function simThree(seed: number, ranked: Player[]): Contest {
  const usa = new Set(["cont", "vngd", "aftr", "pall"]);
  const pool = PLAYERS.filter((p) => p.ratings.three >= 78 && p.ratings.threeRate >= 28)
    .sort((a, b) => b.ratings.three - a.ratings.three);
  const field: Player[] = [];
  for (const p of pool) {
    if (field.length >= 5) break;
    field.push(p);
  }
  for (const p of pool) {
    if (field.length >= 8) break;
    if (usa.has(p.teamId) || field.includes(p)) continue;
    field.push(p);
  }
  for (const p of pool) {
    if (field.length >= 8) break;
    if (!field.includes(p)) field.push(p);
  }
  void ranked;
  const rng = mulberry32(mixSeed(seed, "three"));
  const shoot = (p: Player) => {
    let score = 0;
    const pMake = Math.max(0.28, Math.min(0.7, 0.4 + (p.ratings.three - 80) * 0.0045));
    for (let i = 0; i < 25; i++) {
      const money = i % 5 === 4;
      if (rng() < pMake - (money ? 0.04 : 0)) score += money ? 2 : 1;
    }
    return score;
  };
  const round1: ContestEntry[] = field.map((p) => ({ playerId: p.id, scores: [shoot(p)], total: 0 }));
  for (const row of round1) row.total = row.scores[0];
  round1.sort((a, b) => b.total - a.total);
  const finalists = round1.slice(0, 3).map((row) => {
    const player = PLAYERS.find((p) => p.id === row.playerId)!;
    const extra = shoot(player);
    return { playerId: row.playerId, scores: [row.scores[0], extra], total: extra };
  });
  finalists.sort((a, b) => b.total - a.total || b.scores[0] - a.scores[0]);
  return { kind: "three", title: "Three-point contest", field: round1, finalists, winnerId: finalists[0].playerId };
}

function simDunk(seed: number): Contest {
  const usa = new Set(["cont", "vngd", "aftr", "pall"]);
  const pool = PLAYERS.filter((p) => p.ratings.ath >= 84).sort((a, b) => b.ratings.ath - a.ratings.ath);
  const fieldPlayers: Player[] = [];
  for (const p of pool) {
    if (fieldPlayers.length >= 5) break;
    fieldPlayers.push(p);
  }
  for (const p of pool) {
    if (fieldPlayers.length >= 8) break;
    if (!usa.has(p.teamId) && !fieldPlayers.includes(p)) fieldPlayers.push(p);
  }
  for (const p of pool) {
    if (fieldPlayers.length >= 8) break;
    if (!fieldPlayers.includes(p)) fieldPlayers.push(p);
  }
  const rng = mulberry32(mixSeed(seed, "dunk"));
  const dunkScore = (p: Player) => Math.round(Math.max(30, Math.min(50, 34 + (p.ratings.ath - 80) * 0.38 + rng() * 9)));
  const round1: ContestEntry[] = fieldPlayers.map((p) => {
    const scores = [dunkScore(p), dunkScore(p)];
    return { playerId: p.id, scores, total: scores[0] + scores[1] };
  });
  round1.sort((a, b) => b.total - a.total);
  const finalists = round1.slice(0, 2).map((row) => {
    const player = PLAYERS.find((p) => p.id === row.playerId)!;
    const scores = [dunkScore(player), dunkScore(player)];
    return { playerId: row.playerId, scores, total: scores[0] + scores[1] };
  });
  finalists.sort((a, b) => b.total - a.total);
  return { kind: "dunk", title: "Dunk contest", field: round1, finalists, winnerId: finalists[0].playerId };
}

export interface TrialSummary {
  seed: number;
  championId: string;
  runnerUpId: string;
  thirdId: string;
  fourthId: string;
  finals: string;
  mvpId: string;
  finalsMvpId: string;
  dpoyId: string;
  sixthId: string;
  breakoutId: string;
  teams: { id: string; finish: number; seed: number; wins: number; losses: number }[];
}

export function summarizeTournament(tournament: Tournament): TrialSummary {
  const final = tournament.games.find((g) => g.id === "final")!;
  const awards = tournament.awards!;
  const record = new Map<string, { w: number; l: number }>();
  for (const game of tournament.games) {
    for (const id of [game.homeId, game.awayId]) {
      const row = record.get(id) ?? { w: 0, l: 0 };
      if (id === game.winnerId) row.w += 1;
      else row.l += 1;
      record.set(id, row);
    }
  }
  return {
    seed: tournament.seed,
    championId: final.winnerId,
    runnerUpId: final.loserId,
    thirdId: tournament.games.find((g) => g.id === "third")!.winnerId,
    fourthId: tournament.games.find((g) => g.id === "third")!.loserId,
    finals: `${final.winnerId === final.homeId ? final.homeScore : final.awayScore}–${final.winnerId === final.homeId ? final.awayScore : final.homeScore}`,
    mvpId: awards.mvpId,
    finalsMvpId: awards.finalsMvpId,
    dpoyId: awards.dpoyId,
    sixthId: awards.sixthId,
    breakoutId: awards.breakoutId,
    teams: tournament.ranking.map((row) => ({
      id: row.teamId,
      finish: tournament.finishes[row.teamId] ?? 32,
      seed: row.seed,
      wins: record.get(row.teamId)?.w ?? 0,
      losses: record.get(row.teamId)?.l ?? 0,
    })),
  };
}

export function simulateTrial(seed: number): TrialSummary {
  return summarizeTournament(simulateTournament(seed, { through: 8, log: false, exhibitions: false }));
}
