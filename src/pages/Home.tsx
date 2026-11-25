import { Link } from "react-router-dom";
import { CONSTRUCT_ID, isConstructed, PLAYERS, playerById, sideById, TEAM_BY_ID, TEAMS } from "../data";
import { Mark } from "../components/Marks";
import { formatSeed } from "../engine/rng";
import { seriesRecord } from "../engine/series";
import { usePantheon } from "../state/store";

export function Home() {
  const { tournament } = usePantheon();
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
          <span>Made the playable all-time roster of their own nation. Twenty-eight countries are in the field.</span>
        </article>
        <article className="path">
          <strong>Overflow</strong>
          <span>American primes the Continental could not minute. Vanguard, then Afterlight, then Palladium. No fourth house.</span>
        </article>
        <article className="path">
          <strong>Homeland</strong>
          <span>Great players whose country cannot fill a competitive all-time side. They choose the Lantern Company.</span>
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
