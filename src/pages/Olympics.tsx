import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ScoreTable } from "../components/ScoreTable";
import { isConstructed, PLAYERS, playerById } from "../data";
import type { GameResult, Pos } from "../data/types";
import { readPlayerStyle } from "../engine/style";
import {
  OLY_ID,
  OLY_NAT_CAP,
  OLY_ROSTER,
  draftOlympicPrime,
  earnedOlympicBoosters,
  olympicMeetReading,
  olympicRosterLegal,
  olympicVerdict,
  olympicsLockLine,
  olympicsUnlock,
  openOlympicFinal,
  playOlympics,
  readOlympicSide,
  releaseOlympicPrime,
  startOlympicBuild,
  type OlympicBuild,
  type OlympicMeet,
  type OlympicReading,
  type OlympicSeriesLine,
} from "../engine/olympics";
import { formatSeed, freshSeed } from "../engine/rng";
import { loadYear } from "../state/yearBook";
import { EMPTY_OLYMPICS, loadOlympics, saveOlympics, type OlympicSave } from "../state/olympicsBook";
import { usePantheon } from "../state/store";

const POSITIONS: Array<Pos | "ALL"> = ["ALL", "PG", "SG", "SF", "PF", "C"];
const PAGE = 36;

const FAR_TITLE: Record<ReturnType<typeof olympicVerdict>["far"], string> = {
  gold: "Won the Olympics",
  final: "Reached the final",
  semifinal: "Reached the semifinal",
  quarterfinal: "Out in the quarterfinal",
};

export function Olympics() {
  const { trials } = usePantheon();
  const unlock = olympicsUnlock(trials);
  const [saved, setSaved] = useState<OlympicSave>(() => loadOlympics());
  const [running, setRunning] = useState(false);
  const [note, setNote] = useState("");
  const [finalGame, setFinalGame] = useState<GameResult | null>(null);

  useEffect(() => {
    saveOlympics(saved);
  }, [saved]);

  if (!unlock.open) {
    return (
      <main className="page" data-floor="olympics" data-state="locked">
        <p className="kicker">Side floor · still shut</p>
        <h2 className="display">The Olympics</h2>
        <p className="lede">{olympicsLockLine(unlock)}</p>
        <p className="lede">
          When the door opens, you draft twelve real primes from the book. At most three from one nationality. No Construct units. The side plays one eight-team bracket and then leaves. It is not in the championship draw, and it does not write the country standings.
        </p>
        <div className="filters">
          <Link className="text-btn" to="/trials">Trials</Link>
          <Link className="text-btn" to="/play">Side floors</Link>
        </div>
      </main>
    );
  }

  if (saved.meet) {
    return (
      <Report
        meet={saved.meet}
        finalGame={finalGame}
        onOpen={() => setFinalGame(openOlympicFinal(saved.meet as OlympicMeet))}
        onNew={begin}
        onDisband={disband}
      />
    );
  }

  if (!saved.build) {
    return (
      <main className="page" data-floor="olympics" data-state="open">
        <p className="kicker">Side floor · draft night</p>
        <h2 className="display">Draft night</h2>
        <p className="lede">
          Choose twelve real primes from the book. At most three share a nationality. The reading tells you whether the side is good before you enter: power, style, and where that card sits against the human field and the Construct. Then one eight-team bracket, first to four. The side never joins the championship.
        </p>
        <div className="stat-grid">
          <div className="panel">
            <span className="tag">The book</span>
            <h3>The whole pool</h3>
            <p>Every human prime is available. The board offers eight of the best still legal. You set the pick, then you take them.</p>
          </div>
          <div className="panel">
            <span className="tag">The side</span>
            <h3>Twelve seats</h3>
            <p>Draft order is the order you take them. The night opens the five the simulator would start. No Construct units.</p>
          </div>
          <div className="panel">
            <span className="tag">The reading</span>
            <h3>Before the meet</h3>
            <p>Power is the minute-weighted card the bracket uses to seed. Style is the opening five. It is a reading, not a tactic.</p>
          </div>
          <div className="panel">
            <span className="tag">The meet</span>
            <h3>First to four</h3>
            <p>Your side, the Construct, four countries, and two houses. Neutral floor. The report says how far they went.</p>
          </div>
        </div>
        <div className="filters">
          <button className="solid" type="button" onClick={begin}>Open the draft</button>
          <Link className="text-btn" to="/play">Side floors</Link>
        </div>
      </main>
    );
  }

  return (
    <DraftNight
      build={saved.build}
      running={running}
      note={note}
      onCommit={commit}
      onEnter={() => enter(saved.build as OlympicBuild)}
      onDisband={disband}
    />
  );

  function begin() {
    const year = loadYear();
    const boosters = earnedOlympicBoosters(year.relic?.charges ?? null, year.run?.charges ?? null);
    setNote("");
    setFinalGame(null);
    setSaved({ build: startOlympicBuild(freshSeed(), boosters), meet: null });
  }

  function disband() {
    setNote("");
    setFinalGame(null);
    setRunning(false);
    setSaved(EMPTY_OLYMPICS);
  }

  function commit(next: OlympicBuild) {
    setNote("");
    setSaved({ build: next, meet: null });
  }

  function enter(current: OlympicBuild) {
    if (running || !olympicRosterLegal(current.rosterIds)) return;
    setRunning(true);
    setNote("");
    const rosterIds = current.rosterIds.slice();
    const seed = current.seed;
    window.setTimeout(() => {
      try {
        const meet = playOlympics(rosterIds, seed);
        setSaved({ build: null, meet });
      } catch {
        setNote("The bracket did not finish. The side is still here.");
      } finally {
        setRunning(false);
      }
    }, 40);
  }
}

