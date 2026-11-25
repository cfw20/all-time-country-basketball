import type { GameResult, SeriesResult } from "../data/types";
import { simulateGame, type SideInput } from "./game";
import { mixSeed } from "./rng";

/** Games 1, 2, 5, and 7 list the series home on the home side. 3, 4, and 6 flip the card. No scoring bonus. */
const SERIES_HOME_HOSTS = new Set([1, 2, 5, 7]);

export function playSeries(input: {
  id: string;
  round: string;
  roundLabel: string;
  dayLabel: string;
  seed: number;
  log: boolean;
  venues: string[];
  home: SideInput;
  away: SideInput;
  exhibition?: boolean;
}): SeriesResult {
  const games: GameResult[] = [];
  let homeWins = 0;
  let awayWins = 0;
  for (let n = 1; n <= 7 && homeWins < 4 && awayWins < 4; n++) {
    const hostHome = SERIES_HOME_HOSTS.has(n);
    const gameHome = hostHome ? input.home : input.away;
    const gameAway = hostHome ? input.away : input.home;
    const gameId = `${input.id}-${n}`;
    const gameSeed = mixSeed(input.seed, gameId);
    const played = simulateGame({
      id: gameId,
      round: input.round,
      roundLabel: input.roundLabel,
      dayLabel: input.dayLabel,
      venue: input.venues[mixSeed(gameSeed, String(n)) % input.venues.length],
      seed: gameSeed,
      home: gameHome,
      away: gameAway,
      log: input.log,
      exhibition: input.exhibition,
    });
    games.push({ ...played, seriesId: input.id });
    if (played.winnerId === input.home.id) homeWins += 1;
    else awayWins += 1;
  }
  const winnerId = homeWins >= 4 ? input.home.id : input.away.id;
  const loserId = winnerId === input.home.id ? input.away.id : input.home.id;
  return {
    id: input.id,
    round: input.round,
    roundLabel: input.roundLabel,
    dayLabel: input.dayLabel,
    homeId: input.home.id,
    awayId: input.away.id,
    homeName: input.home.name,
    awayName: input.away.name,
    games,
    homeWins,
    awayWins,
    winnerId,
    loserId,
    exhibition: input.exhibition,
  };
}

export function seriesRecord(series: SeriesResult): { winnerWins: number; loserWins: number } {
  return {
    winnerWins: Math.max(series.homeWins, series.awayWins),
    loserWins: Math.min(series.homeWins, series.awayWins),
  };
}

export function seriesLabel(series: SeriesResult): string {
  const { winnerWins, loserWins } = seriesRecord(series);
  const winner = series.winnerId === series.homeId ? series.homeName : series.awayName;
  const loser = series.winnerId === series.homeId ? series.awayName : series.homeName;
  return `${winner ?? series.winnerId} ${winnerWins}–${loserWins} ${loser ?? series.loserId}`;
}
