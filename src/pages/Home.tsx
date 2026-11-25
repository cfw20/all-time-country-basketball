import { Link } from "react-router-dom";
import { CONSTRUCT_ID, isConstructed, PLAYERS, playerById, sideById, TEAM_BY_ID, TEAMS } from "../data";
import { Mark } from "../components/Marks";
import { formatSeed } from "../engine/rng";
import { yearUnlock } from "../engine/season";
import { loadYear } from "../state/yearBook";
import { seriesRecord } from "../engine/series";
import { usePantheon } from "../state/store";

export function Home() {
  const { tournament, trials } = usePantheon();
  const year = yearUnlock(trials);
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
  const restoration = tournament.siege?.restoration;
  const held = Boolean(restoration && !tournament.siege?.threatEnded);

  return (
    <main className="page">
      <section className="entrance">
        <div className="folio">
          <div className="ring" aria-hidden="true" />
          <p className="kicker">A private all-time floor · NBA rules</p>
          <h2 className="display">Every prime<span>on one floor.</span></h2>
          <p className="lede">
            {humans} real primes. Thirty-two human sides. One built threat. Draw {formatSeed(tournament.seed)}. Countries do not sign. Players choose, and every human is simulated in a prime.
          </p>
        </div>
        <div className="panel">
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
              <p>{champ.name} won the countries, over {runner?.name}. The Construct beat the Concord and holds the floor. {mvp ? `${mvp.name} is the country MVP.` : ""}</p>
            </>
          ) : champ ? (
            <>
              <div className="champion-mark" style={{ marginTop: 12 }}>
                <Mark team={champ} size={56} />
                <h3 className="display" style={{ fontSize: 40 }}>{champ.name}</h3>
              </div>
              <p className="scoreline">
                {seriesRecord(final!).winnerWins}–{seriesRecord(final!).loserWins} · {runner?.name}
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
              <p>Sim a round from the ribbon, or run the whole championship. Every result comes from this seed.</p>
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
          <Link to="/play/clash" className="panel door"><span className="tag">One night</span><h3>Era Clash</h3><p>Two rolled years. One NBA game, waiting when you open the page.</p></Link>
          <Link to="/play/series" className="panel door"><span className="tag">First to four</span><h3>A series tonight</h3><p>Any two sides, the Construct included. A best-of-seven on demand.</p></Link>
          <Link to="/play/lamp" className="panel door"><span className="tag">Contests</span><h3>The Lamp</h3><p>Threes, dunks, and skills, lit whenever you want.</p></Link>
          <Link to="/play/throne" className="panel door"><span className="tag">A bracket</span><h3>The Throne</h3><p>Eight era sides. Seven games. One year leaves with the floor.</p></Link>
          <Link to="/play/hill" className="panel door"><span className="tag">Winner stays</span><h3>King of the Hill</h3><p>Defend the floor. The last challenger is the Construct.</p></Link>
          <Link to="/play/gauntlet" className="panel door"><span className="tag">Seven rungs</span><h3>The Gauntlet</h3><p>One side climbs the field, one NBA game at a time.</p></Link>
          <Link to="/play/decade" className="panel door"><span className="tag">By decade</span><h3>Decade Cup</h3><p>Every prime plays for the decade on the card.</p></Link>
          <Link to="/play/open" className="panel door"><span className="tag">Sixteen sides</span><h3>The Open</h3><p>A one-game bracket. Loser out.</p></Link>
          <Link to="/play/fortnight" className="panel door"><span className="tag">Then a series</span><h3>Fortnight</h3><p>Six sides, a round robin, a best-of-seven final.</p></Link>
          <Link to="/play/survivor" className="panel door"><span className="tag">Worst loss out</span><h3>Survivor</h3><p>Eight sides. The heaviest defeat goes home.</p></Link>
          <Link to="/play/five" className="panel door"><span className="tag">Two fives</span><h3>The Five</h3><p>Ten names from the whole book. One game.</p></Link>
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
          {houses.map((team) => (
            <Link key={team.id} to={`/teams/${team.id}`} className="panel" style={{ borderTop: `3px solid ${team.colors.primary}` }}>
              <Mark team={team} size={40} />
              <h3>{team.name}</h3>
              <p>{team.motto}</p>
            </Link>
          ))}
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
                <em>{team.country}</em>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function scoreName(id: string, game: { homeId: string; awayId: string; homeName?: string; awayName?: string }): string {
  if (id === game.homeId) return game.homeName ?? sideById(id)?.name ?? id;
  if (id === game.awayId) return game.awayName ?? sideById(id)?.name ?? id;
  return sideById(id)?.name ?? id;
}
