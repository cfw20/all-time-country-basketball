import { Link } from "react-router-dom";
import { loadYear } from "../state/yearBook";

const DOORS = [
  {
    to: "/play/clash",
    kicker: "One night",
    title: "Era Clash",
    body: "Two rolled years of basketball. One NBA game, already tipped when you arrive.",
  },
  {
    to: "/play/series",
    kicker: "First to four",
    title: "A series tonight",
    body: "Any two sides, including the Construct. A best-of-seven you can start over.",
  },
  {
    to: "/play/lamp",
    kicker: "The interval, anytime",
    title: "The Lamp",
    body: "Three-point contest, dunk contest, skills challenge. Real primes. Light it again whenever you want.",
  },
  {
    to: "/play/throne",
    kicker: "Eight sides, one night",
    title: "The Throne",
    body: "Eight era sides. Single elimination, one NBA game a night. Seven games, then one year leaves holding the floor.",
  },
  {
    to: "/play/hill",
    kicker: "Winner stays",
    title: "King of the Hill",
    body: "A side defends the floor. Win and the next challenger walks on. The last one is the Construct.",
  },
  {
    to: "/play/gauntlet",
    kicker: "Seven rungs",
    title: "The Gauntlet",
    body: "One side, seven games, each opponent a step up the field. The last rung is the Construct.",
  },
  {
    to: "/play/decade",
    kicker: "Every prime's decade",
    title: "Decade Cup",
    body: "The 1950s through the 2020s, each as a side. A round robin, then a final.",
  },
  {
    to: "/play/open",
    kicker: "Sixteen sides",
    title: "The Open",
    body: "A one-game bracket drawn from the field. Loser out. Humans only.",
  },
  {
    to: "/play/fortnight",
    kicker: "A week, then a series",
    title: "Fortnight",
    body: "Six sides play a round robin. The top two settle it in a best-of-seven.",
  },
  {
    to: "/play/survivor",
    kicker: "The heaviest loss goes",
    title: "Survivor",
    body: "Eight sides. Each night the worst defeat is eliminated, until two remain.",
  },
  {
    to: "/play/five",
    kicker: "Ten names, one game",
    title: "The Five",
    body: "Two position-balanced fives, drawn from the whole human book. They play once.",
  },
  {
    to: "/olympics",
    kicker: "One bracket, then it closes",
    title: "The Olympics",
    body: "Roll a temporary side and see if it can live with the countries and the Construct. Every meeting is a best-of-seven. It does not join the draw.",
  },
  {
    to: "/season",
    kicker: "The long chase",
    title: "The Unbroken Year",
    body: "Roll a roster and try to go 82–0. A deep year leaves a relic. A perfect year is cut into the book.",
  },
  {
    to: "/trials",
    kicker: "The whole championship",
    title: "Trials",
    body: "Run the country draw and the siege again. Same primes, a new seed, a new champion.",
  },
];

const NIGHTS = [
  {
    to: "/play/shootaround",
    kicker: "Six primes",
    title: "Shootaround",
    body: "Midrange, threes, and the line. Five shots at each. Most makes take the floor.",
  },
  {
    to: "/play/ladder",
    kicker: "Free throws",
    title: "The Ladder",
    body: "Eight primes, one free throw at a time. Miss, and you leave. The last one shooting wins.",
  },
  {
    to: "/play/halfcourt",
    kicker: "First to 11",
    title: "Halfcourt",
    body: "Two primes alternate the ball. A basket is 2. No five on the floor.",
  },
  {
    to: "/play/cut",
    kicker: "Under a cap",
    title: "The Cut",
    body: "Build a five, one at each position, under an overall cap. One rating night against the book.",
  },
  {
    to: "/play/streak",
    kicker: "Hot hand",
    title: "The Streak",
    body: "Four shooters. Threes until a miss. The longest run wins.",
  },
  {
    to: "/play/glass",
    kicker: "Boards and blocks",
    title: "The Glass",
    body: "Two bigs, ten trips. A board is one. A block is two.",
  },
  {
    to: "/play/closer",
    kicker: "Late clock",
    title: "The Closer",
    body: "Name a prime, then watch five late possessions each.",
  },
  {
    to: "/play/arc",
    kicker: "Five threes",
    title: "The Arc",
    body: "One shooter from each decade on the card. Not the Decade Cup.",
  },
];

const BOOK = [
  {
    to: "/play/prime",
    kicker: "The card",
    title: "Prime year",
    body: "A name from the book. Four years. Which one is the prime.",
  },
  {
    to: "/play/flag",
    kicker: "Nationality",
    title: "The Flag",
    body: "A flag from the book. Which prime wears it.",
  },
  {
    to: "/play/opens",
    kicker: "Same side",
    title: "Opens With",
    body: "That prime starts. Who else is in the opening five.",
  },
  {
    to: "/play/edge",
    kicker: "Ratings",
    title: "The Edge",
    body: "Higher overall, better shot, or better defense. The number stays down until you answer.",
  },
  {
    to: "/play/tape",
    kicker: "Size and spot",
    title: "The Tape",
    body: "Who is taller on the card, or who is listed at that position.",
  },
];

export function Play() {
  const book = loadYear();
  return (
    <main className="page" data-floor="play">
      <p className="kicker">Side floors · jump in</p>
      <h2 className="display" style={{ fontSize: 68 }}>Play something now.</h2>
      <p className="lede">
        The championship is the book. These floors are the nights around it: a game, a series, a contest, a bracket. Each one starts the moment you open it. A series tonight, the Fortnight final, and the Olympics are best-of-seven. The Throne, the Open, and the other one-night brackets are a single NBA game. Humans are real primes. The basketball is NBA rules. None of these nights move the groups. Short nights and the trivia use the cards only and do not call a full game.
      </p>
      {book.crown ? <p className="scoreline">An Unbroken Year is already cut into this browser.</p> : null}
      <div className="doors">
        {DOORS.map((door) => (
          <Link key={door.to} to={door.to} className="panel door">
            <span className="tag">{door.kicker}</span>
            <h3>{door.title}</h3>
            <p>{door.body}</p>
          </Link>
        ))}
      </div>
      <h3 className="subhead">Short nights</h3>
      <p className="lede">Cards and ratings. No full game. Run it again deals another from the same seed.</p>
      <div className="doors">
        {NIGHTS.map((door) => (
          <Link key={door.to} to={door.to} className="panel door">
            <span className="tag">{door.kicker}</span>
            <h3>{door.title}</h3>
            <p>{door.body}</p>
          </Link>
        ))}
      </div>
      <h3 className="subhead">From the book</h3>
      <p className="lede">Trivia. The answer is a field on the card: year, flag, side, rating, height, or position.</p>
      <div className="doors">
        {BOOK.map((door) => (
          <Link key={door.to} to={door.to} className="panel door">
            <span className="tag">{door.kicker}</span>
            <h3>{door.title}</h3>
            <p>{door.body}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
