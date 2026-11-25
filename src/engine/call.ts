import { rosterOf, TEAMS, teamById } from "../data";
import type { Team } from "../data/types";
import { simulateGame, type SideInput } from "./game";
import { mixSeed, mulberry32, shuffle } from "./rng";
import { teamPower } from "./tournament";

export interface CallDeal {
  home: Team;
  away: Team;
  homePower: number;
  awayPower: number;
}

function side(team: Team): SideInput {
  return { id: team.id, name: team.name, pace: team.pace, players: rosterOf(team.id) };
}

/** Two human sides. The game is an exhibition and never enters the championship. */
export function dealCall(seed: number, salt = 0): CallDeal {
  const rng = mulberry32(mixSeed(mixSeed(seed || 1, "call"), `salt:${salt}`));
  const ids = shuffle(TEAMS.filter((team) => team.kind !== "construct").map((team) => team.id), rng);
  const home = teamById(ids[0]);
  const away = teamById(ids[1]);
  if (!home || !away) throw new Error("call short");
  return { home, away, homePower: teamPower(home.id), awayPower: teamPower(away.id) };
}

export function playCall(seed: number, salt = 0) {
  const deal = dealCall(seed, salt);
  const game = simulateGame({
    id: `call-${seed}-${salt}`,
    round: "floor",
    roundLabel: "The Call",
    dayLabel: "Side floor",
    venue: "The Open Ring",
    seed: mixSeed(seed || 1, `call-game:${salt}`),
    home: side(deal.home),
    away: side(deal.away),
    log: false,
    exhibition: true,
  });
  return { ...deal, game };
}
