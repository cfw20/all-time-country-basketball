import { Link, useParams } from "react-router-dom";
import { rosterOf, sideById, TEAM_BY_ID } from "../data";
import { dutyLabel, minuteTarget, statusLabel } from "../data/ratings";
import { Mark } from "../components/Marks";
import { StylePanel } from "../components/StylePanel";
import type { SeriesResult } from "../data/types";
import { readPlayerStyle } from "../engine/style";
import { finishName, kindLabel, one, placeLine, trueShooting } from "../lib/format";
import { styleOfTeam } from "../lib/styleFor";
import { seriesRecord } from "../engine/series";
import { siegeGames } from "../engine/siege";
import { seriesShape, tally, teamLine } from "../lib/stats";
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
  const siegeSeries = [tournament.siege?.arrival, tournament.siege?.gate, tournament.siege?.restoration]
    .filter((item): item is SeriesResult => Boolean(item))
    .filter((item) => item.homeId === team.id || item.awayId === team.id);
  const book = built ? siegeSeries : tournament.series.filter((item) => item.homeId === team.id || item.awayId === team.id);
  const seriesWins = book.filter((item) => item.winnerId === team.id).length;
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
      <p className="kicker">{built ? "Constructed · no nation · outside the draw" : `${kindLabel(team.kind)}${placeLine(team) ? ` · ${placeLine(team)}` : ""} · ${team.country} · power seed ${seed ?? "—"}`}</p>
      <div className="champion-mark">
        <Mark team={team} size={72} />
        <div>
          <h2 className="display" style={{ fontSize: 72 }}>{team.name}</h2>
          <p className="lede" style={{ margin: "8px 0 0" }}>{team.motto}</p>
        </div>
      </div>
      <p className="lede">{team.blurb}</p>
      <section className="section">
        <div className="section-head">
          <h3>Style</h3>
          <span className="quiet">{built ? "Read off the chassis" : "Read off the opening five"}</span>
        </div>
        <StylePanel style={styleOfTeam(team)} kicker={built ? "Built side" : "Play style"} />
      </section>
      <div className="stat-grid" style={{ marginTop: 18 }}>
        <div className="panel"><span className="tag">Series</span><h3>{seriesWins}-{book.length - seriesWins}</h3><p>{built ? floor : finish ? finishName(finish) : "Still in the book"} · games {record.w}-{record.l}</p></div>
        <div className="panel"><span className="tag">Points</span><h3>{record.pf}</h3><p>Allowed {record.pa}</p></div>
        <div className="panel"><span className="tag">Group</span><h3>{built ? "Siege" : group ? `Group ${group.id}` : "—"}</h3><p>{built ? "Arrival, the gate, the Concord" : group?.teamIds.map((tid) => TEAM_BY_ID[tid]?.code).join(" · ")}</p></div>
        <div className="panel"><span className="tag">Roster</span><h3>{roster.length}</h3><p>{built ? "Chassis, spare frames, and short cycles" : "Standard body, two-ways, and short deals"}</p></div>
      </div>
      <section className="section">
        <div className="section-head"><h3>Opening five</h3><span className="quiet">{built ? "The chassis that starts" : `Pace ${team.pace.toFixed(2)} · the card that starts the night`}</span></div>
        <div className="team-grid">
          {roster.filter((player) => player.starts).map((player) => {
            const from = !built && player.nationality !== team.country ? player.nationality : null;
            return (
              <Link key={player.id} to={`/players/${player.id}`} className="panel">
                <span className="tag">{player.pos}{player.pos2 ? ` / ${player.pos2}` : ""}{from ? ` · ${from}` : ""} · {built ? "Built" : player.primeYear}</span>
                <h3>{player.name}</h3>
                <p className="style-name">{readPlayerStyle(player).name}</p>
                <p>{player.ratings.ovr} overall · {minuteTarget(player)} minute band · {player.height}</p>
              </Link>
            );
          })}
        </div>
      </section>
      <section className="section">
        <div className="section-head"><h3>Roster</h3><span className="quiet">{built ? "Unit class is the minute band" : "Minute target is the band, not a guarantee"}</span></div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Player</th><th>Pos</th><th className="num">Prime</th><th>Role</th><th>Status</th><th className="num">Ovr</th><th className="num">Band</th><th className="num">Min</th><th className="num">Pts</th><th className="num">TS</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((player) => {
                const line = totals.get(player.id);
                const from = !built && player.nationality !== team.country ? player.nationality : null;
                return (
                  <tr key={player.id}>
                    <td className="name-cell"><Link to={`/players/${player.id}`}>{player.name}</Link>{player.starts ? " · opens" : ""}{from ? <div className="split">{from}</div> : null}</td>
                    <td>{player.pos}{player.pos2 ? `/${player.pos2}` : ""}</td>
                    <td className="num">{built ? "Built" : player.primeYear}</td>
                    <td>{dutyLabel(player.role, built)}</td>
                    <td>{statusLabel(player.contract, built)}</td>
                    <td className="num">{player.ratings.ovr}</td>
                    <td className="num">{minuteTarget(player)}</td>
                    <td className="num">{line ? one(line.sec / 60, line.g) : "—"}</td>
                    <td className="num">{line ? one(line.pts, line.g) : "—"}</td>
                    <td className="num">{line ? trueShooting(line.pts, line.fga, line.fta) : "—"}</td>
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
          <SeriesList teamId={team.id} series={siegeSeries} empty="This series has not been played." />
        </section>
      ) : (
        <>
          <section className="section">
            <div className="section-head"><h3>Results</h3><span className="quiet">Official series in this draw</span></div>
            <SeriesList teamId={team.id} series={book} empty="No official series yet." />
          </section>
          {siegeSeries.length > 0 ? (
            <section className="section">
              <div className="section-head"><h3>Against the Construct</h3><span className="quiet">Siege series. Off the country record.</span></div>
              <SeriesList teamId={team.id} series={siegeSeries} empty="This series has not been played." />
            </section>
          ) : null}
        </>
      )}
    </main>
  );
}

function SeriesList({ teamId, series, empty }: { teamId: string; series: SeriesResult[]; empty: string }) {
  if (series.length === 0) return <p className="empty">{empty}</p>;
  return (
    <div className="team-grid">
      {series.map((item) => {
        const { winnerWins, loserWins } = seriesRecord(item);
        const win = item.winnerId === teamId;
        const opp = item.homeId === teamId ? item.awayId : item.homeId;
        const ours = win ? winnerWins : loserWins;
        const theirs = win ? loserWins : winnerWins;
        return (
          <Link key={item.id} to={`/series/${item.id}`} className="panel">
            <span className="tag">{item.roundLabel} · {item.games.length} games</span>
            <h3>{win ? "W" : "L"} {ours}–{theirs}</h3>
            <p>{sideById(opp)?.name ?? opp}</p>
            <p>{seriesShape(item)}</p>
          </Link>
        );
      })}
    </div>
  );
}
