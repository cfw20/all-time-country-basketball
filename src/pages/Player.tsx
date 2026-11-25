import { Link, useParams } from "react-router-dom";
import { choiceStory, playerById, TEAM_BY_ID } from "../data";
import { contractLabel, formatHeight, minuteTarget, roleLabel } from "../data/ratings";
import { Mark } from "../components/Marks";
import { clockMin, one, pct, shotLine, signed, trueShooting } from "../lib/format";
import { tally } from "../lib/stats";
import type { GameResult } from "../data/types";
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
      <p className="kicker">{player.nationality} · {formatHeight(player.height)}</p>
      <h2 className="display" style={{ fontSize: 76 }}>{player.name}</h2>
      <p className="seal">Prime only <b>{player.primeYear}</b></p>
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
        <div className="panel"><span className="tag">Shooting</span><h3>{line ? pct(line.fgm, line.fga) : "—"}</h3><p>{line ? `3P ${pct(line.tpm, line.tpa)} · FT ${pct(line.ftm, line.fta)} · TS ${trueShooting(line.pts, line.fga, line.fta)}` : "No attempts yet"}</p></div>
      </div>
      <section className="section">
        <div className="section-head"><h3>Game log</h3><span className="quiet">This draw · official games · prime on the card</span></div>
        <GameLog playerId={player.id} teamId={player.teamId} games={tournament.games} />
      </section>
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
        <p className="note">Usage {player.ratings.usg}. Three-point share {player.ratings.threeRate}. These ratings are the {player.primeYear} prime. The simulator does not age the player past it.</p>
      </section>
    </main>
  );
}

function GameLog({ playerId, teamId, games }: { playerId: string; teamId: string; games: GameResult[] }) {
  const rows = games.flatMap((game) => {
    if (game.exhibition) return [];
    const line = [...game.box.home, ...game.box.away].find((item) => item.playerId === playerId);
    if (!line) return [];
    const home = game.homeId === teamId;
    const opponentId = home ? game.awayId : game.homeId;
    const ours = home ? game.homeScore : game.awayScore;
    const theirs = home ? game.awayScore : game.homeScore;
    return [{ game, line, opponentId, ours, theirs, win: game.winnerId === teamId }];
  });
  if (rows.length === 0) return <p className="empty">No official minutes yet. The log fills as this draw is played.</p>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table>
        <thead>
          <tr>
            <th>Game</th><th>Opp</th><th className="num">Min</th><th className="num">Pts</th><th className="num">Reb</th><th className="num">Ast</th><th className="num">Stl</th><th className="num">Blk</th><th className="num">Fg</th><th className="num">3p</th><th className="num">Ft</th><th className="num">+/−</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.game.id}>
              <td className="name-cell"><Link to={`/games/${row.game.id}`}>{row.win ? "W" : "L"} {row.ours}–{row.theirs}</Link><div className="quiet">{row.game.roundLabel}</div></td>
              <td>{TEAM_BY_ID[row.opponentId]?.code ?? row.opponentId}</td>
              <td className="num">{clockMin(row.line.sec)}</td>
              <td className="num">{row.line.pts}</td>
              <td className="num">{row.line.orb + row.line.drb}</td>
              <td className="num">{row.line.ast}</td>
              <td className="num">{row.line.stl}</td>
              <td className="num">{row.line.blk}</td>
              <td className="num">{shotLine(row.line.fgm, row.line.fga)}</td>
              <td className="num">{shotLine(row.line.tpm, row.line.tpa)}</td>
              <td className="num">{shotLine(row.line.ftm, row.line.fta)}</td>
              <td className="num">{signed(row.line.pm)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
