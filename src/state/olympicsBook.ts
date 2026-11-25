import { playerById } from "../data";
import {
  OLY_ID,
  OLY_ROSTER,
  olympicRosterLegal,
  olympicRosterShape,
  refreshOlympicOffer,
  type OlympicBuild,
  type OlympicMeet,
  type OlympicOffer,
  type OlympicRound,
  type OlympicSeriesLine,
  type OlympicSide,
} from "../engine/olympics";

/** Separate from pantheon-v7 and pantheon-year-v1. One finished bracket, then the window is the report. */
export const OLYMPICS_KEY = "pantheon-olympics-v1";

export interface OlympicSave {
  build: OlympicBuild | null;
  meet: OlympicMeet | null;
}

export const EMPTY_OLYMPICS: OlympicSave = { build: null, meet: null };

export function loadOlympics(): OlympicSave {
  try {
    const store = storage();
    const raw = store?.getItem(OLYMPICS_KEY);
    if (!raw) return EMPTY_OLYMPICS;
    const parsed = JSON.parse(raw) as Partial<OlympicSave>;
    const meet = validMeet(parsed.meet);
    if (meet) return { build: null, meet };
    const build = validBuild(parsed.build);
    return { build, meet: null };
  } catch {
    return EMPTY_OLYMPICS;
  }
}

export function saveOlympics(saved: OlympicSave) {
  const store = storage();
  if (!store) return;
  store.setItem(OLYMPICS_KEY, JSON.stringify(saved));
}

function storage(): Storage | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage;
  } catch {
    return null;
  }
}

function validBuild(build: OlympicBuild | null | undefined): OlympicBuild | null {
  if (!build || typeof build.seed !== "number" || !Array.isArray(build.rosterIds)) return null;
  const rosterIds = build.rosterIds.filter((id) => typeof id === "string" && playerById(id));
  if (!olympicRosterShape(rosterIds, false)) return null;
  const next: OlympicBuild = {
    seed: build.seed >>> 0 || 1,
    nonce: typeof build.nonce === "number" && build.nonce > 0 ? Math.floor(build.nonce) : 1,
    rosterIds,
    offer: validOffer(build.offer, rosterIds),
    mulligan: build.mulligan > 0 ? 1 : 0,
    boosters: typeof build.boosters === "number" && Number.isFinite(build.boosters) ? Math.max(0, Math.floor(build.boosters)) : 0,
  };
  if (next.rosterIds.length >= OLY_ROSTER) return { ...next, rosterIds: next.rosterIds.slice(0, OLY_ROSTER), offer: null };
  if (!next.offer) return refreshOlympicOffer(next);
  return next;
}

function validOffer(offer: OlympicOffer | null | undefined, rosterIds: string[]): OlympicOffer | null {
  if (!offer || !Array.isArray(offer.playerIds) || offer.playerIds.length === 0 || offer.playerIds.length > 4) return null;
  const have = new Set(rosterIds);
  const playerIds = offer.playerIds.filter((id) => typeof id === "string" && !have.has(id) && playerById(id));
  if (playerIds.length === 0 || new Set(playerIds).size !== playerIds.length) return null;
  if (!olympicRosterShape([...rosterIds, ...playerIds.slice(0, 1)], false)) return null;
  const tier = offer.tier === "myth" || offer.tier === "banner" || offer.tier === "solid" || offer.tier === "book" ? offer.tier : "book";
  return {
    cardId: typeof offer.cardId === "string" ? offer.cardId : null,
    tier,
    franchise: typeof offer.franchise === "string" ? offer.franchise : "The open book",
    years: typeof offer.years === "string" ? offer.years : "Any prime",
    line: typeof offer.line === "string" ? offer.line : "",
    playerIds,
  };
}

function validMeet(meet: OlympicMeet | null | undefined): OlympicMeet | null {
  if (!meet || !Array.isArray(meet.series) || meet.series.length !== 7 || !Array.isArray(meet.field) || meet.field.length !== 8) return null;
  if (!Array.isArray(meet.rosterIds) || !olympicRosterLegal(meet.rosterIds)) return null;
  const field = meet.field.filter(validSide);
  if (field.length !== 8 || !field.some((side) => side.id === OLY_ID) || !field.some((side) => side.kind === "construct")) return null;
  const series = meet.series.map(validSeries);
  if (series.some((item) => !item)) return null;
  return {
    seed: typeof meet.seed === "number" ? meet.seed >>> 0 || 1 : 1,
    rosterIds: meet.rosterIds.slice(),
    field,
    series: series as OlympicSeriesLine[],
  };
}

function validSide(side: OlympicSide): boolean {
  return Boolean(side && typeof side.id === "string" && typeof side.name === "string" && typeof side.kind === "string" && typeof side.power === "number");
}

function validSeries(series: OlympicSeriesLine): OlympicSeriesLine | null {
  const round: OlympicRound | null = series?.round === "qf" || series?.round === "sf" || series?.round === "gold" ? series.round : null;
  if (!round || !Array.isArray(series.games) || series.games.length < 4 || series.games.length > 7) return null;
  const wins = Math.max(series.homeWins, series.awayWins);
  if (wins !== 4) return null;
  return series;
}
