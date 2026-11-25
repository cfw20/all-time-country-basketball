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
        <p className="lede">Four quarters of 12 minutes. A 24-second shot clock. The NBA three-point line. Six personal fouls and that player is ejected. Bonus on the fifth team foul of a quarter, and on the fourth in overtime. A technical foul is an NBA technical: it counts on the player and on the team, and the other side shoots one free throw. Two technicals eject. A flagrant 2, or a second flagrant, ejects on the spot, and that player is suspended for the next game of the same series. A second technical ejection in the same series does the same. One-night floors have no next game to sit. Overtime is five minutes and repeats until someone leads. Timeouts and substitutions follow an NBA shape. There is no FIBA difference in this event: no FIBA quarter length, no FIBA foul limit, no zone-only wrinkle, no Olympic roster cap. The painted sky is the look of the building. The basketball is the real game: real players, at the prime on the card, with real box scores.</p>
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
            <span>Americans who could not earn minutes on the Continental, then on the houses above them. Vanguard, Afterlight, and Palladium are the first three. More houses follow, each a full prime-era roster, for players the book still had and the minutes did not. A player chooses the first house that can actually play them.</span>
          </article>
          <article className="path">
            <strong>Homeland path</strong>
            <span>A great player whose country cannot fill a competitive all-time side. Those countries are not in the draw. The primes choose a homeland house: the Lantern, the Bastion, the Harbor, or the Reed. The house is a roster that can play, not a pile of the players a weak national side could not support.</span>
          </article>
        </div>
      </section>

      <section className="section">
        <h3 className="display" style={{ fontSize: 36 }}>The Construct and the Concord</h3>
        <p className="lede">The Construct is twenty-two chassis. They have no country and no prime. They are the favorite of the event, a clear step ahead of the human sides. A series against them is very hard, and they can still lose one. They stay out of the groups so the country tournament can still be played.</p>
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
        <p className="lede">{TEAMS.filter((team) => team.kind !== "construct").length / 4} groups of four human sides, drawn in pots from pre-tournament power so each group gets one side from each band. Every group matchup is a best-of-seven, three series per side. Then an interval that does not count: All-Star, a skills challenge, a three-point contest, and a dunk contest. The Construct stays out of those nights. Every group winner advances. The best second-place sides fill the field to sixteen. Those sixteen are seeded by pre-draw power, 1 against 16, and every knockout round is first to four, including the final and the third-place series. The siege follows: arrival is already in from the round of 16, then the gate, then the Concord, each a best-of-seven. Same seed, same series. A new draw is a new seed. Trials compare country titles and whether the floor was restored. The atlas sorts every human prime by decade. Nights collects the seven-game series, the 4–3s, the sweeps, and the tight games of the country draw. After a game or a series, the players who just played can run Horse, the Rack, the Stripe, the Poster, the Circuit, or Buzzer. Those toys do not touch the book.</p>
      </section>

      <section className="section">
        <h3 className="display" style={{ fontSize: 36 }}>The Unbroken Year</h3>
        <p className="lede">A side floor, separate from the country championship. The goal is an NBA regular season that never loses: 82–0. It opens after two finished championships and one series taken from the Construct. The opening draw does not count as that success when the Construct sweeps the siege. Replaying one seed does not add a second championship.</p>
        <p className="lede">The roster is twelve real primes, built by rolls. A roll is an era and a franchise the player actually played for, and the card lists those primes so the best name on it is visible. Take one. Boosters can roll again, force a myth year, take a second name from the same card, call a position, or recall someone who was passed. Each night is that era side. When the card is short, other primes from the same years fill the rotation, and the box marks them era. After the season, one loss can be played again. Humans stay in their prime. The Construct is not on this floor.</p>
        <p className="lede">A strong year leaves a relic for the next one. Seventy wins adds a roll-again. Seventy-five adds a gilded roll. Seventy-eight adds a gilded roll and a position call, and the roster is kept on the seal. Eighty-one opens the next year on a myth card and carries a second replay. Eighty-two, The Unbroken, cuts the roster into the book for good and opens the next year on a myth card with a heavier set of boosters.</p>
      </section>

      <section className="section">
        <h3 className="display" style={{ fontSize: 36 }}>Side floors</h3>
        <p className="lede">The championship stays the book. Around it are nights you can start immediately. Era Clash is one NBA game between two rolled years. A series tonight is a best-of-seven between any two sides, and the Construct can be called. The Lamp is a three-point contest, a dunk contest, and a skills challenge, lit whenever you want. The Throne is eight era sides in a one-night bracket. King of the Hill keeps the winner on the floor. The Gauntlet is seven games up the field, ending at the Construct. The Decade Cup puts every prime on the decade of the card. The Open is a sixteen-side one-game bracket. Fortnight is a six-side round robin and a best-of-seven final. Survivor drops the heaviest loss each night. The Five is two drawn lineups and one game. Open any of those boxes and the same after-the-horn games are waiting. None of them touch the standings.</p>
        <p className="lede">The Olympics is a fantasy draft on the same door as the Unbroken Year: two finished championships and a series taken from the Construct. You take twelve real primes from the book, at most three from one nationality, and no Construct units. Power, style, and a seat against the field are on the page before the bracket. The meet is eight sides, every series first to four. The drafted side never enters the championship draw and does not write the country standings.</p>
        <p className="lede">Eight shorter nights use the cards and never call a full game. Shootaround is midrange, threes, and free throws. The Ladder is free throws until a miss. Halfcourt is first to 11, one prime against another. The Cut is a five under an overall cap. The Streak is makes until a miss. The Glass is boards and blocks. The Closer is five late possessions after you name who. The Arc is five threes, one shooter from each decade. Five trivia nights use only the card: prime year, flag, who opens beside that prime, the higher rating, and height or position. Nine questions, then a score. A wrong pick shows the right name. None of this changes the groups, the best-of-seven, or the standings.</p>
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
