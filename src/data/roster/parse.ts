import { rate, slug } from "../ratings";
import type { Arch, Contract, Player, Pos, Ratings, Role } from "../types";

const ROLES = new Set<Role>(["star", "starter", "rotation", "deep", "two-way"]);
const DEALS = new Set<Contract>(["standard", "two-way", "ten-day", "exhibit-10", "hardship", "short"]);
const ARCHES = new Set<Arch>([
  "point",
  "shooter",
  "slasher",
  "creator",
  "wing",
  "defender",
  "stretch",
  "post",
  "rim",
  "glue",
]);
const POS = new Set<Pos>(["PG", "SG", "SF", "PF", "C"]);

function extras(raw: string | undefined): Partial<Ratings> | undefined {
  if (!raw || raw === "-" || raw === "") return undefined;
  const out: Partial<Ratings> = {};
  for (const part of raw.split(",")) {
    const [k, v] = part.split(":");
    if (!k || v === undefined) continue;
    const n = Number(v);
    if (!Number.isFinite(n)) throw new Error(`Bad extra ${part}`);
    (out as Record<string, number>)[k.trim()] = n;
  }
  return out;
}

/** Pipe rows: name|pos|ht|year|nat|role|deal|arch|ovr|usg|3rate|start|pos2|extra|note */
export function parseRoster(teamId: string, block: string): Player[] {
  const players: Player[] = [];
  const lines = block.split("\n");
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const parts = line.split("|").map((p) => p.trim());
    if (parts.length < 13) throw new Error(`${teamId}: short row ${line}`);
    const [
      name,
      pos,
      height,
      year,
      nationality,
      role,
      deal,
      arch,
      ovr,
      usg,
      threeRate,
      start,
      pos2,
      extra,
    ] = parts;
    if (!POS.has(pos as Pos)) throw new Error(`${name}: bad pos ${pos}`);
    if (!ROLES.has(role as Role)) throw new Error(`${name}: bad role ${role}`);
    if (!DEALS.has(deal as Contract)) throw new Error(`${name}: bad deal ${deal}`);
    if (!ARCHES.has(arch as Arch)) throw new Error(`${name}: bad arch ${arch}`);
    const note = parts.slice(14).join(" | ").trim();
    const secondary = pos2 && pos2 !== "-" ? (pos2 as Pos) : undefined;
    if (secondary && !POS.has(secondary)) throw new Error(`${name}: bad pos2 ${pos2}`);
    players.push({
      id: slug(name),
      name,
      pos: pos as Pos,
      pos2: secondary,
      height,
      primeYear: Number(year),
      nationality,
      teamId,
      role: role as Role,
      contract: deal as Contract,
      starts: start === "1",
      arch: arch as Arch,
      ratings: rate(arch as Arch, Number(ovr), Number(usg), Number(threeRate), extras(extra)),
      note: note || undefined,
    });
  }
  return players;
}
