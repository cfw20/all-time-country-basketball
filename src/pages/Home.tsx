import { Link } from "react-router-dom";
import { CONSTRUCT_ID, isConstructed, PLAYERS, playerById, sideById, TEAM_BY_ID, TEAMS } from "../data";
import { Mark } from "../components/Marks";
import { formatSeed } from "../engine/rng";
import { olympicsLockLine, olympicsUnlock } from "../engine/olympics";
import { yearUnlock } from "../engine/season";
import { loadOlympics } from "../state/olympicsBook";
import { loadYear } from "../state/yearBook";
import { seriesRecord } from "../engine/series";
import { teamPower } from "../engine/tournament";
import { placeLine } from "../lib/format";
import { usePantheon } from "../state/store";

export function Home() {
  const { tournament, trials } = usePantheon();
  const year = yearUnlock(trials);
  const olympics = olympicsUnlock(trials);
  const olympicSave = loadOlympics();
  const book = loadYear();
  const final = tournament.series.find((item) => item.id === "final");
  const champ = final ? TEAM_BY_ID[final.winnerId] : undefined;
  const runner = final ? TEAM_BY_ID[final.loserId] : undefined;
  const mvp = tournament.awards ? playerById(tournament.awards.mvpId) : undefined;
  const latestLabel = tournament.series.at(-1)?.dayLabel;
  const latest = latestLabel ? tournament.series.filter((item) => item.dayLabel === latestLabel).slice(-4) : [];
  const houses = TEAMS.filter((team) => team.kind === "overflow" || team.kind === "homeland");
  const nations = TEAMS.filter((team) => team.kind === "country");
  const humans = PLAYERS.filter((player) => !isConstructed(player)).length;
  const humanSides = TEAMS.filter((team) => team.kind !== "construct").length;
  const restoration = tournament.siege?.restoration;
  const held = Boolean(restoration && !tournament.siege?.threatEnded);

  return (
    <main className="page" data-floor="home">
      <section className="entrance">
        <div className="folio">
          <div className="ring" aria-hidden="true" />
          <p className="kicker">A private all-time floor · NBA rules</p>
          <h2 className="display">Every prime<span>on one floor.</span></h2>
          <p className="lede">
            {humans} real primes. {humanSides} human sides. One built threat. Draw {formatSeed(tournament.seed)}. Countries do not sign. Players choose, and every human is simulated in a prime.
          </p>
          <div className="threshold" aria-hidden="true"><span /></div>
        </div>
        <div className="panel held">
          <span className="tag">{champ ? "This draw" : "The field is drawn"}</span>
          {champ && held && restoration ? (
            <>
              <div className="champion-mark" style={{ marginTop: 12 }}>
                <Mark team={TEAM_BY_ID[CONSTRUCT_ID]} size={56} />
                <h3 className="display" style={{ fontSize: 40 }}>The Construct</h3>
              </div>
              <p className="scoreline">
                The Construct {Math.max(restoration.homeWins, restoration.awayWins)}–{Math.min(restoration.homeWins, restoration.awayWins)} The Concord
              </p>
              <p>{champ.name} won the countries, over {runner?.name}. The Construct beat the Concord {howLong(restoration.games.length)} and holds the floor. {mvp ? `${mvp.name} is the country MVP.` : ""}</p>
            </>
          ) : champ ? (
            <>
              <div className="champion-mark" style={{ marginTop: 12 }}>
                <Mark team={champ} size={56} />
                <h3 className="display" style={{ fontSize: 40 }}>{champ.name}</h3>
              </div>
              <p className="scoreline">
                {seriesRecord(final!).winnerWins}–{seriesRecord(final!).loserWins} · {ran(final!.games.length)} · {runner?.name}
              </p>
              <p>
                {tournament.siege?.threatEnded
                  ? `The Concord beat the Construct. ${champ.name} keeps the championship, and the floor is country against country again. `
                  : "The country final is in. The siege still decides whether that title holds the floor. "}
                {mvp ? `${mvp.name} is the tournament MVP. ` : ""}
                Favorites win more often. They do not own the night.
              </p>
            </>
          ) : (
            <>
              <h3 style={{ fontSize: 32, marginTop: 8 }}>The groups are set.</h3>
              <p>Sim a round from the ribbon, or run the whole championship. {tournament.groups.length} groups, every cell a best-of-seven. Every result comes from this seed.</p>
            </>
          )}
        </div>
      </section>

      <div className="paths">
        <article className="path">
          <strong>Country</strong>
          <span>Made the playable all-time roster of their own nation. Countries that cannot fill a competitive book are not in the draw. Their best primes chose a homeland house.</span>
        </article>
        <article className="path">
          <strong>Overflow</strong>
          <span>American primes the houses above them could not minute. Vanguard, Afterlight, Palladium, and a long run of houses after them. A player chooses the first house that still had a night.</span>
        </article>
        <article className="path">
          <strong>Homeland</strong>
          <span>Great players whose country cannot fill a competitive all-time side. They choose the Lantern, the Bastion, the Harbor, or the Reed. The house is shared. Nobody signed them.</span>
        </article>
      </div>

      <section className="section">
        <div className="section-head">
          <h3>Who is best</h3>
          <Link to="/rankings">The board</Link>
        </div>
        <p className="lede">Power is the card before tip. The board keeps this draw’s series record, the point margin, and the siege. Two primes, or two sides, can be set beside each other.</p>
        <div className="team-grid">
          {TEAMS.slice().sort((a, b) => teamPower(b.id) - teamPower(a.id)).slice(0, 4).map((team, index) => (
            <Link key={team.id} to={`/teams/${team.id}`} className="panel" style={{ borderTop: `3px solid ${team.colors.primary}` }}>
              <span className="tag">{index === 0 ? "Highest card" : `Power ${Math.round(teamPower(team.id))}`}</span>
              <h3>{team.name}</h3>
              <p>{Math.round(teamPower(team.id))} · {team.motto}</p>
            </Link>
          ))}
        </div>
        <p className="note"><Link to="/compare">Set two beside each other</Link> · <Link to="/leaders">Leaders</Link> · <Link to="/trials">Titles</Link> · <Link to="/schedule">Series</Link></p>
      </section>

      <Link to="/siege" className="panel siege-banner">
        <span className="tag">{tournament.siege?.threatEnded ? "Threat ended" : restoration ? "Construct holds" : "The Construct"}</span>
        <h3>{tournament.siege?.threatEnded ? "The countries have the floor back." : "A built side is in the championship."}</h3>
        <p>
          {restoration
            ? `${scoreName(restoration.winnerId, restoration)} ${seriesRecord(restoration).winnerWins}–${seriesRecord(restoration).loserWins} ${scoreName(restoration.loserId, restoration)}. Open the three series.`
            : "Arrival, the gate, then the Concord: twelve real primes, a best-of-seven, against the Construct."}
        </p>
      </Link>

      <section className="section">
        <div className="section-head">
          <h3>Jump in</h3>
          <Link to="/play">All side floors</Link>
        </div>
        <div className="doors">
          <Link to="/play/call" className="panel door"><span className="tag">You pick</span><h3>The Call</h3><p>Two human sides. One NBA game. The groups stay put.</p></Link>
          <Link to="/play/horse" className="panel door"><span className="tag">You call it</span><h3>Horse</h3><p>Take a prime and call the shot.</p></Link>
          <Link to="/play/clash" className="panel door"><span className="tag">One night</span><h3>Era Clash</h3><p>Two rolled years. One NBA game, waiting when you open the page.</p></Link>
          <Link to="/play/series" className="panel door"><span className="tag">First to four</span><h3>A series tonight</h3><p>Any two sides, the Construct included. A best-of-seven on demand.</p></Link>
          <Link to="/play/lamp" className="panel door"><span className="tag">Contests</span><h3>The Lamp</h3><p>Threes, dunks, and skills, lit whenever you want.</p></Link>
          <Link to="/play/throne" className="panel door"><span className="tag">A bracket</span><h3>The Throne</h3><p>Eight era sides. Single elimination, one NBA game a night. Seven games, then one year leaves with the floor.</p></Link>
          <Link to="/play/hill" className="panel door"><span className="tag">Winner stays</span><h3>King of the Hill</h3><p>Defend the floor. The last challenger is the Construct.</p></Link>
          <Link to="/play/gauntlet" className="panel door"><span className="tag">Seven rungs</span><h3>The Gauntlet</h3><p>One side climbs the field, one NBA game at a time.</p></Link>
          <Link to="/play/decade" className="panel door"><span className="tag">By decade</span><h3>Decade Cup</h3><p>Every prime plays for the decade on the card.</p></Link>
          <Link to="/play/open" className="panel door"><span className="tag">Sixteen sides</span><h3>The Open</h3><p>A one-game bracket. Loser out.</p></Link>
          <Link to="/play/fortnight" className="panel door"><span className="tag">Then a series</span><h3>Fortnight</h3><p>Six sides, a round robin, a best-of-seven final.</p></Link>
          <Link to="/play/survivor" className="panel door"><span className="tag">Worst loss out</span><h3>Survivor</h3><p>Eight sides. The heaviest defeat goes home.</p></Link>
          <Link to="/play/five" className="panel door"><span className="tag">Two fives</span><h3>The Five</h3><p>Ten names from the whole book. One game.</p></Link>
        </div>
        <h3 className="subhead">Short nights</h3>
        <div className="doors">
          <Link to="/play/shootaround" className="panel door"><span className="tag">Six primes</span><h3>Shootaround</h3><p>Midrange, threes, and the line. Five shots each.</p></Link>
          <Link to="/play/ladder" className="panel door"><span className="tag">Free throws</span><h3>The Ladder</h3><p>Miss, and you leave. The last one shooting wins.</p></Link>
          <Link to="/play/halfcourt" className="panel door"><span className="tag">First to 11</span><h3>Halfcourt</h3><p>Two primes. Baskets count 2.</p></Link>
          <Link to="/play/cut" className="panel door"><span className="tag">Under a cap</span><h3>The Cut</h3><p>Build a five. One rating night against the book.</p></Link>
          <Link to="/play/streak" className="panel door"><span className="tag">Hot hand</span><h3>The Streak</h3><p>Threes until a miss.</p></Link>
          <Link to="/play/glass" className="panel door"><span className="tag">Boards and blocks</span><h3>The Glass</h3><p>Two bigs. A block counts two.</p></Link>
          <Link to="/play/closer" className="panel door"><span className="tag">Late clock</span><h3>The Closer</h3><p>Name who, then five possessions each.</p></Link>
          <Link to="/play/arc" className="panel door"><span className="tag">Five threes</span><h3>The Arc</h3><p>One shooter from each decade. Not the cup.</p></Link>
        </div>
        <h3 className="subhead">From the book</h3>
        <div className="doors">
          <Link to="/play/prime" className="panel door"><span className="tag">The card</span><h3>Prime year</h3><p>Which year is the prime.</p></Link>
          <Link to="/play/flag" className="panel door"><span className="tag">Nationality</span><h3>The Flag</h3><p>Who wears it.</p></Link>
          <Link to="/play/opens" className="panel door"><span className="tag">Same side</span><h3>Opens With</h3><p>Who is in that opening five.</p></Link>
          <Link to="/play/edge" className="panel door"><span className="tag">Ratings</span><h3>The Edge</h3><p>Higher overall, shot, or defense.</p></Link>
          <Link to="/play/tape" className="panel door"><span className="tag">Size and spot</span><h3>The Tape</h3><p>Taller, or the position on the card.</p></Link>
        </div>
      </section>

      <Link to="/season" className="panel year-link">
        <span className="tag">{year.open ? "Side floor open" : "Side floor"}</span>
        <h3>The Unbroken Year</h3>
        <p>
          {book.crown
            ? "An Unbroken Year is cut into this browser. Open the floor and the roster is still in the book."
            : year.open
            ? "The 82–0 season is open. A year of 70 wins leaves a relic. 82–0 cuts the roster into the book."
            : `An NBA 82–0 season, built by rolls. It opens after ${year.needChampionships} championships and a series taken from the Construct. This browser has ${year.championships} championships and ${year.strikes} series taken from the Construct.`}
        </p>
      </Link>

      <Link to="/olympics" className="panel year-link">
        <span className="tag">{olympicSave.meet ? "Window closed" : olympics.open ? "Side floor open" : "Side floor"}</span>
        <h3>The Olympics</h3>
        <p>
          {olympicSave.meet
            ? "That window is closed. The report stays until you disband or draft a new side. The side never joins the draw."
            : olympics.open
              ? "Draft twelve real primes from the book and see if that side can live in one eight-team bracket. It leaves when the bracket ends. It does not join the championship."
              : olympicsLockLine(olympics)}
        </p>
      </Link>

      <section className="section">
        <div className="section-head">
          <h3>{latestLabel ?? "Waiting on the first tip"}</h3>
          <Link to="/schedule">All series</Link>
        </div>
        {latest.length === 0 ? (
          <p className="empty">No series yet. The draw is posted on the groups page. Sim round plays the next slate.</p>
        ) : (
          <div className="team-grid">
            {latest.map((item) => {
              const record = seriesRecord(item);
              return (
                <Link key={item.id} to={`/series/${item.id}`} className="panel">
                  <span className="tag">{item.roundLabel} · {item.games.length} games</span>
                  <h4>{scoreName(item.winnerId, item)} {record.winnerWins}–{record.loserWins}</h4>
                  <p>{scoreName(item.loserId, item)}</p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <h3>The wire</h3>
          <Link to="/news">Full wire</Link>
        </div>
        {tournament.news.length === 0 ? (
          <p className="empty">Stories appear once the ball is live. They are written from the box score, not from a script.</p>
        ) : (
          <div className="news-grid">
            {tournament.news.slice(0, 3).map((item) => (
              <article key={item.id} className="panel">
                <span className="tag">{item.kicker}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <h3>American houses and the lantern</h3>
          <Link to="/teams">All sides</Link>
        </div>
        <div className="team-grid">
          {houses.map((team) => {
            const place = placeLine(team);
            return (
              <Link key={team.id} to={`/teams/${team.id}`} className="panel" style={{ borderTop: `3px solid ${team.colors.primary}` }}>
                <Mark team={team} size={40} />
                {place ? <span className="tag">{place}</span> : null}
                <h3>{team.name}</h3>
                <p>{team.motto}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h3>Nations</h3>
          <span className="quiet">{nations.length} countries</span>
        </div>
        <div className="team-grid">
          {nations.map((team) => (
            <Link key={team.id} to={`/teams/${team.id}`} className="side" style={{ padding: "8px 0" }}>
              <i style={{ background: team.colors.primary }} />
              <Mark team={team} size={28} />
              <span>
                <strong>{team.name}</strong>
                <em>{team.country} · {team.region}</em>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function ran(games: number): string {
  if (games === 4) return "sweep";
  if (games === 7) return "seven games";
  return `${games} games`;
}

function howLong(games: number): string {
  if (games === 4) return "in a sweep";
  if (games === 7) return "in seven games";
  return `in ${games} games`;
}

function scoreName(id: string, game: { homeId: string; awayId: string; homeName?: string; awayName?: string }): string {
  if (id === game.homeId) return game.homeName ?? sideById(id)?.name ?? id;
  if (id === game.awayId) return game.awayName ?? sideById(id)?.name ?? id;
  return sideById(id)?.name ?? id;
}
