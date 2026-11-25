import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Link } from "react-router-dom";
import { playerById } from "../data";
import type { GameResult, Play, Pos } from "../data/types";
import { formatSeed, mixSeed } from "../engine/rng";
import {
  ROSTER_SIZE,
  addPlayer,
  armDouble,
  bannerReplay,
  cardPlayers,
  eraCard,
  playYear,
  recallPlayer,
  rosterHole,
  seasonRecord,
  spendGilded,
  spendPosition,
  spendReroll,
  startYear,
  watchNight,
  yearReady,
  yearUnlock,
  honorFor,
  type Inscription,
  type SeasonNight,
  type YearRun,
} from "../engine/season";
import { usePantheon } from "../state/store";
import { loadYear, saveYear, withFiledYear, type BestYear, type YearSave } from "../state/yearBook";

const POSITIONS: Pos[] = ["PG", "SG", "SF", "PF", "C"];

export function Season() {
  const { trials, tournament } = usePantheon();
  const unlock = yearUnlock(trials);
  const [saved, setSaved] = useState<YearSave>(() => loadYear());
  const [note, setNote] = useState("");
  const [running, setRunning] = useState(false);
  const [watch, setWatch] = useState<number | null>(null);
  const nightRef = useRef<HTMLElement>(null);

  useEffect(() => {
    saveYear(saved);
  }, [saved]);

  const run = saved.run;
  const filedWins = run?.nights?.filter((night) => night.win).length ?? -1;
  useEffect(() => {
    setSaved((prev) => withFiledYear(prev));
  }, [filedWins, run?.seed]);
  const game = useMemo(() => (run && watch !== null ? watchNight(run, watch) : null), [run, watch]);

  useEffect(() => {
    if (watch === null || !game) return;
    nightRef.current?.scrollIntoView({ block: "start" });
  }, [watch, game]);

  function commit(next: YearRun) {
    setNote("");
    setWatch(null);
    setSaved((prev) => ({ ...prev, run: next }));
  }

  function openYear() {
    const starts = saved.starts + 1;
    const seed = mixSeed(tournament.seed, `unbroken-${starts}`) || starts;
    setNote("");
    setWatch(null);
    setSaved({ ...saved, starts, relic: null, run: startYear(seed, saved.relic) });
  }

  function fold() {
    const nights = saved.run?.nights;
    const record = nights ? seasonRecord(nights) : null;
    setNote("");
    setWatch(null);
    setRunning(false);
    setSaved((prev) => ({
      ...prev,
      run: null,
      best: record ? betterYear(prev.best, { ...record, seed: prev.run?.seed ?? 0 }) : prev.best,
    }));
  }

  function tip() {
    if (!run || running) return;
    setRunning(true);
    window.setTimeout(() => {
      setSaved((prev) => (prev.run ? { ...prev, run: playYear(prev.run) } : prev));
      setRunning(false);
    }, 40);
  }

  if (!unlock.open) {
    return (
      <main className="page" data-floor="unbroken" data-state="locked">
        <p className="kicker">Side floor · still shut</p>
        <h2 className="display" style={{ fontSize: 68 }}>The Unbroken Year</h2>
        <p className="lede">
          An NBA regular season, played for 82–0. The roster is built by rolls: an era, a real franchise, and one prime from that card. This floor is separate from the country championship. It opens after some success in the main event.
        </p>
        <div className="stat-grid">
          <div className="panel">
            <span className="tag">Championships in the book</span>
            <h3>{unlock.championships}/{unlock.needChampionships}</h3>
            <p>Finish a second full championship. Replaying the same seed does not add another.</p>
          </div>
          <div className="panel">
            <span className="tag">Series taken from the Construct</span>
            <h3>{unlock.strikes}/{unlock.needStrikes}</h3>
            <p>Win the arrival, hold the gate, or have the Concord restore the floor.</p>
          </div>
        </div>
        <p className="lede">
          The first draw this browser files on arrival does not open the year. On that draw the Construct takes the siege, and one championship is short of the book. Run another draw from Trials, and take a series from the Construct in the siege.
        </p>
        <div className="filters">
          <Link className="text-btn" to="/trials">Trials</Link>
          <Link className="text-btn" to="/siege">Siege</Link>
          <Link className="text-btn" to="/rules">Rules</Link>
        </div>
      </main>
    );
  }

  if (!run) {
    return (
      <main className="page" data-floor="unbroken" data-state="ready">
        <p className="kicker">Side floor · NBA 82–0</p>
        <h2 className="display" style={{ fontSize: 68 }}>The Unbroken Year</h2>
        <p className="lede">
          Build The Unbroken from rolled era cards, then play an 82-game NBA regular season. The goal is a year that never loses. Humans are real primes. The country championship stays where it is.
        </p>
        {saved.crown ? <p className="scoreline">An Unbroken Year is cut into this browser.</p> : null}
        {saved.best ? (
          <p className="scoreline">Best year {saved.best.wins}–{saved.best.losses} · seed {formatSeed(saved.best.seed)}</p>
        ) : (
          <p className="scoreline">No year in the book yet.</p>
        )}
        {saved.relic ? <RelicNote relicId={saved.relic.honorId} gilded={saved.relic.gildedOpen} /> : null}
        <div className="filters">
          <button className="solid" type="button" onClick={openYear}>{saved.relic ? "Open a year with the relic" : "Open a year"}</button>
        </div>
        <Vault rows={saved.vault} />
      </main>
    );
  }

  if (run.nights) {
    const record = seasonRecord(run.nights);
    const perfect = record.wins === 82;
    const night = watch !== null ? run.nights[watch] : undefined;
    return (
      <main className="page" data-floor="unbroken" data-state="played">
        <p className="kicker">The Unbroken · seed {formatSeed(run.seed)}</p>
        <h2 className="display" style={{ fontSize: 68 }}>{perfect ? "82–0" : `${record.wins}–${record.losses}`}</h2>
        <HonorBlock wins={record.wins} losses={record.losses} rosterIds={run.rosterIds} nights={run.nights} relicId={saved.relic?.honorId ?? null} />
        <p className="quiet">Gold is a win. Rose is a loss. Open a night for the line score. One loss can be played again.</p>
        {saved.best ? <p className="scoreline">Best year in this browser {saved.best.wins}–{saved.best.losses}</p> : null}
        <div className="pips" role="list">
          {run.nights.map((item, index) => (
            <button
              key={item.n}
              type="button"
              className={`pip${item.win ? " win" : ""}${watch === index ? " on" : ""}`}
              title={`Night ${item.n}: ${item.us}–${item.them}`}
              onClick={() => setWatch(index)}
            >
              {item.n}
            </button>
          ))}
        </div>
        {night && game ? (
          <NightCard
            night={night}
            game={game}
            sheetRef={nightRef}
            replay={night.win || run.bannerUsed || run.charges.banner <= 0 ? null : (
              <button className="solid" type="button" onClick={() => commit(bannerReplay(run, watch ?? -1))}>
                Play this night again
              </button>
            )}
            replayNote={run.bannerUsed ? "The banner replay has been used." : null}
          />
        ) : <p className="empty">Choose a night.</p>}
        <div className="filters">
          <button type="button" onClick={fold}>Fold this year</button>
        </div>
        <RosterStrip ids={run.rosterIds} />
      </main>
    );
  }

  const card = run.current ? eraCard(run.current.cardId) : null;
  const offered = card ? cardPlayers(card) : [];
  const best = offered[0];
  const bestOpen = offered.find((player) => !run.rosterIds.includes(player.id));
  const hole = rosterHole(run.rosterIds);
  const myth = Boolean(card && (card.tier === "myth" || run.current?.charged || run.current?.gilded));

  return (
    <main className="page" data-floor="unbroken" data-state="building">
      <p className="kicker">The Unbroken · seed {formatSeed(run.seed)} · {run.rosterIds.length}/{ROSTER_SIZE}</p>
      <h2 className="display" style={{ fontSize: 64 }}>Build the year</h2>
      <p className="lede">
        Each roll is an era and a franchise. The names are real teammates from that season, shown in the prime already in the book. Take one. Seventy wins leaves a relic for the next year. Eighty-two cuts this roster into the book.
      </p>
      {run.openedWith ? <RelicNote relicId={run.openedWith} gilded={Boolean(run.current?.gilded)} /> : null}
      {saved.best ? <p className="scoreline">Best year {saved.best.wins}–{saved.best.losses}</p> : null}
      <ChargeRow run={run} />
      {note ? <p className="scoreline">{note}</p> : null}

      {card && run.current ? (
        <article className={`panel era-card${myth ? " myth" : ""}`}>
          <span className="tag">{tierLabel(card.tier, run.current.charged, run.current.gilded)}</span>
          <h3 className="display" style={{ fontSize: 40 }}>{card.years} {card.franchise}</h3>
          <p>{card.line}</p>
          {run.current.charged ? <p>The floor tilted. This roll came up a myth year.</p> : null}
          {run.current.gilded ? <p>A gilded roll. The book opened on a myth year.</p> : null}
          {run.doubleArmed ? <p>This card will give you two primes. Leave it, and the second add goes with the card.</p> : null}
          <div className="era-list">
            {offered.map((player) => {
              const taken = run.rosterIds.includes(player.id);
              const openHole = !taken && fillsHole(player.pos, player.pos2, hole);
              return (
                <div key={player.id} className={`era-pick${taken ? " taken" : ""}`}>
                  <div>
                    <Link to={`/players/${player.id}`}><strong>{player.name}</strong></Link>
                    <span className="quiet"> {player.pos}{player.pos2 ? `/${player.pos2}` : ""} · {player.primeYear} · {player.ratings.ovr}</span>
                    <div className="badges">
                      {player.id === best?.id ? <span className="badge">Best on the card</span> : null}
                      {best?.id !== bestOpen?.id && player.id === bestOpen?.id ? <span className="badge">Best still open</span> : null}
                      {openHole ? <span className="badge">Fills your hole</span> : null}
                    </div>
                    {player.note ? <p className="quiet">{player.note}</p> : null}
                  </div>
                  <button type="button" disabled={taken} onClick={() => commit(addPlayer(run, player.id))}>
                    {taken ? "On the roster" : "Add"}
                  </button>
                </div>
              );
            })}
          </div>
        </article>
      ) : (
        <p className="empty">The book has no open card with a prime still available. Recall someone you passed, or fold the year.</p>
      )}

      <div className="filters">
        <button type="button" disabled={!run.current || run.charges.reroll <= 0} onClick={() => {
          const next = spendReroll(run);
          if (next === run) setNote("This is the last open card. The reroll was kept.");
          else commit(next);
        }}>
          Roll again · {run.charges.reroll}
        </button>
        <button type="button" disabled={run.charges.gilded <= 0} onClick={() => {
          const next = spendGilded(run);
          if (next === run) setNote("No myth year still has an open prime. The gilded roll was kept.");
          else commit(next);
        }}>
          Gilded roll · {run.charges.gilded}
        </button>
        <button type="button" disabled={!run.current || run.doubleArmed || run.charges.double <= 0 || run.picksOnCard >= 2} onClick={() => commit(armDouble(run))}>
          Take two · {run.charges.double}
        </button>
      </div>
      <div className="filters">
        {POSITIONS.map((pos) => (
          <button
            key={pos}
            type="button"
            disabled={run.charges.position <= 0}
            onClick={() => {
              const next = spendPosition(run, pos);
              if (next === run) setNote(`No open card still has a ${pos}. That call was kept.`);
              else commit(next);
            }}
          >
            Call {pos}
          </button>
        ))}
        <span className="quiet">Position calls left: {run.charges.position}</span>
      </div>

      {run.charges.recall > 0 && run.memoryIds.length > 0 ? (
        <section className="section">
          <div className="section-head">
            <h3>Memory</h3>
            <span className="quiet">One recall</span>
          </div>
          <div className="filters">
            {memoryPlayers(run.memoryIds).map((player) => (
              <button key={player.id} type="button" onClick={() => commit(recallPlayer(run, player.id))}>
                Recall {player.name} · {player.ratings.ovr}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <RosterStrip ids={run.rosterIds} hole={hole} />

      <div className="filters">
        <button className="solid" type="button" disabled={!yearReady(run) || running} onClick={tip}>
          {running ? "The year is being played" : run.rosterIds.length >= ROSTER_SIZE ? "Play the 82" : "Play the 82 with this roster"}
        </button>
        <button type="button" onClick={fold}>Fold this year</button>
      </div>
      {hole ? <p className="quiet">The roster is still missing {hole}. A call can hunt that spot. The season can tip without it, and a teammate will have to start there.</p> : null}
      {run.rosterIds.length < ROSTER_SIZE ? <p className="quiet">The book holds twelve. Ten is enough to tip.</p> : null}
    </main>
  );
}

function ChargeRow({ run }: { run: YearRun }) {
  return (
    <p className="quiet">
      Roll again {run.charges.reroll} · Gilded {run.charges.gilded} · Take two {run.charges.double} · Position {run.charges.position} · Recall {run.charges.recall} · Replay a loss {run.charges.banner}
    </p>
  );
}

function RosterStrip({ ids, hole }: { ids: string[]; hole?: string | null }) {
  const players = ids.map((id) => playerById(id)).filter((player) => player !== undefined);
  return (
    <section className="section">
      <div className="section-head">
        <h3>The Unbroken</h3>
        <span className="quiet">{ids.length}/{ROSTER_SIZE}{hole ? ` · missing ${hole}` : ""}</span>
      </div>
      <div className="roster-slots">
        {Array.from({ length: ROSTER_SIZE }, (_, index) => {
          const player = players[index];
          return (
            <div key={player?.id ?? `empty-${index}`} className={`slot panel${player ? "" : " empty"}`}>
              {player ? (
                <>
                  <Link to={`/players/${player.id}`}><strong>{player.name}</strong></Link>
                  <span className="quiet">{player.pos} · {player.primeYear} · {player.ratings.ovr}</span>
                </>
              ) : (
                <span className="quiet">Open spot</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function NightCard({ night, game, sheetRef, replay, replayNote }: { night: SeasonNight; game: GameResult; sheetRef: RefObject<HTMLElement | null>; replay: ReactNode; replayNote: string | null }) {
  const swings = game.plays.filter((play) => play.key).slice(-8);
  const named = new Set(eraCard(night.cardId).playerIds);
  return (
    <section className="section night-sheet" ref={sheetRef}>
      <p className="kicker">Night {night.n} · {night.home ? "Home" : "Road"} · {night.venue}</p>
      <h3 className="display" style={{ fontSize: 36 }}>{night.us}–{night.them}</h3>
      <p>{night.opponent}. {night.win ? "The Unbroken won the night." : "The year took a loss."} The primes from that card play under their own names. Anyone marked era is a real prime from those years, filling the rotation.</p>
      {replay || replayNote ? <div className="filters">{replay}{replayNote ? <span className="quiet">{replayNote}</span> : null}</div> : null}
      <div className="panel" style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Line</th>
              {game.quarters.map((_, index) => <th key={index} className="num">{periodName(index)}</th>)}
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
        <MiniBox title={game.awayName ?? "Away"} lines={game.box.away} named={game.awayId === "year" ? null : named} />
        <MiniBox title={game.homeName ?? "Home"} lines={game.box.home} named={game.homeId === "year" ? null : named} />
      </div>
      <div>
        {swings.map((play, index) => <Swing key={`${play.clock}-${index}`} play={play} />)}
      </div>
    </section>
  );
}

function MiniBox({ title, lines, named }: { title: string; lines: GameResult["box"]["home"]; named: Set<string> | null }) {
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
            {named && !named.has(line.playerId) ? " · era" : ""}
            {line.injured ? " · scare" : ""}
          </p>
        );
      })}
    </div>
  );
}

function Swing({ play }: { play: Play }) {
  return (
    <div className={`play${play.key ? " key" : ""}`}>
      <span className="clock">{play.clock}</span>
      <span>{play.text}</span>
      <span className="mono">{play.away}–{play.home}</span>
    </div>
  );
}

function memoryPlayers(ids: string[]) {
  return ids
    .map((id) => playerById(id))
    .filter((player) => player !== undefined)
    .sort((a, b) => b.ratings.ovr - a.ratings.ovr || a.name.localeCompare(b.name));
}

function fillsHole(pos: Pos, pos2: Pos | undefined, hole: string | null): boolean {
  if (!hole) return false;
  if (hole.includes("point")) return pos === "PG" || pos2 === "PG";
  if (hole.includes("center")) return pos === "C" || pos2 === "C";
  return false;
}

function tierLabel(tier: string, charged: boolean, gilded: boolean): string {
  if (gilded) return "Gilded myth year";
  if (charged) return "The floor tilted";
  if (tier === "myth") return "Myth year";
  if (tier === "banner") return "Banner year";
  return "League year";
}

function periodName(index: number): string {
  if (index < 4) return `Q${index + 1}`;
  return index === 4 ? "OT" : `OT${index - 3}`;
}

function betterYear(current: BestYear | null, next: BestYear): BestYear {
  if (!current) return next;
  if (next.wins !== current.wins) return next.wins > current.wins ? next : current;
  return next.losses < current.losses ? next : current;
}

function HonorBlock({ wins, losses, rosterIds, nights, relicId }: { wins: number; losses: number; rosterIds: string[]; nights: SeasonNight[]; relicId: string | null }) {
  const honor = honorFor(wins);
  const names = rosterIds.map((id) => playerById(id)?.name).filter((name): name is string => Boolean(name));
  const loss = nights.find((night) => !night.win);
  return (
    <section className={`honor honor-${honor.id}`} data-honor={honor.id}>
      <p className="kicker">{honor.kicker}</p>
      <h3 className="display" style={{ fontSize: honor.id === "unbroken" ? 76 : 48 }}>{honor.title}</h3>
      <p>{honor.line}</p>
      {loss && wins < 82 ? <p>The year broke on night {loss.n}, {loss.us}–{loss.them}, against {loss.opponent}.</p> : null}
      {wins >= 75 ? (
        <div className="honor-names">
          {names.map((name) => <span key={name}>{name}</span>)}
        </div>
      ) : null}
      {honor.relic ? <p>{relicId === honor.id ? `The ${honor.title} relic travels with the next year.` : "The book keeps the stronger relic already waiting."}</p> : null}
      <p className="quiet">{wins}–{losses}</p>
    </section>
  );
}

function RelicNote({ relicId, gilded }: { relicId: string; gilded: boolean }) {
  const honor = honorFor(relicId === "unbroken" ? 82 : relicId === "breath" ? 81 : relicId === "door" ? 78 : relicId === "deep" ? 75 : 70);
  return (
    <p className="scoreline">
      {honor.title} is awake.{gilded ? " The first card can open as a myth year." : ""} {honor.line}
    </p>
  );
}

function Vault({ rows }: { rows: Inscription[] }) {
  if (rows.length === 0) return null;
  return (
    <section className="section">
      <div className="section-head">
        <h3>Years cut into the book</h3>
      </div>
      <div className="team-grid">
        {rows.slice(0, 6).map((row) => {
          const honor = honorFor(row.wins);
          const names = (row.rosterIds ?? []).slice(0, 4).map((id) => playerById(id)?.name).filter(Boolean);
          return (
            <article key={row.seed} className="panel">
              <span className="tag">{honor.title}</span>
              <h3>{row.wins}–{row.losses}</h3>
              <p>{names.join(", ")}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
