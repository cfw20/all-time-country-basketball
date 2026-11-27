import { playerById } from "../data";
import {
  eraCard,
  fileYear,
  type HonorId,
  type Inscription,
  type SeasonNight,
  type YearRelic,
  type YearRun,
} from "../engine/season";

export const YEAR_KEY = "pantheon-year-v1";

export interface BestYear {
  wins: number;
  losses: number;
  seed: number;
}

export interface YearSave {
  run: YearRun | null;
  best: BestYear | null;
  starts: number;
  vault: Inscription[];
  relic: YearRelic | null;
  crown: boolean;
}

const EMPTY: YearSave = { run: null, best: null, starts: 0, vault: [], relic: null, crown: false };

export function loadYear(): YearSave {
  try {
    const raw = localStorage.getItem(YEAR_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<YearSave>;
    const run = validRun(parsed.run);
    const vault = Array.isArray(parsed.vault) ? parsed.vault.filter(validInscription) : [];
    const relic = validRelic(parsed.relic);
    return {
      run,
      best: validBest(parsed.best),
      starts: typeof parsed.starts === "number" ? parsed.starts : 0,
      vault,
      relic,
      crown: Boolean(parsed.crown) || vault.some((item) => item.honorId === "unbroken"),
    };
  } catch {
    return EMPTY;
  }
}

export function saveYear(saved: YearSave) {
  localStorage.setItem(YEAR_KEY, JSON.stringify(saved));
}

export function withFiledYear(saved: YearSave): YearSave {
  const run = saved.run;
  if (!run?.nights) return saved;
  const next = fileYear(saved, run);
  if (next === saved) return saved;
  return { ...saved, ...next };
}

function validBest(best: BestYear | null | undefined): BestYear | null {
  if (!best || typeof best.wins !== "number" || typeof best.losses !== "number") return null;
  return { wins: best.wins, losses: best.losses, seed: best.seed >>> 0 };
}

function validRun(run: YearRun | null | undefined): YearRun | null {
  if (!run || typeof run.seed !== "number" || !Array.isArray(run.rosterIds) || !run.charges) return null;
  const rosterIds = run.rosterIds.filter((id) => typeof id === "string" && playerById(id));
  let current = run.current;
  if (current) {
    try {
      eraCard(current.cardId);
    } catch {
      current = null;
    }
  }
  return {
    seed: run.seed >>> 0,
    rosterIds,
    nonce: run.nonce || 1,
    current,
    picksOnCard: run.picksOnCard || 0,
    memoryIds: Array.isArray(run.memoryIds) ? run.memoryIds.filter((id) => typeof id === "string" && playerById(id) && !rosterIds.includes(id)) : [],
    charges: {
      reroll: num(run.charges.reroll),
      gilded: num(run.charges.gilded),
      double: num(run.charges.double),
      position: num(run.charges.position),
      recall: num(run.charges.recall),
      banner: num(run.charges.banner),
    },
    doubleArmed: Boolean(run.doubleArmed),
    nights: Array.isArray(run.nights) ? run.nights.filter(validNight) : null,
    bannerUsed: Boolean(run.bannerUsed),
    openedWith: validHonor(run.openedWith),
  };
}

function validNight(night: SeasonNight): boolean {
  return Boolean(night && typeof night.n === "number" && typeof night.cardId === "string" && typeof night.us === "number");
}

function validInscription(item: Inscription): boolean {
  return Boolean(item && typeof item.seed === "number" && typeof item.wins === "number" && typeof item.honorId === "string");
}

function validRelic(relic: YearRelic | null | undefined): YearRelic | null {
  if (!relic || !relic.charges || !validHonor(relic.honorId)) return null;
  return {
    honorId: relic.honorId,
    gildedOpen: Boolean(relic.gildedOpen),
    charges: {
      reroll: num(relic.charges.reroll),
      gilded: num(relic.charges.gilded),
      double: num(relic.charges.double),
      position: num(relic.charges.position),
      recall: num(relic.charges.recall),
      banner: num(relic.charges.banner),
    },
  };
}

function validHonor(id: string | null | undefined): HonorId | null {
  if (id === "heard" || id === "deep" || id === "door" || id === "breath" || id === "unbroken") return id;
  return null;
}

function num(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}
