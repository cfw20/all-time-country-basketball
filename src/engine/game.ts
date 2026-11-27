import { minuteTarget } from "../data/ratings";
import type { BoxLine, GameResult, Play, Player, Pos } from "../data/types";
import { clockLabel, periodName, shortName } from "./names";
import { mulberry32 } from "./rng";

export interface SideInput {
  id: string;
  name: string;
  pace: number;
  players: Player[];
}

export interface GameInput {
  id: string;
  round: string;
  roundLabel: string;
  dayLabel: string;
  venue: string;
  seed: number;
  home: SideInput;
  away: SideInput;
  log?: boolean;
  defNerf?: number;
  exhibition?: boolean;
  /** Sitting this game. Earned in an earlier game of the same series. */
  suspended?: { playerId: string; reason: string }[];
}

interface Live {
  sec: number;
  pts: number;
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
  drawn: number;
  tech: number;
  flagrant: number;
  injured: boolean;
  opened: boolean;
  ejected: boolean;
  ejectReason?: "technicals" | "flagrant" | "fouls";
  suspended: boolean;
  suspendReason?: string;
}

interface Side {
  id: string;
  name: string;
  pace: number;
  players: Player[];
  live: Record<string, Live>;
  lineup: Player[];
  score: number;
  foulsQ: number;
  heat: number;
}

const POS_ORDER: Record<Pos, number> = { PG: 0, SG: 1, SF: 2, PF: 3, C: 4 };

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

function blankLive(): Live {
  return {
    sec: 0, pts: 0, orb: 0, drb: 0, ast: 0, stl: 0, blk: 0, tov: 0, pf: 0,
    fgm: 0, fga: 0, tpm: 0, tpa: 0, ftm: 0, fta: 0, pm: 0, drawn: 0, tech: 0, flagrant: 0,
    injured: false, opened: false, ejected: false, suspended: false,
  };
}

function posFit(player: Player, slot: Pos): number {
  const fit = (pos: Pos) => {
    const d = Math.abs(POS_ORDER[pos] - POS_ORDER[slot]);
    if (d === 0) return 16;
    if (d === 1) return 8;
    if (d === 2) return 0;
    return -14;
  };
  return Math.max(fit(player.pos), player.pos2 ? fit(player.pos2) : -99);
}

interface FloorCtx {
  quarter: number;
  gameMinute: number;
  margin: number;
  blowout: boolean;
  clutch: boolean;
  emergency: boolean;
  opening: boolean;
}

function desire(player: Player, live: Live, ctx: FloorCtx): number {
  const played = live.sec / 60;
  const target = minuteTarget(player);
  const tier =
    player.role === "star" ? 76 :
    player.role === "starter" ? 66 :
    player.role === "rotation" ? 34 :
    player.role === "deep" ? 14 : 4;
  let score = tier + (target - played) * 1.2 + (player.ratings.ovr - 75) * 0.18;
  const spot = player.role === "two-way" || player.contract === "two-way";
  const callup = player.contract === "ten-day" || player.contract === "exhibit-10";
  if (spot) score += ctx.blowout || ctx.emergency ? 24 : played >= 3 ? -42 : -12;
  if (callup) score += ctx.blowout || ctx.emergency ? 28 : -55;
  if (player.contract === "hardship") score += ctx.blowout || ctx.emergency ? 16 : -24;
  if (player.contract === "short" && !ctx.blowout) score -= 8;
  if (live.pf >= 5 && ctx.quarter < 4) score -= 38;
  if (live.pf >= 4 && ctx.quarter <= 2) score -= 14;
  if (ctx.clutch) {
    if (player.role === "star") score += 18;
    else if (player.role === "starter") score += 6;
    else score -= 14;
    if (callup) score -= 20;
  }
  if (ctx.blowout && played > 24 && (player.role === "star" || player.role === "starter")) score -= 30;
  if (ctx.blowout && (player.role === "deep" || player.role === "rotation" || player.role === "two-way")) score += 16;
  if (played >= target + 3) score -= 22;
  return score;
}

function onFloor(live: Live): boolean {
  return live.pf < 6 && !live.injured && !live.ejected && !live.suspended;
}

