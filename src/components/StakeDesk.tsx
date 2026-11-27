import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { TEAM_BY_ID, TEAMS } from "../data";
import type { SeriesResult } from "../data/types";
import { STAKE_AMOUNTS, openingSeries, useVisit } from "../state/visit";
import { usePantheon } from "../state/store";

const HUMANS = TEAMS.filter((team) => team.kind !== "construct").slice().sort((a, b) => a.name.localeCompare(b.name));

export function FollowBar() {
  const { tournament } = usePantheon();
  const { stake } = useVisit();
  const ticket = stake.ticket;
  if (!ticket) return null;
  const team = TEAM_BY_ID[ticket.teamId];
  if (!team) return null;
  const played = tournament.series.filter(
    (series) => !series.exhibition && (series.homeId === team.id || series.awayId === team.id),
  );
  const current = played.at(-1);
  const game = current?.games.at(-1);
  const sentence = ticket.settled
    ? ticket.sentence
    : `Backing ${team.name} for ${ticket.amount.toLocaleString("en-US")} marks. Their series has not tipped, so you can still change the side.`;
  return (
    <div className="follow-bar">
      <p><strong>Following {team.name}.</strong> {sentence}</p>
      <Link to={`/teams/${team.id}`}>The side</Link>
      {current ? <Link to={`/series/${current.id}`}>Their series</Link> : <span className="follow-wait">Series has not tipped</span>}
      {game ? <Link to={`/games/${game.id}`}>Latest game</Link> : null}
    </div>
  );
}

export function StakeDesk() {
  const { tournament } = usePantheon();
  const { stake, place } = useVisit();
  const location = useLocation();
  const ticket = stake.ticket;
  const [teamId, setTeamId] = useState(ticket?.teamId && !ticket.settled ? ticket.teamId : HUMANS[0].id);
  const [amount, setAmount] = useState<number>(ticket && !ticket.settled ? ticket.amount : 100);
  const selected = HUMANS.find((team) => team.id === teamId) ?? HUMANS[0];
  const series = openingSeries(tournament, selected.id);
  const locked = Boolean(ticket?.settled);
  const already = Boolean(series && stake.settledKeys.includes(`${tournament.seed}:${series.id}`));
  const refund = ticket && !ticket.settled ? ticket.amount : 0;
  const available = stake.purse + refund;
  const backed = ticket ? TEAM_BY_ID[ticket.teamId]?.name ?? ticket.teamId : "";

  useEffect(() => {
    if (!ticket || ticket.settled) return;
    setTeamId(ticket.teamId);
    setAmount(ticket.amount);
  }, [ticket]);

  useEffect(() => {
    if (location.hash !== "#back-a-side") return;
    document.getElementById("back-a-side")?.scrollIntoView({ block: "start" });
  }, [location.hash, location.pathname]);

  return (
    <section className="section stake-desk" id="back-a-side">
      <div className="section-head">
        <h3>Back a side</h3>
        <span className="quiet">Purse {stake.purse.toLocaleString("en-US")} marks</span>
      </div>
      <p className="lede">
        The purse starts at 1,000 marks and lives in this browser. Marks are made up. They are not money. There is no payment and no wallet. Backing a side does not change the games or the standings.
      </p>
      {ticket?.settled ? <p className="stake-sentence">{ticket.sentence}</p> : null}
      {!ticket && stake.last ? <p className="stake-sentence">{stake.last}</p> : null}
      {ticket && !ticket.settled ? (
        <p className="stake-sentence">Backing {backed} for {ticket.amount.toLocaleString("en-US")} marks. Their series has not tipped, so you can still change the side.</p>
      ) : null}
      {ticket?.seriesId ? <p className="note"><Link to={`/series/${ticket.seriesId}`}>Open that series</Link></p> : null}
      {locked ? (
        <p className="note">This series is settled. Replay the draw, or start a new one, and you can change the side before that series tips. The purse stays in this browser.</p>
      ) : (
        <>
          <p className="note">
            {series
              ? "Their opening series is already in this draw. Switch the side now if you want. Back this side settles the purse on that result."
              : "Their series has not started. You can change the side until it tips."}
          </p>
          <label className="stake-field">
            <span>Side</span>
            <select value={selected.id} onChange={(event) => setTeamId(event.target.value)} aria-label="Side">
              {HUMANS.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </label>
          <div className="stake-amounts" role="group" aria-label="Stake">
            {STAKE_AMOUNTS.map((value) => (
              <button key={value} type="button" className={value === amount ? "on" : ""} onClick={() => setAmount(value)} disabled={available < value}>
                {value} marks
              </button>
            ))}
          </div>
          <button type="button" className="stake-go" disabled={already || available < amount} onClick={() => place(selected.id, amount)}>
            {ticket && !ticket.settled ? "Change the side" : "Back this side"}
          </button>
          {already ? <p className="note">This series is already settled in the purse.</p> : null}
        </>
      )}
    </section>
  );
}

export function SeriesStake({ series }: { series: SeriesResult }) {
  const { stakeLine } = useVisit();
  const line = stakeLine(series);
  if (!line) return null;
  return <p className="stake-sentence">{line}</p>;
}
