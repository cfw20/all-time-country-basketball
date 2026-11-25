import { Link } from "react-router-dom";
import { playerById } from "../data";
import type { GameResult, Play } from "../data/types";

export function ScoreTable({ game }: { game: GameResult }) {
  const swings = game.plays.filter((play) => play.key).slice(-8);
  return (
    <section className="section">
      <p className="kicker">{game.venue}</p>
      <h3 className="display" style={{ fontSize: 42 }}>{game.awayScore}–{game.homeScore}</h3>
      <p>{game.awayName} at {game.homeName}. {game.winnerId === game.homeId ? game.homeName : game.awayName} took the night.</p>
      <div className="panel" style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Line</th>
              {game.quarters.map((_, index) => <th key={index} className="num">{index < 4 ? `Q${index + 1}` : index === 4 ? "OT" : `OT${index - 3}`}</th>)}
              <th className="num">Tot</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{game.awayName}</td>
              {game.quarters.map((quarter, index) => <td key={index} className="num">{quarter.away}</td>)}
              <td className="num">{game.awayScore}</td>
            </tr>
            <tr>
              <td>{game.homeName}</td>
              {game.quarters.map((quarter, index) => <td key={index} className="num">{quarter.home}</td>)}
              <td className="num">{game.homeScore}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="team-grid">
        <Mini title={game.awayName ?? "Away"} lines={game.box.away} />
        <Mini title={game.homeName ?? "Home"} lines={game.box.home} />
      </div>
      <div>
        {swings.map((play, index) => <Swing key={`${play.clock}-${index}`} play={play} />)}
      </div>
    </section>
  );
}

function Mini({ title, lines }: { title: string; lines: GameResult["box"]["home"] }) {
  const top = lines.slice().sort((a, b) => b.pts - a.pts || b.sec - a.sec).slice(0, 5);
  return (
    <div className="panel">
      <span className="tag">{title}</span>
      {top.map((line) => {
        const player = playerById(line.playerId);
        return (
          <p key={line.playerId}>
            {player ? <Link to={`/players/${player.id}`}>{player.name}</Link> : line.playerId}
            {" "}{line.pts} pts · {line.orb + line.drb} reb · {line.ast} ast
          </p>
        );
      })}
    </div>
  );
}

function Swing({ play }: { play: Play }) {
  return (
    <div className="play key">
      <span className="clock">{play.clock}</span>
      <span>{play.text}</span>
      <span className="mono">{play.away}–{play.home}</span>
    </div>
  );
}
