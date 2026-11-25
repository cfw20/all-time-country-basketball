import { Link } from "react-router-dom";
import { playerById, TEAM_BY_ID } from "../data";
import type { BoxLine, GameResult } from "../data/types";
import { one, trueShooting } from "../lib/format";
import { tally, type Tot } from "../lib/stats";
import { usePantheon } from "../state/store";

export function Leaders() {
  const { tournament } = usePantheon();
  const games = tournament.games.filter((game) => !game.exhibition);
  const rows = [...tally(games).values()].filter((row) => row.g > 0);
  if (rows.length === 0) {
    return (
      <main className="page">
        <p className="kicker">Leaders</p>
        <h2 className="display" style={{ fontSize: 68 }}>No box scores yet.</h2>
      </main>
    );
  }
  const highs = singleHighs(games);
  return (
    <main className="page">
      <p className="kicker">This draw</p>
      <h2 className="display" style={{ fontSize: 68 }}>Leaders and records</h2>
      <p className="lede">Averages are per game in official Pantheon games. Rebounds split into the offensive and defensive boards already on the box. True shooting needs 25 field-goal attempts. The counting book is the total from those same boxes, so a longer run sits higher. The single-game book is the high mark from one night. <Link to="/rankings">Rankings</Link> puts the sides on one board. <Link to="/compare">Compare</Link> sets two primes, or two sides, beside each other.</p>
      <div className="groups" style={{ marginTop: 18 }}>
        <Board title="Points" rows={top(rows, (row) => row.pts / row.g)} value={(row) => one(row.pts, row.g)} />
        <Board title="Rebounds" rows={top(rows, (row) => row.reb / row.g)} value={(row) => one(row.reb, row.g)} detail={(row) => `${one(row.orb, row.g)} off · ${one(row.drb, row.g)} def`} />
        <Board title="Offensive boards" rows={top(rows, (row) => row.orb / row.g)} value={(row) => one(row.orb, row.g)} />
        <Board title="Defensive boards" rows={top(rows, (row) => row.drb / row.g)} value={(row) => one(row.drb, row.g)} />
        <Board title="Assists" rows={top(rows, (row) => row.ast / row.g)} value={(row) => one(row.ast, row.g)} />
        <Board title="Steals" rows={top(rows, (row) => row.stl / row.g)} value={(row) => one(row.stl, row.g)} />
        <Board title="Blocks" rows={top(rows, (row) => row.blk / row.g)} value={(row) => one(row.blk, row.g)} />
        <Board title="True shooting" rows={top(rows.filter((row) => row.fga >= 25), (row) => ts(row))} value={(row) => trueShooting(row.pts, row.fga, row.fta)} detail={(row) => `${row.fga} fga`} />
        <Board title="Minutes" rows={top(rows, (row) => row.sec / row.g)} value={(row) => one(row.sec / 60, row.g)} />
      </div>
      <section className="section">
        <div className="section-head"><h3>Counting book</h3><span className="quiet">Totals from the same boxes</span></div>
        <div className="groups">
          <Board title="Points" rows={top(rows, (row) => row.pts)} value={(row) => String(row.pts)} detail={(row) => `${one(row.pts, row.g)} a game`} />
          <Board title="Rebounds" rows={top(rows, (row) => row.reb)} value={(row) => String(row.reb)} detail={(row) => `${row.orb} off · ${row.drb} def`} />
          <Board title="Assists" rows={top(rows, (row) => row.ast)} value={(row) => String(row.ast)} detail={(row) => `${one(row.ast, row.g)} a game`} />
          <Board title="Steals" rows={top(rows, (row) => row.stl)} value={(row) => String(row.stl)} />
          <Board title="Blocks" rows={top(rows, (row) => row.blk)} value={(row) => String(row.blk)} />
        </div>
      </section>
      <section className="section">
        <div className="section-head"><h3>Single-game book</h3></div>
        <div className="team-grid">
          {highs.map((high) => (
            <Link key={high.label} to={`/games/${high.gameId}`} className="panel">
              <span className="tag">{high.label}</span>
              <h3>{high.value}</h3>
              <p>{high.name} · {high.team}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function ts(row: Tot): number {
  const denom = 2 * (row.fga + 0.44 * row.fta);
  return denom ? row.pts / denom : 0;
}

function top(rows: Tot[], score: (row: Tot) => number): Tot[] {
  return rows.slice().sort((a, b) => score(b) - score(a)).slice(0, 10);
}

function Board({ title, rows, value, detail }: { title: string; rows: Tot[]; value: (row: Tot) => string; detail?: (row: Tot) => string }) {
  return (
    <section className="group-card">
      <h3>{title}</h3>
      <table>
        <tbody>
          {rows.map((row) => {
            const player = playerById(row.playerId);
            const team = TEAM_BY_ID[row.teamId];
            const extra = detail ? detail(row) : "";
            return (
              <tr key={row.playerId}>
                <td className="name-cell">
                  <Link to={`/players/${row.playerId}`}>{player?.name}</Link>
                  <div className="quiet">{team?.code} · {row.g}g{extra ? ` · ${extra}` : ""}</div>
                </td>
                <td className="num">{value(row)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function singleHighs(games: GameResult[]) {
  const best = (label: string, pick: (line: BoxLine) => number) => {
    let value = -1;
    let name = "";
    let team = "";
    let gameId = "";
    for (const game of games) {
      for (const [teamId, lines] of [[game.homeId, game.box.home], [game.awayId, game.box.away]] as const) {
        for (const line of lines) {
          const n = pick(line);
          if (n > value) {
            value = n;
            name = playerById(line.playerId)?.name ?? line.playerId;
            team = TEAM_BY_ID[teamId]?.name ?? teamId;
            gameId = game.id;
          }
        }
      }
    }
    return { label, value, name, team, gameId };
  };
  return [
    best("Points", (line) => line.pts),
    best("Rebounds", (line) => line.orb + line.drb),
    best("Offensive rebounds", (line) => line.orb),
    best("Assists", (line) => line.ast),
    best("Steals", (line) => line.stl),
    best("Blocks", (line) => line.blk),
    best("Threes", (line) => line.tpm),
  ];
}
