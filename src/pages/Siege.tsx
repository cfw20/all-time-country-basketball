import { Link } from "react-router-dom";
import { CONCORD_TEAM, CONSTRUCT_ID, playerById, sideById, TEAM_BY_ID } from "../data";
import { Mark } from "../components/Marks";
import { StylePanel } from "../components/StylePanel";
import { asLineup, readStyle } from "../engine/style";
import { styleOfTeam } from "../lib/styleFor";
import type { GameResult, SeriesResult } from "../data/types";
import { seriesRecord } from "../engine/series";
import { siegeGames } from "../engine/siege";
import { usePantheon } from "../state/store";

const NIGHTS: { id: "arrival" | "gate" | "restoration"; kicker: string; title: string; body: string }[] = [
  {
    id: "arrival",
    kicker: "Night one",
    title: "Arrival",
    body: "The Construct plays the best group winner, first to four. The country bracket continues either way.",
  },
  {
    id: "gate",
    kicker: "Night two",
    title: "The gate",
    body: "The country champion plays the Construct alone, first to four. One nation, the whole built side.",
  },
  {
    id: "restoration",
    kicker: "Night three",
    title: "The restoration",
    body: "The Concord, twelve real primes, plays the Construct in a best-of-seven. This series decides the floor.",
  },
];

