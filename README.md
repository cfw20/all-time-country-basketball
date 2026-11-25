# Pantheon

Pantheon is a fictional all-time world basketball championship. Thirty-two sides, every prime at once, played under NBA rules only. The site runs entirely in the browser. There is no paid API and no public deployment.

This repository is private. It stays private until the owner decides to publish. Do not flip the repository to public, and do not deploy a public site from this project, unless the owner makes that decision.

The players are real. The club names, the mixed houses, and the games are invented. Pantheon is not affiliated with the NBA or FIBA.

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

Player pages state which path they took, and they state the prime. Every player is shown and simulated only in that prime. There is no faded version and no current-age card.

## Rosters and status

Each side carries a deep NBA-style book, twenty-two primes: a standard body, two two-way deals, and at least one 10-day, Exhibit 10, hardship, or other short stay. The extra seats are real players in a deep minute band. Those labels are minute bands, not contracts a team handed out.

Stars play the heavy minutes. Rotation players live in the teens and low twenties. Two-ways, deep bench, and short deals stay sparse until fouls, a blowout, an injury scare, or a call-up. An injury scare lasts that game only. Ratings describe a prime already on record, including young players, and they do not project a career that has not happened. The atlas page groups the whole book by decade.

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

Twenty-eight countries, three American overflow houses, and one homeland house.

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

## The competition

Eight groups of four, drawn in pots from a fixed power ranking so each group gets one side from each band. Tiebreakers are wins, head-to-head when exactly two sides are tied, point differential, points scored, then pre-draw power. The top two advance.

The bracket is fixed from group place: A1–B2, C1–D2, E1–F2, G1–H2, and the matching pairs on the other side. Neutral floors. A third-place game is played on final night.

After the groups, an interval that does not count: an All-Star game (First Light against Second Light), a skills challenge, a three-point contest, and a dunk contest. Honors after the final include tournament MVP, Finals MVP, defense, sixth man, breakout, and two all-tournament teams. The wire is written from the box score of that draw: buzzers, upsets, blowouts, injury scares, short-deal nights, and the interval winners. Nights collects rematches, close games, and margins from the active draw.

Every game has quarter scores, a full box (points, rebounds, assists, steals, blocks, turnovers, fouls, minutes, field goals, threes, free throws), and a possession log. Favorites win more often. They are not locks.

## Comparing draws

Trials rerun the whole championship with play-by-play skipped, so a batch stays quick. The Trials page keeps up to 200 finished draws in this browser and shows title rate, finals reached, average finish, win rate, and honors. Power seed does not change between draws. Finish does. Open a seed to watch that exact tournament with the logs restored. The active draw and the trial list are stored locally under `pantheon-v2`.

## Where the data lives

Rosters, ratings, and contract status are in `src/data`. The possession engine is in `src/engine`. Nothing leaves the machine.
