import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PLAYERS, TEAMS, playerById, rosterOf, sideById, TEAM_BY_ID } from "../data";
import { Mark } from "../components/Marks";
import type { GameResult, Player, SeriesResult, Siege, Team } from "../data/types";
import { seriesRecord } from "../engine/series";
import { teamPower } from "../engine/tournament";
import { styleOfTeam } from "../lib/styleFor";
import { readPlayerStyle } from "../engine/style";
import { kindLabel, one, pct, signed, trueShooting } from "../lib/format";
import { tally, teamLine, type Tot } from "../lib/stats";
import { usePantheon } from "../state/store";

type Mode = "primes" | "sides";

export function Compare() {
  const { tournament } = usePantheon();
  const [params, setParams] = useSearchParams();
  const initialMode: Mode = params.get("side") || params.get("other") ? "sides" : "primes";
  const [mode, setMode] = useState<Mode>(initialMode);
  const leftId = params.get("left") ?? "";
  const rightId = params.get("right") ?? "";
  const sideId = params.get("side") ?? "";
  const otherId = params.get("other") ?? "";
  const [leftQ, setLeftQ] = useState("");
  const [rightQ, setRightQ] = useState("");
  const [sideQ, setSideQ] = useState("");
  const [otherQ, setOtherQ] = useState("");

  useEffect(() => {
    const player = playerById(leftId);
    if (player) setLeftQ(player.name);
  }, [leftId]);
  useEffect(() => {
    const player = playerById(rightId);
    if (player) setRightQ(player.name);
  }, [rightId]);
  useEffect(() => {
    const team = sideId ? TEAM_BY_ID[sideId] : undefined;
    if (team) setSideQ(team.name);
  }, [sideId]);
  useEffect(() => {
    const team = otherId ? TEAM_BY_ID[otherId] : undefined;
    if (team) setOtherQ(team.name);
  }, [otherId]);

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const left = playerById(leftId);
  const right = playerById(rightId);
  const side = sideId ? TEAM_BY_ID[sideId] : undefined;
  const other = otherId ? TEAM_BY_ID[otherId] : undefined;
  const meetings = useMemo(() => {
    if (!side || !other) return [];
    return meetingsBetween(tournament.series, tournament.siege, side.id, other.id);
  }, [side, other, tournament.series, tournament.siege]);

  return (
    <main className="page">
      <p className="kicker">Beside</p>
      <h2 className="display" style={{ fontSize: "clamp(48px, 8vw, 76px)" }}>Set them next to each other</h2>
      <p className="lede">
        Two primes, or two sides. Shooting, boards, creation, defense, and the margin. A higher number takes the gold, except turnovers, where fewer is the better night. Open either card when the table is not enough.
      </p>
      <div className="filters">
        <button type="button" className={mode === "primes" ? "on" : ""} onClick={() => setMode("primes")}>Primes</button>
        <button type="button" className={mode === "sides" ? "on" : ""} onClick={() => setMode("sides")}>Sides</button>
        <Link className="text-btn" to="/rankings">Rankings</Link>
        <Link className="text-btn" to="/leaders">Leaders</Link>
      </div>

      {mode === "primes" ? (
        <>
          <div className="versus">
            <Finder
              label="First prime"
              query={leftQ}
              onQuery={setLeftQ}
              picks={primePicks(leftQ, leftId)}
              selected={left}
              onPick={(id) => set("left", id)}
            />
            <div className="seal-mid">against</div>
            <Finder
              label="Second prime"
              query={rightQ}
              onQuery={setRightQ}
              picks={primePicks(rightQ, rightId)}
              selected={right}
              onPick={(id) => set("right", id)}
            />
          </div>
          {left && right ? <PrimeTable left={left} right={right} games={tournament.games} siege={tournament.siege} /> : (
            <p className="empty">Choose a side, then any prime on it. Search still finds a name.</p>
          )}
        </>
      ) : (
        <>
          <div className="versus">
            <SideFinder label="First side" query={sideQ} onQuery={setSideQ} picks={sidePicks(sideQ, sideId)} selected={side} onPick={(id) => set("side", id)} />
            <div className="seal-mid">against</div>
            <SideFinder label="Second side" query={otherQ} onQuery={setOtherQ} picks={sidePicks(otherQ, otherId)} selected={other} onPick={(id) => set("other", id)} />
          </div>
          {side && other ? <SideTable left={side} right={other} games={tournament.games} series={tournament.series} siege={tournament.siege} meetings={meetings} /> : (
            <p className="empty">Choose any two sides. The Construct is on the list.</p>
          )}
        </>
      )}
    </main>
  );
}

