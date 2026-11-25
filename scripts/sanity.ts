import { CONSTRUCT_ID, PLAYERS, ROSTERS, TEAMS, isConstructed, playerById } from "../src/data";
import {
  OLY_ID,
  OLY_ROSTER,
  earnedOlympicBoosters,
  olympicRosterLegal,
  olympicVerdict,
  olympicsLockLine,
  olympicsUnlock,
  draftOlympicPrime,
  olympicMeetReading,
  openOlympicFinal,
  playOlympics,
  readOlympicSide,
  releaseOlympicPrime,
  rerollOlympic,
  startOlympicBuild,
  takeOlympicPrime,
} from "../src/engine/olympics";
import { ERA_CARDS, eraCard, freshCharges, honorFor, seasonRecord, simulateSeason, startYear, yearUnlock } from "../src/engine/season";
import { OLYMPICS_KEY } from "../src/state/olympicsBook";
import { playDecade, playFive, playFortnight, playGauntlet, playHill, playOpen, playSurvivor } from "../src/engine/floors";
import { TRIVIA_PLAYS } from "../src/engine/trivia";
import { TOY_PLAYS } from "../src/engine/toys";
import { drawThrone, playClash, playQuick, playThrone } from "../src/engine/side";
import { castFromGame, playAfter, type AfterKind } from "../src/engine/after";
import { lightLamp } from "../src/engine/tournament";
import { SERIES_MAX_GAMES, SERIES_WINS, seriesIsBestOfSeven } from "../src/engine/series";
import { simulateTournament, simulateTrial, teamPower, type TrialSummary } from "../src/engine/tournament";
import { readPlayerStyle, readStyle } from "../src/engine/style";

const errors: string[] = [];
const fail = (message: string) => errors.push(message);

if (TEAMS.length !== 57) fail(`expected 57 sides, got ${TEAMS.length}`);
const overflow = TEAMS.filter((t) => t.kind === "overflow");
const homeland = TEAMS.filter((t) => t.kind === "homeland");
const countries = TEAMS.filter((t) => t.kind === "country");
const built = TEAMS.filter((t) => t.kind === "construct");
if (overflow.length !== 34) fail(`expected 34 overflow houses, got ${overflow.length}`);
if (homeland.length !== 4) fail(`expected 4 homeland houses, got ${homeland.length}`);
if (countries.length !== 18) fail(`expected 18 countries, got ${countries.length}`);
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
  const startsBefore = roster.map((player) => player.starts);
  const style = readStyle({ pace: team.pace, players: roster, built: team.kind === "construct" });
  if (roster.some((player, index) => player.starts !== startsBefore[index])) fail(`${team.name} style mutated the roster`);
  if (!style.name.trim()) fail(`${team.name} style name is empty`);
  if (style.facets.length < 3 || style.facets.length > 5) fail(`${team.name} has ${style.facets.length} style facets`);
  if (team.kind === "construct" && !/built/i.test(style.line)) fail("Construct style does not say it is built");
  if (team.kind !== "construct" && style.built) fail(`${team.name} style is marked built`);
}