function available(side: Side): Player[] {
  return side.players.filter((p) => onFloor(side.live[p.id]));
}

function pickLineup(side: Side, ctx: FloorCtx): Player[] {
  const pool = available(side);
  if (pool.length <= 5) return pool.slice();
  if (ctx.opening) {
    const starters = side.players.filter((p) => p.starts && onFloor(side.live[p.id]));
    if (starters.length === 5) return starters;
  }
  const slots: Pos[] = ["PG", "SG", "SF", "PF", "C"];
  const chosen: Player[] = [];
  const used = new Set<string>();
  for (const slot of slots) {
    let best: Player | null = null;
    let bestScore = -Infinity;
    for (const player of pool) {
      if (used.has(player.id)) continue;
      const score = desire(player, side.live[player.id], ctx) + posFit(player, slot);
      if (score > bestScore) {
        bestScore = score;
        best = player;
      }
    }
    if (best) {
      chosen.push(best);
      used.add(best.id);
    }
  }
  if (chosen.length < 5) {
    const rest = pool.filter((p) => !used.has(p.id));
    rest.sort((a, b) => desire(b, side.live[b.id], ctx) - desire(a, side.live[a.id], ctx));
    for (const player of rest) {
      if (chosen.length >= 5) break;
      chosen.push(player);
    }
  }
  return chosen;
}

function unitOff(lineup: Player[]): number {
  let w = 0;
  let s = 0;
  let pass = 0;
  for (const p of lineup) {
    const u = p.ratings.usg;
    w += u;
    const mix = p.ratings.threeRate / 100;
    const skill = mix * p.ratings.three + (1 - mix) * p.ratings.shot;
    s += u * (0.62 * skill + 0.2 * p.ratings.play + 0.18 * p.ratings.ft);
    if (p.ratings.play > pass) pass = p.ratings.play;
  }
  if (w <= 0) return 70;
  return (s / w) * 0.86 + pass * 0.14;
}

function unitDef(lineup: Player[]): number {
  let sum = 0;
  let rim = 0;
  for (const p of lineup) {
    sum += p.ratings.def * 0.72 + p.ratings.ath * 0.28;
    const rimScore = p.ratings.def * 0.5 + p.ratings.reb * 0.25 + p.ratings.ath * 0.25;
    if (rimScore > rim) rim = rimScore;
  }
  return (sum / lineup.length) * 0.75 + rim * 0.25;
}

function pickWeighted(list: Player[], weight: (p: Player) => number, rng: () => number): Player {
  let total = 0;
  for (const p of list) total += Math.max(0.001, weight(p));
  let r = rng() * total;
  for (const p of list) {
    r -= Math.max(0.001, weight(p));
    if (r <= 0) return p;
  }
  return list[list.length - 1];
}

const THREES = ["wing three", "corner three", "step-back three", "pull-up three", "catch-and-shoot three"];
const TWOS = ["layup", "floater", "turnaround", "midrange jumper", "hook", "runner"];

