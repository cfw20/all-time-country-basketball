import { playerById, TEAM_BY_ID } from "../data";
import { PlayerLink } from "../components/Marks";
import { usePantheon } from "../state/store";

export function Awards() {
  const { tournament } = usePantheon();
  const awards = tournament.awards;
  if (!awards) {
    return (
      <main className="page">
        <p className="kicker">Honors</p>
        <h2 className="display" style={{ fontSize: 68 }}>The night is unfinished.</h2>
        <p className="empty">Tournament MVP, Finals MVP, and the all-tournament teams are named after the final. Sim the rest of this draw.</p>
      </main>
    );
  }
  const cards = [
    ["Tournament MVP", awards.mvpId],
    ["Finals MVP", awards.finalsMvpId],
    ["Defense", awards.dpoyId],
    ["Sixth man", awards.sixthId],
    ["Breakout", awards.breakoutId],
  ] as const;
  return (
    <main className="page">
      <p className="kicker">Official games only</p>
      <h2 className="display" style={{ fontSize: 68 }}>Honors</h2>
      <p className="lede">
        MVP weights the box and a deep run. Finals MVP is the best night on the champion in the final. Sixth man started half the games or fewer. Breakout is production above the rating, kept to players at 90 or under.
      </p>
      <div className="award-grid" style={{ marginTop: 18 }}>
        {cards.map(([label, id]) => {
          const player = playerById(id);
          const team = player ? TEAM_BY_ID[player.teamId] : undefined;
          return (
            <article key={label} className="panel" style={{ borderTop: `3px solid ${team?.colors.primary ?? "var(--gold)"}` }}>
              <span className="tag">{label}</span>
              <h3 style={{ fontSize: 32 }}><PlayerLink id={id} /></h3>
              <p>{team?.name} · {player?.pos} · prime {player?.primeYear}</p>
            </article>
          );
        })}
      </div>
      <section className="section">
        <TeamList title="All-Tournament first" ids={awards.firstTeam} />
        <TeamList title="All-Tournament second" ids={awards.secondTeam} />
      </section>
    </main>
  );
}

function TeamList({ title, ids }: { title: string; ids: string[] }) {
  return (
    <div style={{ marginTop: 16 }}>
      <h3 className="display" style={{ fontSize: 32 }}>{title}</h3>
      <ol>
        {ids.map((id) => {
          const player = playerById(id);
          const team = player ? TEAM_BY_ID[player.teamId] : undefined;
          return (
            <li key={id} style={{ margin: "8px 0" }}>
              <PlayerLink id={id} />
              <span className="quiet"> · {team?.code} · {player?.pos}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