function Finder({
  label, query, onQuery, picks, selected, onPick,
}: {
  label: string;
  query: string;
  onQuery: (value: string) => void;
  picks: Player[];
  selected?: Player;
  onPick: (id: string) => void;
}) {
  const [browseId, setBrowseId] = useState(selected?.teamId ?? "");
  const shownSide = browseId || selected?.teamId || "";
  const book = shownSide ? rosterOf(shownSide) : [];
  return (
    <div className="seek panel">
      <span className="kicker">{label}</span>
      <label className="quiet">
        Side
        <select aria-label={`${label} side`} value={shownSide} onChange={(event) => setBrowseId(event.target.value)}>
          <SideOptions />
        </select>
      </label>
      <label className="quiet">
        Prime
        <select aria-label={`${label} prime`} value={selected && selected.teamId === shownSide ? selected.id : ""} onChange={(event) => onPick(event.target.value)} disabled={!shownSide}>
          <option value="">{shownSide ? "Choose a prime" : "Choose a side first"}</option>
          {book.map((player) => (
            <option key={player.id} value={player.id}>{player.name} · {player.pos} · {player.ratings.ovr}</option>
          ))}
        </select>
      </label>
      <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Or type a name" aria-label={label} />
      {selected ? (
        <p className="chosen">
          <Link to={`/players/${selected.id}`}>{selected.name}</Link>
          <span className="quiet"> · {TEAM_BY_ID[selected.teamId]?.code} · {selected.primeYear} · {selected.ratings.ovr}</span>
        </p>
      ) : <p className="quiet">No prime chosen.</p>}
      <div className="match-list">
        {picks.map((player) => (
          <button key={player.id} type="button" className={player.id === selected?.id ? "match on" : "match"} onClick={() => onPick(player.id)}>
            <strong>{player.name}</strong>
            <span className="meta">{TEAM_BY_ID[player.teamId]?.name} · {player.pos} · {player.primeYear}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SideFinder({
  label, query, onQuery, picks, selected, onPick,
}: {
  label: string;
  query: string;
  onQuery: (value: string) => void;
  picks: Team[];
  selected?: Team;
  onPick: (id: string) => void;
}) {
  return (
    <div className="seek panel">
      <span className="kicker">{label}</span>
      <label className="quiet">
        Side
        <select aria-label={label} value={selected?.id ?? ""} onChange={(event) => onPick(event.target.value)}>
          <SideOptions />
        </select>
      </label>
      <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Or type a side" aria-label={`${label} search`} />
      {selected ? (
        <p className="chosen">
          <Mark team={selected} size={28} />
          <Link to={`/teams/${selected.id}`}>{selected.name}</Link>
        </p>
      ) : <p className="quiet">No side chosen.</p>}
      <div className="match-list">
        {picks.map((team) => (
          <button key={team.id} type="button" className={team.id === selected?.id ? "match on" : "match"} onClick={() => onPick(team.id)}>
            <strong>{team.name}</strong>
            <span className="meta">{team.code} · {team.kind}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PrimeTable({ left, right, games, siege }: { left: Player; right: Player; games: GameResult[]; siege: Siege | null }) {
  const leftBag = bagFor(left, games, siege);
  const rightBag = bagFor(right, games, siege);
  const rows: Row[] = [
    row("Overall", left.ratings.ovr, right.ratings.ovr, String(left.ratings.ovr), String(right.ratings.ovr)),
    row("Shot", left.ratings.shot, right.ratings.shot, String(left.ratings.shot), String(right.ratings.shot)),
    row("Three", left.ratings.three, right.ratings.three, String(left.ratings.three), String(right.ratings.three)),
    row("Play", left.ratings.play, right.ratings.play, String(left.ratings.play), String(right.ratings.play)),
    row("Board", left.ratings.reb, right.ratings.reb, String(left.ratings.reb), String(right.ratings.reb)),
    row("Defense", left.ratings.def, right.ratings.def, String(left.ratings.def), String(right.ratings.def)),
    row("Ath", left.ratings.ath, right.ratings.ath, String(left.ratings.ath), String(right.ratings.ath)),
    rateRow("Points", leftBag, rightBag, (t) => t.pts / t.g, (t) => one(t.pts, t.g)),
    rateRow("Rebounds", leftBag, rightBag, (t) => t.reb / t.g, (t) => one(t.reb, t.g)),
    rateRow("Assists", leftBag, rightBag, (t) => t.ast / t.g, (t) => one(t.ast, t.g)),
    rateRow("Steals", leftBag, rightBag, (t) => t.stl / t.g, (t) => one(t.stl, t.g)),
    rateRow("Blocks", leftBag, rightBag, (t) => t.blk / t.g, (t) => one(t.blk, t.g)),
    rateRow("Turnovers", leftBag, rightBag, (t) => t.tov / t.g, (t) => one(t.tov, t.g), false),
    rateRow("Plus-minus", leftBag, rightBag, (t) => t.pm / t.g, (t) => signed(t.pm / t.g)),
    rateRow("Minutes", leftBag, rightBag, (t) => t.sec / t.g, (t) => one(t.sec / 60, t.g)),
    shotRow("Field goals", leftBag, rightBag, (t) => t.fgm / Math.max(1, t.fga), (t) => t.fga ? pct(t.fgm, t.fga) : "—"),
    shotRow("Threes", leftBag, rightBag, (t) => t.tpm / Math.max(1, t.tpa), (t) => t.tpa ? pct(t.tpm, t.tpa) : "—"),
    shotRow("True shooting", leftBag, rightBag, (t) => tsNum(t), (t) => trueShooting(t.pts, t.fga, t.fta)),
  ];
  return (
    <section className="section">
      <div className="section-head">
        <h3>{left.name} · {right.name}</h3>
        <span className="quiet">{readPlayerStyle(left).name} · {readPlayerStyle(right).name}</span>
      </div>
      <p className="pair-note"><span>{sourceLine(left, leftBag)}</span><span>{sourceLine(right, rightBag)}</span></p>
      <Sheet leftName={left.name} rightName={right.name} leftHref={`/players/${left.id}`} rightHref={`/players/${right.id}`} rows={rows} />
      <p className="note">
        Card ratings are the prime. The counting rows are this draw. A constructed unit is counted from the siege, because that is the only floor they play.
      </p>
    </section>
  );
}

function SideTable({
  left, right, games, series, siege, meetings,
}: {
  left: Team;
  right: Team;
  games: GameResult[];
  series: SeriesResult[];
  siege: Siege | null;
  meetings: SeriesResult[];
}) {
  const leftBook = bookFor(left, games, siege);
  const rightBook = bookFor(right, games, siege);
  const leftSeries = seriesRecordOf(left, series, siege);
  const rightSeries = seriesRecordOf(right, series, siege);
  const leftN = leftBook.w + leftBook.l;
  const rightN = rightBook.w + rightBook.l;
  const rows: Row[] = [
    row("Power", teamPower(left.id), teamPower(right.id), String(Math.round(teamPower(left.id))), String(Math.round(teamPower(right.id)))),
    row("Series wins", leftSeries.wins, rightSeries.wins, `${leftSeries.wins}-${leftSeries.losses}`, `${rightSeries.wins}-${rightSeries.losses}`),
    row("Game wins", leftBook.w, rightBook.w, leftN ? `${leftBook.w}-${leftBook.l}` : "—", rightN ? `${rightBook.w}-${rightBook.l}` : "—"),
    row("Point diff", leftBook.pf - leftBook.pa, rightBook.pf - rightBook.pa, leftN ? signed(leftBook.pf - leftBook.pa) : "—", rightN ? signed(rightBook.pf - rightBook.pa) : "—"),
    row("Margin a game", leftN ? (leftBook.pf - leftBook.pa) / leftN : 0, rightN ? (rightBook.pf - rightBook.pa) / rightN : 0, leftN ? signed((leftBook.pf - leftBook.pa) / leftN) : "—", rightN ? signed((rightBook.pf - rightBook.pa) / rightN) : "—"),
    shotRow("Field goals", leftBook.tot, rightBook.tot, (t) => (t?.fgm ?? 0) / Math.max(1, t?.fga ?? 0), (t) => t && t.fga ? pct(t.fgm, t.fga) : "—"),
    shotRow("Threes", leftBook.tot, rightBook.tot, (t) => (t?.tpm ?? 0) / Math.max(1, t?.tpa ?? 0), (t) => t && t.tpa ? pct(t.tpm, t.tpa) : "—"),
    shotRow("True shooting", leftBook.tot, rightBook.tot, (t) => t ? tsNum(t) : 0, (t) => t ? trueShooting(t.pts, t.fga, t.fta) : "—"),
    countRow("Boards a game", leftBook.tot, leftN, rightBook.tot, rightN, "reb"),
    countRow("Assists a game", leftBook.tot, leftN, rightBook.tot, rightN, "ast"),
    countRow("Steals a game", leftBook.tot, leftN, rightBook.tot, rightN, "stl"),
    countRow("Blocks a game", leftBook.tot, leftN, rightBook.tot, rightN, "blk"),
    countRow("Turnovers a game", leftBook.tot, leftN, rightBook.tot, rightN, "tov", false),
  ];
  return (
    <section className="section">
      <div className="section-head">
        <h3>{left.name} · {right.name}</h3>
        <span className="quiet">{styleOfTeam(left).name} · {styleOfTeam(right).name}</span>
      </div>
      <Sheet leftName={left.name} rightName={right.name} leftHref={`/teams/${left.id}`} rightHref={`/teams/${right.id}`} rows={rows} />
      {meetings.length > 0 ? (
        <div className="team-grid" style={{ marginTop: 12 }}>
          {meetings.map((series) => {
            const record = seriesRecord(series);
            return (
              <Link key={series.id} to={`/series/${series.id}`} className="panel">
                <span className="tag">{series.roundLabel} · {series.games.length} games</span>
                <h3>{sideById(series.winnerId)?.name ?? series.winnerId} {record.winnerWins}–{record.loserWins}</h3>
                <p>{sideById(series.loserId)?.name ?? series.loserId}</p>
              </Link>
            );
          })}
        </div>
      ) : <p className="note">These two have not met in this draw. The table is the card and the separate nights.</p>}
    </section>
  );
}

function Sheet({ leftName, rightName, leftHref, rightHref, rows }: { leftName: string; rightName: string; leftHref: string; rightHref: string; rows: Row[] }) {
  return (
    <div className="lab-scroll">
      <table>
        <thead>
          <tr>
            <th><Link to={leftHref}>{leftName}</Link></th>
            <th>Line</th>
            <th className="num"><Link to={rightHref}>{rightName}</Link></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.label}>
              <td className={item.leftMark}>{item.left}</td>
              <td>{item.label}</td>
              <td className={`num ${item.rightMark}`}>{item.right}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface Row {
  label: string;
  left: string;
  right: string;
  leftMark: string;
  rightMark: string;
}

function row(label: string, a: number, b: number, left: string, right: string, higher = true): Row {
  const [leftMark, rightMark] = marks(a, b, higher);
  return { label, left, right, leftMark, rightMark };
}

function rateRow(label: string, a: Tot | undefined, b: Tot | undefined, score: (row: Tot) => number, text: (row: Tot) => string, higher = true): Row {
  if (!a || !b || a.g === 0 || b.g === 0) {
    return { label, left: a && a.g ? text(a) : "—", right: b && b.g ? text(b) : "—", leftMark: "", rightMark: "" };
  }
  return row(label, score(a), score(b), text(a), text(b), higher);
}

function shotRow(label: string, a: Tot | undefined, b: Tot | undefined, score: (row: Tot) => number, text: (row: Tot) => string, higher = true): Row {
  if (!a || !b || a.g === 0 || b.g === 0) {
    return { label, left: a && a.g ? text(a) : "—", right: b && b.g ? text(b) : "—", leftMark: "", rightMark: "" };
  }
  return row(label, score(a), score(b), text(a), text(b), higher);
}

function marks(a: number, b: number, higher: boolean): [string, string] {
  if (!Number.isFinite(a) || !Number.isFinite(b) || a === b) return ["", ""];
  const leftWins = higher ? a > b : a < b;
  return leftWins ? ["better", ""] : ["", "better"];
}

function tsNum(row: Tot): number {
  const denom = 2 * (row.fga + 0.44 * row.fta);
  return denom ? row.pts / denom : 0;
}

function bagFor(player: Player, games: GameResult[], siege: Siege | null): Tot | undefined {
  const built = TEAM_BY_ID[player.teamId]?.kind === "construct";
  const source = built ? played(siege).flatMap((series) => series.games) : games;
  return tally(source, built).get(player.id);
}

function sourceLine(player: Player, bag: Tot | undefined): string {
  const built = TEAM_BY_ID[player.teamId]?.kind === "construct";
  const nights = bag?.g ?? 0;
  return `${player.name}: ${nights ? `${nights} ${built ? "siege" : "country"} games` : "no games yet"}.`;
}

function bookFor(team: Team, games: GameResult[], siege: Siege | null) {
  const built = team.kind === "construct";
  const source = built ? played(siege).flatMap((series) => series.games) : games;
  const line = teamLine(source, team.id, built);
  const bags = [...tally(source, built).values()].filter((row) => row.teamId === team.id);
  const tot = bags.reduce<Tot | undefined>((sum, row) => {
    if (!sum) return { ...row };
    sum.pts += row.pts; sum.reb += row.reb; sum.ast += row.ast; sum.stl += row.stl; sum.blk += row.blk; sum.tov += row.tov;
    sum.fgm += row.fgm; sum.fga += row.fga; sum.tpm += row.tpm; sum.tpa += row.tpa; sum.ftm += row.ftm; sum.fta += row.fta;
    sum.g += row.g;
    return sum;
  }, undefined);
  return { ...line, tot };
}

function seriesRecordOf(
  team: Team,
  series: SeriesResult[],
  siege: Siege | null,
): { wins: number; losses: number } {
  const built = team.kind === "construct";
  const pool = built ? played(siege) : series.filter((item) => !item.exhibition);
  const book = pool.filter((item) => item.homeId === team.id || item.awayId === team.id);
  const wins = book.filter((item) => item.winnerId === team.id).length;
  return { wins, losses: book.length - wins };
}

function countRow(
  label: string,
  a: Tot | undefined,
  aN: number,
  b: Tot | undefined,
  bN: number,
  key: "reb" | "ast" | "stl" | "blk" | "tov",
  higher = true,
): Row {
  const av = a && aN ? a[key] / aN : Number.NaN;
  const bv = b && bN ? b[key] / bN : Number.NaN;
  return row(label, av, bv, Number.isFinite(av) ? av.toFixed(1) : "—", Number.isFinite(bv) ? bv.toFixed(1) : "—", higher);
}

function meetingsBetween(
  series: SeriesResult[],
  siege: Siege | null,
  a: string,
  b: string,
): SeriesResult[] {
  const pool = [...series, ...played(siege)];
  const seen = new Set<string>();
  return pool.filter((item) => {
    const hit = (item.homeId === a && item.awayId === b) || (item.homeId === b && item.awayId === a);
    if (!hit || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function played(siege: Siege | null): SeriesResult[] {
  if (!siege) return [];
  return [siege.arrival, siege.gate, siege.restoration].filter((series): series is SeriesResult => Boolean(series));
}

const SIDE_KINDS = ["country", "overflow", "homeland", "construct"] as const;

function SideOptions() {
  return (
    <>
      <option value="">Choose a side</option>
      {SIDE_KINDS.map((kind) => (
        <optgroup key={kind} label={kindLabel(kind)}>
          {TEAMS.filter((team) => team.kind === kind).map((team) => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </optgroup>
      ))}
    </>
  );
}

function primePicks(query: string, selected: string): Player[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return PLAYERS.filter((player) => {
    if (player.id === selected) return false;
    const team = TEAM_BY_ID[player.teamId];
    return `${player.name} ${team?.name ?? ""} ${team?.code ?? ""}`.toLowerCase().includes(q);
  }).slice(0, 12);
}

function sidePicks(query: string, selected: string): Team[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return TEAMS.filter((team) => team.id !== selected && (team.name.toLowerCase().includes(q) || team.code.toLowerCase().includes(q) || team.country.toLowerCase().includes(q))).slice(0, 12);
}
