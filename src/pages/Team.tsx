import { Link, useParams } from "react-router-dom";
import { rosterOf, sideById, TEAM_BY_ID } from "../data";
import { dutyLabel, minuteTarget, statusLabel } from "../data/ratings";
import { Mark } from "../components/Marks";
import { finishName, kindLabel, one } from "../lib/format";
import { siegeGames } from "../engine/siege";
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
  const built = team.kind === "construct";
  const nights = siegeGames(tournament.siege).filter((game) => game.homeId === team.id || game.awayId === team.id);
  const totals = tally(built ? nights : tournament.games, built);
  const record = teamLine(built ? nights : tournament.games, team.id, built);
  const seed = tournament.ranking.find((row) => row.teamId === team.id)?.seed;
  const finish = tournament.finishes[team.id];
  const group = tournament.groups.find((item) => item.teamIds.includes(team.id));
  const floor = tournament.siege?.restoration
    ? (tournament.siege.threatEnded ? "Turned back" : "Holds the floor")
    : "Waiting on the siege";
  return (
    <main className="page">
      <p className="kicker">{built ? "Constructed · no nation · outside the draw" : `${kindLabel(team.kind)} · ${team.country} · power seed ${seed ?? "—"}`}</p>
      <div className="champion-mark">
        <Mark team={team} size={72} />
        <div>
          <h2 className="display" style={{ fontSize: 72 }}>{team.name}</h2>
          <p className="lede" style={{ margin: "8px 0 0" }}>{team.motto}</p>
        </div>
      </div>
      <p className="lede">{team.blurb}</p>
      <div className="stat-grid" style={{ marginTop: 18 }}>
        <div className="panel"><span className="tag">This draw</span><h3>{record.w}-{record.l}</h3><p>{built ? floor : finish ? finishName(finish) : "Still in the book"}</p></div>
        <div className="panel"><span className="tag">Points</span><h3>{record.pf}</h3><p>Allowed {record.pa}</p></div>
        <div className="panel"><span className="tag">Group</span><h3>{built ? "Siege" : group ? `Group ${group.id}` : "—"}</h3><p>{built ? "Arrival, the gate, the Concord" : group?.teamIds.map((tid) => TEAM_BY_ID[tid]?.code).join(" · ")}</p></div>
        <div className="panel"><span className="tag">Roster</span><h3>{roster.length}</h3><p>{built ? "Chassis, spare frames, and short cycles" : "Standard body, two-ways, and short deals"}</p></div>
      </div>
      <section className="section">
        <div className="section-head"><h3>Roster</h3><span className="quiet">{built ? "Unit class is the minute band" : "Minute target is the band, not a guarantee"}</span></div>
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
                    <td className="num">{built ? "Built" : player.primeYear}</td>
                    <td>{dutyLabel(player.role, built)}</td>
                    <td>{statusLabel(player.contract, built)}</td>
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
      {built ? (
        <section className="section">
          <div className="section-head"><h3>The siege</h3><span className="quiet">The whole schedule. Off the country table.</span></div>
          <Results teamId={team.id} games={nights} all />
        </section>
      ) : (
        <>
          <section className="section">
            <div className="section-head"><h3>Results</h3><span className="quiet">Official games in this draw</span></div>
            <Results teamId={team.id} games={tournament.games} />
          </section>
          {nights.length > 0 ? (
            <section className="section">
              <div className="section-head"><h3>Against the Construct</h3><span className="quiet">Siege nights. Off the country record.</span></div>
              <Results teamId={team.id} games={nights} all />
            </section>
          ) : null}
        </>
      )}
    </main>
  );
}

function Results({ teamId, games, all = false }: { teamId: string; games: { id: string; exhibition?: boolean; homeId: string; awayId: string; homeScore: number; awayScore: number; winnerId: string; roundLabel: string; ot: number; comeback?: { teamId: string; deficit: number } }[]; all?: boolean }) {
  const rows = games.filter((game) => (all || !game.exhibition) && (game.homeId === teamId || game.awayId === teamId));
  if (rows.length === 0) return <p className="empty">{all ? "This night has not been played." : "No official games yet."}</p>;
  return (
    <div className="team-grid">
      {rows.map((game) => {
        const home = game.homeId === teamId;
        const ours = home ? game.homeScore : game.awayScore;
        const theirs = home ? game.awayScore : game.homeScore;
        const opp = home ? game.awayId : game.homeId;
        const win = game.winnerId === teamId;
        return (
          <Link key={game.id} to={`/games/${game.id}`} className="panel">
            <span className="tag">{game.roundLabel}{game.ot ? " · OT" : ""}</span>
            <h3>{win ? "W" : "L"} {ours}–{theirs}</h3>
            <p>{sideById(opp)?.name ?? opp}{game.comeback?.teamId === teamId ? ` · erased ${game.comeback.deficit}` : ""}</p>
          </Link>
        );
      })}
    </div>
  );
}
