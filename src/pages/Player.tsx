import { useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { choiceStory, CONCORD_ID, playerById, rosterOf, sideById, TEAM_BY_ID } from "../data";
import { askedToDo, archLabel, dutyLabel, formatHeight, minuteTarget, roleRank, statusLabel } from "../data/ratings";
import { Mark } from "../components/Marks";
import type { BoxLine, Contest, GameResult, Ratings, SeriesResult, Tournament } from "../data/types";
import { readPlayerStyle } from "../engine/style";
import { findSeries } from "../engine/tournament";
import { seriesRecord } from "../engine/series";
import { siegeGames } from "../engine/siege";
import { clockMin, finishName, kindLabel, one, pct, shotLine, signed, trueShooting } from "../lib/format";
import { tally, type Tot } from "../lib/stats";
import { usePantheon } from "../state/store";

const BARS: { key: keyof Ratings; label: string }[] = [
  { key: "shot", label: "Shot" },
  { key: "three", label: "Three" },
  { key: "play", label: "Play" },
  { key: "reb", label: "Board" },
  { key: "def", label: "Defense" },
  { key: "ath", label: "Ath" },
  { key: "ft", label: "Free throw" },
  { key: "clutch", label: "Clutch" },
  { key: "usg", label: "Usage" },
  { key: "threeRate", label: "Three share" },
];

const OFFICIAL_ROUNDS: RoundSpec[] = [
  { label: "Group", phrase: "the group stage", test: (round) => round.startsWith("group") },
  { label: "Round of 16", phrase: "the round of 16", test: (round) => round === "r16" },
  { label: "Quarterfinals", phrase: "the quarterfinals", test: (round) => round === "qf" },
  { label: "Semifinals", phrase: "the semifinals", test: (round) => round === "sf" },
  { label: "Final", phrase: "the final", test: (round) => round === "final" },
  { label: "Third place", phrase: "the third-place series", test: (round) => round === "third" },
];

const SIEGE_ROUNDS: RoundSpec[] = [
  { label: "Arrival", phrase: "the arrival", test: (round) => round === "arrival" },
  { label: "The gate", phrase: "the gate", test: (round) => round === "gate" },
  { label: "The restoration", phrase: "the restoration", test: (round) => round === "restoration" },
];

export function PlayerPage() {
  const { id } = useParams();
  const player = id ? playerById(id) : undefined;
  const { tournament } = usePantheon();
  if (!player) {
    return (
      <main className="page">
        <p className="kicker">The book</p>
        <h2 className="display" style={{ fontSize: "clamp(42px, 8vw, 68px)" }}>That player is not in the field.</h2>
        <p className="empty">The book lists the primes on a side, and the Construct. Nobody else is on a card.</p>
        <p><Link to="/players">Open the book</Link></p>
      </main>
    );
  }
  const team = TEAM_BY_ID[player.teamId];
  const built = team.kind === "construct";
  const story = choiceStory(player, team);
  const look = readPlayerStyle(player);
  const official = tournament.games.filter((game) => !game.exhibition);
  const siegeList = siegeGames(tournament.siege);
  const mainGames = built ? siegeList : official;
  const mainNights = collect(mainGames, player.id);
  const mainLine = tally(mainGames, true).get(player.id);
  const teamGames = official.filter((game) => game.homeId === team.id || game.awayId === team.id);
  const mainViews = built
    ? siegeRounds(tournament, player.id)
    : OFFICIAL_ROUNDS.map((spec) => roundFrom(spec, teamGames.filter((game) => spec.test(game.round)), player.id));
  const humanSiege = built ? [] : humanSiegeRounds(tournament, team.id, player.id);
  const siegeNights = built ? [] : collect(siegeList, player.id);
  const siegeLine = built ? undefined : tally(siegeList, true).get(player.id);
  const group = tournament.groups.find((item) => item.teamIds.includes(team.id));
  const seed = tournament.ranking.find((row) => row.teamId === team.id)?.seed;
  const place = tournament.finishes[team.id];
  const concordAt = tournament.siege?.concordIds.indexOf(player.id) ?? -1;
  const honors = honorList(tournament, player.id);
  const mates = rosterOf(team.id).slice().sort((a, b) => (
    Number(b.starts) - Number(a.starts) || roleRank(a.role) - roleRank(b.role) || b.ratings.ovr - a.ratings.ovr || a.name.localeCompare(b.name)
  ));

  const facts: { label: string; value: ReactNode }[] = [
    { label: built ? "Chassis" : "Prime", value: built ? "Built" : String(player.primeYear) },
    { label: "Nationality", value: player.nationality },
    { label: "Height", value: formatHeight(player.height) },
    { label: "Positions", value: player.pos2 ? `${player.pos} / ${player.pos2}` : player.pos },
    { label: "Archetype", value: archLabel(player.arch) },
    { label: "Style", value: look.name },
    { label: "Role", value: dutyLabel(player.role, built) },
    { label: "Status", value: statusLabel(player.contract, built) },
    { label: "Card", value: player.starts ? "Opens" : "Comes off the bench" },
    { label: "Minute target", value: String(minuteTarget(player)) },
    { label: "Overall", value: String(player.ratings.ovr) },
    { label: "Side", value: <Link to={`/teams/${team.id}`}>{team.name}</Link> },
    { label: "Path", value: built ? "Constructed" : kindLabel(team.kind) },
  ];
  if (built) facts.push({ label: "Draw", value: "Outside the groups" });
  else if (group) facts.push({ label: "Group", value: `Group ${group.id}` });
  if (seed) facts.push({ label: "Power seed", value: String(seed) });
  if (place) facts.push({ label: "Finish", value: finishName(place) });
  if (concordAt >= 0) facts.push({ label: "Concord", value: concordAt < 5 ? "Opens the restoration" : "On the night" });

  return (
    <main className="page">
      <div className="profile-head">
        <div>
          <p className="kicker"><Link to="/players">The book</Link> · {player.nationality} · {formatHeight(player.height)} · {player.pos}{player.pos2 ? ` / ${player.pos2}` : ""}</p>
          <h2 className="display">{player.name}</h2>
          <div className="champion-mark" style={{ marginTop: 14 }}>
            <Mark team={team} size={48} />
            <div className="profile-team">
              <Link to={`/teams/${team.id}`}>{team.name}</Link>
              <span className="quiet">{built ? "Constructed · no nation" : `${kindLabel(team.kind)} · ${team.country}`}</span>
            </div>
          </div>
          <p className="seal">{built ? "Constructed unit" : "Prime only"} <b>{built ? "Built" : player.primeYear}</b></p>
          <p className="quiet"><Link to={`/compare?left=${player.id}`}>Set beside another prime</Link> · <Link to="/rankings">Rankings</Link> · <Link to="/leaders">Leaders</Link></p>
          {honors.length > 0 ? (
            <div className="badges">
              {honors.map((honor) => <span key={honor} className="badge">{honor}</span>)}
            </div>
          ) : null}
        </div>
        <aside className="ovr-plate">
          <span className="tag">Overall</span>
          <b>{player.ratings.ovr}</b>
          <span className="quiet">{player.starts ? "Opens" : "Rotation"} · {minuteTarget(player)} min target</span>
        </aside>
      </div>
      <BookFinder />
      <div className="identity">
        {facts.map((fact) => (
          <div key={fact.label}>
            <span>{fact.label}</span>
            <strong>{fact.value}</strong>
          </div>
        ))}
      </div>
      <article className="panel story-panel">
        <span className="tag">{story.kicker}</span>
        <h3>{story.title}</h3>
        <p>{story.body}</p>
      </article>

      <section className="section" style={{ maxWidth: 920 }}>
        <div className="section-head">
          <h3>{built ? "Chassis ratings" : "Prime ratings"}</h3>
          <span className="quiet">The full card, including clutch</span>
        </div>
        <p className="lede">{askedToDo(player, built)}</p>
        <p className="note"><span className="tag">{look.name}</span> {look.line}</p>
        <div className="rating-board">
          {BARS.map((bar) => (
            <div key={bar.key} className="bar-line">
              <span>{bar.label}</span>
              <span className="track"><span style={{ width: `${Math.max(0, Math.min(100, player.ratings[bar.key]))}%` }} /></span>
              <span className="mono">{player.ratings[bar.key]}</span>
            </div>
          ))}
        </div>
        <p className="note">
          Usage {player.ratings.usg} is the weight for who uses a possession. Three-point share {player.ratings.threeRate} is the share of shots drawn as threes. Clutch moves the late-game shot.
          {built
            ? " These ratings are the chassis. There is no prime year and no aging. The simulator plays the unit as specified."
            : ` These ratings are the ${player.primeYear} prime. The simulator does not age the player past it.`}
        </p>
      </section>

      <StatBlock
        id="draw-line"
        title={built ? "The siege" : "This draw"}
        quiet={built ? "Arrival, the gate, and the restoration. Off the country table." : "Official games only. The interval and the siege are separate."}
        line={mainLine}
        nights={mainNights}
        views={mainViews}
        empty={built ? "This chassis has no siege minutes in this draw." : "This prime has no official minutes in this draw."}
      />
      {mainNights.length > 0 ? (
        <section className="section">
          <div className="section-head">
            <h3>Game log</h3>
            <span className="quiet">{built ? "Each night of the siege" : "Opponent, score, and the line"}</span>
          </div>
          <GameLog nights={mainNights} tournament={tournament} />
        </section>
      ) : null}

      {!built && (humanSiege.some((view) => view.reached) || siegeNights.length > 0) ? (
        <>
          <StatBlock
            title="Against the Construct"
            quiet="Best-of-seven nights. Off the country record, and not in the draw line above."
            line={siegeLine}
            nights={siegeNights}
            views={humanSiege}
            empty="No minutes against the Construct."
          />
          {siegeNights.length > 0 ? (
            <section className="section">
              <div className="section-head">
                <h3>Siege log</h3>
                <span className="quiet">The Construct is the opponent</span>
              </div>
              <GameLog nights={siegeNights} tournament={tournament} />
            </section>
          ) : null}
        </>
      ) : null}

      <Interval tournament={tournament} playerId={player.id} />

      <section className="section">
        <div className="section-head">
          <h3>On this side</h3>
          <Link to={`/teams/${team.id}`}>Full roster</Link>
        </div>
        <div className="book-list">
          {mates.map((mate) => (
            <Link key={mate.id} to={`/players/${mate.id}`} className={`book-row${mate.id === player.id ? " on" : ""}`} aria-current={mate.id === player.id ? "page" : undefined}>
              <strong>{mate.name}</strong>
              <b className="mono">{mate.ratings.ovr}</b>
              <span className="meta">{mate.pos}{mate.pos2 ? ` / ${mate.pos2}` : ""} · {archLabel(mate.arch)} · {built ? "Built" : mate.primeYear} · {dutyLabel(mate.role, built)} · {mate.starts ? "Opens" : "Bench"}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function StatBlock({
  id,
  title,
  quiet,
  line,
  nights,
  views,
  empty,
}: {
  id?: string;
  title: string;
  quiet: string;
  line: Tot | undefined;
  nights: Night[];
  views: RoundView[];
  empty: string;
}) {
  const played = Boolean(line && line.g > 0);
  const reached = views.filter((view) => view.reached);
  const story = roundStory(views);
  const wins = nights.filter((night) => night.win).length;
  const fouled = nights.filter((night) => night.line.fouledOut).length;
  const injured = nights.filter((night) => night.line.injured).length;
  return (
    <section className="section" id={id}>
      <div className="section-head">
        <h3>{title}</h3>
        <span className="quiet">{quiet}</span>
      </div>
      {played && line ? (
        <>
          <p className="lede">{story} {openSentence(line.gs, line.g)} {wins}–{nights.length - wins} in games played.</p>
          {reached.length > 0 ? (
            <div className="phase-grid">
              {reached.map((view) => <PhaseCard key={view.label} view={view} />)}
            </div>
          ) : null}
          <div className="section-head">
            <h3 className="subhead">Per game</h3>
            <span className="quiet">{line.g} game{line.g === 1 ? "" : "s"} · {line.gs} start{line.gs === 1 ? "" : "s"}</span>
          </div>
          <LineSheet line={line} mode="per" />
          <p className="note">Averages divide by games played. A shooting rate stays blank when there are no attempts. TS is true shooting. eFG counts each three as an extra half make. Ast/Tov stays blank when there are no turnovers. These are not per-36 numbers.</p>
          <div className="section-head">
            <h3 className="subhead">Totals</h3>
            <span className="quiet">The same games, added up</span>
          </div>
          <LineSheet line={line} mode="total" />
          {fouled || injured ? <p className="note">{wearSentence(fouled, injured)}</p> : null}
          <div className="section-head">
            <h3 className="subhead">Highs</h3>
            <span className="quiet">Best single game in this line</span>
          </div>
          <Highs nights={nights} />
        </>
      ) : (
        <>
          <p className="empty">Has not played yet. {empty} {story}</p>
          {reached.length > 0 ? (
            <div className="phase-grid">
              {reached.map((view) => <PhaseCard key={view.label} view={view} />)}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

function LineSheet({ line, mode }: { line: Tot; mode: "per" | "total" }) {
  const per = mode === "per";
  const g = line.g;
  const count = (n: number) => (per ? one(n, g) : String(n));
  const volume = (made: number, att: number) => {
    if (att <= 0 || g <= 0) return undefined;
    return per ? `${one(made, g)}–${one(att, g)}` : `${made}–${att}`;
  };
  return (
    <div className="stat-mosaic">
      <Cell label="Games" value={g ? String(g) : "—"} />
      <Cell label="Starts" value={g ? String(line.gs) : "—"} />
      <Cell label="Minutes" value={minutesOf(line.sec, g, per)} />
      <Cell label="Points" value={count(line.pts)} />
      <Cell label="Off reb" value={count(line.orb)} />
      <Cell label="Def reb" value={count(line.drb)} />
      <Cell label="Rebounds" value={count(line.reb)} />
      <Cell label="Assists" value={count(line.ast)} />
      <Cell label="Steals" value={count(line.stl)} />
      <Cell label="Blocks" value={count(line.blk)} />
      <Cell label="Turnovers" value={count(line.tov)} />
      <Cell label="Fouls" value={count(line.pf)} />
      <Cell label="FG" value={pct(line.fgm, line.fga)} detail={volume(line.fgm, line.fga)} />
      <Cell label="3P" value={pct(line.tpm, line.tpa)} detail={volume(line.tpm, line.tpa)} />
      <Cell label="FT" value={pct(line.ftm, line.fta)} detail={volume(line.ftm, line.fta)} />
      <Cell label="True shooting" value={trueShooting(line.pts, line.fga, line.fta)} />
      <Cell label="eFG" value={effectiveFg(line.fgm, line.tpm, line.fga)} />
      <Cell label="Plus-minus" value={per ? avgSigned(line.pm, g) : (g ? signed(line.pm) : "—")} tone={g ? toneOf(line.pm) : undefined} />
      <Cell label="Ast/Tov" value={line.tov > 0 ? (line.ast / line.tov).toFixed(2) : "—"} />
    </div>
  );
}

function Cell({ label, value, detail, tone }: { label: string; value: string; detail?: string; tone?: "up" | "down" }) {
  return (
    <div className={tone ? `stat-cell ${tone}` : "stat-cell"}>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <em>{detail}</em> : null}
    </div>
  );
}

function PhaseCard({ view }: { view: RoundView }) {
  const line = view.line;
  const wins = view.nights.filter((night) => night.win).length;
  return (
    <article className="panel">
      <span className="tag">{view.label}</span>
      {line && line.g > 0 ? (
        <>
          <h3>{one(line.pts, line.g)} pts</h3>
          <p>
            {line.g} of {view.games.length} · {wins}–{view.nights.length - wins} · {one(line.orb, line.g)} off · {one(line.drb, line.g)} def · {one(line.ast, line.g)} ast · TS {trueShooting(line.pts, line.fga, line.fta)}
          </p>
        </>
      ) : (
        <>
          <h3>Did not play</h3>
          <p>{view.games.length} game{view.games.length === 1 ? "" : "s"} in this round.</p>
        </>
      )}
    </article>
  );
}

function Highs({ nights }: { nights: Night[] }) {
  if (nights.length === 0) return null;
  const specs: { label: string; pick: (line: BoxLine) => number; show: (line: BoxLine) => string; extra?: (line: BoxLine) => string }[] = [
    { label: "Points", pick: (line) => line.pts, show: (line) => String(line.pts) },
    {
      label: "Rebounds",
      pick: (line) => line.orb + line.drb,
      show: (line) => String(line.orb + line.drb),
      extra: (line) => `${line.orb} off · ${line.drb} def`,
    },
    { label: "Assists", pick: (line) => line.ast, show: (line) => String(line.ast) },
    { label: "Steals", pick: (line) => line.stl, show: (line) => String(line.stl) },
    { label: "Blocks", pick: (line) => line.blk, show: (line) => String(line.blk) },
    { label: "Plus-minus", pick: (line) => line.pm, show: (line) => signed(line.pm) },
  ];
  return (
    <div className="stat-grid">
      {specs.map((spec) => {
        const night = nights.reduce((best, row) => (spec.pick(row.line) > spec.pick(best.line) ? row : best));
        return (
          <Link key={spec.label} to={`/games/${night.game.id}`} className="panel">
            <span className="tag">{spec.label}</span>
            <h3>{spec.show(night.line)}</h3>
            <p>{night.win ? "W" : "L"} {night.ours}–{night.theirs} · {night.opponentName}{spec.extra ? ` · ${spec.extra(night.line)}` : ""}</p>
          </Link>
        );
      })}
    </div>
  );
}

function GameLog({ nights, tournament }: { nights: Night[]; tournament: Tournament }) {
  const groups = bundle(nights, tournament);
  return (
    <div>
      {groups.map((group) => (
        <section key={group.key} className="log-series">
          <h4>{group.seriesId ? <Link to={`/series/${group.seriesId}`}>{group.title}</Link> : group.title}</h4>
          {group.rows.map((night) => (
            <article key={night.game.id} className="log-night">
              <div>
                <Link to={`/games/${night.game.id}`} className={`log-score${night.win ? " win" : ""}`}>
                  {night.win ? "W" : "L"} {night.ours}–{night.theirs}
                </Link>
                <div className="quiet">
                  {gameNo(night.game.id)}
                  {night.line.started ? " · opened" : " · bench"}
                  {night.line.fouledOut ? " · fouled out" : ""}
                  {night.line.injured ? " · injured" : ""}
                </div>
              </div>
              <div>
                <div className="log-opp"><SideName id={night.opponentId} name={night.opponentName} /></div>
                <Bits line={night.line} />
              </div>
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}

function Bits({ line }: { line: BoxLine }) {
  const items: { text: string; tone?: "up" | "down" }[] = [
    { text: clockMin(line.sec) },
    { text: `${line.pts} pts` },
    { text: `${line.orb} off` },
    { text: `${line.drb} def` },
    { text: `${line.orb + line.drb} reb` },
    { text: `${line.ast} ast` },
    { text: `${line.stl} stl` },
    { text: `${line.blk} blk` },
    { text: `${line.tov} tov` },
    { text: `${line.pf} pf` },
    { text: `FG ${shotLine(line.fgm, line.fga)}` },
    { text: `3P ${shotLine(line.tpm, line.tpa)}` },
    { text: `FT ${shotLine(line.ftm, line.fta)}` },
    { text: `TS ${trueShooting(line.pts, line.fga, line.fta)}` },
    { text: signed(line.pm), tone: toneOf(line.pm) },
  ];
  return (
    <p className="log-bits">
      {items.map((item, index) => (
        <span key={`${item.text}-${index}`} className={item.tone}>{item.text}</span>
      ))}
    </p>
  );
}

function SideName({ id, name }: { id: string; name: string }) {
  const side = sideById(id);
  if (!side) return <span>{name}</span>;
  const to = side.id === CONCORD_ID ? "/siege" : `/teams/${side.id}`;
  return <Link to={to}>{side.name}</Link>;
}

function Interval({ tournament, playerId }: { tournament: Tournament; playerId: string }) {
  const rosters = tournament.allStarRosters;
  const onLight = rosters?.a.includes(playerId) || rosters?.b.includes(playerId);
  const contests = [tournament.three, tournament.dunk, tournament.skills].flatMap((contest) => {
    if (!contest) return [];
    const row = contest.field.find((item) => item.playerId === playerId);
    return row ? [contest] : [];
  });
  if (!onLight && contests.length === 0) return null;
  const light = rosters?.a.includes(playerId) ? "First Light" : "Second Light";
  const captain = rosters?.captainA === playerId || rosters?.captainB === playerId;
  const star = tournament.allStar;
  const spot = star ? spotOf(star, playerId) : null;
  return (
    <section className="section">
      <div className="section-head">
        <h3>The interval</h3>
        <Link to="/events">Exhibition night</Link>
      </div>
      <p className="lede">All-Star and the contests do not count on the draw line.</p>
      <div className="phase-grid">
        {onLight ? (
          <article className="panel">
            <span className="tag">{captain ? "Captain · " : ""}{light}</span>
            {spot && star ? (
              <>
                <h3><Link to={`/games/${star.id}`}>{spot.win ? "W" : "L"} {spot.ours}–{spot.theirs}</Link></h3>
                <p>{spot.line.pts} pts · {spot.line.orb} off · {spot.line.drb} def · {spot.line.ast} ast · {clockMin(spot.line.sec)} · {signed(spot.line.pm)}</p>
              </>
            ) : (
              <>
                <h3>{light}</h3>
                <p>Named to the roster. No box line in the All-Star game.</p>
              </>
            )}
          </article>
        ) : null}
        {contests.map((contest) => <ContestCard key={contest.kind} contest={contest} playerId={playerId} />)}
      </div>
    </section>
  );
}

function ContestCard({ contest, playerId }: { contest: Contest; playerId: string }) {
  const row = contest.field.find((item) => item.playerId === playerId);
  if (!row) return null;
  const final = contest.finalists.find((item) => item.playerId === playerId);
  const won = contest.winnerId === playerId;
  return (
    <article className="panel">
      <span className="tag">{contest.title}</span>
      <h3>{won ? "Won" : final ? "Finalist" : "Field"}</h3>
      <p>
        Scores {row.scores.join(", ")}.
        {final ? ` Final ${final.scores.join(", ")}.` : " Did not reach the final."}
        {won ? " Won the contest." : ""}
      </p>
    </article>
  );
}

function BookFinder() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  return (
    <form
      className="filters"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const q = query.trim();
        navigate(q ? `/players?q=${encodeURIComponent(q)}` : "/players");
      }}
    >
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find another player" aria-label="Find another player" />
      <button type="submit">Open the book</button>
    </form>
  );
}

interface RoundSpec {
  label: string;
  phrase: string;
  test: (round: string) => boolean;
}

interface RoundView extends RoundSpec {
  reached: boolean;
  games: GameResult[];
  nights: Night[];
  line?: Tot;
}

interface Night {
  game: GameResult;
  line: BoxLine;
  opponentId: string;
  opponentName: string;
  ours: number;
  theirs: number;
  win: boolean;
}

function roundFrom(spec: RoundSpec, games: GameResult[], playerId: string): RoundView {
  return {
    ...spec,
    reached: games.length > 0,
    games,
    nights: collect(games, playerId),
    line: tally(games, true).get(playerId),
  };
}

function siegeRounds(tournament: Tournament, playerId: string): RoundView[] {
  const siege = tournament.siege;
  if (!siege) return [];
  const pairs: [RoundSpec, SeriesResult | null][] = [
    [SIEGE_ROUNDS[0], siege.arrival],
    [SIEGE_ROUNDS[1], siege.gate],
    [SIEGE_ROUNDS[2], siege.restoration],
  ];
  return pairs.flatMap(([spec, series]) => (series ? [roundFrom(spec, series.games, playerId)] : []));
}

function humanSiegeRounds(tournament: Tournament, teamId: string, playerId: string): RoundView[] {
  const siege = tournament.siege;
  if (!siege) return [];
  const views: RoundView[] = [];
  if (siege.arrival && sideIn(siege.arrival, teamId)) views.push(roundFrom(SIEGE_ROUNDS[0], siege.arrival.games, playerId));
  if (siege.gate && sideIn(siege.gate, teamId)) views.push(roundFrom(SIEGE_ROUNDS[1], siege.gate.games, playerId));
  if (siege.restoration && siege.concordIds.includes(playerId)) views.push(roundFrom(SIEGE_ROUNDS[2], siege.restoration.games, playerId));
  return views;
}

function sideIn(series: SeriesResult, teamId: string): boolean {
  return series.homeId === teamId || series.awayId === teamId;
}

function collect(games: GameResult[], playerId: string): Night[] {
  const rows: Night[] = [];
  for (const game of games) {
    const spot = spotOf(game, playerId);
    if (spot) rows.push({ game, ...spot });
  }
  return rows;
}

function spotOf(game: GameResult, playerId: string): Omit<Night, "game"> | null {
  const home = game.box.home.find((item) => item.playerId === playerId);
  const away = game.box.away.find((item) => item.playerId === playerId);
  const line = home ?? away;
  if (!line) return null;
  const onHome = Boolean(home);
  const opponentId = onHome ? game.awayId : game.homeId;
  return {
    line,
    opponentId,
    opponentName: sideById(opponentId)?.name ?? (onHome ? game.awayName : game.homeName) ?? opponentId,
    ours: onHome ? game.homeScore : game.awayScore,
    theirs: onHome ? game.awayScore : game.homeScore,
    win: game.winnerId === (onHome ? game.homeId : game.awayId),
  };
}

function bundle(nights: Night[], tournament: Tournament): { key: string; title: string; seriesId?: string; rows: Night[] }[] {
  const order: string[] = [];
  const map = new Map<string, Night[]>();
  for (const night of nights) {
    const key = night.game.seriesId ?? night.game.id;
    if (!map.has(key)) {
      order.push(key);
      map.set(key, []);
    }
    map.get(key)!.push(night);
  }
  return order.map((key) => {
    const rows = map.get(key)!;
    const series = findSeries(tournament, rows[0].game.seriesId);
    if (!series) return { key, title: rows[0].game.roundLabel, rows };
    const { winnerWins, loserWins } = seriesRecord(series);
    const winner = sideById(series.winnerId)?.name ?? (series.winnerId === series.homeId ? series.homeName : series.awayName) ?? series.winnerId;
    return {
      key,
      title: `${series.roundLabel} · ${winner} ${winnerWins}–${loserWins} · ${series.games.length} games`,
      seriesId: series.id,
      rows,
    };
  });
}

function honorList(tournament: Tournament, playerId: string): string[] {
  const awards = tournament.awards;
  if (!awards) return [];
  const list: string[] = [];
  if (awards.mvpId === playerId) list.push("Tournament MVP");
  if (awards.finalsMvpId === playerId) list.push("Finals MVP");
  if (awards.dpoyId === playerId) list.push("Defense");
  if (awards.sixthId === playerId) list.push("Sixth man");
  if (awards.breakoutId === playerId) list.push("Breakout");
  if (awards.firstTeam.includes(playerId)) list.push("All-Tournament first");
  if (awards.secondTeam.includes(playerId)) list.push("All-Tournament second");
  return list;
}

function roundStory(views: RoundView[]): string {
  const reached = views.filter((view) => view.reached);
  if (reached.length === 0) return "No games on the schedule for this side yet.";
  const played = reached.filter((view) => view.line && view.line.g > 0);
  const missed = reached.filter((view) => !view.line || view.line.g === 0);
  if (played.length === 0) return `No minutes in ${writtenList(reached.map((view) => view.phrase))}.`;
  const text = `Minutes in ${writtenList(played.map((view) => view.phrase))}.`;
  if (missed.length === 0) return text;
  return `${text} No minutes in ${writtenList(missed.map((view) => view.phrase))}.`;
}

function writtenList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function openSentence(starts: number, games: number): string {
  if (!games) return "";
  if (starts === games) return `Opened all ${games}.`;
  if (starts === 0) return "Came off the bench in every game played.";
  return `Opened ${starts} of ${games}.`;
}

function wearSentence(fouled: number, injured: number): string {
  const parts: string[] = [];
  if (fouled) parts.push(`Fouled out of ${fouled} game${fouled === 1 ? "" : "s"}.`);
  if (injured) parts.push(`Left ${injured} game${injured === 1 ? "" : "s"} with an injury.`);
  return parts.join(" ");
}

function gameNo(id: string): string {
  const match = /-(\d+)$/.exec(id);
  return match ? `Game ${match[1]}` : "Game";
}

function minutesOf(sec: number, games: number, per: boolean): string {
  if (!games) return "—";
  const value = per ? sec / 60 / games : sec / 60;
  return value.toFixed(1);
}

function avgSigned(total: number, games: number): string {
  if (!games) return "—";
  const value = total / games;
  if (Math.abs(value) < 0.05) return "0.0";
  const text = Math.abs(value).toFixed(1);
  return value > 0 ? `+${text}` : `-${text}`;
}

function effectiveFg(fgm: number, tpm: number, fga: number): string {
  if (fga <= 0) return "—";
  return `${Math.round((100 * (fgm + 0.5 * tpm)) / fga)}%`;
}

function toneOf(n: number): "up" | "down" | undefined {
  if (n > 0) return "up";
  if (n < 0) return "down";
  return undefined;
}
