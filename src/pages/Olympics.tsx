import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ScoreTable } from "../components/ScoreTable";
import { playerById } from "../data";
import type { GameResult } from "../data/types";
import {
  OLY_ID,
  OLY_ROSTER,
  earnedOlympicBoosters,
  olympicRosterLegal,
  olympicVerdict,
  olympicsLockLine,
  olympicsUnlock,
  openOlympicFinal,
  playOlympics,
  rerollOlympic,
  startOlympicBuild,
  takeOlympicPrime,
  type OlympicBuild,
  type OlympicMeet,
  type OlympicSeriesLine,
} from "../engine/olympics";
import { formatSeed, freshSeed } from "../engine/rng";
import { loadYear } from "../state/yearBook";
import { EMPTY_OLYMPICS, loadOlympics, saveOlympics, type OlympicSave } from "../state/olympicsBook";
import { usePantheon } from "../state/store";

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
          A rolled side of twelve real primes can enter one eight-team bracket. It is not a 46th team, and countries still do not recruit.
        </p>
        <div className="filters">
          <Link className="text-btn" to="/trials">Trials</Link>
          <Link className="text-btn" to="/play">Side floors</Link>
        </div>
      </main>
    );
  }

  if (saved.meet) return <Report meet={saved.meet} finalGame={finalGame} onOpen={() => setFinalGame(openOlympicFinal(saved.meet as OlympicMeet))} onNew={begin} onDisband={disband} />;

  const build = saved.build;
  if (build && olympicRosterLegal(build.rosterIds)) {
    return (
      <main className="page" data-floor="olympics" data-state="ready">
        <p className="kicker">Olympics · seed {formatSeed(build.seed)} · 12/{OLY_ROSTER}</p>
        <h2 className="display">The side is rolled.</h2>
        <p className="lede">
          Enter them for one Olympics: this side, the Construct, four countries, and two houses. First to four. Neutral floor. When the bracket ends, that window is closed.
        </p>
        {note ? <p className="scoreline">{note}</p> : null}
        <Roster ids={build.rosterIds} />
        <div className="filters">
          <button className="solid" type="button" disabled={running} onClick={() => enter(build)}>
            {running ? "The bracket is being played" : "Enter the Olympics"}
          </button>
          <button type="button" onClick={disband}>Disband</button>
        </div>
      </main>
    );
  }

  if (build) {
    return (
      <main className="page" data-floor="olympics" data-state="rolling">
        <p className="kicker">Olympics · seed {formatSeed(build.seed)} · {build.rosterIds.length}/{OLY_ROSTER}</p>
        <h2 className="display">Roll the side.</h2>
        <p className="lede">
          A roll is a small card of real primes. Take one. The shuffle is the luck. One mulligan is free. Further rolls spend a booster already earned on the Unbroken Year, and the year keeps its own copy.
        </p>
        <p className="quiet">
          Free mulligan {build.mulligan} · Earned boosters {build.boosters}
          {nationLine(build.rosterIds) ? ` · ${nationLine(build.rosterIds)}` : ""}
        </p>
        {note ? <p className="scoreline">{note}</p> : null}
        {build.offer ? (
          <article className={`panel era-card${build.offer.tier === "myth" ? " myth" : ""}`}>
            <span className="tag">{build.offer.tier === "book" ? "Open book" : `${build.offer.years} · ${build.offer.tier}`}</span>
            <h3 className="display" style={{ fontSize: "clamp(32px, 5vw, 40px)" }}>{build.offer.years} {build.offer.franchise}</h3>
            <p>{build.offer.line}</p>
            <div className="era-list">
              {build.offer.playerIds.map((id) => {
                const player = playerById(id);
                if (!player) return null;
                const used = nationCount(build.rosterIds, player.nationality);
                return (
                  <div key={id} className="era-pick">
                    <div>
                      <Link to={`/players/${player.id}`}><strong>{player.name}</strong></Link>
                      <span className="quiet"> {player.pos}{player.pos2 ? `/${player.pos2}` : ""} · {player.primeYear} · {player.nationality} · {player.ratings.ovr}</span>
                      {used > 0 ? <div className="badges"><span className="badge">{player.nationality} {used}/3 on the side</span></div> : null}
                    </div>
                    <button type="button" onClick={() => commit(takeOlympicPrime(build, id))}>Take</button>
                  </div>
                );
              })}
            </div>
          </article>
        ) : (
          <p className="empty">No legal prime is left under the cap. Disband and roll again.</p>
        )}
        <div className="filters">
          <button
            type="button"
            disabled={!build.offer || (build.mulligan <= 0 && build.boosters <= 0)}
            onClick={() => {
              const next = rerollOlympic(build);
              if (next === build) setNote("No mulligan and no earned booster. Take a prime from this card.");
              else commit(next);
            }}
          >
            {build.mulligan > 0 ? "Mulligan" : build.boosters > 0 ? `Use a booster · ${build.boosters}` : "No roll left"}
          </button>
          <button type="button" onClick={disband}>Disband</button>
        </div>
        <Roster ids={build.rosterIds} />
      </main>
    );
  }

  return (
    <main className="page" data-floor="olympics" data-state="open">
      <p className="kicker">Side floor · one window</p>
      <h2 className="display">The Olympics</h2>
      <p className="lede">
        Roll twelve real primes, then play one bracket. The side is temporary. It does not join the championship draw.
      </p>
      <div className="stat-grid">
        <div className="panel">
          <span className="tag">The side</span>
          <h3>Twelve humans</h3>
          <p>At most three from one nationality. No Construct units. You take one name from a shuffled card.</p>
        </div>
        <div className="panel">
          <span className="tag">The field</span>
          <h3>Eight sides</h3>
          <p>Your side, the Construct, four countries, and two houses from the top of the book.</p>
        </div>
        <div className="panel">
          <span className="tag">The rules</span>
          <h3>First to four</h3>
          <p>NBA rules. Neutral floor. The Construct is the same side as in the siege.</p>
        </div>
        <div className="panel">
          <span className="tag">The window</span>
          <h3>One run</h3>
          <p>The report stays until you disband or roll a new side. It never stays in the draw.</p>
        </div>
      </div>
      <div className="filters">
        <button className="solid" type="button" onClick={begin}>Roll a side</button>
        <Link className="text-btn" to="/play">Side floors</Link>
      </div>
    </main>
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
  const quarters = meet.series.filter((series) => series.round === "qf");
  const semis = meet.series.filter((series) => series.round === "sf");
  const gold = meet.series.find((series) => series.round === "gold");
  return (
    <main className="page" data-floor="olympics" data-state="filed">
      <p className="kicker">Olympics · seed {formatSeed(meet.seed)} · window closed</p>
      <h2 className="display">That window is closed.</h2>
      <p className="lede">{verdict.line}</p>
      <p>The side is not in the championship. Roll a new one, or disband, and this report goes with it.</p>
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
      <Roster ids={meet.rosterIds} />
      <section className="section">
        <div className="section-head">
          <h3>The field</h3>
          <span className="quiet">Eight sides, then they leave</span>
        </div>
        <div className="team-grid">
          {meet.field.map((side) => (
            <article key={side.id} className="panel">
              <span className="tag">{kindLabel(side.kind)}</span>
              <h3>{side.name}</h3>
            </article>
          ))}
        </div>
      </section>
      <div className="filters">
        <button className="solid" type="button" onClick={onNew}>Roll a new side</button>
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

function Roster({ ids }: { ids: string[] }) {
  return (
    <section className="section">
      <div className="section-head">
        <h3>The Rolled Side</h3>
        <span className="quiet">{ids.length}/{OLY_ROSTER} · {nationLine(ids) || "no seats yet"}</span>
      </div>
      <div className="roster-slots">
        {Array.from({ length: OLY_ROSTER }, (_, index) => {
          const player = playerById(ids[index] ?? "");
          return (
            <div key={player?.id ?? `empty-${index}`} className={`slot panel${player ? "" : " empty"}`}>
              {player ? (
                <>
                  <Link to={`/players/${player.id}`}><strong>{player.name}</strong></Link>
                  <span className="quiet">{player.pos}{player.pos2 ? `/${player.pos2}` : ""} · {player.primeYear} · {player.nationality} · {player.ratings.ovr}</span>
                </>
              ) : (
                <span className="quiet">Open seat</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function nationCount(ids: string[], nationality: string): number {
  return ids.filter((id) => playerById(id)?.nationality === nationality).length;
}

function nationLine(ids: string[]): string {
  const counts = new Map<string, number>();
  for (const id of ids) {
    const nationality = playerById(id)?.nationality;
    if (!nationality) continue;
    counts.set(nationality, (counts.get(nationality) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([nationality, count]) => `${nationality} ${count}/3`)
    .join(" · ");
}

function kindLabel(kind: OlympicMeet["field"][number]["kind"]): string {
  if (kind === "rolled") return "Rolled side";
  if (kind === "construct") return "Construct";
  if (kind === "overflow") return "Overflow";
  if (kind === "homeland") return "Homeland";
  return "Country";
}
