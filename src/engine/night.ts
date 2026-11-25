import { PLAYERS, TEAM_BY_ID, isConstructed } from "../data";
import type { Player } from "../data/types";
import { mixSeed, mulberry32 } from "./rng";

export function humans(): Player[] {
  return PLAYERS.filter((player) => !isConstructed(player));
}

/** Opening cards and stars. Trivia and short nights stay on names the book actually lists up front. */
export function notables(list: Player[] = humans()): Player[] {
  const top = list.filter((player) => player.role === "star" || player.starts);
  return top.length >= 36 ? top : list;
}

export function nightRng(seed: number, salt: number, label: string): () => number {
  return mulberry32(mixSeed(mixSeed((seed >>> 0) || 1, label), `salt:${salt}`));
}

export function clamp(value: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, value));
}

export function sideName(player: Player): string {
  return TEAM_BY_ID[player.teamId]?.name ?? player.teamId;
}
