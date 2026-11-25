import type { Team } from "./types";

/** The built villain. In the field, outside the country draw. */
export const CONSTRUCT_ID = "cstr";

/** The combined human side. Assembled for the restoration, then disbanded. */
export const CONCORD_ID = "wld";

export const CONCORD_TEAM: Team = {
  id: CONCORD_ID,
  kind: "concord",
  country: "Every human side",
  name: "The Concord",
  nickname: "Concord",
  code: "WLD",
  region: "The world",
  colors: { primary: "#e7c27a", secondary: "#f0a7b5" },
  mark: "ring",
  motto: "One night. Every country. Then home.",
  blurb:
    "Twelve real primes, borrowed from the sides already in the book. At most three from one country in the opening line, and five on the whole roster. They play the Construct once. After that night they are their countries' players again. Nobody was signed.",
  pace: 1.02,
};
