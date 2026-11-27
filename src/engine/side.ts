import { rosterOf, teamById } from "../data";
import type { GameResult, SeriesResult } from "../data/types";
import { simulateGame, type SideInput } from "./game";
import { mixSeed, mulberry32 } from "./rng";
import { ERA_CARDS, eraCard, eraSide } from "./season";
import { playSeries } from "./series";

const VENUES = ["The Open Ring", "Lampblack Dome, Lisbon", "The Copper Vault, Milan", "Amber Hall, Vilnius"];

export function countrySide(teamId: string): SideInput {
  const team = teamById(teamId);
  return { id: team.id, name: team.name, pace: team.pace, players: rosterOf(team.id) };
}

export function drawClash(seed: number): { a: string; b: string } {
  const rng = mulberry32(seed);
  const a = ERA_CARDS[Math.floor(rng() * ERA_CARDS.length)];
  let b = ERA_CARDS[Math.floor(rng() * ERA_CARDS.length)];
  let guard = 0;
  while (b.id === a.id && guard < 8) {
    b = ERA_CARDS[Math.floor(rng() * ERA_CARDS.length)];
    guard += 1;
  }
  return { a: a.id, b: b.id };
}

export function playClash(aId: string, bId: string, seed: number, log = true): GameResult {
  const left = eraSide(aId, new Set(), mixSeed(seed, "clash-left"));
  const right = eraSide(bId, new Set(left.players.map((player) => player.id)), mixSeed(seed, "clash-right"));
  const home = eraCard(aId);
  return simulateGame({
    id: `clash-${seed}`,
    round: "clash",
    roundLabel: "Era clash",
    dayLabel: "Side floor",
    venue: home.arena,
    seed,
    home: left,
    away: right,
    log,
    exhibition: true,
  });
}

export function playQuick(homeId: string, awayId: string, seed: number, log = false): SeriesResult {
  return playSeries({
    id: `quick-${seed}`,
    round: "quick",
    roundLabel: "A series tonight",
    dayLabel: "Side floor",
    seed,
    log,
    venues: VENUES,
    home: countrySide(homeId),
    away: countrySide(awayId),
    exhibition: true,
  });
}

export interface ThroneGame {
  round: string;
  a: string;
  b: string;
  aScore: number;
  bScore: number;
  winner: string;
  seed: number;
}

export function drawThrone(seed: number): string[] {
  const rng = mulberry32(mixSeed(seed, "throne-draw"));
  const take = (tier: "myth" | "banner" | "solid", count: number, used: Set<string>) => {
    const pool = ERA_CARDS.filter((card) => card.tier === tier && !used.has(card.id));
    const picked: string[] = [];
    const copy = pool.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const swap = copy[i];
      copy[i] = copy[j];
      copy[j] = swap;
    }
    for (const card of copy) {
      if (picked.length >= count) break;
      picked.push(card.id);
      used.add(card.id);
    }
    return picked;
  };
  const used = new Set<string>();
  return [...take("myth", 2, used), ...take("banner", 3, used), ...take("solid", 3, used)];
}

export function playThrone(seed: number): { games: ThroneGame[]; champion: string } {
  let field = drawThrone(seed);
  const games: ThroneGame[] = [];
  const rounds = ["Quarter", "Semi", "The throne"];
  let round = 0;
  while (field.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < field.length; i += 2) {
      const a = field[i];
      const b = field[i + 1];
      const gameSeed = mixSeed(seed, `throne-${round}-${i}`);
      const played = playClash(a, b, gameSeed, false);
      const winner = played.winnerId === a ? a : b;
      games.push({
        round: rounds[round] ?? "Night",
        a,
        b,
        aScore: played.homeScore,
        bScore: played.awayScore,
        winner,
        seed: gameSeed,
      });
      next.push(winner);
    }
    field = next;
    round += 1;
  }
  return { games, champion: field[0] };
}

export function throneNight(game: ThroneGame): GameResult {
  return playClash(game.a, game.b, game.seed, true);
}
