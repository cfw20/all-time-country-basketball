import { Link } from "react-router-dom";
import { playerById, TEAM_BY_ID, TEAMS } from "../data";
import { Mark } from "../components/Marks";
import { formatSeed } from "../engine/rng";
import { usePantheon } from "../state/store";

export function Home() {
  const { tournament } = usePantheon();
  const final = tournament.games.find((game) => game.id === "final");
  const champ = final ? TEAM_BY_ID[final.winnerId] : undefined;
  const runner = final ? TEAM_BY_ID[final.loserId] : undefined;
  const mvp = tournament.awards ? playerById(tournament.awards.mvpId) : undefined;
  const latestLabel = tournament.games.at(-1)?.dayLabel;
  const latest = latestLabel ? tournament.games.filter((game) => game.dayLabel === latestLabel).slice(-4) : [];
  const houses = TEAMS.filter((team) => team.kind !== "country");
  const nations = TEAMS.filter((team) => team.kind === "country");

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="kicker">{champ ? `Champion · draw ${formatSeed(tournament.seed)}` : "The field is drawn"}</p>
          {champ ? (
            <>
              <div className="champion-mark">
                <Mark team={champ} size={64} />
                <h2 className="display">{champ.name}</h2>
              </div>
              <p className="scoreline">
                {champ.name} {Math.max(final!.homeScore, final!.awayScore)} · {runner?.name} {Math.min(final!.homeScore, final!.awayScore)}
                {final!.ot ? " · OT" : ""}
              </p>
              <p className="lede">
                {mvp ? `${mvp.name} is the tournament MVP.` : ""} This is one draw under NBA rules. Favorites win more often. They do not own the night.
              </p>
            </>
          ) : (
            <>
              <h2 className="display">Thirty-two primes.</h2>
              <p className="lede">
                The groups are set for draw {formatSeed(tournament.seed)}. Sim a round from the dock, or run the whole championship. Every result below comes from that seed.
              </p>
            </>
          )}
        </div>
        <div className="panel">
          <span className="tag">How a player arrives</span>
          <h3 style={{ fontSize: 28, marginTop: 8 }}>They choose. Sides do not sign.</h3>
          <p>The default is a player’s own country. Mixed sides exist only when that door is shut.</p>
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
          <span>Great players whose country cannot fill a competitive eighteen-man side. They choose the Lantern Company.</span>
        </article>
      </div>

      <section className="section">
        <div className="section-head">
          <h3>{latestLabel ?? "Waiting on the first tip"}</h3>
          <Link to="/schedule">All games</Link>
        </div>
        {latest.length === 0 ? (
          <p className="empty">No games yet. The draw is posted on the groups page. Sim round plays the next day.</p>
        ) : (
          <div className="team-grid">
            {latest.map((game) => (
              <Link key={game.id} to={`/games/${game.id}`} className="panel">
                <span className="tag">{game.roundLabel}</span>
                <h4>{scoreName(game.winnerId, game)} {Math.max(game.homeScore, game.awayScore)}</h4>
                <p>{scoreName(game.loserId, game)} {Math.min(game.homeScore, game.awayScore)}{game.buzzerBeater ? " · buzzer" : ""}</p>
              </Link>
            ))}
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
  if (id === game.homeId) return game.homeName ?? TEAM_BY_ID[id]?.name ?? id;
  if (id === game.awayId) return game.awayName ?? TEAM_BY_ID[id]?.name ?? id;
  return TEAM_BY_ID[id]?.name ?? id;
}
