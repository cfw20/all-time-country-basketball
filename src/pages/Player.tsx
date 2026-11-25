import { Link, useParams } from "react-router-dom";
import { choiceStory, playerById, TEAM_BY_ID } from "../data";
import { contractLabel, formatHeight, minuteTarget, roleLabel } from "../data/ratings";
import { Mark } from "../components/Marks";
import { one, pct } from "../lib/format";
import { tally } from "../lib/stats";
import { usePantheon } from "../state/store";

const BARS: { key: "shot" | "three" | "play" | "reb" | "def" | "ath" | "ft"; label: string }[] = [
  { key: "shot", label: "Shot" },
  { key: "three", label: "Three" },
  { key: "play", label: "Play" },
  { key: "reb", label: "Board" },
  { key: "def", label: "Defense" },
  { key: "ath", label: "Ath" },
  { key: "ft", label: "Free throw" },
];

export function PlayerPage() {
  const { id } = useParams();
  const player = id ? playerById(id) : undefined;
  const { tournament } = usePantheon();
  if (!player) return <main className="page"><h2 className="display">That player is not in the field.</h2></main>;
  const team = TEAM_BY_ID[player.teamId];
  const story = choiceStory(player, team);
  const line = tally(tournament.games).get(player.id);
  return (
    <main className="page">
      <p className="kicker">{player.nationality} · prime {player.primeYear} · {formatHeight(player.height)}</p>
      <h2 className="display" style={{ fontSize: 76 }}>{player.name}</h2>
      <p className="lede">{player.pos}{player.pos2 ? ` / ${player.pos2}` : ""} · {roleLabel(player.role)} · {contractLabel(player.contract)} · overall {player.ratings.ovr}</p>
      <div className="champion-mark" style={{ marginTop: 12 }}>
        <Mark team={team} size={42} />
        <Link to={`/teams/${team.id}`} className="display" style={{ fontSize: 32 }}>{team.name}</Link>
      </div>
      <article className="panel" style={{ marginTop: 18, maxWidth: 760 }}>
        <span className="tag">{story.kicker}</span>
        <h3 style={{ fontSize: 32 }}>{story.title}</h3>
        <p>{story.body}</p>
      </article>
      <div className="stat-grid" style={{ marginTop: 16 }}>
        <div className="panel"><span className="tag">Minute band</span><h3>{minuteTarget(player)}</h3><p>{player.starts ? "Opens the game" : "Comes in with the rotation"}</p></div>
        <div className="panel"><span className="tag">This draw</span><h3>{line ? `${one(line.pts, line.g)} pts` : "—"}</h3><p>{line ? `${line.g} games · ${one(line.sec / 60, line.g)} mpg` : "Has not played yet"}</p></div>
        <div className="panel"><span className="tag">Line</span><h3>{line ? `${one(line.reb, line.g)} reb` : "—"}</h3><p>{line ? `${one(line.ast, line.g)} ast · ${one(line.stl, line.g)} stl · ${one(line.blk, line.g)} blk` : "Box score waits on the first tip"}</p></div>
        <div className="panel"><span className="tag">Shooting</span><h3>{line ? pct(line.fgm, line.fga) : "—"}</h3><p>{line ? `3P ${pct(line.tpm, line.tpa)} · FT ${pct(line.ftm, line.fta)}` : "No attempts yet"}</p></div>
      </div>
      <section className="section" style={{ maxWidth: 560 }}>
        <div className="section-head"><h3>Prime ratings</h3></div>
        <div className="bars">
          {BARS.map((bar) => (
            <div key={bar.key} className="bar-line">
              <span>{bar.label}</span>
              <span className="track"><span style={{ width: `${player.ratings[bar.key]}%` }} /></span>
              <span className="mono">{player.ratings[bar.key]}</span>
            </div>
          ))}
        </div>
        <p className="note">Usage {player.ratings.usg}. Three-point share {player.ratings.threeRate}. These describe the prime, not a current season.</p>
      </section>
    </main>
  );
}
