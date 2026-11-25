import { TEAMS } from "../data";
import { kindLabel } from "../lib/format";

export function Rules() {
  const countries = TEAMS.filter((team) => team.kind === "country");
  const mixed = TEAMS.filter((team) => team.kind === "overflow" || team.kind === "homeland");
  const built = TEAMS.filter((team) => team.kind === "construct");
  return (
    <main className="page">
      <p className="kicker">The book of the event</p>
      <h2 className="display" style={{ fontSize: 68 }}>NBA rules. Country first.</h2>
      <p className="lede">
        Pantheon is a fictional all-time world basketball championship. Every human player is a real player, shown in a prime already on record. The Construct is the one built side. It is not affiliated with the NBA or FIBA, and this project stays private until the owner decides to publish.
      </p>

      <section className="section">
        <h3 className="display" style={{ fontSize: 36 }}>The floor</h3>
        <p className="lede">Four quarters of 12 minutes. A 24-second shot clock. The NBA three-point line. Six fouls to foul out. Bonus on the fifth team foul of a quarter, and on the fourth in overtime. Overtime is five minutes and repeats until someone leads. Timeouts and substitutions follow an NBA shape. There is no FIBA difference in this event: no FIBA quarter length, no FIBA foul limit, no zone-only wrinkle, no Olympic roster cap. The painted sky is the look of the building. The basketball is the real game: real players, at the prime on the card, with real box scores.</p>
      </section>

      <section className="section">
        <h3 className="display" style={{ fontSize: 36 }}>How a player chooses</h3>
        <p className="lede">This is not a signing league and not a free-agent market. Countries and mixed sides do not recruit. A player chooses a side, and the default is their own country.</p>
        <div className="paths">
          <article className="path">
            <strong>Country path</strong>
            <span>The player made that nation’s playable all-time roster. Historical federations are not revived. A Yugoslav, Soviet, or Czechoslovak-era player is with the modern country they actually belong to, by birthplace or the senior team they represented.</span>
          </article>
          <article className="path">
            <strong>Overflow path</strong>
            <span>Americans who could not earn minutes on the Continental. The houses, in order, are Vanguard, Afterlight, and Palladium. The cut is positional: centers who would have had no night behind the national middle chose a house where they could play. There is no fourth American house.</span>
          </article>
          <article className="path">
            <strong>Homeland path</strong>
            <span>A great player whose country cannot fill a competitive all-time side. They choose the Lantern Company. The Lantern is the only mixed side of that kind.</span>
          </article>
        </div>
      </section>

      <section className="section">
        <h3 className="display" style={{ fontSize: 36 }}>The Construct and the Concord</h3>
        <p className="lede">The Construct is twenty-two chassis. They have no country and no prime. They are the favorite of the event, clearly ahead of the human sides, and they can still lose a series. They stay out of the groups so the country tournament can still be played.</p>
        <div className="paths">
          <article className="path">
            <strong>Arrival</strong>
            <span>When the knockout starts, the Construct plays the best group winner in a best-of-seven. The bracket continues either way. The series is off the standings.</span>
          </article>
          <article className="path">
            <strong>The gate</strong>
            <span>After the final, the country champion plays the Construct alone, first to four. One nation against the built side.</span>
          </article>
          <article className="path">
            <strong>The restoration</strong>
            <span>The Concord is twelve real primes already in the field, at most three from one country in the opening line and five on the night. They play the Construct in a best-of-seven. A Concord series win ends the threat and leaves the country champion in place. A Construct series win means they hold the floor. The players go back to their countries after the series.</span>
          </article>
        </div>
      </section>

      <section className="section">
        <h3 className="display" style={{ fontSize: 36 }}>The prime</h3>
        <p className="lede">Every human player is shown and simulated in one prime already on record. A 1960s body and a 2020s body share the same rules and the same floor. Injured years after a peak, and seasons that have not been played, are outside the book. Ratings do not age anyone down to a current season. The Construct has no prime. Its ratings are the chassis.</p>
      </section>

      <section className="section">
        <h3 className="display" style={{ fontSize: 36 }}>Roster status</h3>
        <p className="lede">Every side carries a deep NBA-style book: a standard body, two two-way deals, and at least one 10-day, Exhibit 10, hardship, or other short stay. The label is a minute band, not a contract a team handed out. Stars carry the heavy minutes. Rotation players live in the teens and low twenties. Two-ways and short deals stay sparse until fouls, a blowout, an injury scare, or a call-up asks for them. An injury scare lasts that game only.</p>
      </section>

      <section className="section">
        <h3 className="display" style={{ fontSize: 36 }}>The competition</h3>
        <p className="lede">Eight groups of four human sides, drawn in pots from pre-tournament power so each group gets one side from each band. Every group matchup is a best-of-seven, three series per side. Then an interval that does not count: All-Star, a skills challenge, a three-point contest, and a dunk contest. The Construct stays out of those nights. Sixteen advance. The bracket is fixed from group place, and every knockout round is first to four, including the final and the third-place series. The siege follows: arrival is already in from the round of 16, then the gate, then the Concord, each a best-of-seven. Same seed, same series. A new draw is a new seed. Trials compare country titles and whether the floor was restored. The atlas sorts every human prime by decade. Nights collects the seven-game series, the 4–3s, the sweeps, and the tight games of the country draw.</p>
      </section>

      <section className="section">
        <h3 className="display" style={{ fontSize: 36 }}>The Unbroken Year</h3>
        <p className="lede">A side floor, separate from the country championship. The goal is an NBA regular season that never loses: 82–0. It opens after two finished championships and one series taken from the Construct. The opening draw does not count as that success when the Construct sweeps the siege. Replaying one seed does not add a second championship.</p>
        <p className="lede">The roster is twelve real primes, built by rolls. A roll is an era and a franchise the player actually played for, and the card lists those primes so the best name on it is visible. Take one. Boosters can roll again, force a myth year, take a second name from the same card, call a position, or recall someone who was passed. Each night is that era side. When the card is short, other primes from the same years fill the rotation, and the box marks them era. After the season, one loss can be played again. Humans stay in their prime. The Construct is not on this floor.</p>
      </section>

      <section className="section">
        <h3 className="display" style={{ fontSize: 36 }}>The sides</h3>
        <div className="groups">
          {countries.map((team) => (
            <p key={team.id}><strong>{team.name}</strong> · {team.country}</p>
          ))}
          {mixed.map((team) => (
            <p key={team.id}><strong>{team.name}</strong> · {kindLabel(team.kind)}</p>
          ))}
          {built.map((team) => (
            <p key={team.id}><strong>{team.name}</strong> · Constructed · outside the draw</p>
          ))}
        </div>
      </section>
    </main>
  );
}
