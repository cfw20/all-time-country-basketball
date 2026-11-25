# Pantheon

Pantheon is a fictional all-time world basketball championship. Thirty-two human sides, every prime at once, plus one constructed villain side, played under NBA rules only. The site runs entirely in the browser. There is no paid API and no public deployment.

This repository is private. It stays private until the owner decides to publish. Do not flip the repository to public, and do not deploy a public site from this project, unless the owner makes that decision.

The human players are real. The club names, the mixed houses, the Construct, and the games are invented. Pantheon is not affiliated with the NBA or FIBA.

## Run it

```bash
npm install
npm run dev
```

Open the local URL Vite prints (default `http://localhost:5173`).

Other scripts:

- `npm run build` typechecks and builds the static app.
- `npm run sanity` checks roster integrity and a batch of simulated championships.
- `npm run preview` serves the production build.

The first visit completes one seeded championship so the floor, the bracket, and the wire are already full. The dock at the bottom of every page starts a new draw, replays the same seed, simulates the next round, or runs the rest of the tournament. Same seed, same games.

## How a player arrives

This is not a signing league and not a free-agent market. Countries and mixed sides do not recruit. Players choose.

1. **Country path.** The default. The player made the playable all-time roster of their own country. A Yugoslav, Soviet, or Czechoslovak-era player is assigned to the modern country they belong to, by birthplace or the senior team they represented. Those federations are not revived.
2. **Overflow path.** Americans who could not earn minutes on the national side. The houses, in order, are Vanguard, Afterlight, and Palladium. The national cut is positional: some all-time centers chose a house where the middle was actually open. There is no fourth American house.
3. **Homeland path.** A great player whose country cannot fill a competitive all-time side. They choose the Lantern Company. It is the only house of that kind.

Player pages state which path they took, and they state the prime. Every human player is shown and simulated only in that prime. There is no faded version and no current-age card.

The Construct is the one invented side: twenty-two built units, outside the groups. They are a real threat under the same NBA engine. After the country final, the champion plays them at the gate. The Concord — twelve real primes already in the field, at most five from any one country — then plays them once. A Concord win ends the threat and leaves the country champion in place. A Construct win means they hold the floor.

## Rosters and status

Each side carries a deep NBA-style book, twenty-two primes: a standard body, two two-way deals, and at least one 10-day, Exhibit 10, hardship, or other short stay. The extra seats are real players in a deep minute band. Those labels are minute bands, not contracts a team handed out.

Stars play the heavy minutes. Rotation players live in the teens and low twenties. Two-ways, deep bench, and short deals stay sparse until fouls, a blowout, an injury scare, or a call-up. An injury scare lasts that game only. Ratings describe a prime already on record, including young players, and they do not project a career that has not happened. The atlas page groups the human book by decade. The Construct is filed on its own side.

## Rules

NBA rules only.

- Four quarters of 12 minutes, overtime of 5 minutes, repeated until someone leads
- 24-second shot clock
- NBA three-point line
- Six fouls to foul out
- Bonus on the fifth team foul of a quarter, and on the fourth in overtime
- NBA-shaped timeouts and substitutions

No FIBA quarter length, foul limit, or roster cap is used anywhere in the event.

## The field

Twenty-eight countries, three American overflow houses, one homeland house, and the Construct. The Concord is assembled per draw and is not a thirty-fourth side.

