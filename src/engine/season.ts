import { ERA_TEAMS, type EraTeam, type EraTier } from "../data/eraTeams";
import { CONSTRUCT_ID, isConstructed, PLAYERS, playerById } from "../data";
import type { Player, Pos } from "../data/types";
import type { TrialSummary } from "./tournament";
import { simulateGame, type SideInput } from "./game";
import { mixSeed, mulberry32 } from "./rng";

export const ROSTER_SIZE = 12;
const HOME_FLOOR = "The Unbroken Floor";
const BOSS_NIGHTS = new Set([12, 33, 54, 75]);

const BY_NAME = new Map<string, Player>();
for (const player of PLAYERS) {
  if (isConstructed(player)) continue;
  if (BY_NAME.has(player.name)) throw new Error(`Two primes share the name ${player.name}`);
  BY_NAME.set(player.name, player);
}

export interface ResolvedEra extends Omit<EraTeam, "names"> {
  playerIds: string[];
}

export const ERA_CARDS: ResolvedEra[] = ERA_TEAMS.map((card) => {
  const playerIds = card.names.map((name) => {
    const player = BY_NAME.get(name);
    if (!player) throw new Error(`Era card ${card.id} names ${name}, who is not in the book`);
    return player.id;
  });
  const unique = new Set(playerIds);
  if (unique.size !== playerIds.length) throw new Error(`Era card ${card.id} lists a player twice`);
  return {
    id: card.id,
    era: card.era,
    franchise: card.franchise,
    years: card.years,
    tier: card.tier,
    anchor: card.anchor,
    arena: card.arena,
    pace: card.pace,
    line: card.line,
    playerIds,
  };
});

const CARD_BY_ID = new Map(ERA_CARDS.map((card) => [card.id, card]));
const HUMANS = PLAYERS.filter((player) => !isConstructed(player));

export function eraCard(id: string): ResolvedEra {
  const card = CARD_BY_ID.get(id);
  if (!card) throw new Error(`Unknown era card ${id}`);
  return card;
}

export function cardPlayers(card: ResolvedEra): Player[] {
  return card.playerIds
    .map((id) => playerById(id))
    .filter((player): player is Player => Boolean(player))
    .sort((a, b) => b.ratings.ovr - a.ratings.ovr || a.name.localeCompare(b.name));
}

export interface Charges {
  reroll: number;
  gilded: number;
  double: number;
  position: number;
  recall: number;
  banner: number;
}

export interface DrawnCard {
  cardId: string;
  charged: boolean;
  gilded: boolean;
}

export interface SeasonNight {
  n: number;
  cardId: string;
  opponent: string;
  us: number;
  them: number;
  win: boolean;
  seed: number;
  venue: string;
  home: boolean;
}

export interface YearRun {
  seed: number;
  rosterIds: string[];
  nonce: number;
  current: DrawnCard | null;
  picksOnCard: number;
  memoryIds: string[];
  charges: Charges;
  doubleArmed: boolean;
  nights: SeasonNight[] | null;
  bannerUsed: boolean;
}

export interface YearUnlock {
  open: boolean;
  championships: number;
  strikes: number;
  needChampionships: number;
  needStrikes: number;
}

const NEED_CHAMPIONSHIPS = 2;
const NEED_STRIKES = 1;

export function yearUnlock(trials: TrialSummary[]): YearUnlock {
  const championships = trials.length;
  const strikes = trials.filter((trial) => humanStruck(trial)).length;
  return {
    open: championships >= NEED_CHAMPIONSHIPS && strikes >= NEED_STRIKES,
    championships,
    strikes,
    needChampionships: NEED_CHAMPIONSHIPS,
    needStrikes: NEED_STRIKES,
  };
}

function humanStruck(trial: TrialSummary): boolean {
  return trial.threatEnded || trial.arrivalWinnerId !== CONSTRUCT_ID || trial.gateWinnerId !== CONSTRUCT_ID;
}

export function freshCharges(): Charges {
  return { reroll: 3, gilded: 2, double: 1, position: 2, recall: 1, banner: 1 };
}

export function startYear(seed: number): YearRun {
  const run: YearRun = {
    seed: seed >>> 0 || 1,
    rosterIds: [],
    nonce: 1,
    current: null,
    picksOnCard: 0,
    memoryIds: [],
    charges: freshCharges(),
    doubleArmed: false,
    nights: null,
    bannerUsed: false,
  };
  return drawInto(run, {});
}

