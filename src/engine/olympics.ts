import { CONSTRUCT_ID, PLAYERS, isConstructed, playerById, rosterOf, teamById, TEAMS } from "../data";
import type { GameResult, Player, Pos, SeriesResult } from "../data/types";
import { minuteTarget } from "../data/ratings";
import { type SideInput } from "./game";
import { mixSeed, mulberry32, shuffle } from "./rng";
import { ERA_CARDS, eraCard, freshCharges, yearUnlock, type Charges, type ResolvedEra } from "./season";
import { playSeries } from "./series";
import type { TrialSummary } from "./tournament";
import { teamPower } from "./tournament";

/** The rolled side is not a championship team. This id is absent from TEAMS. */
export const OLY_ID = "oly";
export const OLY_NAME = "The Rolled Side";
export const OLY_ROSTER = 12;
export const OLY_NAT_CAP = 3;
const CARD_SIZE = 4;
const COUNTRY_WINDOW = 10;
const COUNTRY_PICKS = 4;
const HOUSE_WINDOW = 8;
const HOUSE_PICKS = 2;
const VENUE = "The Olympic Floor";

const CHARGE_KEYS = ["reroll", "gilded", "double", "position", "recall", "banner"] as const;

export interface OlympicOffer {
  cardId: string | null;
  tier: ResolvedEra["tier"] | "book";
  franchise: string;
  years: string;
  line: string;
  /** Shuffled. The order is the luck. The user takes one. */
  playerIds: string[];
}

export interface OlympicBuild {
  seed: number;
  nonce: number;
  rosterIds: string[];
  offer: OlympicOffer | null;
  /** One free mulligan for the whole side. */
  mulligan: number;
  /** Snapshot of boosters already earned on the year. Spending them does not write the year save. */
  boosters: number;
}

export type OlympicRound = "qf" | "sf" | "gold";

export interface OlympicGameLine {
  n: number;
  homeId: string;
  awayId: string;
  homeScore: number;
  awayScore: number;
  winnerId: string;
}

export interface OlympicSeriesLine {
  id: string;
  round: OlympicRound;
  roundLabel: string;
  dayLabel: string;
  homeId: string;
  awayId: string;
  homeName: string;
  awayName: string;
  homeWins: number;
  awayWins: number;
  winnerId: string;
  loserId: string;
  games: OlympicGameLine[];
}

export interface OlympicSide {
  id: string;
  name: string;
  kind: "rolled" | "construct" | "country" | "overflow" | "homeland";
  power: number;
}

export interface OlympicMeet {
  seed: number;
  rosterIds: string[];
  field: OlympicSide[];
  series: OlympicSeriesLine[];
}

export interface OlympicVerdict {
  far: "gold" | "final" | "semifinal" | "quarterfinal";
  seriesWins: number;
  eliminatedBy: string | null;
  pointMargin: number;
  good: boolean;
  line: string;
}

/**
 * Same bar as the Unbroken Year, with one extra reading of the same trials:
 * a repeated seed counts once, the way the championship book already files draws.
 */
export function olympicsUnlock(trials: TrialSummary[]) {
  const seen = new Set<number>();
  const unique: TrialSummary[] = [];
  for (const trial of trials) {
    if (!trial) continue;
    if (typeof trial.seed === "number" && Number.isFinite(trial.seed)) {
      const seed = trial.seed >>> 0;
      if (seen.has(seed)) continue;
      seen.add(seed);
      unique.push(trial);
    } else {
      unique.push(trial);
    }
  }
  return yearUnlock(unique);
}

/** One sentence. Names the gap that is still in this browser. */
export function olympicsLockLine(unlock: ReturnType<typeof olympicsUnlock>): string {
  const champs = `${unlock.championships} championship${unlock.championships === 1 ? "" : "s"}`;
  const series = `${unlock.strikes} series`;
  const needChampionships = unlock.championships < unlock.needChampionships;
  const needStrikes = unlock.strikes < unlock.needStrikes;
  if (!needChampionships && !needStrikes) return "The Olympics are open.";
  if (needChampionships && needStrikes) {
    return `It opens after ${unlock.needChampionships} finished championships and a series taken from the Construct; this browser has ${champs} and ${series}.`;
  }
  if (needChampionships) {
    return `It opens after ${unlock.needChampionships} finished championships; this browser has ${champs} and already has a series taken from the Construct.`;
  }
  return `It opens after a series taken from the Construct; this browser has ${champs} and ${series} taken.`;
}

