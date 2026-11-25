export type Pos = "PG" | "SG" | "SF" | "PF" | "C";

export type Role = "star" | "starter" | "rotation" | "deep" | "two-way";

export type Contract =
  | "standard"
  | "two-way"
  | "ten-day"
  | "exhibit-10"
  | "hardship"
  | "short";

export type SideKind = "country" | "overflow" | "homeland";

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
  mark: "ring" | "shield" | "diamond" | "arch" | "bars";
  motto: string;
  blurb: string;
  pace: number;
  /** 1 = first overflow house, 2 = second, 3 = last. */
  overflowRank?: 1 | 2 | 3;
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
  exhibition?: boolean;
  homeName?: string;
  awayName?: string;
}

export interface GroupStanding {
  teamId: string;
  w: number;
  l: number;
  pf: number;
  pa: number;
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

export interface Tournament {
  seed: number;
  through: number;
  ranking: { teamId: string; power: number; seed: number }[];
  groups: { id: string; teamIds: string[] }[];
  games: GameResult[];
  allStar: GameResult | null;
  allStarRosters: { a: string[]; b: string[]; captainA: string; captainB: string } | null;
  three: Contest | null;
  dunk: Contest | null;
  skills: Contest | null;
  awards: Awards | null;
  news: NewsItem[];
  finishes: Record<string, number>;
}