export function simulateGame(input: GameInput): GameResult {
  const rng = mulberry32(input.seed || 1);
  const log = input.log !== false;
  const nerf = input.defNerf ?? 0;
  const names = shortNameMap(input.home.players.concat(input.away.players));
  const home = makeSide(input.home, (rng() - 0.5) * 22);
  const away = makeSide(input.away, (rng() - 0.5) * 22);
  const plays: Play[] = [];
  const quarters: { home: number; away: number }[] = [];
  let leadSign = 0;
  let leadChanges = 0;
  let runTeam = "";
  let run = 0;
  let biggestRun = { teamId: home.id, points: 0 };
  let biggestLead = { teamId: home.id, margin: 0 };
  let buzzer = false;
  const injuryAt: Record<string, number> = {};
  if (rng() < 0.045) injuryAt[home.id] = 500 + Math.floor(rng() * 1900);
  if (rng() < 0.045) injuryAt[away.id] = 500 + Math.floor(rng() * 1900);
  const sat: string[] = [];
  for (const ban of input.suspended ?? []) {
    const side = home.players.some((p) => p.id === ban.playerId) ? home : away.players.some((p) => p.id === ban.playerId) ? away : null;
    if (!side?.live[ban.playerId]) continue;
    side.live[ban.playerId].suspended = true;
    side.live[ban.playerId].suspendReason = ban.reason;
    const player = side.players.find((p) => p.id === ban.playerId);
    if (player) sat.push(`${player.name}, ${ban.reason}`);
  }

  let period = 1;
  let clock = 0;
  let elapsed = 0;
  const worst: Record<string, number> = { [home.id]: 0, [away.id]: 0 };
  const addPlay = (play: Play) => {
    if (log) plays.push(play);
  };
  if (sat.length) {
    addPlay({
      q: 1,
      clock: "12:00",
      text: `Suspended: ${sat.join("; ")}.`,
      home: 0,
      away: 0,
      kind: "note",
      key: true,
    });
  }

  const noteScore = (side: Side, pts: number) => {
    side.score += pts;
    const margin = Math.abs(home.score - away.score);
    const leader = home.score === away.score ? "" : home.score > away.score ? home.id : away.id;
    if (leader && margin > biggestLead.margin) biggestLead = { teamId: leader, margin };
    if (side.id !== runTeam) {
      runTeam = side.id;
      run = pts;
    } else run += pts;
    if (run > biggestRun.points) biggestRun = { teamId: side.id, points: run };
    const sign = Math.sign(home.score - away.score);
    if (sign !== 0 && leadSign !== 0 && sign !== leadSign) leadChanges += 1;
    if (sign !== 0) leadSign = sign;
  };

  const creditPoints = (off: Side, def: Side, pts: number) => {
    noteScore(off, pts);
    for (const p of off.lineup) off.live[p.id].pm += pts;
    for (const p of def.lineup) def.live[p.id].pm -= pts;
  };

  const scorePoints = (off: Side, def: Side, pts: number) => {
    const beforeRun = runTeam === off.id ? run : 0;
    const beforeHome = home.score;
    const beforeAway = away.score;
    const homeDown = Math.max(0, beforeAway - beforeHome);
    const awayDown = Math.max(0, beforeHome - beforeAway);
    if (homeDown > worst[home.id]) worst[home.id] = homeDown;
    if (awayDown > worst[away.id]) worst[away.id] = awayDown;
    creditPoints(off, def, pts);
    let milestone = 0;
    for (const mark of [8, 10, 12, 16]) if (run >= mark && beforeRun < mark) milestone = run;
    if (milestone) {
      addPlay({
        q: period,
        clock: clockLabel(Math.max(0, clock)),
        text: `${off.name}, ${run}–0 run.`,
        home: home.score,
        away: away.score,
        kind: "note",
        key: true,
        teamId: off.id,
      });
    }
    const wasBehind = off.id === home.id ? beforeHome < beforeAway : beforeAway < beforeHome;
    const ahead = off.id === home.id ? home.score > away.score : away.score > home.score;
    const hole = off.id === home.id ? homeDown : awayDown;
    const tied = home.score === away.score;
    if (wasBehind && ahead && hole >= 8) {
      addPlay({
        q: period,
        clock: clockLabel(Math.max(0, clock)),
        text: `${off.name} in front after trailing by ${hole}.`,
        home: home.score,
        away: away.score,
        kind: "note",
        key: true,
        teamId: off.id,
      });
    }
    return { tied, tookLead: wasBehind && ahead };
  };

  const inBonus = (fouls: number, q: number) => (q > 4 ? fouls >= 4 : fouls >= 5);

  const shootFT = (shooter: Player, off: Side, def: Side, n: number) => {
    const prob = clamp(0.5 + (shooter.ratings.ft - 75) * 0.0056, 0.4, 0.95);
    let made = 0;
    for (let i = 0; i < n; i++) {
      off.live[shooter.id].fta += 1;
      if (rng() < prob) {
        off.live[shooter.id].ftm += 1;
        off.live[shooter.id].pts += 1;
        made += 1;
        scorePoints(off, def, 1);
      }
    }
    return made;
  };

  const sendOff = (side: Side, player: Player, reason: "technicals" | "flagrant" | "fouls", ctx: FloorCtx) => {
    const live = side.live[player.id];
    live.ejected = true;
    if (reason === "flagrant" || !live.ejectReason || live.ejectReason === "fouls") live.ejectReason = reason;
    side.lineup = pickLineup(side, ctx);
  };

  /** Dead-ball NBA foul. The team that was about to play keeps the ball after the free throws. */
  const deadBall = (off: Side, def: Side, ctx: FloorCtx) => {
    if (!off.lineup.length || !def.lineup.length) return;
    const roll = rng();
    const flagrant2 = roll < 0.00028;
    const flagrant1 = !flagrant2 && roll < 0.00115;
    const technical = !flagrant1 && !flagrant2 && roll < 0.0064;
    if (!technical && !flagrant1 && !flagrant2) return;
    const fouler = pickWeighted(def.lineup, (p) => 12 + p.ratings.usg * 0.22 + (p.role === "star" ? 5 : 0), rng);
    const live = def.live[fouler.id];
    if (!onFloor(live)) return;
    live.pf += 1;
    def.foulsQ += 1;
    const shooter = pickWeighted(off.lineup, (p) => 16 + p.ratings.ft, rng);
    if (technical) {
      live.tech += 1;
      const made = shootFT(shooter, off, def, 1);
      let why = "";
      if (live.tech >= 2) {
        sendOff(def, fouler, "technicals", ctx);
        why = " Second technical. Ejected.";
      } else if (live.pf >= 6) {
        sendOff(def, fouler, "fouls", ctx);
        why = " Sixth personal foul. Ejected.";
      }
      addPlay({
        q: ctx.quarter,
        clock: clockLabel(clock),
        text: `Technical foul on ${names(fouler)}. ${names(shooter)} makes ${made} of 1.${why}`,
        home: home.score,
        away: away.score,
        kind: "foul",
        key: why.length > 0 || fouler.role === "star",
        teamId: def.id,
      });
      return;
    }
    const level = flagrant2 ? 2 : 1;
    live.flagrant += level === 2 ? 2 : 1;
    const made = shootFT(shooter, off, def, 2);
    let why = "";
    if (level === 2 || live.flagrant >= 2) {
      sendOff(def, fouler, "flagrant", ctx);
      why = " Ejected.";
    } else if (live.pf >= 6) {
      sendOff(def, fouler, "fouls", ctx);
      why = " Sixth personal foul. Ejected.";
    }
    addPlay({
      q: ctx.quarter,
      clock: clockLabel(clock),
      text: `Flagrant ${level} on ${names(fouler)}. ${names(shooter)} makes ${made} of 2.${why}`,
      home: home.score,
      away: away.score,
      kind: "foul",
      key: true,
      teamId: def.id,
    });
  };

  while (period <= 10) {
    const length = period <= 4 ? 720 : 300;
    clock = length;
    home.foulsQ = 0;
    away.foulsQ = 0;
    const qStartHome = home.score;
    const qStartAway = away.score;
    addPlay({
      q: period,
      clock: clockLabel(clock),
      text: period === 1 ? "Tip." : `${periodName(period)} begins.`,
      home: home.score,
      away: away.score,
      kind: "period",
      key: true,
    });
    let offenseIsHome = period % 2 === 1;
    let nextSub = 240;
    let guard = 0;
    while (clock > 0 && guard < 160) {
      guard += 1;
      const off = offenseIsHome ? home : away;
      const def = offenseIsHome ? away : home;
      const gameMinute = elapsed / 60;
      const margin = off.score - def.score;
      const emergency = off.players.some((p) => {
        const live = off.live[p.id];
        return (p.role === "star" || p.role === "starter") && (live.injured || live.pf >= 6 || live.ejected);
      });
      const ctx: FloorCtx = {
        quarter: period,
        gameMinute,
        margin,
        blowout: Math.abs(home.score - away.score) >= 18 && (period >= 3 || gameMinute >= 30),
        clutch: period >= 4 && clock <= 180 && Math.abs(home.score - away.score) <= 10,
        emergency,
        opening: (period === 1 || period === 3) && clock > length - 20,
      };
      if (clock === length || length - clock >= nextSub || off.lineup.some((p) => off.live[p.id].pf >= 6 || off.live[p.id].injured || off.live[p.id].ejected)) {
        const before = off.lineup.map((p) => p.id).join();
        off.lineup = pickLineup(off, ctx);
        def.lineup = pickLineup(def, { ...ctx, margin: -margin, emergency: def.players.some((p) => (p.role === "star" || p.role === "starter") && (def.live[p.id].injured || def.live[p.id].pf >= 6 || def.live[p.id].ejected)) });
        if (period === 1 && clock === length) {
          for (const p of off.lineup) off.live[p.id].opened = true;
          for (const p of def.lineup) def.live[p.id].opened = true;
        }
        if (off.lineup.map((p) => p.id).join() !== before && log) {
          addPlay({
            q: period,
            clock: clockLabel(clock),
            text: `${off.name} on the floor: ${off.lineup.map((p) => names(p)).join(", ")}.`,
            home: home.score,
            away: away.score,
            kind: "sub",
            key: false,
            teamId: off.id,
          });
        }
        if (length - clock >= nextSub) nextSub += 240;
      }
      if (!off.lineup.length || !def.lineup.length) break;
      deadBall(off, def, ctx);
      if (!off.lineup.length || !def.lineup.length) break;

      const pace = (off.pace + def.pace) / 2;
      let used = (10 + rng() * 8) / pace;
      if (ctx.clutch) used *= 0.86;
      if (used < 6) used = 6;
      if (used > clock) used = clock;
      for (const p of off.lineup) off.live[p.id].sec += used;
      for (const p of def.lineup) def.live[p.id].sec += used;
      clock -= used;
      elapsed += used;

      for (const side of [off, def]) {
        const at = injuryAt[side.id];
        if (at !== undefined && elapsed >= at && injuryAt[side.id] !== -1) {
          injuryAt[side.id] = -1;
          const on = side.lineup.filter((p) => p.role === "star" || p.role === "starter" || p.role === "rotation");
          if (on.length) {
            const victim = on[Math.floor(rng() * on.length)];
            side.live[victim.id].injured = true;
            side.lineup = pickLineup(side, ctx);
            addPlay({
              q: period,
              clock: clockLabel(clock),
              text: `Injury scare: ${victim.name} leaves and does not return tonight. The other side of the roster is active.`,
              home: home.score,
              away: away.score,
              kind: "injury",
              key: true,
              teamId: side.id,
            });
          }
        }
      }

      const net = unitOff(off.lineup) + off.heat - (unitDef(def.lineup) + def.heat * 0.15) - nerf;
      const deficit = def.score - off.score;
      const shotNet = net + (deficit >= 12 && period >= 2 ? Math.min(4, (deficit - 10) * 0.28) : 0);
      const ball = pickWeighted(off.lineup, (p) => {
        let u = p.ratings.usg;
        if (ctx.clutch && p.role === "star") u *= 1.45;
        if (ctx.clutch && (p.role === "deep" || p.role === "two-way")) u *= 0.55;
        return u;
      }, rng);
      const ballLive = off.live[ball.id];
      const clutchBump = ctx.clutch ? (ball.ratings.clutch - 78) * 0.0016 : 0;
      const tovP = clamp(0.082 - shotNet * 0.0014, 0.042, 0.14);
      let foulP = clamp(0.095 + ball.ratings.ath * 0.00035, 0.07, 0.15);
      if (period >= 4 && clock <= 28 && margin >= 1 && margin <= 6) foulP = Math.min(0.28, foulP + 0.09);
      const roll = rng();

      const foulSomeone = () => {
        const fouler = pickWeighted(def.lineup, (p) => 30 + (100 - p.ratings.def) + (p.pos === "C" || p.pos === "PF" ? 8 : 0), rng);
        def.live[fouler.id].pf += 1;
        def.foulsQ += 1;
        if (def.live[fouler.id].pf >= 6 && !def.live[fouler.id].ejected) {
          def.live[fouler.id].ejected = true;
          def.live[fouler.id].ejectReason = "fouls";
          addPlay({
            q: period,
            clock: clockLabel(clock),
            text: `Foul out: ${fouler.name}, sixth personal foul. Ejected.`,
            home: home.score,
            away: away.score,
            kind: "foul",
            key: fouler.role === "star" || fouler.role === "starter",
            teamId: def.id,
          });
          def.lineup = pickLineup(def, ctx);
        }
        return fouler;
      };

      if (roll < tovP) {
        ballLive.tov += 1;
        const stealer = pickWeighted(def.lineup, (p) => p.ratings.def * (p.pos === "PG" || p.pos === "SG" ? 1.35 : 0.75), rng);
        if (rng() < 0.6) def.live[stealer.id].stl += 1;
        addPlay({
          q: period,
          clock: clockLabel(clock),
          text: rng() < 0.6 ? `${names(ball)} turnover. ${names(stealer)} steals.` : `${names(ball)} loses it.`,
          home: home.score,
          away: away.score,
          kind: "turn",
          key: ctx.clutch,
          teamId: off.id,
        });
        offenseIsHome = !offenseIsHome;
        continue;
      }

      if (roll < tovP + foulP && rng() < 0.42) {
        const fouler = foulSomeone();
        ballLive.drawn += 1;
        if (inBonus(def.foulsQ, period)) {
          const made = shootFT(ball, off, def, 2);
          addPlay({
            q: period,
            clock: clockLabel(clock),
            text: `Bonus foul on ${names(fouler)}. ${names(ball)} makes ${made} of 2.`,
            home: home.score,
            away: away.score,
            kind: "foul",
            key: false,
            teamId: def.id,
          });
          offenseIsHome = !offenseIsHome;
        } else {
          addPlay({
            q: period,
            clock: clockLabel(clock),
            text: `Common foul on ${names(fouler)}. ${off.name} keeps the ball.`,
            home: home.score,
            away: away.score,
            kind: "foul",
            key: false,
            teamId: def.id,
          });
        }
        continue;
      }

      if (roll < tovP + foulP) {
        const spacing = lineupThree(off.lineup);
        const three = rng() < clamp(ball.ratings.threeRate / 100 * 0.45 + (spacing - 70) * 0.001, 0.02, 0.3);
        const fouler = foulSomeone();
        ballLive.drawn += 1;
        const n = three ? 3 : 2;
        const made = shootFT(ball, off, def, n);
        addPlay({
          q: period,
          clock: clockLabel(clock),
          text: `Shooting foul on ${names(fouler)}. ${names(ball)} makes ${made} of ${n}.`,
          home: home.score,
          away: away.score,
          kind: "foul",
          key: clock < 30 && period >= 4,
          teamId: def.id,
        });
        offenseIsHome = !offenseIsHome;
        continue;
      }

      const spacing = lineupThree(off.lineup);
      const threeRate = clamp(ball.ratings.threeRate / 100 + (spacing - 72) * 0.0016, 0.02, 0.62);
      const isThree = rng() < threeRate;
      const makeP = isThree
        ? clamp(0.4 + (ball.ratings.three - 76) * 0.0045 + shotNet * 0.0034 + clutchBump, 0.3, 0.55)
        : clamp(0.57 + (ball.ratings.shot - 76) * 0.0042 + shotNet * 0.003 + (ball.ratings.ath - 78) * 0.0007 + clutchBump, 0.45, 0.74);
      const madeShot = rng() < makeP;
      ballLive.fga += 1;
      if (isThree) ballLive.tpa += 1;
      const shotName = isThree
        ? THREES[Math.floor(rng() * THREES.length)]
        : ball.ratings.ath >= 88 && ball.ratings.shot >= 78 && rng() < 0.2
          ? "dunk"
          : ball.pos === "C" && rng() < 0.34
            ? "hook"
            : TWOS[Math.floor(rng() * TWOS.length)];

      if (!madeShot && !isThree) {
        const blocker = pickWeighted(def.lineup, (p) => p.ratings.def * (p.pos === "C" || p.pos === "PF" ? 1.45 : 0.5), rng);
        const blkP = clamp((blocker.ratings.def - 80) * 0.0032, 0.01, 0.12);
        if (rng() < blkP) {
          def.live[blocker.id].blk += 1;
          addPlay({
            q: period,
            clock: clockLabel(clock),
            text: `${names(blocker)} blocks ${names(ball)}.`,
            home: home.score,
            away: away.score,
            kind: "miss",
            key: period >= 3 || blocker.role === "star",
            teamId: def.id,
          });
          const reb = pickWeighted(def.lineup, (p) => p.ratings.reb, rng);
          def.live[reb.id].drb += 1;
          offenseIsHome = !offenseIsHome;
          continue;
        }
      }

      if (madeShot) {
        const pts = isThree ? 3 : 2;
        ballLive.fgm += 1;
        if (isThree) ballLive.tpm += 1;
        ballLive.pts += pts;
        const beforeHome = home.score;
        const beforeAway = away.score;
        scorePoints(off, def, pts);
        let assist = "";
        if (rng() < 0.38 + Math.max(...off.lineup.map((p) => p.ratings.play)) * 0.0025) {
          const mates = off.lineup.filter((p) => p.id !== ball.id);
          if (mates.length) {
            const passer = pickWeighted(mates, (p) => p.ratings.play, rng);
            off.live[passer.id].ast += 1;
            assist = ` Assisted by ${names(passer)}.`;
          }
        }
        let andOne = "";
        if (rng() < 0.09 + ball.ratings.ath / 2400) {
          const fouler = foulSomeone();
          ballLive.drawn += 1;
          const ft = shootFT(ball, off, def, 1);
          andOne = ft ? ` And-one over ${names(fouler)}.` : ` Fouled by ${names(fouler)}, misses the free throw.`;
        }
        const tiedNow = home.score === away.score;
        const tookNow = off.id === home.id ? beforeHome <= beforeAway && home.score > away.score : beforeAway <= beforeHome && away.score > home.score;
        const tookLead = period >= 4 && clock === 0 && tookNow;
        if (tookLead) buzzer = true;
        const stamp = tiedNow ? " Ties it." : tookNow ? " Takes the lead." : "";
        addPlay({
          q: period,
          clock: clockLabel(Math.max(0, clock)),
          text: `${names(ball)} ${shotName}.${assist}${andOne}${stamp}`,
          home: home.score,
          away: away.score,
          kind: "make",
          key: tookLead || tiedNow || tookNow || andOne !== "" || shotName === "dunk" || (period >= 4 && clock < 90) || (pts === 3 && ctx.clutch),
          teamId: off.id,
        });
        if (period >= 4 && clock < 120 && Math.abs(home.score - away.score) <= 8 && def.players.length && rng() < 0.22) {
          addPlay({
            q: period,
            clock: clockLabel(clock),
            text: `Timeout, ${def.name}.`,
            home: home.score,
            away: away.score,
            kind: "timeout",
            key: true,
            teamId: def.id,
          });
        }
        offenseIsHome = !offenseIsHome;
        continue;
      }

      const offBoard = boardWeight(off.lineup);
      const defBoard = boardWeight(def.lineup);
      const orebP = clamp(0.18 + (offBoard - defBoard) * 0.004, 0.1, 0.32);
      if (rng() < orebP) {
        const reb = pickWeighted(off.lineup, (p) => p.ratings.reb * (p.pos === "C" || p.pos === "PF" ? 1.3 : 0.8), rng);
        off.live[reb.id].orb += 1;
        if (rng() < 0.46) {
          const put = off.live[reb.id];
          put.fga += 1;
          const putP = clamp(0.5 + (reb.ratings.shot - 74) * 0.003, 0.36, 0.68);
          if (rng() < putP) {
            put.fgm += 1;
            put.pts += 2;
            const swing = scorePoints(off, def, 2);
            addPlay({
              q: period,
              clock: clockLabel(clock),
              text: `${names(reb)} offensive rebound and putback.${swing.tied ? " Ties it." : swing.tookLead ? " Takes the lead." : ""}`,
              home: home.score,
              away: away.score,
              kind: "make",
              key: clock < 40 && period >= 4,
              teamId: off.id,
            });
            offenseIsHome = !offenseIsHome;
            continue;
          }
        }
        addPlay({
          q: period,
          clock: clockLabel(clock),
          text: `${names(ball)} misses. ${names(reb)} keeps it alive.`,
          home: home.score,
          away: away.score,
          kind: "miss",
          key: false,
          teamId: off.id,
        });
        continue;
      }
      const reb = pickWeighted(def.lineup, (p) => p.ratings.reb * (p.pos === "C" || p.pos === "PF" ? 1.35 : 0.75), rng);
      def.live[reb.id].drb += 1;
      addPlay({
        q: period,
        clock: clockLabel(clock),
        text: `${names(ball)} misses the ${shotName}. ${names(reb)} rebound.`,
        home: home.score,
        away: away.score,
        kind: "miss",
        key: false,
        teamId: def.id,
      });
      offenseIsHome = !offenseIsHome;
    }

    quarters.push({ home: home.score - qStartHome, away: away.score - qStartAway });
    if (period >= 4 && home.score !== away.score) break;
    if (period >= 4 && home.score === away.score) {
      addPlay({
        q: period,
        clock: "0:00",
        text: period === 4 ? "Tied. Overtime." : "Still tied. Another overtime.",
        home: home.score,
        away: away.score,
        kind: "period",
        key: true,
      });
    }
    period += 1;
  }

  if (home.score === away.score) {
    const favored = unitOff(home.players.slice(0, 5)) >= unitOff(away.players.slice(0, 5)) ? home : away;
    noteScore(favored, 1);
  }

  const ot = Math.max(0, quarters.length - 4);
  const winnerId = home.score >= away.score ? home.id : away.id;
  const loserId = winnerId === home.id ? away.id : home.id;
  return {
    id: input.id,
    round: input.round,
    roundLabel: input.roundLabel,
    dayLabel: input.dayLabel,
    venue: input.venue,
    seed: input.seed,
    homeId: home.id,
    awayId: away.id,
    homeName: input.home.name,
    awayName: input.away.name,
    quarters,
    homeScore: home.score,
    awayScore: away.score,
    ot,
    box: { home: toBox(home), away: toBox(away) },
    plays,
    biggestLead,
    biggestRun,
    leadChanges,
    winnerId,
    loserId,
    buzzerBeater: buzzer,
    comeback: worst[winnerId] >= 12 ? { teamId: winnerId, deficit: worst[winnerId] } : undefined,
    exhibition: input.exhibition,
  };
}

