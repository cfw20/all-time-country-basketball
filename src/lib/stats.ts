import type { GameResult } from "../data/types";

export interface Tot {
  playerId: string;
  teamId: string;
  sec: number;
  pts: number;
  reb: number;
  orb: number;
  drb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  pf: number;
  fgm: number;
  fga: number;
  tpm: number;
  tpa: number;
  ftm: number;
  fta: number;
  pm: number;
  g: number;
  gs: number;
}

export function tally(games: GameResult[], includeExhibition = false): Map<string, Tot> {
  const map = new Map<string, Tot>();
  for (const game of games) {
    if (game.exhibition && !includeExhibition) continue;
    const sides = [
      [game.homeId, game.box.home],
      [game.awayId, game.box.away],
    ] as const;
    for (const [teamId, lines] of sides) {
      for (const line of lines) {
        const row = map.get(line.playerId) ?? {
          playerId: line.playerId,
          teamId,
          sec: 0, pts: 0, reb: 0, orb: 0, drb: 0, ast: 0, stl: 0, blk: 0, tov: 0, pf: 0,
          fgm: 0, fga: 0, tpm: 0, tpa: 0, ftm: 0, fta: 0, pm: 0, g: 0, gs: 0,
        };
        row.sec += line.sec;
        row.pts += line.pts;
        row.reb += line.orb + line.drb;
        row.orb += line.orb;
        row.drb += line.drb;
        row.ast += line.ast;
        row.stl += line.stl;
        row.blk += line.blk;
        row.tov += line.tov;
        row.pf += line.pf;
        row.fgm += line.fgm;
        row.fga += line.fga;
        row.tpm += line.tpm;
        row.tpa += line.tpa;
        row.ftm += line.ftm;
        row.fta += line.fta;
        row.pm += line.pm;
        row.g += 1;
        if (line.started) row.gs += 1;
        map.set(line.playerId, row);
      }
    }
  }
  return map;
}

export function teamLine(games: GameResult[], teamId: string, includeExhibition = false): { w: number; l: number; pf: number; pa: number } {
  const row = { w: 0, l: 0, pf: 0, pa: 0 };
  for (const game of games) {
    if (game.exhibition && !includeExhibition) continue;
    if (game.homeId !== teamId && game.awayId !== teamId) continue;
    const home = game.homeId === teamId;
    row.pf += home ? game.homeScore : game.awayScore;
    row.pa += home ? game.awayScore : game.homeScore;
    if (game.winnerId === teamId) row.w += 1;
    else row.l += 1;
  }
  return row;
}
