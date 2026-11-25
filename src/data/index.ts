import { EUROPE_ROSTERS } from "./roster/europe";
import { parseRoster } from "./roster/parse";
import { REST_ROSTERS } from "./roster/rest";
import { USA_ROSTERS } from "./roster/usa";
import { TEAMS } from "./teams";
import type { Player } from "./types";

const BLOCKS: Record<string, string> = { ...USA_ROSTERS, ...EUROPE_ROSTERS, ...REST_ROSTERS };

export const ROSTERS: Record<string, Player[]> = {};
export const PLAYERS: Player[] = [];

for (const team of TEAMS) {
  const block = BLOCKS[team.id];
  if (!block) throw new Error(`Missing roster for ${team.id}`);
  const roster = parseRoster(team.id, block);
  ROSTERS[team.id] = roster;
  PLAYERS.push(...roster);
}

const ids = new Set<string>();
for (const player of PLAYERS) {
  if (ids.has(player.id)) throw new Error(`Duplicate player id ${player.id} (${player.name})`);
  ids.add(player.id);
}

export function rosterOf(teamId: string): Player[] {
  return ROSTERS[teamId] ?? [];
}

export function playerById(id: string): Player | undefined {
  return PLAYERS.find((p) => p.id === id);
}

export { TEAMS, teamById, TEAM_BY_ID } from "./teams";
export { choiceStory } from "./choice";
export { contractLabel, formatHeight, minuteTarget, roleLabel } from "./ratings";