export function rosterHole(ids: string[]): string | null {
  const players = ids.map((id) => playerById(id)).filter((player): player is Player => Boolean(player));
  const has = (pos: Pos) => players.some((player) => player.pos === pos || player.pos2 === pos);
  if (!has("PG")) return "a point guard";
  if (!has("C")) return "a center";
  return null;
}

export function yearReady(run: YearRun): boolean {
  return run.rosterIds.length >= 10 && !run.nights;
}

export function addPlayer(run: YearRun, playerId: string): YearRun {
  if (run.nights) return run;
  if (!run.current) return run;
  if (run.rosterIds.includes(playerId)) return run;
  if (run.rosterIds.length >= ROSTER_SIZE) return run;
  const card = eraCard(run.current.cardId);
  if (!card.playerIds.includes(playerId)) return run;
  const rosterIds = [...run.rosterIds, playerId];
  const picksOnCard = run.picksOnCard + 1;
  const allow = run.doubleArmed ? 2 : 1;
  const next: YearRun = { ...run, rosterIds, picksOnCard, memoryIds: run.memoryIds.filter((id) => id !== playerId) };
  if (picksOnCard < allow && eligibleIds(card, rosterIds).length > 0 && rosterIds.length < ROSTER_SIZE) return next;
  return closeAndDraw(next);
}

export function spendReroll(run: YearRun): YearRun {
  if (run.nights || !run.current) return run;
  const empty = eligibleIds(eraCard(run.current.cardId), run.rosterIds).length === 0;
  if (!empty && run.charges.reroll <= 0) return run;
  const others = ERA_CARDS.filter((card) => card.id !== run.current?.cardId && eligibleIds(card, run.rosterIds).length > 0);
  if (!empty && others.length === 0) return run;
  const spent = empty ? run.charges : { ...run.charges, reroll: run.charges.reroll - 1 };
  const next = rememberCard({ ...run, charges: spent });
  return drawInto({ ...next, doubleArmed: false, picksOnCard: 0 }, {});
}

export function spendGilded(run: YearRun): YearRun {
  if (run.nights || run.charges.gilded <= 0) return run;
  const myths = ERA_CARDS.filter((card) => card.tier === "myth" && eligibleIds(card, run.rosterIds).length > 0);
  if (myths.length === 0) return run;
  const base = run.current ? rememberCard(run) : run;
  return drawInto(
    { ...base, charges: { ...base.charges, gilded: base.charges.gilded - 1 }, doubleArmed: false, picksOnCard: 0 },
    { gilded: true },
  );
}

export function spendPosition(run: YearRun, position: Pos): YearRun {
  if (run.nights || run.charges.position <= 0) return run;
  const open = ERA_CARDS.filter((card) => eligibleIds(card, run.rosterIds).length > 0 && covers(card, position, run.rosterIds));
  if (open.length === 0) return run;
  const base = run.current ? rememberCard(run) : run;
  return drawInto(
    { ...base, charges: { ...base.charges, position: base.charges.position - 1 }, doubleArmed: false, picksOnCard: 0 },
    { position },
  );
}

export function armDouble(run: YearRun): YearRun {
  if (run.nights || run.doubleArmed || run.charges.double <= 0 || !run.current) return run;
  if (run.picksOnCard >= 2) return run;
  return { ...run, doubleArmed: true, charges: { ...run.charges, double: run.charges.double - 1 } };
}

export function recallPlayer(run: YearRun, playerId: string): YearRun {
  if (run.nights || run.charges.recall <= 0) return run;
  if (!run.memoryIds.includes(playerId) || run.rosterIds.includes(playerId)) return run;
  if (run.rosterIds.length >= ROSTER_SIZE) return run;
  const rosterIds = [...run.rosterIds, playerId];
  const next: YearRun = {
    ...run,
    rosterIds,
    memoryIds: run.memoryIds.filter((id) => id !== playerId),
    charges: { ...run.charges, recall: run.charges.recall - 1 },
  };
  if (rosterIds.length >= ROSTER_SIZE) return { ...next, current: null };
  return next;
}

export function playYear(run: YearRun): YearRun {
  if (run.nights || !yearReady(run)) return run;
  return { ...run, current: null, nights: simulateSeason(run.rosterIds, run.seed) };
}

export function bannerReplay(run: YearRun, nightIndex: number): YearRun {
  if (!run.nights || run.bannerUsed || run.charges.banner <= 0) return run;
  const night = run.nights[nightIndex];
  if (!night || night.win) return run;
  const seed = mixSeed(run.seed, `banner-${night.n}`);
  const replay = playNight(run.rosterIds, night.cardId, night.n, seed);
  const nights = run.nights.slice();
  if (replay.win) nights[nightIndex] = replay;
  return {
    ...run,
    nights,
    bannerUsed: true,
    charges: { ...run.charges, banner: run.charges.banner - 1 },
  };
}

