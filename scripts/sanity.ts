import { PLAYERS, ROSTERS, TEAMS, playerById } from "../src/data";
import { simulateTournament, simulateTrial, teamPower } from "../src/engine/tournament";

const errors: string[] = [];
const fail = (message: string) => errors.push(message);

if (TEAMS.length !== 33) fail(`expected 33 sides, got ${TEAMS.length}`);
const overflow = TEAMS.filter((t) => t.kind === "overflow");
const homeland = TEAMS.filter((t) => t.kind === "homeland");
const countries = TEAMS.filter((t) => t.kind === "country");
const built = TEAMS.filter((t) => t.kind === "construct");
if (overflow.length !== 3) fail(`expected 3 overflow houses, got ${overflow.length}`);
if (homeland.length !== 1) fail(`expected 1 homeland house, got ${homeland.length}`);
if (countries.length !== 28) fail(`expected 28 countries, got ${countries.length}`);
if (built.length !== 1) fail(`expected 1 constructed side, got ${built.length}`);

const seen = new Map<string, string>();
for (const team of TEAMS) {
  const roster = ROSTERS[team.id] ?? [];
  const expected = 22;
  if (roster.length !== expected) fail(`${team.name} has ${roster.length} players`);
  const early = roster.find((p) => p.primeYear < 1955 || p.primeYear > 2026);
  if (early) fail(`${early.name} prime ${early.primeYear} is outside 1955–2026`);
  const starts = roster.filter((p) => p.starts);
  if (starts.length !== 5) fail(`${team.name} has ${starts.length} opening starters`);
  if (roster.filter((p) => p.contract === "two-way").length < 2) fail(`${team.name} needs two two-ways`);
  if (!roster.some((p) => p.contract === "ten-day" || p.contract === "exhibit-10" || p.contract === "hardship" || p.contract === "short")) {
    fail(`${team.name} needs a short-term deal`);
  }
  if (!roster.some((p) => p.pos === "PG" || p.pos2 === "PG")) fail(`${team.name} has no point guard`);
  for (const player of roster) {
    if (player.ratings.ovr < 60 || player.ratings.ovr > 99) fail(`${player.name} ovr ${player.ratings.ovr}`);
    if (team.kind === "country" && player.nationality !== team.country) {
      fail(`${player.name} nationality ${player.nationality} does not match ${team.country}`);
    }
    if (team.kind === "overflow" && player.nationality !== "United States") {
      fail(`${player.name} on an overflow house is ${player.nationality}`);
    }
    if (team.kind === "homeland" && player.nationality === "United States") {
      fail(`${player.name} should not be American on the Lantern`);
    }
    if (team.kind === "construct" && player.nationality !== "Construct") {
      fail(`${player.name} on the Construct is ${player.nationality}`);
    }
    if (team.kind !== "construct" && player.nationality === "Construct") {
      fail(`${player.name} is marked constructed on a human side`);
    }
    const prior = seen.get(player.name);
    if (prior) fail(`duplicate name ${player.name} (${prior} and ${team.id})`);
    seen.set(player.name, team.id);
  }
}

const expect = (name: string, teamId: string) => {
  const player = PLAYERS.find((p) => p.name === name);
  if (!player) fail(`missing ${name}`);
  else if (player.teamId !== teamId) fail(`${name} is on ${player.teamId}, expected ${teamId}`);
};

expect("Hakeem Olajuwon", "cont");
expect("Joel Embiid", "aftr");
expect("Wilt Chamberlain", "vngd");
expect("Bill Russell", "aftr");
expect("Nikola Jokic", "eagl");
expect("Luka Doncic", "alps");
expect("Giannis Antetokounmpo", "ordr");
expect("Dirk Nowitzki", "iron");
expect("Victor Wembanyama", "roya");
expect("Yao Ming", "drgn");
expect("Dikembe Mutombo", "flve");
expect("Steve Nash", "nrth");
expect("Pascal Siakam", "nrth");
expect("Drazen Petrovic", "fire");
expect("Arvydas Sabonis", "ambr");
expect("Stephen Curry", "cont");
expect("Michael Jordan", "cont");

const nigeria = ROSTERS.grns ?? [];
if (nigeria.some((p) => p.name === "Hakeem Olajuwon")) fail("Hakeem must not be on Nigeria");

const ranked = TEAMS.map((t) => ({ name: t.name, id: t.id, power: teamPower(t.id) })).sort((a, b) => b.power - a.power);
console.log("POWER");
for (const row of ranked) console.log(row.power.toFixed(1).padStart(7), row.name);