function lineupThree(lineup: Player[]): number {
  let s = 0;
  for (const p of lineup) s += p.ratings.three;
  return s / lineup.length;
}

function boardWeight(lineup: Player[]): number {
  let s = 0;
  for (const p of lineup) s += p.ratings.reb;
  return s / lineup.length;
}

function makeSide(input: SideInput, heat: number): Side {
  const live: Record<string, Live> = {};
  for (const p of input.players) live[p.id] = blankLive();
  return {
    id: input.id,
    name: input.name,
    pace: input.pace,
    players: input.players,
    live,
    lineup: [],
    score: 0,
    foulsQ: 0,
    heat,
  };
}

function toBox(side: Side): BoxLine[] {
  const lines: BoxLine[] = [];
  for (const p of side.players) {
    const live = side.live[p.id];
    if (live.sec <= 0 && live.pf === 0 && !live.injured && !live.suspended && !live.ejected) continue;
    lines.push({
      playerId: p.id,
      sec: Math.round(live.sec),
      pts: live.pts,
      orb: live.orb,
      drb: live.drb,
      ast: live.ast,
      stl: live.stl,
      blk: live.blk,
      tov: live.tov,
      pf: live.pf,
      fgm: live.fgm,
      fga: live.fga,
      tpm: live.tpm,
      tpa: live.tpa,
      ftm: live.ftm,
      fta: live.fta,
      pm: live.pm,
      drawn: live.drawn,
      tech: live.tech,
      flagrant: live.flagrant,
      started: live.opened,
      fouledOut: live.pf >= 6,
      injured: live.injured,
      ejected: live.ejected,
      ejectReason: live.ejectReason,
      suspended: live.suspended || undefined,
      suspendReason: live.suspendReason,
    });
  }
  lines.sort((a, b) => Number(Boolean(a.suspended)) - Number(Boolean(b.suspended)) || Number(b.started) - Number(a.started) || b.sec - a.sec);
  return lines;
}

function shortNameMap(pool: Player[]): (p: Player) => string {
  const cache = new Map<string, string>();
  for (const p of pool) cache.set(p.id, shortName(p, pool));
  return (p) => cache.get(p.id) ?? p.name;
}
