import type { Player } from "../data/types";

export function shortName(player: Player, pool: Player[]): string {
  const last = player.name.split(" ").slice(-1)[0];
  const same = pool.filter((p) => p.name.split(" ").slice(-1)[0] === last);
  if (same.length === 1) return last;
  const initial = player.name[0];
  const sameInitial = same.filter((p) => p.name[0] === initial);
  if (sameInitial.length === 1) return `${initial}. ${last}`;
  return player.name.split(" ")[0];
}

export function clockLabel(remaining: number): string {
  const safe = Math.max(0, Math.floor(remaining));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function periodName(q: number): string {
  if (q <= 4) return `Q${q}`;
  if (q === 5) return "OT";
  return `OT${q - 4}`;
}