/** Boosters the year already earned. A fresh year's starting set does not count. */
export function earnedOlympicBoosters(relic: Charges | null, run: Charges | null): number {
  const base = freshCharges();
  let total = 0;
  for (const key of CHARGE_KEYS) {
    total += num(relic?.[key]) + (run ? Math.max(0, num(run[key]) - base[key]) : 0);
  }
  return total;
}

export function olympicRosterShape(ids: string[], full: boolean): boolean {
  if (full ? ids.length !== OLY_ROSTER : ids.length > OLY_ROSTER) return false;
  if (new Set(ids).size !== ids.length) return false;
  const counts = new Map<string, number>();
  for (const id of ids) {
    const player = playerById(id);
    if (!player || isConstructed(player)) return false;
    const next = (counts.get(player.nationality) ?? 0) + 1;
    if (next > OLY_NAT_CAP) return false;
    counts.set(player.nationality, next);
  }
  return true;
}

export function olympicRosterLegal(ids: string[]): boolean {
  return olympicRosterShape(ids, true);
}

export function startOlympicBuild(seed: number, boosters: number): OlympicBuild {
  return drawOffer({
    seed: seed >>> 0 || 1,
    nonce: 1,
    rosterIds: [],
    offer: null,
    mulligan: 1,
    boosters: Number.isFinite(boosters) ? Math.max(0, Math.floor(boosters)) : 0,
  });
}

export function takeOlympicPrime(build: OlympicBuild, playerId: string): OlympicBuild {
  if (!build.offer || !build.offer.playerIds.includes(playerId)) return build;
  if (build.rosterIds.includes(playerId) || build.rosterIds.length >= OLY_ROSTER) return build;
  const player = playerById(playerId);
  if (!player || isConstructed(player)) return build;
  if (nationCount(build.rosterIds, player.nationality) >= OLY_NAT_CAP) return build;
  const next: OlympicBuild = { ...build, rosterIds: [...build.rosterIds, playerId], offer: null };
  if (next.rosterIds.length >= OLY_ROSTER) return next;
  return drawOffer(next);
}

/** Mulligan first, then one earned booster. Neither path writes the year save. */
export function rerollOlympic(build: OlympicBuild): OlympicBuild {
  if (!build.offer || build.rosterIds.length >= OLY_ROSTER) return build;
  if (build.mulligan > 0) return drawOffer({ ...build, mulligan: build.mulligan - 1 });
  if (build.boosters > 0) return drawOffer({ ...build, boosters: build.boosters - 1 });
  return build;
}

export function refreshOlympicOffer(build: OlympicBuild): OlympicBuild {
  if (build.rosterIds.length >= OLY_ROSTER) return { ...build, offer: null };
  return drawOffer({ ...build, offer: null });
}

export function playOlympics(rosterIds: string[], seed: number): OlympicMeet {
  if (!olympicRosterLegal(rosterIds)) throw new Error("Olympic roster is not twelve legal primes");
  const meetSeed = seed >>> 0 || 1;
  const field = drawField(rosterIds, meetSeed);
  if (field.length !== 8) throw new Error(`Olympic field has ${field.length} sides`);
  const ranked = [...field].sort((a, b) => b.power - a.power || a.name.localeCompare(b.name));
  const pairs: [number, number][] = [
    [0, 7],
    [3, 4],
    [1, 6],
    [2, 5],
  ];
  const quarters = pairs.map(([hi, lo], index) =>
    playOne(meetSeed, rosterIds, "qf", "Quarterfinal", index, ranked[hi], ranked[lo]),
  );
  const semis = [0, 1].map((index) => {
    const [home, away] = byPower(winnerSide(field, quarters[index * 2]), winnerSide(field, quarters[index * 2 + 1]));
    return playOne(meetSeed, rosterIds, "sf", "Semifinal", index, home, away);
  });
  const [home, away] = byPower(winnerSide(field, semis[0]), winnerSide(field, semis[1]));
  const gold = playOne(meetSeed, rosterIds, "gold", "Final", 0, home, away);
  return { seed: meetSeed, rosterIds: rosterIds.slice(), field, series: [...quarters, ...semis, gold] };
}