| Side | Kind | Country |
| --- | --- | --- |
| The Continental | Country | United States |
| Vanguard | Overflow | United States |
| Afterlight | Overflow | United States |
| Palladium | Overflow | United States |
| Lantern Company | Homeland | Players whose countries could not field a side |
| Northline | Country | Canada |
| Casa de Oro | Country | Spain |
| Maison Royale | Country | France |
| White Eagles | Country | Serbia |
| Adriatic Fire | Country | Croatia |
| Alpine Crown | Country | Slovenia |
| Amber Kings | Country | Lithuania |
| Olympian Order | Country | Greece |
| Río de Plata | Country | Argentina |
| Auriverde | Country | Brazil |
| Southern Sun | Country | Australia |
| Iron Court | Country | Germany |
| Atelier | Country | Italy |
| Green Standard | Country | Nigeria |
| Crescent Forge | Country | Turkey |
| Isla Fuego | Country | Puerto Rico |
| Quisqueya | Country | Dominican Republic |
| Teranga | Country | Senegal |
| Amber Gate | Country | Latvia |
| Black Peak | Country | Montenegro |
| Caucasus | Country | Georgia |
| The Bridge | Country | Bosnia and Herzegovina |
| Dragon Court | Country | China |
| The Archipelago | Country | Philippines |
| Fleuve | Country | DR Congo |
| Olive Standard | Country | Israel |
| Nevsky Court | Country | Russia |
| The Construct | Constructed | No nation. Built units, outside the draw |

## The competition

Eight groups of four, drawn in pots from a fixed power ranking so each group gets one side from each band. Every group matchup is a best-of-seven. A side advances by winning four games. Tiebreakers are series wins, head-to-head series when exactly two sides are tied, game differential, point differential, points scored, then pre-draw power. The top two advance.

The bracket is fixed from group place: A1–B2, C1–D2, E1–F2, G1–H2, and the matching pairs on the other side. Every knockout round is first to four, including the final and the third-place series. Neutral floors. The better power seed is listed as home for games 1, 2, 5, and 7. Games 3, 4, and 6 flip the card. There is no home-court scoring bonus.

After the groups, an interval that does not count: an All-Star game (First Light against Second Light), a skills challenge, a three-point contest, and a dunk contest. The Construct does not enter those nights. Honors after the final include tournament MVP, Finals MVP, defense, sixth man, breakout, and two all-tournament teams, all from the country games.

The siege is three best-of-seven series off the standings. The arrival, at the start of the knockout, is the Construct against the best group winner. The gate is the country champion against the Construct. The restoration is the Concord against the Construct, and it decides whether the country champion keeps the floor. The Construct is the favorite. Humans can still take a series. The wire includes those series. Nights collects seven-game series, 4–3s, sweeps, and tight games from the country draw.

Every game has quarter scores, a full box (points, rebounds, assists, steals, blocks, turnovers, fouls, minutes, field goals, threes, free throws), and a possession log. Favorites win more series. They are not locks.

## Comparing draws

Trials rerun the whole championship, siege included, with play-by-play skipped, so a batch stays quick. The Trials page runs 10, 25, 50, or 100 championships and keeps up to 400 in this browser. It shows country title rate, finals, final four, average finish, series win rate, honors, final-series point margins, close games, comebacks, and upsets, plus how often the Construct wins the arrival and the gate and how often the Concord restores the floor. Click a side to inspect it, or open a seed to watch that exact tournament with the logs restored. Power seed does not change between draws. Finish does. The active draw and the trial list are stored locally under `pantheon-v5`.

A series page lists every game and the running tally. A game page has the line score, team shooting and true shooting, a short list of the plays that swung it, and the full possession log. Player pages carry a game log for the open draw. Team pages list every series. The look is a fantasy sci-fi floor. The games are NBA basketball, played at the prime on each card.

The Unbroken Year is a side floor at `/season`. It does not replace the championship. It opens after two finished championships and one series taken from the Construct. The roster is built by rolling an era and a real franchise, then taking one prime from that card. Boosters can reroll, force a myth year, take two from one card, call a position, or recall a passed prime. The season is 82 NBA games. One loss can be replayed. Seventy wins leaves a relic for the next year. An 82–0, The Unbroken, is kept in the book and opens the next year on a myth card with extra boosters. The year is stored locally under `pantheon-year-v1`, apart from the championship save.

Other side floors live at `/play`. Era Clash is one game between two rolled years. A series tonight is a best-of-seven between any two sides. The Lamp runs the three-point, dunk, and skills contests on demand. The Throne is an eight-team era bracket. They are exhibitions. They do not change the championship.

## Where the data lives

Rosters, ratings, and contract status are in `src/data`. The possession engine is in `src/engine`. Nothing leaves the machine.
