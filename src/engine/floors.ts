import { PLAYERS, TEAMS, isConstructed, rosterOf, teamById } from "../data";
import type { GameResult, Player, Pos, SeriesResult } from "../data/types";
import { simulateGame, type SideInput } from "./game";
import { mixSeed, mulberry32 } from "./rng";
import { playSeries } from "./series";
import { teamPower } from "./tournament";

const VENUES = ["The Open Ring", "Lampblack Dome, Lisbon", "The Copper Vault, Milan", "Amber Hall, Vilnius", "The Reed Court", "Halcyon Floor"];

export interface NightGame {
  label: string;
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
  winnerName: string;
  note?: string;
  watch: () => GameResult;
}

export interface HillNight {
  games: NightGame[];
  king: string;
  longest: { name: string; games: number };
}

export interface GauntletNight {
  climber: string;
  games: NightGame[];
  cleared: number;
}

export interface TableNight {
  title: string;
  rows: { name: string; w: number; l: number; diff: number }[];
  games: NightGame[];
  champion: string;
  finalLabel?: string;
}

export interface OpenNight {
  rounds: { name: string; games: NightGame[] }[];
  champion: string;
}

export interface FiveNight {
  home: string[];
  away: string[];
  game: NightGame;
}

function humans(): string[] {
  return TEAMS.filter((team) => team.kind !== "construct").map((team) => team.id);
}

function shuffleIds(ids: string[], rng: () => number): string[] {
  const copy = ids.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const swap = copy[i];
    copy[i] = copy[j];
    copy[j] = swap;
  }
  return copy;
}

function country(id: string): SideInput {
  const team = teamById(id);
  return { id: team.id, name: team.name, pace: team.pace, players: rosterOf(team.id) };
}

function playOne(home: SideInput, away: SideInput, seed: number, label: string, note?: string): NightGame {
  const quiet = simulateGame({
    id: `floor-${seed}`,
    round: "floor",
    roundLabel: label,
    dayLabel: "Side floor",
    venue: VENUES[seed % VENUES.length],
    seed,
    home,
    away,
    log: false,
    exhibition: true,
  });
  return {
    label,
    homeName: quiet.homeName ?? home.name,
    awayName: quiet.awayName ?? away.name,
    homeScore: quiet.homeScore,
    awayScore: quiet.awayScore,
    winnerName: quiet.winnerId === home.id ? home.name : away.name,
    note,
    watch: () => simulateGame({
      id: `floor-${seed}`,
      round: "floor",
      roundLabel: label,
      dayLabel: "Side floor",
      venue: VENUES[seed % VENUES.length],
      seed,
      home,
      away,
      log: true,
      exhibition: true,
    }),
  };
}

export function playHill(seed: number): HillNight {
  const rng = mulberry32(mixSeed(seed, "hill"));
  const order = shuffleIds(humans(), rng);
  let king = order[0];
  const queue = [...order.slice(1, 8), "cstr"];
  const games: NightGame[] = [];
  const streak = new Map<string, number>();
  for (let i = 0; i < queue.length; i++) {
    const challenger = queue[i];
    const game = playOne(country(king), country(challenger), mixSeed(seed, `hill-${i}`), `Hill ${i + 1}`);
    games.push(game);
    const winner = game.winnerName === teamById(king).name ? king : challenger;
    streak.set(winner, (streak.get(winner) ?? 0) + 1);
    king = winner;
  }
  let longest = { name: teamById(king).name, games: 0 };
  for (const [id, gamesWon] of streak) {
    if (gamesWon > longest.games) longest = { name: teamById(id).name, games: gamesWon };
  }
  return { games, king: teamById(king).name, longest };
}

export function playGauntlet(seed: number): GauntletNight {
  const rng = mulberry32(mixSeed(seed, "gauntlet"));
  const ranked = [...humans()].sort((a, b) => teamPower(b) - teamPower(a));
  const rungs = [28, 22, 16, 10, 6, 1].map((index) => ranked[Math.min(index, ranked.length - 1)]);
  const blocked = new Set([...rungs, "cstr"]);
  const pool = shuffleIds(humans().filter((id) => !blocked.has(id)), rng);
  const climber = pool[0] ?? ranked[ranked.length - 1];
  const ladder = [...rungs, "cstr"];
  const games = ladder.map((id, index) => playOne(
    country(climber),
    country(id),
    mixSeed(seed, `gauntlet-${index}`),
    `Rung ${index + 1}`,
    teamById(id).name,
  ));
  let cleared = 0;
  for (const game of games) {
    if (game.winnerName !== teamById(climber).name) break;
    cleared += 1;
  }
  return { climber: teamById(climber).name, games, cleared };
}

