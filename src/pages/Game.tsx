import { Link, useParams } from "react-router-dom";
import { playerById, TEAM_BY_ID } from "../data";
import { Mark } from "../components/Marks";
import type { BoxLine, GameResult } from "../data/types";
import { periodName } from "../engine/names";
import { clockMin, shotLine, signed } from "../lib/format";
import { usePantheon } from "../state/store";

export function GamePage() {
  const { id } = useParams();
  const { tournament } = usePantheon();
  const game = tournament.games.find((item) => item.id === id) ?? (tournament.allStar?.id === id ? tournament.allStar : undefined);
  if (!game) {
    return (
      <main className="page">
        <p className="kicker">Game</p>
        <h2 className="display" style={{ fontSize: 64 }}>This tip has not been played.</h2>
        <p className="lede">Sim the round from the dock, or go back to the schedule.</p>
      </main>
    );
  }
  const quarters = game.quarters.map((q, index) => `${periodName(index + 1)} ${q.away}-${q.home}`).join("  ·  ");
  return (
    <main className="page">
      <p className="kicker">{game.dayLabel} · {game.venue}{game.exhibition ? " · exhibition" : ""}</p>
      <div className="game-top">
        <Club id={game.awayId} name={game.awayName} />
        <div style={{ textAlign: "center" }}>
          <div className="big mono">{game.awayScore}<span style={{ color: "var(--faint)" }}>–</span>{game.homeScore}</div>
          <div className="quarters"><span>{quarters}</span></div>
        </div>
        <Club id={game.homeId} name={game.homeName} right />
      </div>
      <div className="facts">
        <span>Lead changes {game.leadChanges}</span>
        <span>Biggest lead {marginName(game)} {game.biggestLead.margin}</span>
        <span>Biggest run {runName(game)} {game.biggestRun.points}</span>
        {game.buzzerBeater ? <span style={{ color: "var(--ember)" }}>Buzzer</span> : null}
        {game.ot ? <span>{game.ot === 1 ? "Overtime" : `${game.ot} overtimes`}</span> : null}
      </div>
      <section className="section">
        <div className="section-head"><h3>Box score</h3></div>
        <Box title={sideName(game, game.awayId)} lines={game.box.away} />
        <Box title={sideName(game, game.homeId)} lines={game.box.home} />
      </section>
      <section className="section">
        <div className="section-head">
          <h3>Possession log</h3>
          <span className="quiet">{game.plays.length} lines · score is away–home · highlighted rows are the turns</span>
        </div>
        <div className="log">
          {game.plays.map((play, index) => {
            const head = index === 0 || play.q !== game.plays[index - 1].q;
            return (
              <div key={`${play.q}-${play.clock}-${index}`}>
                {head ? <div className="qhead">{periodName(play.q)}</div> : null}
                <div className={`play${play.key ? " key" : ""}`}>
                  <span className="clock">{play.clock}</span>
                  <span>{play.text}</span>
                  <span className="mono">{play.away}–{play.home}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function Club({ id, name, right }: { id: string; name?: string; right?: boolean }) {
  const team = TEAM_BY_ID[id];
  const title = name ?? team?.name ?? id;
  return (
    <div className={`club${right ? " right" : ""}`}>
      {team ? <Mark team={team} size={48} /> : null}
      {team ? <Link to={`/teams/${team.id}`} className="display" style={{ fontSize: 36 }}>{title}</Link> : <span className="display" style={{ fontSize: 36 }}>{title}</span>}
      <span className="quiet">{team?.country ?? "Exhibition"}</span>
    </div>
  );
}

function Box({ title, lines }: { title: string; lines: BoxLine[] }) {
  const ordered = lines.slice().sort((a, b) => Number(b.started) - Number(a.started) || b.sec - a.sec);
  return (
    <div style={{ marginBottom: 18 }}>
      <h4 style={{ fontFamily: "var(--serif)", fontSize: 26, margin: "8px 0" }}>{title}</h4>
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              {["Player", "Min", "Pts", "Reb", "Ast", "Stl", "Blk", "To", "Pf", "Fg", "3p", "Ft", "+/−"].map((label) => (
                <th key={label} className={label === "Player" ? "" : "num"}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ordered.map((line) => {
              const player = playerById(line.playerId);
              return (
                <tr key={line.playerId}>
                  <td className="name-cell">
                    <Link to={`/players/${line.playerId}`}>{player?.name ?? line.playerId}</Link>
                    {line.started ? " · start" : ""}
                    {line.fouledOut ? " · fouled out" : ""}
                    {line.injured ? " · left hurt" : ""}
                  </td>
                  <td className="num">{clockMin(line.sec)}</td>
                  <td className="num">{line.pts}</td>
                  <td className="num">{line.orb + line.drb}</td>
                  <td className="num">{line.ast}</td>
                  <td className="num">{line.stl}</td>
                  <td className="num">{line.blk}</td>
                  <td className="num">{line.tov}</td>
                  <td className="num">{line.pf}</td>
                  <td className="num">{shotLine(line.fgm, line.fga)}</td>
                  <td className="num">{shotLine(line.tpm, line.tpa)}</td>
                  <td className="num">{shotLine(line.ftm, line.fta)}</td>
                  <td className="num">{signed(line.pm)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function sideName(game: GameResult, id: string): string {
  if (id === game.homeId) return game.homeName ?? TEAM_BY_ID[id]?.name ?? id;
  return game.awayName ?? TEAM_BY_ID[id]?.name ?? id;
}

function marginName(game: GameResult): string {
  return sideName(game, game.biggestLead.teamId);
}

function runName(game: GameResult): string {
  return sideName(game, game.biggestRun.teamId);
}
