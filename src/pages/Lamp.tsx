import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PlayerLink } from "../components/Marks";
import { playerById, TEAM_BY_ID } from "../data";
import type { Contest } from "../data/types";
import { freshSeed, formatSeed } from "../engine/rng";
import { lightLamp } from "../engine/tournament";

export function Lamp() {
  const [seed, setSeed] = useState(() => freshSeed());
  const lamp = useMemo(() => lightLamp(seed), [seed]);
  return (
    <main className="page" data-floor="lamp">
      <p className="kicker">Side floor · seed {formatSeed(seed)}</p>
      <h2 className="display" style={{ fontSize: 64 }}>The Lamp</h2>
      <p className="lede">
        The interval, without waiting on the groups. Eight real primes in each contest. The final round decides it. Light it again for a new field.
      </p>
      <div className="filters">
        <button className="solid" type="button" onClick={() => setSeed(freshSeed())}>Light it again</button>
        <Link className="text-btn" to="/play">All floors</Link>
        <Link className="text-btn" to="/events">The championship interval</Link>
      </div>
      <div className="doors">
        <Winner contest={lamp.three} />
        <Winner contest={lamp.dunk} />
        <Winner contest={lamp.skills} />
      </div>
      <ContestTable contest={lamp.three} caption="Twenty-five shots, every fifth worth two. The final column is the final round." />
      <ContestTable contest={lamp.dunk} caption="Two dunks to advance, two more in the final." />
      <ContestTable contest={lamp.skills} caption="Handle, pass, and finish, each out of 20." />
    </main>
  );
}

function Winner({ contest }: { contest: Contest }) {
  const player = playerById(contest.winnerId);
  return (
    <article className="panel door">
      <span className="tag">{contest.title}</span>
      <h3>{player?.name ?? "The winner"}</h3>
      <p>{TEAM_BY_ID[player?.teamId ?? ""]?.name}. Prime {player?.primeYear}.</p>
    </article>
  );
}

function ContestTable({ contest, caption }: { contest: Contest; caption: string }) {
  return (
    <section className="section">
      <div className="section-head">
        <h3>{contest.title}</h3>
        <span className="quiet">Winner <PlayerLink id={contest.winnerId} /></span>
      </div>
      <p className="note">{caption}</p>
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr><th>Player</th><th>Side</th><th className="num">Round</th><th className="num">Final</th></tr>
          </thead>
          <tbody>
            {contest.field.map((row) => {
              const player = playerById(row.playerId);
              const final = contest.finalists.find((item) => item.playerId === row.playerId);
              return (
                <tr key={row.playerId}>
                  <td><PlayerLink id={row.playerId} /></td>
                  <td>{TEAM_BY_ID[player?.teamId ?? ""]?.code}</td>
                  <td className="num">{row.scores.join(" · ")}</td>
                  <td className="num">{final ? final.scores.join(" · ") : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