const DECADES: { id: string; name: string; from: number; to: number }[] = [
  { id: "early", name: "1955–69", from: 1955, to: 1969 },
  { id: "70s", name: "The 1970s", from: 1970, to: 1979 },
  { id: "80s", name: "The 1980s", from: 1980, to: 1989 },
  { id: "90s", name: "The 1990s", from: 1990, to: 1999 },
  { id: "00s", name: "The 2000s", from: 2000, to: 2009 },
  { id: "10a", name: "2010–14", from: 2010, to: 2014 },
  { id: "10b", name: "2015–19", from: 2015, to: 2019 },
  { id: "20s", name: "The 2020s", from: 2020, to: 2026 },
];

function decadeSide(band: (typeof DECADES)[number]): SideInput {
  const pool = PLAYERS.filter((player) => !isConstructed(player) && player.primeYear >= band.from && player.primeYear <= band.to)
    .sort((a, b) => b.ratings.ovr - a.ratings.ovr);
  const starters: Player[] = [];
  for (const pos of ["PG", "SG", "SF", "PF", "C"] as Pos[]) {
    const hit = pool.find((player) => !starters.includes(player) && (player.pos === pos || player.pos2 === pos));
    if (hit) starters.push(hit);
  }
  for (const player of pool) {
    if (starters.length >= 5) break;
    if (!starters.includes(player)) starters.push(player);
  }
  const bench = pool.filter((player) => !starters.includes(player)).slice(0, 7);
  const dressed = [...starters, ...bench].map((player, index) => ({
    ...player,
    starts: index < starters.length,
    role: index < 5 ? "star" as const : index < 8 ? "starter" as const : "rotation" as const,
  }));
  return { id: band.id, name: band.name, pace: 1, players: dressed };
}

export function playDecade(seed: number): TableNight {
  const sides = DECADES.map(decadeSide);
  const rows = new Map(sides.map((side) => [side.id, { name: side.name, w: 0, l: 0, diff: 0 }]));
  const games: NightGame[] = [];
  let n = 0;
  for (let i = 0; i < sides.length; i++) {
    for (let j = i + 1; j < sides.length; j++) {
      const game = playOne(sides[i], sides[j], mixSeed(seed, `decade-${n}`), "Decade Cup");
      games.push(game);
      const home = rows.get(sides[i].id)!;
      const away = rows.get(sides[j].id)!;
      const margin = game.homeScore - game.awayScore;
      if (game.winnerName === sides[i].name) {
        home.w += 1;
        away.l += 1;
      } else {
        away.w += 1;
        home.l += 1;
      }
      home.diff += margin;
      away.diff -= margin;
      n += 1;
    }
  }
  const table = [...rows.values()].sort((a, b) => b.w - a.w || b.diff - a.diff);
  const first = sides.find((side) => side.name === table[0].name)!;
  const second = sides.find((side) => side.name === table[1].name)!;
  const final = playOne(first, second, mixSeed(seed, "decade-final"), "Decade final");
  return { title: "Decade Cup", rows: table, games: [...games, final], champion: final.winnerName, finalLabel: "The table is every decade once. The last night is the final." };
}

export function playOpen(seed: number): OpenNight {
  const rng = mulberry32(mixSeed(seed, "open"));
  let field = shuffleIds(humans(), rng).slice(0, 16).map(country);
  const rounds: OpenNight["rounds"] = [];
  const names = ["Round of 16", "Quarterfinals", "Semifinals", "The Open final"];
  let round = 0;
  while (field.length > 1) {
    const games: NightGame[] = [];
    const next: SideInput[] = [];
    for (let i = 0; i < field.length; i += 2) {
      const game = playOne(field[i], field[i + 1], mixSeed(seed, `open-${round}-${i}`), names[round] ?? "The Open");
      games.push(game);
      next.push(game.winnerName === field[i].name ? field[i] : field[i + 1]);
    }
    rounds.push({ name: names[round] ?? "Night", games });
    field = next;
    round += 1;
  }
  return { rounds, champion: field[0].name };
}