function DraftNight({
  build,
  running,
  note,
  onCommit,
  onEnter,
  onDisband,
}: {
  build: OlympicBuild;
  running: boolean;
  note: string;
  onCommit: (next: OlympicBuild) => void;
  onEnter: () => void;
  onDisband: () => void;
}) {
  const [focus, setFocus] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState<Pos | "ALL">("ALL");
  const [nation, setNation] = useState("ALL");
  const [shown, setShown] = useState(PAGE);
  const reading = useMemo(() => readOlympicSide(build.rosterIds), [build.rosterIds]);
  const seated = useMemo(() => new Set(build.rosterIds), [build.rosterIds]);
  const counts = useMemo(() => nationCounts(build.rosterIds), [build.rosterIds]);
  const humans = useMemo(() => PLAYERS.filter((player) => !isConstructed(player)), []);
  const nations = useMemo(
    () => [...new Set(humans.map((player) => player.nationality))].sort((a, b) => a.localeCompare(b)),
    [humans],
  );
  const board = useMemo(() => {
    return humans
      .filter((player) => !seated.has(player.id) && (counts.get(player.nationality) ?? 0) < OLY_NAT_CAP)
      .slice()
      .sort((a, b) => b.ratings.ovr - a.ratings.ovr || a.name.localeCompare(b.name))
      .slice(0, 8);
  }, [humans, seated, counts]);
  const pool = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return humans
      .filter((player) => {
        if (seated.has(player.id)) return false;
        if (pos !== "ALL" && player.pos !== pos && player.pos2 !== pos) return false;
        if (nation !== "ALL" && player.nationality !== nation) return false;
        if (!needle) return true;
        return player.name.toLowerCase().includes(needle) || player.nationality.toLowerCase().includes(needle);
      })
      .slice()
      .sort((a, b) => b.ratings.ovr - a.ratings.ovr || a.name.localeCompare(b.name));
  }, [humans, seated, pos, nation, query]);
  const visible = pool.slice(0, shown);
  const focused = focus ? playerById(focus) : undefined;
  const legalFocus = Boolean(focused && draftOlympicPrime(build, focused.id) !== build);
  const preview = legalFocus && focused ? readOlympicSide([...build.rosterIds, focused.id]) : null;

  useEffect(() => {
    setShown(PAGE);
  }, [query, pos, nation]);

  useEffect(() => {
    if (focus && seated.has(focus)) setFocus(board[0]?.id ?? null);
  }, [focus, seated, board]);

  return (
    <main className="page" data-floor="olympics" data-state="draft" data-ready={reading.ready ? "yes" : "no"}>
      <p className="kicker">Olympics · seed {formatSeed(build.seed)} · {build.rosterIds.length}/{OLY_ROSTER}</p>
      <h2 className="display">Draft night</h2>
      <p className="lede">
        Set a pick from the board or the pool, then take them. The side on the left is who you already have. Release a seat if you want the name back in the book.
      </p>
      {note ? <p className="scoreline">{note}</p> : null}
      <Reading reading={reading} />
      <div className="draft-layout">
        <section className="panel">
          <span className="tag">On the side</span>
          <h3>The drafted side</h3>
          <p className="quiet nation-line">{nationLine(build.rosterIds) || "No seats yet"}</p>
          <div className="nation-meters">
            {[...counts.entries()]
              .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
              .map(([name, count]) => (
                <span key={name}>{name} {count}/{OLY_NAT_CAP}</span>
              ))}
          </div>
          <div className="roster-slots">
            {Array.from({ length: OLY_ROSTER }, (_, index) => {
              const player = playerById(build.rosterIds[index] ?? "");
              const opener = player ? reading.starters.some((starter) => starter.id === player.id) : false;
              return (
                <div key={player?.id ?? `empty-${index}`} className={`slot panel${player ? "" : " empty"}`}>
                  {player ? (
                    <>
                      <Link to={`/players/${player.id}`}><strong>{player.name}</strong></Link>
                      <span className="quiet">
                        {player.pos}{player.pos2 ? `/${player.pos2}` : ""} · {player.primeYear} · {player.nationality} · {player.ratings.ovr}
                        {opener ? " · opens" : ""}
                      </span>
                      <button type="button" onClick={() => onCommit(releaseOlympicPrime(build, player.id))}>Release</button>
                    </>
                  ) : (
                    <span className="quiet">Open seat</span>
                  )}
                </div>
              );
            })}
          </div>
          {reading.starters.length === 5 ? (
            <p className="note">Opens {reading.starters.map((starter) => `${starter.name} (${starter.pos})`).join(" · ")}. That five is who the simulator starts. Style is a reading of them, not a tactic you call.</p>
          ) : (
            <p className="note">Five primes open a style and an opening five. Until then the power is only the names already taken.</p>
          )}
        </section>
        <section className="panel pick-sheet">
          <span className="tag">The pick</span>
          {focused ? (
            <>
              <h3><Link to={`/players/${focused.id}`}>{focused.name}</Link></h3>
              <p className="quiet">
                {focused.pos}{focused.pos2 ? `/${focused.pos2}` : ""} · {focused.primeYear} · {focused.nationality} · {focused.ratings.ovr}
                {" · "}{readPlayerStyle(focused).name}
              </p>
              <p>{readPlayerStyle(focused).line}</p>
              <p className="note">{focused.nationality} {counts.get(focused.nationality) ?? 0}/{OLY_NAT_CAP} already seated.</p>
              {preview ? (
                <>
                  <p>{preview.line}</p>
                  {preview.styleName ? <p className="note">With them, the style reads {preview.styleName}. {preview.styleLine}</p> : null}
                  <div className="filters">
                    <button className="solid" type="button" onClick={() => onCommit(draftOlympicPrime(build, focused.id))}>Take {focused.name}</button>
                  </div>
                </>
              ) : (
                <p>{takeBlock(build, focused.id, counts)}</p>
              )}
            </>
          ) : (
            <>
              <h3>Nobody is on the clock.</h3>
              <p>Choose a name from the board or the pool. The pick stays here, with the style and the seat they would give the side, until you take them.</p>
            </>
          )}
          <div className="filters">
            <button className="solid" type="button" disabled={running || !reading.ready} onClick={onEnter}>
              {running ? "The bracket is being played" : reading.ready ? "Enter the Olympics" : `Need ${OLY_ROSTER - build.rosterIds.length} more`}
            </button>
            <button type="button" onClick={onDisband}>Disband</button>
          </div>
        </section>
      </div>
      <section className="section pool-wrap">
        <div className="section-head">
          <h3>The board</h3>
          <span className="quiet">Eight of the best still legal</span>
        </div>
        <div className="draft-board">
          {board.length === 0 ? (
            <p className="empty">{reading.ready ? "The side is full. Release a seat to bring a name back." : "No legal prime is left under the cap."}</p>
          ) : null}
          {board.map((player) => (
            <button
              key={player.id}
              type="button"
              className={`board-name${focus === player.id ? " on" : ""}`}
              onClick={() => setFocus(player.id)}
            >
              <strong>{player.name}</strong>
              <span className="meta">{player.pos} · {player.primeYear} · {player.nationality} · {player.ratings.ovr}</span>
            </button>
          ))}
        </div>
        <div className="section-head">
          <h3>The pool</h3>
          <span className="quiet">{pool.length} names under this filter · {build.rosterIds.length} seated</span>
        </div>
        <div className="filters">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the book"
            aria-label="Search the book"
          />
          {POSITIONS.map((item) => (
            <button key={item} type="button" className={pos === item ? "on" : ""} onClick={() => setPos(item)}>
              {item === "ALL" ? "All spots" : item}
            </button>
          ))}
          <select value={nation} aria-label="Nationality" onChange={(event) => setNation(event.target.value)}>
            <option value="ALL">All nationalities</option>
            {nations.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <div className="pool-scroll">
          {visible.map((player) => {
            const capped = (counts.get(player.nationality) ?? 0) >= OLY_NAT_CAP;
            return (
              <button
                key={player.id}
                type="button"
                className={`pool-row${focus === player.id ? " on" : ""}${capped ? " cap" : ""}`}
                onClick={() => setFocus(player.id)}
              >
                <span>
                  <strong>{player.name}</strong>
                  <span className="meta">{player.pos}{player.pos2 ? `/${player.pos2}` : ""} · {player.primeYear} · {player.nationality} · {player.ratings.ovr} · {readPlayerStyle(player).name}</span>
                </span>
                <span className="quiet">{capped ? "Cap" : "Pick"}</span>
              </button>
            );
          })}
          {visible.length === 0 ? <p className="empty">No prime matches that filter.</p> : null}
        </div>
        {shown < pool.length ? (
          <div className="filters">
            <button type="button" onClick={() => setShown((value) => value + PAGE)}>Show more of the book</button>
            <span className="quiet">Showing {visible.length} of {pool.length}</span>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function Reading({ reading }: { reading: OlympicReading }) {
  const tag = reading.count === 0
    ? "Open book"
    : reading.ready
      ? `${reading.strength} · ready`
      : `${reading.outlook} so far · ${reading.count}/${OLY_ROSTER}`;
  return (
    <article className="panel reading">
      <span className="tag">{tag}</span>
      <div className="reading-power">{reading.count === 0 ? "—" : Math.round(reading.power)}</div>
      <p className="quiet">Power · minute-weighted card · pace {reading.pace.toFixed(2)}</p>
      <h3>{reading.styleName ?? "Style waits on five"}</h3>
      {reading.styleLine ? <p>{reading.styleLine}</p> : null}
      <p>{reading.line}</p>
      <p className="note">The rank is this pile against the best same number of names on each human side. Elite is a top-four cut. Contender is inside twelve. Live is the top half. Thin is below that. The Construct is quoted on its own cut. The meet seeds the other sides on their full books.</p>
    </article>
  );
}

function Report({
  meet,
  finalGame,
  onOpen,
  onNew,
  onDisband,
}: {
  meet: OlympicMeet;
  finalGame: GameResult | null;
  onOpen: () => void;
  onNew: () => void;
  onDisband: () => void;
}) {
  const verdict = olympicVerdict(meet);
  const reading = readOlympicSide(meet.rosterIds);
  const seat = olympicMeetReading(meet);
  const quarters = meet.series.filter((series) => series.round === "qf");
  const semis = meet.series.filter((series) => series.round === "sf");
  const gold = meet.series.find((series) => series.round === "gold");
  const maxPower = Math.max(...meet.field.map((side) => side.power), 1);
  const ranked = [...meet.field].sort((a, b) => b.power - a.power || a.name.localeCompare(b.name));
  const steps: Array<{ round: OlympicSeriesLine["round"]; label: string }> = [
    { round: "qf", label: "Quarterfinal" },
    { round: "sf", label: "Semifinal" },
    { round: "gold", label: "Final" },
  ];
  return (
    <main className="page" data-floor="olympics" data-state="filed">
      <p className="kicker">Olympics · seed {formatSeed(meet.seed)} · window closed</p>
      <h2 className="display">{FAR_TITLE[verdict.far]}</h2>
      <p className="lede">{verdict.line}</p>
      <p>The side is not in the championship, and this meet did not write the country standings. Draft a new side, or disband, and the report goes with it.</p>
      <Reading reading={reading} />
      <p className="note">{seat.line}</p>
      <section className="section">
        <div className="section-head">
          <h3>How far</h3>
          <span className="quiet">Your side only · first to four</span>
        </div>
        <ol className="oly-path">
          {steps.map((step) => {
            const series = meet.series.find((item) => item.round === step.round && (item.homeId === OLY_ID || item.awayId === OLY_ID));
            if (!series) {
              return (
                <li key={step.round}>
                  <span className="tag">{step.label}</span>
                  <strong>Did not reach</strong>
                </li>
              );
            }
            const win = series.winnerId === OLY_ID;
            const foe = series.homeId === OLY_ID ? series.awayName : series.homeName;
            const us = series.homeId === OLY_ID ? series.homeWins : series.awayWins;
            const them = series.homeId === OLY_ID ? series.awayWins : series.homeWins;
            return (
              <li key={step.round} className={win ? "win" : "loss"}>
                <span className="tag">{step.label}</span>
                <strong>{win ? "Won" : "Lost"} {us}–{them}</strong>
                <span>{foe}</span>
              </li>
            );
          })}
        </ol>
      </section>
      <section className="section">
        <div className="section-head">
          <h3>Quarterfinals</h3>
          <span className="quiet">First to four · neutral floor</span>
        </div>
        <div className="team-grid">
          {quarters.map((series) => <SeriesCard key={series.id} series={series} />)}
        </div>
      </section>
      <section className="section">
        <div className="section-head"><h3>Semifinals</h3></div>
        <div className="team-grid">
          {semis.map((series) => <SeriesCard key={series.id} series={series} />)}
        </div>
      </section>
      {gold ? (
        <section className="section">
          <div className="section-head"><h3>Final</h3></div>
          <SeriesCard series={gold} />
          <div className="filters">
            <button className="solid" type="button" onClick={onOpen}>Open the final game</button>
          </div>
          {finalGame ? <ScoreTable game={finalGame} /> : null}
        </section>
      ) : null}
      <Roster ids={meet.rosterIds} starters={reading.starters.map((starter) => starter.id)} />
      <section className="section">
        <div className="section-head">
          <h3>This field</h3>
          <span className="quiet">Eight sides, seeded by the same power</span>
        </div>
        <div className="meet-list">
          {ranked.map((side, index) => (
            <article key={side.id} className={`meet-row${side.id === OLY_ID ? " mine" : ""}`}>
              <span className="tag">{index + 1} · {kindLabel(side.kind)}</span>
              <strong>{side.name}</strong>
              <span className="track" aria-hidden="true"><span style={{ width: `${Math.max(8, (side.power / maxPower) * 100)}%` }} /></span>
              <b>{Math.round(side.power)}</b>
            </article>
          ))}
        </div>
      </section>
      <div className="filters">
        <button className="solid" type="button" onClick={onNew}>Draft a new side</button>
        <button type="button" onClick={onDisband}>Disband</button>
        <Link className="text-btn" to="/play">Side floors</Link>
      </div>
    </main>
  );
}

function SeriesCard({ series }: { series: OlympicSeriesLine }) {
  const ours = series.homeId === OLY_ID || series.awayId === OLY_ID;
  return (
    <article className={`panel${ours ? " year-seal" : ""}`}>
      <span className="tag">{series.roundLabel}{ours ? " · your side" : ""}</span>
      <p className="scoreline">{series.homeName} {series.homeWins}–{series.awayWins} {series.awayName}</p>
      {ours ? (
        <p className="quiet">
          Your points first. {series.games.map((game) => {
            const us = game.homeId === OLY_ID ? game.homeScore : game.awayScore;
            const them = game.homeId === OLY_ID ? game.awayScore : game.homeScore;
            return `G${game.n} ${us}–${them}`;
          }).join(" · ")}
        </p>
      ) : null}
    </article>
  );
}

function Roster({ ids, starters }: { ids: string[]; starters: string[] }) {
  const opening = new Set(starters);
  return (
    <section className="section">
      <div className="section-head">
        <h3>The Drafted Side</h3>
        <span className="quiet">{ids.length}/{OLY_ROSTER} · {nationLine(ids) || "no seats"}</span>
      </div>
      <div className="roster-slots">
        {ids.map((id) => {
          const player = playerById(id);
          if (!player) return null;
          return (
            <div key={player.id} className="slot panel">
              <Link to={`/players/${player.id}`}><strong>{player.name}</strong></Link>
              <span className="quiet">
                {player.pos}{player.pos2 ? `/${player.pos2}` : ""} · {player.primeYear} · {player.nationality} · {player.ratings.ovr}
                {opening.has(player.id) ? " · opens" : ""}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function takeBlock(build: OlympicBuild, playerId: string, counts: Map<string, number>): string {
  if (build.rosterIds.length >= OLY_ROSTER) return "The side is full. Release a seat to take someone else.";
  const player = playerById(playerId);
  if (!player) return "That prime is not in the book.";
  if (isConstructed(player)) return "Construct units stay off this side.";
  if ((counts.get(player.nationality) ?? 0) >= OLY_NAT_CAP) return `Three names from ${player.nationality} are already seated.`;
  if (build.rosterIds.includes(playerId)) return "That prime is already on the side.";
  return "That prime cannot be taken.";
}

function nationCounts(ids: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const id of ids) {
    const nationality = playerById(id)?.nationality;
    if (!nationality) continue;
    counts.set(nationality, (counts.get(nationality) ?? 0) + 1);
  }
  return counts;
}

function nationLine(ids: string[]): string {
  return [...nationCounts(ids).entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([nationality, count]) => `${nationality} ${count}/${OLY_NAT_CAP}`)
    .join(" · ");
}

function kindLabel(kind: OlympicMeet["field"][number]["kind"]): string {
  if (kind === "rolled") return "Drafted side";
  if (kind === "construct") return "Construct";
  if (kind === "overflow") return "Overflow";
  if (kind === "homeland") return "Homeland";
  return "Country";
}
