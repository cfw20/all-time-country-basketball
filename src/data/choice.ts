import { contractLabel, roleLabel } from "./ratings";
import type { Player, Team } from "./types";

export interface ChoiceStory {
  kicker: string;
  title: string;
  body: string;
}

export function choiceStory(player: Player, team: Team): ChoiceStory {
  const seat = `${contractLabel(player.contract)} seat in the ${roleLabel(player.role).toLowerCase()} minute band`;
  if (team.kind === "country") {
    return {
      kicker: "Country path",
      title: `Made ${team.country}'s roster`,
      body: join(
        `${player.name} took the default path: their own country. They made ${team.name}, the playable all-time side for ${team.country}, on a ${seat}. Countries do not sign players in Pantheon. The cut had room, and they chose home.`,
        player.note,
      ),
    };
  }
  if (team.kind === "overflow") {
    const above =
      team.overflowRank === 1
        ? "The Continental, the national all-time side, closed without a minutes-earning seat."
        : team.overflowRank === 2
          ? "The Continental and Vanguard had no seat left."
          : "The national roster, Vanguard, and Afterlight had no seat left.";
    return {
      kicker: "Overflow path",
      title: "Could not make the United States roster",
      body: join(
        `${player.name} is American. ${above} They chose ${team.name}. This is not a signing and not a free-agent market. It is where the minutes were.`,
        player.note,
      ),
    };
  }
  return {
    kicker: "Homeland path",
    title: `${player.nationality} could not field a side`,
    body: join(
      `${player.name} is from ${player.nationality}. That country is outside the twenty-eight nation field because it cannot fill a competitive all-time roster. They chose the Lantern Company, the only house for that path. Nobody recruited them.`,
      player.note,
    ),
  };
}

function join(body: string, note?: string): string {
  const text = note ? `${body} ${note}` : body;
  return `${text} Shown and simulated only in this prime. Faded years are not in the book.`;
}