const started = Date.now();
const tournament = simulateTournament(20261125, { log: true, exhibitions: true });
const fullMs = Date.now() - started;
const officialSeries = tournament.series.filter((s) => !s.exhibition);
const official = tournament.games.filter((g) => !g.exhibition);
const mean = official.reduce((sum, g) => sum + (g.homeScore + g.awayScore) / 2, 0) / official.length;
console.log(`\nFULL ${fullMs}ms series=${officialSeries.length} games=${official.length} news=${tournament.news.length} mean=${mean.toFixed(1)}`);
const finalSeries = officialSeries.find((s) => s.id === "final");
const final = finalSeries?.games.at(-1);
console.log("FINAL SERIES", finalSeries && `${finalSeries.homeName} ${finalSeries.homeWins}–${finalSeries.awayWins} ${finalSeries.awayName}`, "games", finalSeries?.games.length);
console.log("CLINCHER", final?.homeName, final?.homeScore, final?.awayName, final?.awayScore, "plays", final?.plays.length, "q", final?.quarters.map((q) => `${q.home}-${q.away}`).join(" "));
if (final) {
  const lines = final.box.home.concat(final.box.away);
  const reb = lines.reduce((s, l) => s + l.orb + l.drb, 0);
  const ast = lines.reduce((s, l) => s + l.ast, 0);
  const fga = lines.reduce((s, l) => s + l.fga, 0);
  console.log("FINAL reb", reb, "ast", ast, "fga", fga);
}

function minutes(teamId: string) {
  const map = new Map<string, { sec: number; g: number; pts: number }>();
  for (const game of official) {
    const lines = game.homeId === teamId ? game.box.home : game.awayId === teamId ? game.box.away : null;
    if (!lines) continue;
    for (const line of lines) {
      const row = map.get(line.playerId) ?? { sec: 0, g: 0, pts: 0 };
      row.sec += line.sec;
      row.g += 1;
      row.pts += line.pts;
      map.set(line.playerId, row);
    }
  }
  return [...map.entries()]
    .map(([id, row]) => ({
      name: playerById(id)?.name ?? id,
      role: playerById(id)?.role,
      deal: playerById(id)?.contract,
      mpg: row.g ? row.sec / 60 / row.g : 0,
      ppg: row.g ? row.pts / row.g : 0,
    }))
    .sort((a, b) => b.mpg - a.mpg);
}

console.log("\nCONTINENTAL");
for (const row of minutes("cont")) console.log(row.mpg.toFixed(1).padStart(5), row.ppg.toFixed(1).padStart(5), row.role, row.deal, row.name);
console.log("\nNIGERIA");
for (const row of minutes("grns").slice(0, 10)) console.log(row.mpg.toFixed(1).padStart(5), row.ppg.toFixed(1).padStart(5), row.role, row.deal, row.name);

let twSec = 0;
let twG = 0;
let starSec = 0;
let starG = 0;
for (const game of official) {
  for (const line of game.box.home.concat(game.box.away)) {
    const player = playerById(line.playerId);
    if (!player) continue;
    if (player.contract === "two-way" || player.role === "two-way") {
      twSec += line.sec;
      twG += 1;
    }
    if (player.role === "star") {
      starSec += line.sec;
      starG += 1;
    }
  }
}
const twMpg = twG ? twSec / 60 / twG : 0;
const starMpg = starG ? starSec / 60 / starG : 0;
console.log(`\nstar mpg ${starMpg.toFixed(1)} two-way mpg ${twMpg.toFixed(1)}`);

