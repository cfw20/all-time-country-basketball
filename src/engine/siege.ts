import { CONCORD_ID, CONCORD_TEAM, CONSTRUCT_ID, PLAYERS, rosterOf, teamById } from "../data";
import type { GameResult, Player, Pos, Role, SeriesResult, Siege } from "../data/types";
import type { SideInput } from "./game";
import { playSeries } from "./series";

const SIEGE_FLOORS = [
  "The Glass Meridian, Reykjavík",
  "The White Circuit, Vienna",
  "The Open Ring, Cairo",
  "The Amber Vault, Vilnius",
  "The Quiet Court, Kyoto",
  "The Salt Archive, Dakar",
  "The Violet Dock, Lisbon",
];

export function siegeGames(siege: Siege | null | undefined): GameResult[] {
  if (!siege) return [];
  return [siege.arrival, siege.gate, siege.restoration].flatMap((series) => series?.games ?? []);
}

export function playSiege(input: {
  seed: number;
  through: number;
  log: boolean;
  games: GameResult[];
  opponentId: string;
  championId?: string;
}): Siege {
  const arrival = playMatch({
    id: "arrival",
    round: "arrival",
    roundLabel: "Arrival",
    dayLabel: "The arrival",
    venues: ["The Glass Meridian, Reykjavík", ...SIEGE_FLOORS],
    seed: input.seed,
    log: input.log,
    home: sideOf(input.opponentId),
    away: constructSide(),
  });
  if (input.through < 9 || !input.championId) {
    return { arrival, gate: null, restoration: null, concordIds: [], threatEnded: false };
  }
  const gate = playMatch({
    id: "gate",
    round: "gate",
    roundLabel: "The gate",
    dayLabel: "The siege",
    venues: ["The White Circuit, Vienna", ...SIEGE_FLOORS],
    seed: input.seed,
    log: input.log,
    home: sideOf(input.championId),
    away: constructSide(),
  });
  const concord = buildConcord(input.games);
  const restoration = playMatch({
    id: "restoration",
    round: "restoration",
    roundLabel: "The restoration",
    dayLabel: "The siege",
    venues: ["The Open Ring, Cairo", ...SIEGE_FLOORS],
    seed: input.seed,
    log: input.log,
    home: constructSide(),
    away: concordSide(concord),
  });
  return {
    arrival,
    gate,
    restoration,
    concordIds: concord.map((player) => player.id),
    threatEnded: restoration.winnerId === CONCORD_ID,
  };
}

function playMatch(input: {
  id: string;
  round: string;
  roundLabel: string;
  dayLabel: string;
  venues: string[];
  seed: number;
  log: boolean;
  home: SideInput;
  away: SideInput;
}): SeriesResult {
  return playSeries({
    id: input.id,
    round: input.round,
    roundLabel: input.roundLabel,
    dayLabel: input.dayLabel,
    seed: input.seed,
    log: input.log,
    venues: input.venues,
    home: input.home,
    away: input.away,
    exhibition: true,
  });
}

function sideOf(teamId: string): SideInput {
  const team = teamById(teamId);
  return { id: team.id, name: team.name, pace: team.pace, players: rosterOf(team.id) };
}

function constructSide(): SideInput {
  const team = teamById(CONSTRUCT_ID);
  return { id: team.id, name: team.name, pace: team.pace, players: rosterOf(team.id) };
}

function concordSide(players: Player[]): SideInput {
  return { id: CONCORD_ID, name: CONCORD_TEAM.name, pace: CONCORD_TEAM.pace, players };
}

/**
 * Twelve real primes. Opening five come one per position, with at most three
 * from any country in that line. The full night allows five from one country.
 */
export function buildConcord(games: GameResult[]): Player[] {
  const score = new Map<string, number>();
  const played = new Map<string, number>();
  for (const game of games) {
    if (game.exhibition) continue;
    for (const line of game.box.home.concat(game.box.away)) {
      const value = line.pts + (line.orb + line.drb) * 1.1 + line.ast * 1.3 + line.stl + line.blk;
      score.set(line.playerId, (score.get(line.playerId) ?? 0) + value);
      played.set(line.playerId, (played.get(line.playerId) ?? 0) + 1);
    }
  }
  const rank = (player: Player) => {
    const gamesPlayed = played.get(player.id) ?? 0;
    const prod = gamesPlayed ? (score.get(player.id) ?? 0) / gamesPlayed : 0;
    return player.ratings.ovr * 1.8 + prod * 0.15;
  };
  const pool = PLAYERS.filter((player) => player.teamId !== CONSTRUCT_ID)
    .slice()
    .sort((a, b) => rank(b) - rank(a) || a.name.localeCompare(b.name));
  const counts = new Map<string, number>();
  const nation = (player: Player) => player.nationality;
  const room = (player: Player, limit: number) => (counts.get(nation(player)) ?? 0) < limit;
  const take = (player: Player) => counts.set(nation(player), (counts.get(nation(player)) ?? 0) + 1);
  const used = new Set<string>();
  const starters: Player[] = [];
  const slots: Pos[] = ["PG", "SG", "SF", "PF", "C"];
  for (const slot of slots) {
    const fits = (player: Player) => !used.has(player.id) && (player.pos === slot || player.pos2 === slot);
    const choice = pool.find((player) => fits(player) && room(player, 3))
      ?? pool.find((player) => fits(player) && room(player, 5));
    if (!choice) continue;
    starters.push(choice);
    used.add(choice.id);
    take(choice);
  }
  const rest: Player[] = [];
  for (const player of pool) {
    if (starters.length + rest.length >= 12) break;
    if (used.has(player.id) || !room(player, 5)) continue;
    rest.push(player);
    used.add(player.id);
    take(player);
  }
  return starters.concat(rest).map(dress);
}

function dress(player: Player, index: number): Player {
  const role: Role = index < 5 ? "star" : index < 9 ? "starter" : "rotation";
  return {
    ...player,
    ratings: { ...player.ratings },
    role,
    contract: "standard",
    starts: index < 5,
  };
}
