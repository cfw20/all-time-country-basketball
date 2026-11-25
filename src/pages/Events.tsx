import { Link } from "react-router-dom";
import { playerById, TEAM_BY_ID } from "../data";
import { PlayerLink } from "../components/Marks";
import { usePantheon } from "../state/store";

export function Events() {
  const { tournament } = usePantheon();
  if (!tournament.allStar || !tournament.three || !tournament.dunk || !tournament.skills) {
    return (
      <main className="page">
        <p className="kicker">The interval</p>
        <h2 className="display" style={{ fontSize: 68 }}>After the groups.</h2>
        <p className="empty">All-Star, the skills challenge, the three-point contest, and the dunk contest open once the group stage is complete. They do not touch the standings.</p>
        <div className="filters">
          <Link className="text-btn" to="/play/lamp">Light a lamp of your own</Link>
        </div>
      </main>
    );
  }
  const star = tournament.allStar;
  const rosters = tournament.allStarRosters;
  return (
    <main className="page">
      <p className="kicker">Exhibition · Lampblack Dome</p>
      <h2 className="display" style={{ fontSize: 68 }}>The interval</h2>
      <p className="lede">Captains are the two best group-stage nights from different sides. The snake fills twelve-man lights. Defense is a little looser, on purpose.</p>
      <section className="section">
        <div className="section-head">
          <h3>{star.awayName} {star.awayScore} · {star.homeName} {star.homeScore}</h3>
          <Link to={`/games/${star.id}`}>Open the log</Link>
        </div>
        <div className="groups">
          <Roster title="First Light" captain={rosters?.captainA} ids={rosters?.a ?? []} />
          <Roster title="Second Light" captain={rosters?.captainB} ids={rosters?.b ?? []} />
        </div>
      </section>
      <section className="section">
        <Contest
          title={tournament.skills.title}
          caption="Handle, pass, and finish. Each station is out of 20. The final is a second circuit."
          winner={tournament.skills.winnerId}
          rows={tournament.skills.field}
          finalists={tournament.skills.finalists}
        />
      </section>
      <section className="section">
        <Contest
          title={tournament.three.title}
          caption="Twenty-five shots, every fifth worth two. The final column is the final round only."
          winner={tournament.three.winnerId}
          rows={tournament.three.field}
          finalists={tournament.three.finalists}
        />
      </section>
      <section className="section">
        <Contest
          title={tournament.dunk.title}
          caption="Two dunks to advance, two more in the final."
          winner={tournament.dunk.winnerId}
          rows={tournament.dunk.field}
          finalists={tournament.dunk.finalists}
        />
      </section>
    </main>
  );
}

function Roster({ title, ids, captain }: { title: string; ids: string[]; captain?: string }) {
  return (
    <section className="group-card">
      <h3>{title}</h3>
      <ol>
        {ids.map((id) => {
          const player = playerById(id);
          return (
            <li key={id} style={{ margin: "6px 0" }}>
              <PlayerLink id={id} />
              <span className="quiet"> · {TEAM_BY_ID[player?.teamId ?? ""]?.code}{id === captain ? " · captain" : ""}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Contest({
  title,
  caption,
  winner,
  rows,
  finalists,
}: {
  title: string;
  caption: string;
  winner: string;
  rows: { playerId: string; scores: number[]; total: number }[];
  finalists: { playerId: string; scores: number[]; total: number }[];
}) {
  return (
    <div>
      <div className="section-head">
        <h3>{title}</h3>
        <span className="quiet">Winner <PlayerLink id={winner} /></span>
      </div>
      <p className="note">{caption}</p>
      <table>
        <thead>
          <tr><th>Player</th><th>Side</th><th className="num">Stations</th><th className="num">Final</th></tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const player = playerById(row.playerId);
            const final = finalists.find((item) => item.playerId === row.playerId);
            return (
              <tr key={row.playerId}>
                <td><PlayerLink id={row.playerId} /></td>
                <td>{TEAM_BY_ID[player?.teamId ?? ""]?.code}</td>
                <td className="num">{row.scores.join(" · ")}</td>
                <td className="num">{final ? (row.scores.length === 1 ? final.scores[final.scores.length - 1] : final.scores.join(" · ")) : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
