import { Link } from "react-router-dom";
import { TEAM_BY_ID } from "../data";
import type { SeriesResult, Tournament } from "../data/types";
import { standingsFor } from "../engine/tournament";
import { usePantheon } from "../state/store";

interface Slot {
  id: string;
  series?: SeriesResult;
  awayId?: string;
  homeId?: string;
}

export function Bracket() {
  const { tournament } = usePantheon();
  const r16 = r16Slots(tournament);
  const qf = fromWinners(["r16-0", "r16-1", "r16-2", "r16-3", "r16-4", "r16-5", "r16-6", "r16-7"], "qf", tournament);
  const sf = fromWinners(["qf-0", "qf-1", "qf-2", "qf-3"], "sf", tournament);
  const final = tournament.series.find((item) => item.id === "final");
  const third = tournament.series.find((item) => item.id === "third");
  const sf0 = tournament.series.find((item) => item.id === "sf-0");
  const sf1 = tournament.series.find((item) => item.id === "sf-1");

  return (
    <main className="page">
      <p className="kicker">Knockout · first to four · neutral floor</p>
      <h2 className="display" style={{ fontSize: 68 }}>The bracket</h2>
      <p className="lede">
        Every round is a best-of-seven. A side advances by winning four games. A1–B2, C1–D2, E1–F2, G1–H2, then the matching pairs on the other side. No home court. The better power seed is listed second. <Link to="/siege">The siege</Link> is its own set of series.
      </p>
      {tournament.through < 3 ? (
        <p className="empty">The bracket is named after the third group series. Sim the groups and the pairings appear, still unplayed until the round of 16.</p>
      ) : (
        <div className="bracket" style={{ marginTop: 18 }}>
          <Column slots={r16.slice(0, 4)} />
          <Column slots={qf.slice(0, 2)} />
          <Column slots={sf.slice(0, 1)} />
          <div className="final-col">
            <div>
              <div className="label">Final</div>
              <Match slot={{ id: "final", series: final, awayId: final?.awayId ?? sf0?.winnerId, homeId: final?.homeId ?? sf1?.winnerId }} />
            </div>
            <div>
              <div className="label">Third</div>
              <Match slot={{ id: "third", series: third, awayId: third?.awayId ?? sf0?.loserId, homeId: third?.homeId ?? sf1?.loserId }} />
            </div>
          </div>
          <Column slots={sf.slice(1)} />
          <Column slots={qf.slice(2)} />
          <Column slots={r16.slice(4)} />
        </div>
      )}
    </main>
  );
}

function Column({ slots }: { slots: Slot[] }) {
  return (
    <div className="br-col">
      {slots.map((slot) => <Match key={slot.id} slot={slot} />)}
    </div>
  );
}

function Match({ slot }: { slot: Slot }) {
  const series = slot.series;
  const awayId = series?.awayId ?? slot.awayId;
  const homeId = series?.homeId ?? slot.homeId;
  const awayWins = series ? (awayId === series.awayId ? series.awayWins : series.homeWins) : undefined;
  const homeWins = series ? (homeId === series.homeId ? series.homeWins : series.awayWins) : undefined;
  const body = (
    <>
      <Row id={awayId} score={awayWins} winner={series?.winnerId} />
      <Row id={homeId} score={homeWins} winner={series?.winnerId} />
    </>
  );
  if (!awayId || !homeId) return <div className="match"><div className="wait">Waiting</div></div>;
  if (!series) return <div className="match">{body}</div>;
  return <Link to={`/series/${series.id}`} className="match">{body}</Link>;
}

function Row({ id, score, winner }: { id?: string; score?: number; winner?: string }) {
  if (!id) return <div className="row"><span /><span>Open</span><b>—</b></div>;
  const team = TEAM_BY_ID[id];
  const state = winner ? (winner === id ? "win" : "loss") : "";
  return (
    <div className={`row ${state}`}>
      <i style={{ background: team?.colors.primary ?? "#888", display: "block", height: "100%" }} />
      <span>{team?.code ?? id}</span>
      <b>{score ?? ""}</b>
    </div>
  );
}

function r16Slots(tournament: Tournament): Slot[] {
  const slots: Slot[] = Array.from({ length: 8 }, (_, index) => {
    const series = tournament.series.find((item) => item.id === `r16-${index}`);
    return { id: `r16-${index}`, series, awayId: series?.awayId, homeId: series?.homeId };
  });
  if (slots[0].series || tournament.through < 3) return slots;
  const table = (letter: string) => standingsFor(tournament.groups.find((group) => group.id === letter)!.teamIds, tournament.series);
  const pairs: [string, string][] = [
    [table("A")[0].teamId, table("B")[1].teamId],
    [table("C")[0].teamId, table("D")[1].teamId],
    [table("E")[0].teamId, table("F")[1].teamId],
    [table("G")[0].teamId, table("H")[1].teamId],
    [table("B")[0].teamId, table("A")[1].teamId],
    [table("D")[0].teamId, table("C")[1].teamId],
    [table("F")[0].teamId, table("E")[1].teamId],
    [table("H")[0].teamId, table("G")[1].teamId],
  ];
  pairs.forEach((pair, index) => {
    const [a, b] = pair;
    const sa = tournament.ranking.find((row) => row.teamId === a)?.seed ?? 99;
    const sb = tournament.ranking.find((row) => row.teamId === b)?.seed ?? 99;
    slots[index].homeId = sa <= sb ? a : b;
    slots[index].awayId = slots[index].homeId === a ? b : a;
  });
  return slots;
}

function fromWinners(prev: string[], round: string, tournament: Tournament): Slot[] {
  const slots: Slot[] = [];
  for (let i = 0; i < prev.length; i += 2) {
    const left = tournament.series.find((item) => item.id === prev[i]);
    const right = tournament.series.find((item) => item.id === prev[i + 1]);
    const id = `${round}-${i / 2}`;
    const series = tournament.series.find((item) => item.id === id);
    slots.push({
      id,
      series,
      awayId: series?.awayId ?? left?.winnerId,
      homeId: series?.homeId ?? right?.winnerId,
    });
  }
  return slots;
}