export function playFortnight(seed: number): TableNight & { series: SeriesResult } {
  const rng = mulberry32(mixSeed(seed, "fortnight"));
  const picked = shuffleIds(humans(), rng).slice(0, 6).map(country);
  const rows = new Map(picked.map((side) => [side.id, { name: side.name, w: 0, l: 0, diff: 0 }]));
  const games: NightGame[] = [];
  let n = 0;
  for (let i = 0; i < picked.length; i++) {
    for (let j = i + 1; j < picked.length; j++) {
      const game = playOne(picked[i], picked[j], mixSeed(seed, `fort-${n}`), "Fortnight");
      games.push(game);
      const home = rows.get(picked[i].id)!;
      const away = rows.get(picked[j].id)!;
      const margin = game.homeScore - game.awayScore;
      if (game.winnerName === picked[i].name) {
        home.w += 1;
        away.l += 1;
      } else {
        away.w += 1;
        home.l += 1;
      }
      home.diff += margin;
      away.diff -= margin;
      n += 1;
    }
  }
  const table = [...rows.values()].sort((a, b) => b.w - a.w || b.diff - a.diff);
  const home = picked.find((side) => side.name === table[0].name)!;
  const away = picked.find((side) => side.name === table[1].name)!;
  const series = playSeries({
    id: `fort-final-${seed}`,
    round: "fortnight",
    roundLabel: "Fortnight final",
    dayLabel: "Side floor",
    seed: mixSeed(seed, "fort-final"),
    log: false,
    venues: VENUES,
    home,
    away,
    exhibition: true,
  });
  return {
    title: "Fortnight",
    rows: table,
    games,
    champion: series.winnerId === home.id ? home.name : away.name,
    finalLabel: `${series.winnerId === home.id ? home.name : away.name} ${Math.max(series.homeWins, series.awayWins)}–${Math.min(series.homeWins, series.awayWins)}`,
    series,
  };
}

export function watchSeriesGame(series: SeriesResult, index: number): GameResult {
  const game = series.games[index];
  return simulateGame({
    id: game.id,
    round: series.round,
    roundLabel: series.roundLabel,
    dayLabel: "Side floor",
    venue: game.venue,
    seed: game.seed,
    home: country(game.homeId),
    away: country(game.awayId),
    log: true,
    exhibition: true,
  });
}

export function playSurvivor(seed: number): { rounds: { name: string; games: NightGame[]; out: string }[]; champion: string } {
  const rng = mulberry32(mixSeed(seed, "survivor"));
  let field = shuffleIds(humans(), rng).slice(0, 8).map(country);
  const rounds: { name: string; games: NightGame[]; out: string }[] = [];
  let n = 0;
  while (field.length > 2) {
    const order = shuffleIds(field.map((side) => side.id), rng).map((id) => field.find((side) => side.id === id)!);
    const games: NightGame[] = [];
    const played = new Set<string>();
    for (let i = 0; i + 1 < order.length; i += 2) {
      const game = playOne(order[i], order[i + 1], mixSeed(seed, `surv-${n}`), `Night ${rounds.length + 1}`);
      games.push(game);
      played.add(order[i].id);
      played.add(order[i + 1].id);
      n += 1;
    }
    let worstMargin = -1;
    let worstId = games.length ? field[0].id : "";
    for (const game of games) {
      const margin = Math.abs(game.homeScore - game.awayScore);
      const loserName = game.winnerName === game.homeName ? game.awayName : game.homeName;
      const loser = field.find((side) => side.name === loserName)!;
      if (margin > worstMargin) {
        worstMargin = margin;
        worstId = loser.id;
      }
    }
    const bye = field.find((side) => !played.has(side.id));
    if (bye && games.length === 0) break;
    field = field.filter((side) => side.id !== worstId);
    const gone = teamById(worstId).name;
    rounds.push({ name: `Night ${rounds.length + 1}`, games, out: gone });
  }
  const final = playOne(field[0], field[1], mixSeed(seed, "surv-final"), "Last night");
  rounds.push({
    name: "Last night",
    games: [final],
    out: final.winnerName === field[0].name ? field[1].name : field[0].name,
  });
  return { rounds, champion: final.winnerName };
}

function fiveFrom(pool: Player[], rng: () => number): Player[] {
  const bag = shuffleIds(pool.map((player) => player.id), rng).map((id) => pool.find((player) => player.id === id)!);
  const picked: Player[] = [];
  for (const pos of ["PG", "SG", "SF", "PF", "C"] as Pos[]) {
    const strong = bag.find((player) => !picked.includes(player) && player.ratings.ovr >= 84 && (player.pos === pos || player.pos2 === pos));
    const hit = strong ?? bag.find((player) => !picked.includes(player) && (player.pos === pos || player.pos2 === pos));
    if (hit) picked.push(hit);
  }
  return picked;
}

export function playFive(seed: number): FiveNight {
  const rng = mulberry32(mixSeed(seed, "five"));
  const humansOnly = PLAYERS.filter((player) => !isConstructed(player));
  const homePlayers = fiveFrom(humansOnly, rng);
  const used = new Set(homePlayers.map((player) => player.id));
  const awayPlayers = fiveFrom(humansOnly.filter((player) => !used.has(player.id)), rng);
  const dress = (players: Player[], id: string, name: string): SideInput => ({
    id,
    name,
    pace: 1,
    players: players.map((player) => ({ ...player, starts: true, role: "star" as const })),
  });
  const home = dress(homePlayers, "five-home", "First five");
  const away = dress(awayPlayers, "five-away", "Second five");
  return {
    home: homePlayers.map((player) => player.name),
    away: awayPlayers.map((player) => player.name),
    game: playOne(home, away, mixSeed(seed, "five-game"), "The Five"),
  };
}

