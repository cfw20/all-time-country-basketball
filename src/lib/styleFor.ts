import { CONCORD_ID, CONCORD_TEAM, playerById, rosterOf, sideById } from "../data";
import type { Player, Team } from "../data/types";
import { asLineup, readStyle, type SideStyle } from "../engine/style";

export function styleOfTeam(team: Team): SideStyle {
  return readStyle({
    pace: team.pace,
    players: rosterOf(team.id),
    built: team.kind === "construct",
  });
}

/** Concord ids are stored in opening order. The first five are the line that starts. */
export function styleForSide(id: string, concordIds: string[] = []): SideStyle | null {
  if (id === CONCORD_ID) {
    const players = concordIds
      .map((pid) => playerById(pid))
      .filter((player): player is Player => Boolean(player));
    if (players.length < 5) return null;
    return readStyle({ pace: CONCORD_TEAM.pace, players: asLineup(players) });
  }
  const team = sideById(id);
  if (!team || team.kind === "concord") return null;
  const players = rosterOf(team.id);
  if (players.length < 5) return null;
  return readStyle({ pace: team.pace, players, built: team.kind === "construct" });
}

export function styleKicker(id: string, name: string): string {
  const team = sideById(id);
  if (team?.kind === "construct") return `${name} · built`;
  if (id === CONCORD_ID || team?.kind === "concord") return `${name} · mixed`;
  return name;
}
