import { CONSTRUCT_ID } from "./concord";
import { EUROPE_ROSTERS } from "./roster/europe";
import { CONSTRUCT_ROSTER } from "./roster/construct";
import { MORE_ROSTERS } from "./roster/more";
import { parseRoster } from "./roster/parse";
import { HOUSE_ROSTERS } from "./houses";
import { WAVE_ROSTERS } from "./wave";
import { REST_ROSTERS } from "./roster/rest";
import { USA_ROSTERS } from "./roster/usa";
import { TEAMS } from "./teams";
import type { Player } from "./types";

const BLOCKS: Record<string, string> = {
  ...USA_ROSTERS,
  ...EUROPE_ROSTERS,
  ...REST_ROSTERS,
  ...HOUSE_ROSTERS,
  ...WAVE_ROSTERS,
  [CONSTRUCT_ID]: CONSTRUCT_ROSTER,
};

export const ROSTERS: Record<string, Player[]> = {};
export const PLAYERS: Player[] = [];

for (const team of TEAMS) {
  const block = BLOCKS[team.id];
  if (!block) throw new Error(`Missing roster for ${team.id}`);
  const roster = parseRoster(team.id, block);
  const extra = MORE_ROSTERS[team.id];
  if (extra) roster.push(...parseRoster(team.id, extra));
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

export function isConstructed(player: Player): boolean {
  return player.teamId === CONSTRUCT_ID;
}

export { TEAMS, teamById, TEAM_BY_ID, sideById } from "./teams";
export { CONCORD_ID, CONCORD_TEAM, CONSTRUCT_ID } from "./concord";
export { choiceStory } from "./choice";
export { contractLabel, formatHeight, minuteTarget, roleLabel } from "./ratings";