export function olympicVerdict(meet: OlympicMeet): OlympicVerdict {
  const mine = meet.series.filter((series) => series.homeId === OLY_ID || series.awayId === OLY_ID);
  const seriesWins = mine.filter((series) => series.winnerId === OLY_ID).length;
  const loss = mine.find((series) => series.winnerId !== OLY_ID) ?? null;
  let pointMargin = 0;
  for (const series of mine) {
    for (const game of series.games) {
      const us = game.homeId === OLY_ID ? game.homeScore : game.awayScore;
      const them = game.homeId === OLY_ID ? game.awayScore : game.homeScore;
      pointMargin += us - them;
    }
  }
  const eliminatedBy = loss ? (loss.winnerId === loss.homeId ? loss.homeName : loss.awayName) : null;
  const good = !loss || seriesWins > 0 || pointMargin >= 0;
  const margin = pointMargin > 0 ? `+${pointMargin}` : String(pointMargin);
  if (!loss) {
    return {
      far: "gold",
      seriesWins,
      eliminatedBy: null,
      pointMargin,
      good: true,
      line: `The Rolled Side won the Olympics. ${seriesWins} series wins. Point margin ${margin}. They were good enough to take this field.`,
    };
  }
  const score = `${Math.max(loss.homeWins, loss.awayWins)}–${Math.min(loss.homeWins, loss.awayWins)}`;
  if (loss.round === "qf") {
    return {
      far: "quarterfinal",
      seriesWins,
      eliminatedBy,
      pointMargin,
      good,
      line: `${eliminatedBy} beat the Rolled Side ${score} in the quarterfinal. ${seriesWins} series wins. Point margin ${margin}. ${good ? "The scores say the side was good enough to live on this floor." : "They were not good enough for this field."}`,
    };
  }
  const far = loss.round === "gold" ? "final" : "semifinal";
  return {
    far,
    seriesWins,
    eliminatedBy,
    pointMargin,
    good: true,
    line: `The Rolled Side reached the ${far} and lost to ${eliminatedBy} ${score}. ${seriesWins} series wins. Point margin ${margin}. They were good enough to get that far.`,
  };
}

/** The clinching game of the final, with the possession log. Earlier games stay score-only. */
export function openOlympicFinal(meet: OlympicMeet): GameResult | null {
  const replay = replayFinal(meet, true);
  return replay?.games.at(-1) ?? null;
}

function replayFinal(meet: OlympicMeet, log: boolean): SeriesResult | null {
  const final = meet.series.find((series) => series.round === "gold");
  if (!final) return null;
  return playSeries({
    id: final.id,
    round: final.round,
    roundLabel: final.roundLabel,
    dayLabel: final.dayLabel,
    seed: mixSeed(meet.seed, final.id),
    log,
    venues: [VENUE],
    home: sideFor(final.homeId, meet.rosterIds),
    away: sideFor(final.awayId, meet.rosterIds),
    exhibition: true,
  });
}

function playOne(
  meetSeed: number,
  rosterIds: string[],
  round: OlympicRound,
  roundLabel: string,
  index: number,
  home: OlympicSide,
  away: OlympicSide,
): OlympicSeriesLine {
  const id = round === "gold" ? "oly-gold" : `oly-${round}-${index}`;
  const played = playSeries({
    id,
    round,
    roundLabel,
    dayLabel: "Olympics",
    seed: mixSeed(meetSeed, id),
    log: false,
    venues: [VENUE],
    home: sideFor(home.id, rosterIds),
    away: sideFor(away.id, rosterIds),
    exhibition: true,
  });
  return {
    id: played.id,
    round,
    roundLabel,
    dayLabel: played.dayLabel,
    homeId: played.homeId,
    awayId: played.awayId,
    homeName: played.homeName ?? home.name,
    awayName: played.awayName ?? away.name,
    homeWins: played.homeWins,
    awayWins: played.awayWins,
    winnerId: played.winnerId,
    loserId: played.loserId,
    games: played.games.map((game, n) => ({
      n: n + 1,
      homeId: game.homeId,
      awayId: game.awayId,
      homeScore: game.homeScore,
      awayScore: game.awayScore,
      winnerId: game.winnerId,
    })),
  };
}

function drawField(rosterIds: string[], seed: number): OlympicSide[] {
  const rng = mulberry32(mixSeed(seed, "oly-field"));
  const countries = rankedTeams("country");
  const houses = rankedTeams("house");
  const picked = [...takeWindow(countries, COUNTRY_WINDOW, COUNTRY_PICKS, rng), ...takeWindow(houses, HOUSE_WINDOW, HOUSE_PICKS, rng)];
  const construct = teamById(CONSTRUCT_ID);
  const sides: OlympicSide[] = [
    { id: OLY_ID, name: OLY_NAME, kind: "rolled", power: rosterPower(rosterIds) },
    { id: construct.id, name: construct.name, kind: "construct", power: teamPower(construct.id) },
  ];
  for (const row of picked) {
    const team = teamById(row.id);
    const kind = team.kind === "overflow" ? "overflow" : team.kind === "homeland" ? "homeland" : "country";
    sides.push({ id: team.id, name: team.name, kind, power: row.power });
  }
  return sides;
}