if (!tournament.awards) fail("missing awards");
if (!tournament.allStar || tournament.allStar.plays.length < 20) fail("all-star log too thin");
if (!tournament.three || !tournament.dunk || !tournament.skills) fail("missing interval contests");
if (officialSeries.length !== 48 + 8 + 4 + 2 + 2) fail(`unexpected series count ${officialSeries.length}`);
for (const item of officialSeries) {
  const wins = Math.max(item.homeWins, item.awayWins);
  const losses = Math.min(item.homeWins, item.awayWins);
  if (wins !== 4 || item.games.length !== 4 + losses) fail(`${item.id} did not end at four wins (${item.homeWins}-${item.awayWins}, ${item.games.length} games)`);
}
if (official.length < officialSeries.length * 4 || official.length > officialSeries.length * 7) fail(`unexpected game count ${official.length}`);
if ((final?.plays.length ?? 0) < 40) fail("final play log too thin");
const siege = tournament.siege;
if (!siege?.arrival || !siege.gate || !siege.restoration) fail("siege is missing a series");
for (const item of [siege?.arrival, siege?.gate, siege?.restoration]) {
  if (!item) continue;
  const wins = Math.max(item.homeWins, item.awayWins);
  if (wins !== 4 || item.games.length < 4 || item.games.length > 7) fail(`${item.id} is not a best-of-seven`);
}
if (tournament.groups.some((group) => group.teamIds.includes("cstr"))) fail("Construct was drawn into a group");
if (tournament.ranking.some((row) => row.teamId === "cstr")) fail("Construct was given a country seed");
if ((siege?.concordIds.length ?? 0) !== 12) fail(`Concord has ${siege?.concordIds.length} players`);
const concordCountries = new Map<string, number>();
for (const id of siege?.concordIds ?? []) {
  const player = playerById(id);
  if (!player || player.teamId === "cstr") fail(`Concord seat ${id} is not a human prime`);
  else concordCountries.set(player.nationality, (concordCountries.get(player.nationality) ?? 0) + 1);
}
if ([...concordCountries.values()].some((count) => count > 5)) fail("Concord broke the five-player country cap");
if (concordCountries.size < 6) fail(`Concord only spans ${concordCountries.size} sides`);
const seriesLine = (item: { awayName?: string; awayWins: number; homeName?: string; homeWins: number; games: unknown[] } | null | undefined) =>
  item && `${item.awayName} ${item.awayWins} @ ${item.homeName} ${item.homeWins} (${item.games.length}g)`;
console.log("SIEGE", seriesLine(siege?.arrival), "|", seriesLine(siege?.gate), "|", seriesLine(siege?.restoration), siege?.threatEnded ? "RESTORED" : "HELD");
console.log("CONCORD", (siege?.concordIds ?? []).map((id, index) => `${index < 5 ? "*" : ""}${playerById(id)?.name}`).join(", "));
if (mean < 102 || mean > 128) fail(`mean score ${mean.toFixed(1)} is outside 102-128`);
const jordan = minutes("cont").find((row) => row.name === "Michael Jordan");
const aminu = minutes("grns").find((row) => row.name === "Al-Farouq Aminu");
if (!jordan || jordan.mpg < 24) fail(`Jordan minutes ${jordan?.mpg.toFixed(1)}`);
if (!aminu || aminu.mpg < 28) fail(`Aminu minutes ${aminu?.mpg.toFixed(1)}`);
if (twMpg > 11) fail(`two-way minutes ${twMpg.toFixed(1)} are too high`);

const trialStart = Date.now();
const champs = new Map<string, number>();
const TRIALS = 40;
let arrivalConstruct = 0;
let gateConstruct = 0;
let restored = 0;
for (let i = 0; i < TRIALS; i++) {
  const trial = simulateTrial(1100 + i * 97);
  champs.set(trial.championId, (champs.get(trial.championId) ?? 0) + 1);
  if (trial.arrivalWinnerId === "cstr") arrivalConstruct += 1;
  if (trial.gateWinnerId === "cstr") gateConstruct += 1;
  if (trial.threatEnded) restored += 1;
  if (!trial.mvpId || !trial.championId || !trial.restorationWinnerId) fail(`bad trial ${trial.seed}`);
}
console.log(`\n${TRIALS} TRIALS ${Date.now() - trialStart}ms`);
for (const [id, n] of [...champs.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(String(n).padStart(3), TEAMS.find((t) => t.id === id)?.name);
}
console.log(`ARRIVAL construct ${arrivalConstruct}/${TRIALS}  GATE construct ${gateConstruct}/${TRIALS}  RESTORED ${restored}/${TRIALS}`);
const contTitles = champs.get("cont") ?? 0;
if (contTitles > 38) fail(`Continental won ${contTitles}/${TRIALS}, the country title is a lock`);
if (contTitles < 8) fail(`Continental won ${contTitles}/${TRIALS}, variance is too wild`);
if (champs.size < 2) fail(`only ${champs.size} champions in ${TRIALS} draws`);
if (arrivalConstruct < 26) fail(`Construct won the arrival ${arrivalConstruct}/${TRIALS}, too mild a threat`);
if (arrivalConstruct > 37) fail(`Construct won the arrival ${arrivalConstruct}/${TRIALS}, the arrival is a lock`);
if (gateConstruct < 26) fail(`Construct won the gate ${gateConstruct}/${TRIALS}, a single country handles them too often`);
if (gateConstruct > 37) fail(`Construct won the gate ${gateConstruct}/${TRIALS}, the gate is a lock`);
if (restored < 4 || restored > 18) fail(`Concord restored the floor ${restored}/${TRIALS}, the climax is out of range`);

if (errors.length) {
  console.error("\nSANITY FAILED");
  for (const message of errors) console.error(" -", message);
  process.exit(1);
}
console.log("\nSANITY OK");