export function watchNight(run: YearRun, nightIndex: number) {
  const night = run.nights?.[nightIndex];
  if (!night) return null;
  return playNightGame(run.rosterIds, night.cardId, night.n, night.seed, true);
}

export function seasonRecord(nights: SeasonNight[]): { wins: number; losses: number } {
  const wins = nights.filter((night) => night.win).length;
  return { wins, losses: nights.length - wins };
}

export function simulateSeason(rosterIds: string[], seed: number): SeasonNight[] {
  const nights: SeasonNight[] = [];
  for (let n = 1; n <= 82; n++) nights.push(playNight(rosterIds, opponentCardId(seed, n), n, mixSeed(seed, `night-${n}`)));
  return nights;
}

function playNight(rosterIds: string[], cardId: string, n: number, seed: number): SeasonNight {
  const game = playNightGame(rosterIds, cardId, n, seed, false);
  const home = n % 2 === 1;
  const us = home ? game.homeScore : game.awayScore;
  const them = home ? game.awayScore : game.homeScore;
  return {
    n,
    cardId,
    opponent: `${eraCard(cardId).years} ${eraCard(cardId).franchise}`,
    us,
    them,
    win: game.winnerId === "year",
    seed,
    venue: home ? HOME_FLOOR : eraCard(cardId).arena,
    home,
  };
}

function playNightGame(rosterIds: string[], cardId: string, n: number, seed: number, log: boolean) {
  const card = eraCard(cardId);
  const home = n % 2 === 1;
  const user = sideFrom(rosterIds, "year", "The Unbroken", 1);
  const foe = opponentSide(card, new Set(rosterIds), seed);
  return simulateGame({
    id: `year-${n}`,
    round: "season",
    roundLabel: "Regular season",
    dayLabel: `Night ${n}`,
    venue: home ? HOME_FLOOR : card.arena,
    seed,
    home: home ? user : foe,
    away: home ? foe : user,
    log,
    exhibition: true,
  });
}

function opponentCardId(seed: number, n: number): string {
  const tier: EraTier = BOSS_NIGHTS.has(n) ? "myth" : n % 5 === 0 ? "banner" : "solid";
  const pool = ERA_CARDS.filter((card) => card.tier === tier);
  const rng = mulberry32(mixSeed(seed, `opp-card-${n}`));
  return pool[Math.floor(rng() * pool.length)].id;
}

function opponentSide(card: ResolvedEra, exclude: Set<string>, seed: number): SideInput {
  const rng = mulberry32(mixSeed(seed, `pad-${card.id}`));
  const named = card.playerIds
    .map((id) => playerById(id))
    .filter((player): player is Player => player !== undefined && !exclude.has(player.id));
  const cap = card.tier === "myth" ? 88 : card.tier === "banner" ? 85 : 80;
  const fillers = HUMANS.filter((player) => {
    if (exclude.has(player.id) || named.some((pick) => pick.id === player.id)) return false;
    if (player.ratings.ovr < 74 || player.ratings.ovr > cap) return false;
    return Math.abs(player.primeYear - card.anchor) <= 8;
  });
  const shuffled = shuffle(fillers, rng);
  const picked = [...named];
  for (const player of shuffled) {
    if (picked.length >= 10) break;
    const covered = new Set(picked.flatMap((mate) => [mate.pos, mate.pos2].filter(Boolean)));
    const helps = !covered.has(player.pos);
    if (helps || picked.length >= 8) picked.push(player);
  }
  for (const player of shuffled) {
    if (picked.length >= 10) break;
    if (!picked.some((mate) => mate.id === player.id)) picked.push(player);
  }
  return {
    id: card.id,
    name: `${card.years} ${card.franchise}`,
    pace: card.pace,
    players: dress(picked.slice(0, 10)),
  };
}

function sideFrom(ids: string[], id: string, name: string, pace: number): SideInput {
  const players = ids.map((playerId) => playerById(playerId)).filter((player): player is Player => Boolean(player));
  return { id, name, pace, players: dress(players) };
}

function dress(players: Player[]): Player[] {
  const starters = pickFive(players);
  const rest = players.filter((player) => !starters.includes(player)).sort((a, b) => b.ratings.ovr - a.ratings.ovr);
  return [...starters, ...rest].map((player, index) => ({
    ...player,
    role: index < 2 ? "star" : index < 5 ? "starter" : index < 8 ? "rotation" : "deep",
    starts: index < 5,
    contract: "standard",
  }));
}

