import { TEAMS } from "../data";
import { kindLabel } from "../lib/format";

export function Rules() {
  const countries = TEAMS.filter((team) => team.kind === "country");
  const mixed = TEAMS.filter((team) => team.kind !== "country");
  return (
    <main className="page">
      <p className="kicker">The book of the event</p>
      <h2 className="display" style={{ fontSize: 68 }}>NBA rules. Country first.</h2>
      <p className="lede">
        Pantheon is a fictional all-time world basketball championship. Every player is a real player, shown in a prime already on record. It is not affiliated with the NBA or FIBA, and this project stays private until the owner decides to publish.
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
        <h3 className="display" style={{ fontSize: 36 }}>The prime</h3>
        <p className="lede">Every player is shown and simulated in one prime already on record. A 1960s body and a 2020s body share the same rules and the same floor. Injured years after a peak, and seasons that have not been played, are outside the book. Ratings do not age anyone down to a current season.</p>
      </section>

      <section className="section">
        <h3 className="display" style={{ fontSize: 36 }}>Roster status</h3>
        <p className="lede">Every side carries a deep NBA-style book: a standard body, two two-way deals, and at least one 10-day, Exhibit 10, hardship, or other short stay. The label is a minute band, not a contract a team handed out. Stars carry the heavy minutes. Rotation players live in the teens and low twenties. Two-ways and short deals stay sparse until fouls, a blowout, an injury scare, or a call-up asks for them. An injury scare lasts that game only.</p>
      </section>

      <section className="section">
        <h3 className="display" style={{ fontSize: 36 }}>The competition</h3>
        <p className="lede">Eight groups of four, drawn in pots from pre-tournament power so each group gets one side from each band. Three group days, then an interval that does not count: All-Star, a skills challenge, a three-point contest, and a dunk contest. Sixteen advance. The bracket is fixed from group place. A third-place game is played. Same seed, same games. A new draw is a new seed. Trials compare finished championships: title rate, average finish, win rate, and honors. The atlas sorts every prime by decade. Nights collects the rematches, close games, and buzzers of the draw you are in.</p>
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
        </div>
      </section>
    </main>
  );
}
