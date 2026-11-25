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
    body: "A bracket of era teams. Seven games. One year leaves holding the floor.",
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

export function Play() {
  const book = loadYear();
  return (
    <main className="page" data-floor="play">
      <p className="kicker">Side floors · jump in</p>
      <h2 className="display" style={{ fontSize: 68 }}>Play something now.</h2>
      <p className="lede">
        The championship is the book. These floors are the nights around it: a game, a series, a contest, a bracket. Each one starts the moment you open it. Humans are real primes. The basketball is NBA rules.
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
    </main>
  );
}
