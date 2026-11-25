import { Link, useParams } from "react-router-dom";
import { rosterOf, TEAM_BY_ID } from "../data";
import { contractLabel, minuteTarget, roleLabel } from "../data/ratings";
import { Mark } from "../components/Marks";
import { finishName, kindLabel, one } from "../lib/format";
import { tally, teamLine } from "../lib/stats";
import { usePantheon } from "../state/store";

export function TeamPage() {
  const { id } = useParams();
  const team = id ? TEAM_BY_ID[id] : undefined;
  const { tournament } = usePantheon();
  if (!team) {
    return <main className="page"><h2 className="display">Unknown side.</h2></main>;
  }
  const roster = rosterOf(team.id);
  const totals = tally(tournament.games);
  const record = teamLine(tournament.games, team.id);
  const seed = tournament.ranking.find((row) => row.teamId === team.id)?.seed;
  const finish = tournament.finishes[team.id];
  const group = tournament.groups.find((item) => item.teamIds.includes(team.id));
  return (
    <main className="page">
      <p className="kicker">{kindLabel(team.kind)} · {team.country} · power seed {seed}</p>
      <div className="champion-mark">
        <Mark team={team} size={72} />
        <div>
          <h2 className="display" style={{ fontSize: 72 }}>{team.name}</h2>
          <p className="lede" style={{ margin: "8px 0 0" }}>{team.motto}</p>
        </div>
      </div>
      <p className="lede">{team.blurb}</p>
      <div className="stat-grid" style={{ marginTop: 18 }}>
        <div className="panel"><span className="tag">This draw</span><h3>{record.w}-{record.l}</h3><p>{finish ? finishName(finish) : "Still in the book"}</p></div>
        <div className="panel"><span className="tag">Points</span><h3>{record.pf}</h3><p>Allowed {record.pa}</p></div>
        <div className="panel"><span className="tag">Group</span><h3>{group ? `Group ${group.id}` : "—"}</h3><p>{group?.teamIds.map((tid) => TEAM_BY_ID[tid]?.code).join(" · ")}</p></div>
        <div className="panel"><span className="tag">Roster</span><h3>{roster.length}</h3><p>Standard body, two-ways, and short deals</p></div>
      </div>
      <section className="section">
        <div className="section-head"><h3>Roster</h3><span className="quiet">Minute target is the band, not a guarantee</span></div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Player</th><th>Pos</th><th className="num">Prime</th><th>Role</th><th>Status</th><th className="num">Ovr</th><th className="num">Band</th><th className="num">Min</th><th className="num">Pts</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((player) => {
                const line = totals.get(player.id);
                return (
                  <tr key={player.id}>
                    <td className="name-cell"><Link to={`/players/${player.id}`}>{player.name}</Link>{player.starts ? " · opens" : ""}</td>
                    <td>{player.pos}{player.pos2 ? `/${player.pos2}` : ""}</td>
                    <td className="num">{player.primeYear}</td>
                    <td>{roleLabel(player.role)}</td>
                    <td>{contractLabel(player.contract)}</td>
                    <td className="num">{player.ratings.ovr}</td>
                    <td className="num">{minuteTarget(player)}</td>
                    <td className="num">{line ? one(line.sec / 60, line.g) : "—"}</td>
                    <td className="num">{line ? one(line.pts, line.g) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
