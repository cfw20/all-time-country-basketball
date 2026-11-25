export type Pos = "PG" | "SG" | "SF" | "PF" | "C";

export type Role = "star" | "starter" | "rotation" | "deep" | "two-way";

export type Contract =
  | "standard"
  | "two-way"
  | "ten-day"
  | "exhibit-10"
  | "hardship"
  | "short";

export type SideKind = "country" | "overflow" | "homeland" | "construct" | "concord";

export type Arch =
  | "point"
  | "shooter"
  | "slasher"
  | "creator"
  | "wing"
  | "defender"
  | "stretch"
  | "post"
  | "rim"
  | "glue";

export interface Ratings {
  ovr: number;
  shot: number;
  three: number;
  play: number;
  reb: number;
  def: number;
  ath: number;
  ft: number;
  usg: number;
  threeRate: number;
  clutch: number;
}

export interface Player {
  id: string;
  name: string;
  pos: Pos;
  pos2?: Pos;
  height: string;
  primeYear: number;
  nationality: string;
  teamId: string;
  role: Role;
  contract: Contract;
  starts: boolean;
  arch: Arch;
  ratings: Ratings;
  note?: string;
}

export interface Team {
  id: string;
  kind: SideKind;
  /** Basketball country this side represents. Overflow houses are the United States. */
  country: string;
  name: string;
  nickname: string;
  code: string;
  region: string;
  colors: { primary: string; secondary: string };
  mark: "ring" | "shield" | "diamond" | "arch" | "bars" | "lattice";
  motto: string;
  blurb: string;
  pace: number;
  /** 1 is the first house after the national cut. Later numbers are further down the American mountain. */
  overflowRank?: number;
}

export interface BoxLine {
  playerId: string;
  sec: number;
  pts: number;
  orb: number;
  drb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  pf: number;
  fgm: number;
  fga: number;
  tpm: number;
  tpa: number;
  ftm: number;
  fta: number;
  pm: number;
  started: boolean;
  fouledOut: boolean;
  injured: boolean;
}

export type PlayKind =
  | "make"
  | "miss"
  | "foul"
  | "turn"
  | "sub"
  | "timeout"
  | "period"
  | "injury"
  | "note";

export interface Play {
  q: number;
  clock: string;
  text: string;
  home: number;
  away: number;
  kind: PlayKind;
  key: boolean;
  teamId?: string;
}

export interface GameResult {
  id: string;
  round: string;
  roundLabel: string;
  dayLabel: string;
  homeId: string;
  awayId: string;
  venue: string;
  seed: number;
  quarters: { home: number; away: number }[];
  homeScore: number;
  awayScore: number;
  ot: number;
  box: { home: BoxLine[]; away: BoxLine[] };
  plays: Play[];
  biggestLead: { teamId: string; margin: number };
  biggestRun: { teamId: string; points: number };
  leadChanges: number;
  winnerId: string;
  loserId: string;
  buzzerBeater: boolean;
  /** Winner erased at least a 12-point deficit at some point in the game. */
  comeback?: { teamId: string; deficit: number };
  exhibition?: boolean;
  homeName?: string;
  awayName?: string;
  /** Series this game belongs to. Best-of-seven ids, not a one-off. */
  seriesId?: string;
}

/** First to four. Games stop when one side has four wins. Neutral floor, no home-court bonus. */
export interface SeriesResult {
  id: string;
  round: string;
  roundLabel: string;
  dayLabel: string;
  /** Better power seed, or the side named home for a custom series. */
  homeId: string;
  awayId: string;
  homeName?: string;
  awayName?: string;
  games: GameResult[];
  homeWins: number;
  awayWins: number;
  winnerId: string;
  loserId: string;
  exhibition?: boolean;
}

export interface GroupStanding {
  teamId: string;
  /** Series wins. A series is first to four games. */
  w: number;
  l: number;
  /** Games won and lost inside those series. */
  gw: number;
  gl: number;
  pf: number;
  pa: number;
  /** Series wins against each opponent. */
  h2h: Record<string, number>;
}

export interface ContestEntry {
  playerId: string;
  scores: number[];
  total: number;
}

export interface Contest {
  kind: "three" | "dunk" | "skills";
  title: string;
  field: ContestEntry[];
  finalists: ContestEntry[];
  winnerId: string;
}

export interface Awards {
  mvpId: string;
  finalsMvpId: string;
  dpoyId: string;
  sixthId: string;
  breakoutId: string;
  firstTeam: string[];
  secondTeam: string[];
}

export interface NewsItem {
  id: string;
  kicker: string;
  title: string;
  body: string;
  gameId?: string;
  importance: number;
  order: number;
}

/** The Construct's three series, and the human roster borrowed to answer them. */
export interface Siege {
  arrival: SeriesResult | null;
  gate: SeriesResult | null;
  restoration: SeriesResult | null;
  /** Real human player ids, opening five first. Empty until the Concord is named. */
  concordIds: string[];
  /** The Concord won the restoration, so the country champion keeps the floor. */
  threatEnded: boolean;
}

export interface Tournament {
  seed: number;
  through: number;
  ranking: { teamId: string; power: number; seed: number }[];
  groups: { id: string; teamIds: string[] }[];
  series: SeriesResult[];
  games: GameResult[];
  allStar: GameResult | null;
  allStarRosters: { a: string[]; b: string[]; captainA: string; captainB: string } | null;
  three: Contest | null;
  dunk: Contest | null;
  skills: Contest | null;
  awards: Awards | null;
  news: NewsItem[];
  finishes: Record<string, number>;
  siege: Siege | null;
}