function pickFive(players: Player[]): Player[] {
  const slots: Pos[] = ["PG", "SG", "SF", "PF", "C"];
  const used = new Set<string>();
  const five: Player[] = [];
  for (const slot of slots) {
    const best = players
      .filter((player) => !used.has(player.id))
      .map((player) => ({ player, fit: fitScore(player, slot) }))
      .sort((a, b) => b.fit - a.fit || b.player.ratings.ovr - a.player.ratings.ovr)[0];
    if (best && best.fit > -20) {
      used.add(best.player.id);
      five.push(best.player);
    }
  }
  for (const player of [...players].sort((a, b) => b.ratings.ovr - a.ratings.ovr)) {
    if (five.length >= 5) break;
    if (used.has(player.id)) continue;
    used.add(player.id);
    five.push(player);
  }
  return five;
}

function fitScore(player: Player, slot: Pos): number {
  const order: Record<Pos, number> = { PG: 0, SG: 1, SF: 2, PF: 3, C: 4 };
  const score = (pos: Pos) => {
    const gap = Math.abs(order[pos] - order[slot]);
    if (gap === 0) return player.ratings.ovr + 8;
    if (gap === 1) return player.ratings.ovr;
    if (gap === 2) return player.ratings.ovr - 12;
    return -50;
  };
  return Math.max(score(player.pos), player.pos2 ? score(player.pos2) : -50);
}

function drawInto(run: YearRun, opts: { gilded?: boolean; position?: Pos }): YearRun {
  if (run.rosterIds.length >= ROSTER_SIZE) return { ...run, current: null };
  const rng = mulberry32(mixSeed(run.seed, `draw-${run.nonce}`));
  let pool = ERA_CARDS.filter((card) => eligibleIds(card, run.rosterIds).length > 0);
  let gilded = Boolean(opts.gilded);
  let charged = false;
  if (gilded) pool = pool.filter((card) => card.tier === "myth");
  if (opts.position) {
    const narrowed = pool.filter((card) => covers(card, opts.position as Pos, run.rosterIds));
    if (narrowed.length > 0) pool = narrowed;
  }
  if (!gilded && pool.some((card) => card.tier === "myth") && rng() < 0.16) {
    const myths = pool.filter((card) => card.tier === "myth");
    if (myths.length > 0) {
      pool = myths;
      charged = true;
    }
  }
  if (pool.length === 0) return { ...run, current: null, nonce: run.nonce + 1 };
  const card = weighted(pool, (item) => (gilded || charged ? 1 : item.tier === "myth" ? 1 : item.tier === "banner" ? 3 : 5), rng);
  return {
    ...run,
    nonce: run.nonce + 1,
    picksOnCard: 0,
    current: { cardId: card.id, charged, gilded },
  };
}

function closeAndDraw(run: YearRun): YearRun {
  const closed = rememberCard({ ...run, doubleArmed: false, picksOnCard: 0 });
  if (closed.rosterIds.length >= ROSTER_SIZE) return { ...closed, current: null };
  return drawInto(closed, {});
}

function rememberCard(run: YearRun): YearRun {
  if (!run.current) return run;
  const skipped = eligibleIds(eraCard(run.current.cardId), run.rosterIds);
  const memory = new Set(run.memoryIds);
  for (const id of skipped) memory.add(id);
  for (const id of run.rosterIds) memory.delete(id);
  return { ...run, memoryIds: [...memory] };
}

function eligibleIds(card: ResolvedEra, rosterIds: string[]): string[] {
  const have = new Set(rosterIds);
  return card.playerIds.filter((id) => !have.has(id));
}

function covers(card: ResolvedEra, position: Pos, rosterIds: string[]): boolean {
  return eligibleIds(card, rosterIds).some((id) => {
    const player = playerById(id);
    return player?.pos === position || player?.pos2 === position;
  });
}

function weighted<T>(items: T[], weight: (item: T) => number, rng: () => number): T {
  const total = items.reduce((sum, item) => sum + weight(item), 0);
  let mark = rng() * total;
  for (const item of items) {
    mark -= weight(item);
    if (mark <= 0) return item;
  }
  return items[items.length - 1];
}

function shuffle<T>(list: T[], rng: () => number): T[] {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const swap = copy[i];
    copy[i] = copy[j];
    copy[j] = swap;
  }
  return copy;
}
