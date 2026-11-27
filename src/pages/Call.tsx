import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { playerById } from "../data";
import type { BoxLine } from "../data/types";
import { dealCall, playCall } from "../engine/call";
import { Floor, useRun } from "./toyShell";

function top(lines: BoxLine[]) {
  return lines
    .filter((line) => line.sec > 0)
    .slice()
    .sort((a, b) => b.pts - a.pts || a.playerId.localeCompare(b.playerId))
    .slice(0, 3);
}

export function Call() {
  const run = useRun();
  const deal = useMemo(() => dealCall(run.seed, run.salt), [run.seed, run.salt]);
  const [pick, setPick] = useState<string | null>(null);
  const played = useMemo(() => (pick ? playCall(run.seed, run.salt) : null), [pick, run.seed, run.salt]);
  const game = played?.game;
  const called = Boolean(game && pick === game.winnerId);
  const winner = game ? (game.winnerId === deal.home.id ? deal.home.name : deal.away.name) : "";

  return (
    <Floor
      floor="call"
      kicker={run.kicker("The Call")}
      title={game ? (called ? "Called it" : winner) : "Pick a side"}
      winner={game ? winner : undefined}
      lede="Two human sides. One NBA game. You pick before tip. It is an exhibition, so the groups and the country standings stay where they are."
      onAgain={() => { setPick(null); run.again(); }}
    >
      <div className="call-pair">
        {[deal.home, deal.away].map((team) => (
          <button
            key={team.id}
            type="button"
            className={`panel door${pick === team.id ? " on" : ""}`}
            onClick={() => setPick(team.id)}
            disabled={pick !== null}
          >
            <span className="tag">{team.code} · power {Math.round(team.id === deal.home.id ? deal.homePower : deal.awayPower)}</span>
            <h3>{team.name}</h3>
            <p>{pick ? "Locked" : "Take this side"}</p>
          </button>
        ))}
      </div>
      {game ? (
        <>
          <p className="scoreline" data-score={`${game.awayScore}–${game.homeScore}`}>{game.awayName} {game.awayScore}, {game.homeName} {game.homeScore}</p>
          <p>{called ? `You took ${winner}. That was the game.` : `You took the other side. ${winner} won it.`}</p>
          <div className="call-box">
            {[{ name: game.awayName, lines: game.box.away }, { name: game.homeName, lines: game.box.home }].map((side) => (
              <div key={side.name}>
                <h3 className="subhead">{side.name}</h3>
                <ul className="toy-log">
                  {top(side.lines).map((line) => (
                    <li key={line.playerId}>
                      <Link to={`/players/${line.playerId}`}>{playerById(line.playerId)?.name ?? line.playerId}</Link>
                      {` ${line.pts} pts`}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="note">The score stays down until you pick.</p>
      )}
    </Floor>
  );
}