function rankedTeams(band: "country" | "house"): { id: string; power: number }[] {
  return TEAMS.filter((team) => (band === "country" ? team.kind === "country" : team.kind === "overflow" || team.kind === "homeland"))
    .map((team) => ({ id: team.id, power: teamPower(team.id) }))
    .sort((a, b) => b.power - a.power || a.id.localeCompare(b.id));
}

function takeWindow(list: { id: string; power: number }[], window: number, count: number, rng: () => number) {
  return shuffle(list.slice(0, Math.min(window, list.length)), rng).slice(0, count);
}

function winnerSide(field: OlympicSide[], series: OlympicSeriesLine): OlympicSide {
  const side = field.find((item) => item.id === series.winnerId);
  if (!side) throw new Error(`Olympic series ${series.id} named ${series.winnerId}, who is not in the field`);
  return side;
}

function byPower(a: OlympicSide, b: OlympicSide): [OlympicSide, OlympicSide] {
  if (b.power > a.power || (b.power === a.power && b.name.localeCompare(a.name) < 0)) return [b, a];
  return [a, b];
}

function sideFor(id: string, rosterIds: string[]): SideInput {
  if (id === OLY_ID) return { id: OLY_ID, name: OLY_NAME, pace: 1, players: dress(rosterIds) };
  const team = teamById(id);
  return { id: team.id, name: team.name, pace: team.pace, players: rosterOf(team.id) };
}

function drawOffer(build: OlympicBuild): OlympicBuild {
  if (build.rosterIds.length >= OLY_ROSTER) return { ...build, offer: null };
  const rng = mulberry32(mixSeed(build.seed, `oly-card-${build.nonce}`));
  const legal = new Set(legalIds(build.rosterIds));
  const cards = ERA_CARDS.filter((card) => card.playerIds.some((id) => legal.has(id)));
  let offer: OlympicOffer;
  if (cards.length === 0) {
    offer = {
      cardId: null,
      tier: "book",
      franchise: "The open book",
      years: "Any prime",
      line: "No era card had a seat left under the nationality cap. These primes are the shuffle.",
      playerIds: shuffle([...legal], rng).slice(0, CARD_SIZE),
    };
  } else {
    const card = weighted(cards, (item) => (item.tier === "myth" ? 1 : item.tier === "banner" ? 3 : 5), rng);
    const resolved = eraCard(card.id);
    offer = {
      cardId: resolved.id,
      tier: resolved.tier,
      franchise: resolved.franchise,
      years: resolved.years,
      line: resolved.line,
      playerIds: shuffle(
        resolved.playerIds.filter((id) => legal.has(id)),
        rng,
      ).slice(0, CARD_SIZE),
    };
  }
  if (offer.playerIds.length === 0) return { ...build, offer: null, nonce: build.nonce + 1 };
  return { ...build, offer, nonce: build.nonce + 1 };
}

function legalIds(rosterIds: string[]): string[] {
  const have = new Set(rosterIds);
  return PLAYERS.filter((player) => {
    if (isConstructed(player) || have.has(player.id)) return false;
    return nationCount(rosterIds, player.nationality) < OLY_NAT_CAP;
  }).map((player) => player.id);
}

function nationCount(ids: string[], nationality: string): number {
  let count = 0;
  for (const id of ids) {
    if (playerById(id)?.nationality === nationality) count += 1;
  }
  return count;
}

function rosterPower(ids: string[]): number {
  let score = 0;
  for (const player of dress(ids)) {
    const minutes = minuteTarget(player) / 36;
    const bump = player.role === "star" ? 1.16 : player.role === "starter" ? 1.05 : 1;
    score += player.ratings.ovr * minutes * bump;
  }
  return score;
}

function dress(ids: string[]): Player[] {
  const players = ids.map((id) => playerById(id)).filter((player): player is Player => Boolean(player));
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

function weighted<T>(items: T[], weight: (item: T) => number, rng: () => number): T {
  const total = items.reduce((sum, item) => sum + weight(item), 0);
  let mark = rng() * total;
  for (const item of items) {
    mark -= weight(item);
    if (mark <= 0) return item;
  }
  return items[items.length - 1];
}

function num(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 0;
}