for (const player of PLAYERS) {
  const look = readPlayerStyle(player);
  if (!look.name.trim() || !look.line.trim()) fail(`${player.name} has an empty style`);
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
expect("Yao Ming", "bstn");
expect("Dikembe Mutombo", "bstn");
expect("Karl-Anthony Towns", "bstn");
expect("Steve Nash", "nrth");
expect("Fred VanVleet", "nrth");
expect("Scottie Barnes", "nrth");
expect("Thomas Heurtel", "roya");
expect("Rodrigue Beaubois", "roya");
expect("Mel Daniels", "fndr");
expect("Tyreke Evans", "apex");
expect("Ron Harper", "rely");
expect("Marcus Camby", "sill");
expect("Pascal Siakam", "nrth");
expect("Drazen Petrovic", "fire");
expect("Arvydas Sabonis", "ambr");
expect("Stephen Curry", "cont");
expect("Michael Jordan", "cont");
expect("Rudy LaRusso", "lntl");
expect("Herb Jones", "orry");
expect("Dick McGuire", "nave");
expect("Coby White", "crnc");
expect("Jimmy Jones", "mull");
expect("Joe Barry Carroll", "quon");
expect("Eddie Johnson", "apse");
expect("Johnny Moore", "spir");
expect("Wlamir Marques", "auri");
expect("Hector Campana", "plat");
expect("Janis Krumins", "gate");
expect("Ivo Daneu", "alps");
expect("Boban Marjanovic", "eagl");
expect("Alex Sarr", "roya");
expect("Zaccharie Risacher", "roya");
expect("Toumani Camara", "lant");
expect("Zach Edey", "nrth");
expect("Shaedon Sharpe", "nrth");

const nigeria = ROSTERS.grns ?? [];
if (nigeria.some((p) => p.name === "Hakeem Olajuwon")) fail("Hakeem must not be on Nigeria");

const ranked = TEAMS.map((t) => ({ name: t.name, id: t.id, kind: t.kind, power: teamPower(t.id) })).sort((a, b) => b.power - a.power);
console.log("POWER");
for (const row of ranked) console.log(row.power.toFixed(1).padStart(7), row.kind, row.name);
for (const row of ranked) {
  if (row.kind !== "construct" && row.power < 820) fail(`${row.name} power ${row.power.toFixed(0)} is below the field floor`);
}

const started = Date.now();
const tournament = simulateTournament(20261125, { log: true, exhibitions: true });
const fullMs = Date.now() - started;
const officialSeries = tournament.series.filter((s) => !s.exhibition);
const official = tournament.games.filter((g) => !g.exhibition);
const mean = official.reduce((sum, g) => sum + (g.homeScore + g.awayScore) / 2, 0) / official.length;
console.log(`\nFULL ${fullMs}ms groups=${tournament.groups.length} series=${officialSeries.length} games=${official.length} news=${tournament.news.length} mean=${mean.toFixed(1)}`);
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
  const cast = castFromGame(final);
  const kinds: AfterKind[] = ["horse", "rack", "stripe", "poster", "circuit", "buzzer"];
  for (const kind of kinds) {
    const result = playAfter(cast, kind, 0);
    if (!result.winner || result.rows.length < 2) fail(`${kind} did not play after the final`);
    const again = playAfter(cast, kind, 0);
    if (again.line !== result.line || again.winner !== result.winner) fail(`${kind} is not stable on the same salt`);
  }
  console.log("AFTER", kinds.map((kind) => `${kind} ${playAfter(cast, kind, 1).winner}`).join(" · "));
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
console.log("\nBASTION");
for (const row of minutes("bstn").slice(0, 8)) console.log(row.mpg.toFixed(1).padStart(5), row.ppg.toFixed(1).padStart(5), row.role, row.deal, row.name);

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
const expectedSeries = tournament.groups.length * 6 + 8 + 4 + 2 + 2;
if (SERIES_WINS !== 4 || SERIES_MAX_GAMES !== 7) fail("the series scheduler is not best of seven");
if (tournament.groups.length !== 14) fail(`expected 14 groups, got ${tournament.groups.length}`);
if (tournament.groups.some((group) => group.teamIds.length !== 4)) fail("a group is not four sides");
const r16ids = new Set(tournament.series.filter((item) => item.round === "r16").flatMap((item) => [item.homeId, item.awayId]));
if (r16ids.size !== 16) fail(`round of 16 has ${r16ids.size} sides`);
if (officialSeries.length !== expectedSeries) fail(`unexpected series count ${officialSeries.length}`);
const mainRounds = ["group-1", "group-2", "group-3", "r16", "qf", "sf", "final", "third"];
for (const round of mainRounds) {
  if (!officialSeries.some((item) => item.round === round)) fail(`missing official round ${round}`);
}
for (const item of officialSeries) {
  if (!seriesIsBestOfSeven(item)) fail(`${item.id} is not a best-of-seven (${item.homeWins}-${item.awayWins}, ${item.games.length} games)`);
}
if (official.length < officialSeries.length * 4 || official.length > officialSeries.length * 7) fail(`unexpected game count ${official.length}`);
if ((final?.plays.length ?? 0) < 40) fail("final play log too thin");
const siege = tournament.siege;
if (!siege?.arrival || !siege.gate || !siege.restoration) fail("siege is missing a series");
for (const item of [siege?.arrival, siege?.gate, siege?.restoration]) {
  if (!item || !seriesIsBestOfSeven(item)) fail(`${item?.id ?? "siege"} is not a best-of-seven`);
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
const yao = minutes("bstn").find((row) => row.name === "Yao Ming");
if (!jordan || jordan.mpg < 24) fail(`Jordan minutes ${jordan?.mpg.toFixed(1)}`);
if (!yao || yao.mpg < 24) fail(`Yao minutes ${yao?.mpg.toFixed(1)}`);
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
const leader = [...champs.entries()].sort((a, b) => b[1] - a[1])[0];
if (!leader || leader[0] !== "cont") fail(`Continental is not the most common champion`);
if (contTitles > 34) fail(`Continental won ${contTitles}/${TRIALS}, the country title is a lock`);
if (contTitles < 8) fail(`Continental won ${contTitles}/${TRIALS}, variance is too wild`);
if (champs.size < 2) fail(`only ${champs.size} champions in ${TRIALS} draws`);
// Seeds 1100 + i*97 with fifty-six human sides: arrival 33, gate 34, restored 4.
if (arrivalConstruct !== 33) fail(`Construct won the arrival ${arrivalConstruct}/${TRIALS}, expected 33`);
if (gateConstruct !== 34) fail(`Construct won the gate ${gateConstruct}/${TRIALS}, expected 34`);
if (restored !== 4) fail(`Concord restored the floor ${restored}/${TRIALS}, expected 4`);

for (const card of ERA_CARDS) {
  if (card.playerIds.length < 2) fail(`${card.franchise} ${card.years} lists ${card.playerIds.length} primes`);
}
const sweep = { arrivalWinnerId: "cstr", gateWinnerId: "cstr", threatEnded: false } as TrialSummary;
const strike = { arrivalWinnerId: "cont", gateWinnerId: "cstr", threatEnded: false } as TrialSummary;
const restoredTrial = { arrivalWinnerId: "cstr", gateWinnerId: "cstr", threatEnded: true } as TrialSummary;
if (yearUnlock([sweep]).open) fail("one Construct sweep opened the Unbroken Year");
if (yearUnlock([sweep, sweep]).open) fail("two Construct sweeps opened the Unbroken Year");
if (yearUnlock([strike]).open) fail("a single human series opened the Unbroken Year");
if (!yearUnlock([sweep, strike]).open) fail("a second championship and a human series left the Unbroken Year shut");
if (!yearUnlock([restoredTrial, sweep]).open) fail("a Concord restoration did not count toward the Unbroken Year");
const strongIds = ["michael-jordan", "lebron-james", "stephen-curry", "nikola-jokic", "magic-johnson", "tim-duncan", "kareem-abdul-jabbar", "giannis-antetokounmpo", "kevin-durant", "shaquille-oneal", "larry-bird", "kobe-bryant"];
const weakIds = ["luc-longley", "tristan-thompson", "rik-smits", "michael-cooper", "dennis-rodman", "jeremy-sochan", "boris-diaw", "josh-giddey", "steven-adams", "hidayet-turkoglu", "robert-horry", "detlef-schrempf"];
const strongYear = seasonRecord(simulateSeason(strongIds, 20261125));
const weakYear = seasonRecord(simulateSeason(weakIds, 20261125));
console.log(`YEAR strong ${strongYear.wins}-${strongYear.losses} weak ${weakYear.wins}-${weakYear.losses}`);
if (strongYear.wins + strongYear.losses !== 82 || weakYear.wins + weakYear.losses !== 82) fail("a season did not play 82 games");
if (strongYear.wins < 72 || strongYear.wins > 82) fail(`strong Unbroken roster went ${strongYear.wins}-${strongYear.losses}`);
if (weakYear.wins > 65 || weakYear.wins >= strongYear.wins) fail(`thin Unbroken roster went ${weakYear.wins}-${weakYear.losses}, too close to a legend roster`);
if (honorFor(69).id !== "filed" || honorFor(69).relic) fail("a 69-win year left a relic");
if (honorFor(70).id !== "heard" || honorFor(75).id !== "deep" || honorFor(78).id !== "door") fail("deep-year honors are out of order");
if (honorFor(81).id !== "breath" || !honorFor(81).relic?.gildedOpen) fail("an 81-win year did not open a myth relic");
if (honorFor(82).id !== "unbroken" || !honorFor(82).relic) fail("82–0 did not cut an Unbroken relic");
const relicYear = startYear(7, honorFor(82).relic);
if (!relicYear.current?.gilded || eraCard(relicYear.current.cardId).tier !== "myth") fail("the Unbroken relic did not open a myth card");
if (relicYear.charges.gilded < 4 || relicYear.charges.banner < 2 || relicYear.charges.reroll < 5) fail("the Unbroken relic did not fatten the boosters");
const plainYear = startYear(7);
if (plainYear.charges.gilded !== 2 || plainYear.charges.banner !== 1) fail("a plain year no longer starts with the base boosters");
const clash = playClash(ERA_CARDS[0].id, ERA_CARDS[1].id, 20261125, false);
if (clash.homeScore < 70 || clash.awayScore < 70 || !clash.winnerId) fail("era clash did not play an NBA game");
const quick = playQuick("cont", "cstr", 20261125, false);
if (!seriesIsBestOfSeven(quick)) fail("a side series did not end at four wins");
const lamp = lightLamp(20261125);
if (!lamp.three.winnerId || !lamp.dunk.winnerId || !lamp.skills.winnerId) fail("the lamp did not name winners");
const throne = playThrone(20261125);
if (throne.games.length !== 7 || drawThrone(20261125).length !== 8 || !eraCard(throne.champion)) fail("the throne did not finish an eight-team night");
console.log(`FLOORS clash ${clash.homeScore}-${clash.awayScore} series ${quick.homeWins}-${quick.awayWins} throne ${throne.champion}`);
const hill = playHill(20261125);
const gauntlet = playGauntlet(20261125);
const decade = playDecade(20261125);
const open = playOpen(20261125);
const fortnight = playFortnight(20261125);
const survivor = playSurvivor(20261125);
const five = playFive(20261125);
if (hill.games.length !== 8 || !hill.king) fail("the hill did not play eight nights");
if (gauntlet.games.length !== 7 || gauntlet.games.at(-1)?.note !== "The Construct") fail("the gauntlet did not end at the Construct");
if (decade.rows.length !== 8 || decade.games.length !== 29) fail(`decade cup played ${decade.games.length} games`);
if (open.rounds.length !== 4 || open.rounds.reduce((sum, round) => sum + round.games.length, 0) !== 15) fail("the open is not a sixteen-side bracket");
if (fortnight.games.length !== 15 || !seriesIsBestOfSeven(fortnight.series)) fail("fortnight did not finish a round robin and a series");
if (survivor.rounds.length < 3 || !survivor.champion) fail("survivor did not play down to a champion");
if (five.home.length !== 5 || five.away.length !== 5 || five.game.homeScore < 70) fail("the five did not tip");
console.log(`MORE hill ${hill.king} gauntlet ${gauntlet.cleared}/7 decade ${decade.champion} open ${open.champion} fortnight ${fortnight.champion} survivor ${survivor.champion}`);

if (OLYMPICS_KEY === "pantheon-v7" || OLYMPICS_KEY === "pantheon-v8" || OLYMPICS_KEY === "pantheon-v9" || OLYMPICS_KEY === "pantheon-v10" || OLYMPICS_KEY === "pantheon-year-v1") fail("olympics save collided with the championship or the year");
if (olympicsUnlock([]).open) fail("olympics opened with no trials");
const lockedLine = olympicsLockLine(olympicsUnlock([]));
const lockedSentences = lockedLine.split(/[.!?]/).map((part) => part.trim()).filter(Boolean);
if (lockedSentences.length !== 1 || !lockedLine.includes("0 championships") || !lockedLine.includes("0 series")) {
  fail(`locked olympics line is not one concrete sentence: ${lockedLine}`);
}
if (olympicsUnlock([sweep]).open) fail("one championship opened the Olympics");
if (!yearUnlock([sweep, strike]).open || !olympicsUnlock([sweep, strike]).open) fail("the trial list that opens the Unbroken Year left the Olympics shut");
if (!olympicsUnlock([restoredTrial, sweep]).open) fail("a Concord restoration did not count toward the Olympics");
const replayedSeed = [
  { seed: 11, arrivalWinnerId: "cont", gateWinnerId: "cstr", threatEnded: false },
  { seed: 11, arrivalWinnerId: "cstr", gateWinnerId: "cstr", threatEnded: true },
] as TrialSummary[];
if (olympicsUnlock(replayedSeed).open || olympicsUnlock(replayedSeed).championships !== 1) fail("replaying one seed counted twice toward the Olympics");
if (earnedOlympicBoosters(null, freshCharges()) !== 0) fail("a fresh year counted as an earned Olympic booster");
const heard = honorFor(70).relic;
if (!heard || earnedOlympicBoosters(heard.charges, null) < 1) fail("a 70-win relic did not earn an Olympic roll");
const plainCard = startOlympicBuild(5, 0);
if (takeOlympicPrime(plainCard, "not-on-the-card") !== plainCard) fail("a name off the card was added to the Olympic side");
let mulligan = plainCard;
const beforeMulligan = mulligan.nonce;
mulligan = rerollOlympic(mulligan);
if (mulligan === plainCard || mulligan.mulligan !== 0 || mulligan.nonce === beforeMulligan) fail("the free mulligan did not roll");
if (rerollOlympic(mulligan) !== mulligan) fail("a roll with no booster changed the card");
let boosted = startOlympicBuild(6, 1);
boosted = rerollOlympic(boosted);
const spentNonce = boosted.nonce;
boosted = rerollOlympic(boosted);
if (boosted.boosters !== 0 || boosted.nonce === spentNonce) fail("an earned booster did not roll the Olympic card");

function fillOlympic(seed: number) {
  let build = startOlympicBuild(seed, 0);
  for (let i = 0; i < 20 && build.rosterIds.length < OLY_ROSTER; i++) {
    const id = build.offer?.playerIds[0];
    if (!id) break;
    const next = takeOlympicPrime(build, id);
    if (next === build) break;
    build = next;
  }
  return build;
}

for (const seed of [1, 8, 21, 99, 20261125]) {
  const built = fillOlympic(seed);
  if (!olympicRosterLegal(built.rosterIds)) fail(`olympic roster for seed ${seed} is not 12 legal humans`);
  const counts = new Map<string, number>();
  for (const id of built.rosterIds) {
    const player = playerById(id);
    if (!player || isConstructed(player)) fail(`olympic seat ${id} is not a human prime`);
    else counts.set(player.nationality, (counts.get(player.nationality) ?? 0) + 1);
  }
  if ([...counts.values()].some((count) => count > 3)) fail(`olympic nationality cap broke on seed ${seed}`);
}
const olympicRoster = fillOlympic(20261125);
const beforeTeams = TEAMS.length;
const olympics = playOlympics(olympicRoster.rosterIds, 20261125);
if (TEAMS.length !== beforeTeams || TEAMS.length !== 57) fail("olympics changed the championship team count");
if (TEAMS.some((team) => team.id === OLY_ID)) fail("the rolled side was added to the championship");
if (olympics.field.length !== 8 || !olympics.field.some((side) => side.id === OLY_ID) || !olympics.field.some((side) => side.id === CONSTRUCT_ID)) {
  fail("the Olympic field is not the rolled side, the Construct, and six others");
}
if (!olympics.field.some((side) => side.kind === "country")) fail("the Olympic field has no country");
if (!olympics.field.some((side) => side.kind === "overflow" || side.kind === "homeland")) fail("the Olympic field has no overflow or homeland house");
if (olympics.series.length !== 7) fail(`olympics played ${olympics.series.length} series`);
for (const series of olympics.series) {
  if (!seriesIsBestOfSeven(series)) fail(`${series.id} is not a best-of-seven (${series.homeWins}-${series.awayWins}, ${series.games.length} games)`);
}
const openedFinal = openOlympicFinal(olympics);
const gold = olympics.series.find((series) => series.round === "gold");
const clincher = gold?.games.at(-1);
if (!openedFinal || !clincher || openedFinal.homeScore !== clincher.homeScore || openedFinal.awayScore !== clincher.awayScore || openedFinal.plays.length < 20) {
  fail("the opened Olympic final did not match the bracket");
}
console.log("OLYMPICS", olympicVerdict(olympics).line);
console.log("OLY FIELD", olympics.field.map((side) => `${side.kind}:${side.name}`).join(" | "));
const offCard = PLAYERS.find((player) => !isConstructed(player) && !plainCard.offer?.playerIds.includes(player.id));
if (!offCard) fail("every human prime was on the first Olympic card");
else {
  const drafted = draftOlympicPrime(plainCard, offCard.id);
  if (drafted === plainCard || drafted.rosterIds[0] !== offCard.id) fail("a prime off the card could not be drafted");
  if (releaseOlympicPrime(drafted, offCard.id).rosterIds.length !== 0) fail("releasing a drafted prime left them seated");
}
const byNation = new Map<string, string[]>();
for (const player of PLAYERS) {
  if (isConstructed(player)) continue;
  const list = byNation.get(player.nationality) ?? [];
  list.push(player.id);
  byNation.set(player.nationality, list);
}
const crowded = [...byNation.values()].find((ids) => ids.length >= 4);
if (!crowded) fail("no nationality has four primes");
else {
  let pile = startOlympicBuild(4, 0);
  for (const id of crowded.slice(0, 4)) pile = draftOlympicPrime(pile, id);
  if (pile.rosterIds.length !== 3) fail(`draft nationality cap seated ${pile.rosterIds.length}`);
}
const unit = PLAYERS.find((player) => isConstructed(player));
if (!unit || draftOlympicPrime(startOlympicBuild(4, 0), unit.id).rosterIds.length !== 0) fail("the draft took a Construct unit");
const reading = readOlympicSide(olympicRoster.rosterIds);
if (!reading.ready || !reading.styleName || reading.humanSides !== 56 || !reading.line.includes("Construct") || !reading.line.includes("human sides")) {
  fail(`olympic reading did not place the side (${reading.line})`);
}
const meetSeat = olympicMeetReading(olympics);
if (meetSeat.of !== 8 || meetSeat.rank < 1 || meetSeat.rank > 8 || !meetSeat.line.includes("of 8")) {
  fail(`olympic meet reading missed the field (${meetSeat.line})`);
}

const sideSeed = 20261125;
for (const [name, play] of Object.entries(TOY_PLAYS)) {
  const night = play(sideSeed, 0);
  const again = play(sideSeed, 0);
  if (!night.winner || night.rows.length < 2 || !night.scoreLine) fail(`${name} did not name a winner`);
  if (again.winner !== night.winner || again.scoreLine !== night.scoreLine || again.line !== night.line) fail(`${name} moved on the same salt`);
  if (name === "cut") {
    const ovr = night.rows.reduce((sum, item) => sum + item.score, 0);
    if (night.winner !== "The book" || night.rows.length !== 5 || night.cap === undefined || ovr > night.cap || night.score <= 0) {
      fail(`cut did not file a five under the cap (${night.line})`);
    }
    if (new Set(night.rows.map((item) => item.playerId)).size !== 5) fail("cut repeated a prime");
  } else if (!night.rows.some((item) => item.name === night.winner)) {
    fail(`${name} winner ${night.winner} was not on the floor`);
  }
}
const triviaCounts: string[] = [];
for (const [name, play] of Object.entries(TRIVIA_PLAYS)) {
  const night = play(sideSeed, 0);
  const again = play(sideSeed, 0);
  if (night.questions.length < 8 || night.questions.length > 10) fail(`${name} asked ${night.questions.length}`);
  const stamp = night.questions.map((question) => `${question.prompt}|${question.answerId}|${question.choices.map((choice) => choice.id).join(",")}|${question.reveal}`).join("~");
  const repeat = again.questions.map((question) => `${question.prompt}|${question.answerId}|${question.choices.map((choice) => choice.id).join(",")}|${question.reveal}`).join("~");
  if (stamp !== repeat) fail(`${name} is not stable on the same salt`);
  for (const question of night.questions) {
    const answer = question.choices.find((choice) => choice.id === question.answerId);
    if (!answer) fail(`${name} has a question with no answer`);
    else if (!question.reveal.includes(answer.label)) fail(`${name} hid ${answer.label}`);
    if (new Set(question.choices.map((choice) => choice.id)).size !== question.choices.length) fail(`${name} repeated a choice`);
  }
  triviaCounts.push(`${name} ${night.questions.length}`);
}
console.log("TOYS", Object.keys(TOY_PLAYS).join(", "));
console.log("TRIVIA", triviaCounts.join(" · "));

if (errors.length) {
  console.error("\nSANITY FAILED");
  for (const message of errors) console.error(" -", message);
  process.exit(1);
}
console.log("\nSANITY OK");
