import { Link } from "react-router-dom";
import { TEAM_BY_ID } from "../data";
import { advancingIds, standingsFor } from "../engine/tournament";
import { usePantheon } from "../state/store";

export function Standings() {
  const { tournament } = usePantheon();
  const seedOf = new Map(tournament.ranking.map((row) => [row.teamId, row.seed]));
  const played = tournament.series.some((item) => item.round.startsWith("group"));
  const advancing = played ? advancingIds(tournament.groups, tournament.series, seedOf) : new Set<string>();
  return (
    <main className="page">
      <p className="kicker">Group stage · {tournament.groups.length} groups of four</p>
      <h2 className="display" style={{ fontSize: 68 }}>The tables</h2>
      <p className="lede">
        Each cell is a best-of-seven. Tiebreakers, in order: series wins, head-to-head series when exactly two sides are tied, game differential, point differential, points scored, then pre-draw power. Every group winner advances. The best seconds fill the round of 16. A dot marks a side that is through.
      </p>
      <div className="groups" style={{ marginTop: 22 }}>
        {tournament.groups.map((group) => {
          const rows = standingsFor(group.teamIds, tournament.series);
          return (
            <section key={group.id} className="group-card">
              <h3>Group {group.id}</h3>
              <table>
                <thead>
                  <tr>
                    <th>Side</th>
                    <th className="num">W</th>
                    <th className="num">L</th>
                    <th className="num">Games</th>
                    <th className="num">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const team = TEAM_BY_ID[row.teamId];
                    return (
                      <tr key={row.teamId}>
                        <td>
                          <Link to={`/teams/${row.teamId}`}>
                            {advancing.has(row.teamId) ? "● " : ""}
                            {team?.code} {team?.name}
                          </Link>
                        </td>
                        <td className="num">{row.w}</td>
                        <td className="num">{row.l}</td>
                        <td className="num">{row.gw - row.gl}</td>
                        <td className="num">{row.pf - row.pa}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          );
        })}
      </div>
    </main>
  );
}
