import { CONCORD_ID, CONSTRUCT_ID, playerById, teamById } from "../data";
import type { Contest, GameResult, NewsItem, Player, Siege } from "../data/types";

export function buildNews(input: {
  games: GameResult[];
  seedOf: Map<string, number>;
  allStar: GameResult | null;
  three: Contest | null;
  dunk: Contest | null;
  skills: Contest | null;
  finishes: Record<string, number>;
  siege: Siege | null;
}): NewsItem[] {
  const items: NewsItem[] = [];
  let order = 0;
  const push = (item: Omit<NewsItem, "id" | "order"> & { id?: string }) => {
    items.push({ ...item, id: item.id ?? `n-${items.length}`, order: order++ });
  };

  for (const game of input.games) {
    const margin = Math.abs(game.homeScore - game.awayScore);
    const winner = game.winnerId;
    const loser = game.loserId;
    const wSeed = input.seedOf.get(winner) ?? 16;
    const lSeed = input.seedOf.get(loser) ?? 16;
    const wName = sideName(game, winner);
    const lName = sideName(game, loser);
    const score = `${Math.max(game.homeScore, game.awayScore)}–${Math.min(game.homeScore, game.awayScore)}`;

    if (game.round === "final") {
      push({
        kicker: "Final",
        title: `${wName} take the Pantheon`,
        body: `${wName} beat ${lName} ${score}${game.ot ? " in overtime" : ""}. The championship is a single night under NBA rules. The result is this draw, not a destiny.`,
        gameId: game.id,
        importance: 100,
      });
    } else if (game.round === "sf") {
      push({
        kicker: "Semifinal",
        title: `${wName} are in the final`,
        body: `${wName} ended ${lName}'s run, ${score}.`,
        gameId: game.id,
        importance: 86,
      });
    }

    if (game.comeback && game.comeback.teamId === winner && game.comeback.deficit >= 12) {
      push({
        kicker: "Comeback",
        title: `${wName} erase a ${game.comeback.deficit}-point hole`,
        body: `${wName} trailed by ${game.comeback.deficit} and still beat ${lName} ${score}. The run is in the possession log.`,
        gameId: game.id,
        importance: 80,
      });
    }

    if (game.buzzerBeater) {
      push({
        kicker: "Buzzer",
        title: `${wName} at the horn`,
        body: `${wName} beat ${lName} ${score} on a shot that ended the period. The possession log has the make.`,
        gameId: game.id,
        importance: 92,
      });
    }

    if (wSeed - lSeed >= 8) {
      push({
        kicker: "Upset",
        title: `${wName} knock off ${lName}`,
        body: `Power seed ${wSeed} beat power seed ${lSeed}, ${score}. Favorites are favorites in Pantheon. They are not locks.`,
        gameId: game.id,
        importance: 70 + Math.min(20, wSeed - lSeed),
      });
    } else if (margin >= 24) {
      push({
        kicker: "Blowout",
        title: `${wName} by ${margin}`,
        body: `${wName} ran ${lName} off the floor, ${score}. The bench minutes show up in the box.`,
        gameId: game.id,
        importance: 58,
      });
    }

    for (const side of [game.box.home, game.box.away] as const) {
      const teamId = side === game.box.home ? game.homeId : game.awayId;
      for (const line of side) {
        const player = playerById(line.playerId);
        if (!player) continue;
        const reb = line.orb + line.drb;
        if (line.pts >= 50) {
          push({
            kicker: "Fifty",
            title: `${player.name} scores ${line.pts}`,
            body: `${player.name} put up ${line.pts} for ${sideName(game, teamId)} against ${teamId === game.homeId ? sideName(game, game.awayId) : sideName(game, game.homeId)}.`,
            gameId: game.id,
            importance: 88,
          });
        } else if (line.pts >= 40) {
          push({
            kicker: "Forty",
            title: `${player.name}, ${line.pts} points`,
            body: `A forty-point night in a ${score} game. Minutes were ${Math.round(line.sec / 60)}.`,
            gameId: game.id,
            importance: 64,
          });
        }
        const cats = [line.pts, reb, line.ast, line.stl, line.blk].filter((n) => n >= 10).length;
        if (line.pts >= 10 && cats >= 3) {
          push({
            kicker: "Triple-double",
            title: `${player.name} fills the box`,
            body: `${line.pts} points, ${reb} rebounds, ${line.ast} assists, ${line.stl} steals, ${line.blk} blocks.`,
            gameId: game.id,
            importance: 66,
          });
        }
        if (line.injured && (player.role === "star" || player.role === "starter")) {
          push({
            kicker: "Scare",
            title: `${player.name} leaves hurt`,
            body: `${player.name} did not return in this game. It is a one-night scare. They are available for the next tip.`,
            gameId: game.id,
            importance: 74,
          });
        }
        if (line.fouledOut && (player.role === "star" || player.role === "starter")) {
          push({
            kicker: "Fouls",
            title: `${player.name} fouls out`,
            body: `Six fouls. NBA rules. The minute band behind them had to play.`,
            gameId: game.id,
            importance: 54,
          });
        }
        const shortDeal = player.contract === "ten-day" || player.contract === "exhibit-10" || player.contract === "two-way" || player.contract === "hardship";
        if (shortDeal && line.pts >= 14) {
          push({
            kicker: "Call-up",
            title: `${player.name} cashes a short deal`,
            body: `${contractPhrase(player)} and scored ${line.pts} in ${Math.round(line.sec / 60)} minutes. Sparse minutes, until the game asked.`,
            gameId: game.id,
            importance: 72,
          });
        }
      }
    }
  }

  if (input.allStar) {
    const w = input.allStar.winnerId === input.allStar.homeId ? input.allStar.homeName : input.allStar.awayName;
    push({
      kicker: "Interval",
      title: `${w ?? "A light"} wins the All-Star game`,
      body: `Exhibition only. ${input.allStar.awayName} ${input.allStar.awayScore}, ${input.allStar.homeName} ${input.allStar.homeScore}. It does not touch the standings.`,
      gameId: input.allStar.id,
      importance: 48,
    });
  }
  if (input.three) {
    const winner = playerById(input.three.winnerId);
    push({
      kicker: "Interval",
      title: `${winner?.name ?? "A shooter"} takes the three-point contest`,
      body: "Eight shooters, money balls worth two, a final round of three. Ratings set the odds. The night still has variance.",
      importance: 46,
    });
  }
  if (input.skills) {
    const winner = playerById(input.skills.winnerId);
    push({
      kicker: "Interval",
      title: `${winner?.name ?? "A guard"} wins the skills challenge`,
      body: "Handle, pass, and finish. The stations follow the prime on the card. The night still misses.",
      importance: 44,
    });
  }
  if (input.dunk) {
    const winner = playerById(input.dunk.winnerId);
    push({
      kicker: "Interval",
      title: `${winner?.name ?? "A leaper"} wins the dunk contest`,
      body: "Two dunks to get out of the first round, two more in the final. Athleticism leans the scores. It does not decide them.",
      importance: 46,
    });
  }

  if (input.siege?.arrival) pushSiege(input.siege.arrival, "Arrival", 93, push);
  if (input.siege?.gate) pushSiege(input.siege.gate, "The gate", 99, push);
  if (input.siege?.restoration) {
    const game = input.siege.restoration;
    const score = `${Math.max(game.homeScore, game.awayScore)}–${Math.min(game.homeScore, game.awayScore)}`;
    const held = game.winnerId === CONCORD_ID;
    push({
      kicker: "Restoration",
      title: held ? "The Concord ends the threat" : "The Construct holds the floor",
      body: held
        ? `The Concord beat The Construct ${score}${game.ot ? " in overtime" : ""}. The country champion keeps the Pantheon, and the floor goes back to country against country.`
        : `The Construct beat The Concord ${score}${game.ot ? " in overtime" : ""}. The country final stays in the book. The built side still holds the floor.`,
      gameId: game.id,
      importance: 104,
    });
    pushSiegeLines(game, push);
  }

  items.sort((a, b) => b.importance - a.importance || a.order - b.order);
  const seen = new Set<string>();
  const capped: NewsItem[] = [];
  for (const item of items) {
    const key = `${item.kicker}:${item.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    capped.push(item);
    if (capped.length >= 48) break;
  }
  return capped;
}

function pushSiege(
  game: GameResult,
  kicker: string,
  importance: number,
  push: (item: Omit<NewsItem, "id" | "order"> & { id?: string }) => void,
) {
  const winner = named(game, game.winnerId);
  const loser = named(game, game.loserId);
  const score = `${Math.max(game.homeScore, game.awayScore)}–${Math.min(game.homeScore, game.awayScore)}`;
  const extra = game.ot ? " in overtime" : "";
  const constructWon = game.winnerId === CONSTRUCT_ID;
  const title = game.round === "gate"
    ? (constructWon ? "The gate falls" : `${winner} hold the gate`)
    : (constructWon ? "The Construct takes the arrival" : `${winner} turn the Construct away`);
  const body = game.round === "gate"
    ? (constructWon
      ? `The Construct beat ${loser} ${score}${extra}. The country champion is down. The Concord is named for the restoration.`
      : `${winner} beat the Construct ${score}${extra}. One country held for a night. The Concord still plays, and that game decides the floor.`)
    : (constructWon
      ? `The Construct beat ${loser} ${score}${extra}. The country bracket keeps going. The siege is still ahead.`
      : `${winner} beat the Construct ${score}${extra}. A country rose on arrival night. The siege is still ahead.`);
  push({ kicker, title, body, gameId: game.id, importance });
  pushSiegeLines(game, push);
}

function pushSiegeLines(
  game: GameResult,
  push: (item: Omit<NewsItem, "id" | "order"> & { id?: string }) => void,
) {
  const score = `${game.awayScore}–${game.homeScore}`;
  for (const [side, lines] of [[game.box.away, game.awayName], [game.box.home, game.homeName]] as const) {
    for (const line of side) {
      const player = playerById(line.playerId);
      if (!player || line.pts < 40) continue;
      push({
        kicker: line.pts >= 50 ? "Fifty" : "Forty",
        title: `${player.name}, ${line.pts} in the siege`,
        body: `${player.name} scored ${line.pts} for ${lines} in a ${score} night. The log has the possessions.`,
        gameId: game.id,
        importance: line.pts >= 50 ? 90 : 84,
      });
    }
  }
}

function named(game: GameResult, id: string): string {
  if (id === game.homeId) return game.homeName ?? id;
  if (id === game.awayId) return game.awayName ?? id;
  return id;
}

function sideName(game: GameResult, id: string): string {
  if (id === game.homeId) return game.homeName ?? teamLabel(id);
  if (id === game.awayId) return game.awayName ?? teamLabel(id);
  return teamLabel(id);
}

function teamLabel(id: string): string {
  try {
    return teamById(id).name;
  } catch {
    return id;
  }
}

function contractPhrase(player: Player): string {
  switch (player.contract) {
    case "ten-day":
      return "On a 10-day";
    case "exhibit-10":
      return "On an Exhibit 10";
    case "two-way":
      return "On a two-way";
    case "hardship":
      return "On a hardship deal";
    default:
      return "On a short deal";
  }
}