export function Siege() {
  const { tournament } = usePantheon();
  const siege = tournament.siege;
  const final = tournament.series.find((item) => item.id === "final");
  const champ = final ? TEAM_BY_ID[final.winnerId] : undefined;
  const games = {
    arrival: siege?.arrival ?? null,
    gate: siege?.gate ?? null,
    restoration: siege?.restoration ?? null,
  };
  const concord = (siege?.concordIds ?? []).map((id) => playerById(id)).filter((player) => player !== undefined);
  const countries = new Set(concord.map((player) => player.nationality));
  const concordStyle = concord.length >= 5
    ? readStyle({ pace: CONCORD_TEAM.pace, players: asLineup(concord) })
    : null;
  const construct = TEAM_BY_ID[CONSTRUCT_ID];
  const constructStyle = styleOfTeam(construct);
  const leaders = siegeScorers(siegeGames(siege));

  return (
    <main className="page">
      <p className="kicker">The Construct · three series · NBA rules</p>
      <h2 className="display" style={{ fontSize: 68 }}>The countries, then the world.</h2>
      <p className="lede">
        The Construct is the one built side. Human games stay the real primes, under NBA rules. A Concord win ends the threat and leaves the country champion in place. A Construct win means they hold the floor.
      </p>

      <Status siegeEnded={Boolean(games.restoration)} threatEnded={Boolean(siege?.threatEnded)} champName={champ?.name} restoration={games.restoration} />

      <div className="steps" style={{ marginTop: 18 }}>
        {NIGHTS.map((night) => {
          const game = games[night.id];
          return (
            <article key={night.id} className="panel" style={{ borderTop: "3px solid #c5d7ff" }}>
              <span className="tag">{night.kicker}</span>
              <h3>{night.title}</h3>
              <p>{night.body}</p>
              {game ? (
                <p style={{ marginTop: 10 }}>
                  <Link to={`/series/${game.id}`}>{scoreLine(game)}</Link>
                </p>
              ) : (
                <p style={{ marginTop: 10 }}>Waiting on this round.</p>
              )}
            </article>
          );
        })}
      </div>

      <section className="section">
        <div className="section-head">
          <h3>The Concord</h3>
          <span className="quiet">{concord.length ? `${concord.length} primes · ${countries.size} countries` : "Named after the final"}</span>
        </div>
        {concord.length === 0 ? (
          <p className="empty">The Concord is chosen after the country final, from primes already in the book. At most three from one country open, and five can dress for the series. Sim the siege once the final is in.</p>
        ) : (
          <>
            <p className="note">Real players, borrowed for one night. The opening five are marked. After the tip they go back to their countries. Nobody was signed.</p>
            {concordStyle ? <StylePanel style={concordStyle} kicker="The Concord · mixed" /> : null}
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Player</th><th>Side</th><th>Pos</th><th className="num">Prime</th><th className="num">Ovr</th><th>Night</th>
                  </tr>
                </thead>
                <tbody>
                  {concord.map((player, index) => {
                    const team = TEAM_BY_ID[player.teamId];
                    return (
                      <tr key={player.id}>
                        <td className="name-cell"><Link to={`/players/${player.id}`}>{player.name}</Link></td>
                        <td><Link to={`/teams/${team.id}`}>{team.code}</Link></td>
                        <td>{player.pos}</td>
                        <td className="num">{player.primeYear}</td>
                        <td className="num">{player.ratings.ovr}</td>
                        <td>{index < 5 ? "Opens" : "With the line"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {leaders.length > 0 ? (
        <section className="section">
          <div className="section-head">
            <h3>Who scored in the siege</h3>
            <span className="quiet">Across the nights that have been played</span>
          </div>
          <div className="team-grid">
            {leaders.map((row) => (
              <Link key={row.id} to={`/players/${row.id}`} className="panel">
                <span className="tag">{row.side}</span>
                <h3>{row.name}</h3>
                <p>{row.pts} pts · {row.reb} reb · {row.ast} ast</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="section-head">
          <h3>The built side</h3>
          <Link to={`/teams/${CONSTRUCT_ID}`}>Open the roster</Link>
        </div>
        <Link to={`/teams/${CONSTRUCT_ID}`} className="panel siege-banner" style={{ marginTop: 0 }}>
          <Mark team={construct} size={48} />
          <h3 style={{ marginTop: 8 }}>{construct.name}</h3>
          <p className="style-name">{constructStyle.name}</p>
          <p>{construct.motto} Twenty-two chassis. The same NBA rules as every human game.</p>
        </Link>
        <p className="note">The Concord’s mark is the human ring. {CONCORD_TEAM.motto}</p>
      </section>
    </main>
  );
}

function Status({
  siegeEnded,
  threatEnded,
  champName,
  restoration,
}: {
  siegeEnded: boolean;
  threatEnded: boolean;
  champName?: string;
  restoration: SeriesResult | null;
}) {
  if (!siegeEnded || !restoration) {
    return (
      <article className="panel siege-banner">
        <span className="tag">The floor is still in question</span>
        <h3 className="display" style={{ fontSize: 36 }}>The Construct is in the event.</h3>
        <p>Sim through the siege. The arrival series can land as early as the round of 16. The gate and the Concord wait on the country final.</p>
      </article>
    );
  }
  const construct = TEAM_BY_ID[CONSTRUCT_ID];
  return (
    <article className="panel siege-banner">
      <span className="tag">{threatEnded ? "The floor is restored" : "The Construct holds the floor"}</span>
      <div className="champion-mark" style={{ marginTop: 8 }}>
        <Mark team={threatEnded ? CONCORD_TEAM : construct} size={52} />
        <h3 className="display" style={{ fontSize: 40 }}>{threatEnded ? "The Concord" : construct.name}</h3>
      </div>
      <p className="scoreline">{scoreLine(restoration)}</p>
      <p>
        {threatEnded
          ? `The Concord beat the Construct. ${champName ?? "The country champion"} keeps the championship, and the event returns to country against country.`
          : `The Construct beat the Concord. ${champName ?? "The country champion"} won the countries. The built side still holds the floor.`}
      </p>
    </article>
  );
}

function scoreLine(series: SeriesResult): string {
  const winner = sideById(series.winnerId)?.name ?? (series.winnerId === series.homeId ? series.homeName : series.awayName) ?? series.winnerId;
  const loser = sideById(series.loserId)?.name ?? (series.loserId === series.homeId ? series.homeName : series.awayName) ?? series.loserId;
  const { winnerWins, loserWins } = seriesRecord(series);
  return `${winner} ${winnerWins}–${loserWins} ${loser}`;
}

function siegeScorers(games: GameResult[]): { id: string; name: string; side: string; pts: number; reb: number; ast: number }[] {
  const map = new Map<string, { pts: number; reb: number; ast: number; side: string }>();
  for (const game of games) {
    const sides = [
      [game.homeId, game.homeName, game.box.home],
      [game.awayId, game.awayName, game.box.away],
    ] as const;
    for (const [id, name, lines] of sides) {
      for (const line of lines) {
        const row = map.get(line.playerId) ?? { pts: 0, reb: 0, ast: 0, side: sideById(id)?.code ?? name ?? id };
        row.pts += line.pts;
        row.reb += line.orb + line.drb;
        row.ast += line.ast;
        map.set(line.playerId, row);
      }
    }
  }
  return [...map.entries()]
    .map(([id, row]) => ({ id, name: playerById(id)?.name ?? id, ...row }))
    .sort((a, b) => b.pts - a.pts || b.reb - a.reb)
    .slice(0, 8);
}
