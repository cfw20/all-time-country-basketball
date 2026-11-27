import type { Player } from "../data/types";

/**
 * Reads a roster the way the game already plays it.
 * Pace is the card pace. Threes are the opening five's usage-weighted three-point share.
 * Defense, glass, and creation are the opening five's def, reb, and highest play.
 * Nothing here is an input to the simulator.
 */

export interface StyleFacet {
  label: string;
  value: string;
  detail: string;
}

export interface SideStyle {
  name: string;
  line: string;
  built: boolean;
  pace: number;
  threeShare: number;
  defense: number;
  glass: number;
  facets: StyleFacet[];
}

export interface PlayerStyle {
  name: string;
  line: string;
}

export interface StyleInput {
  pace: number;
  players: Player[];
  built?: boolean;
}

interface FiveFacts {
  five: Player[];
  pace: number;
  threeShare: number;
  defense: number;
  glass: number;
  height: number;
  creator: Player;
  second: Player;
  posts: Player[];
  shooters: number;
  spaced: number;
  slashers: number;
  built: boolean;
}

export function asLineup(players: Player[], opening = 5): Player[] {
  return players.map((player, index) => ({ ...player, starts: index < opening }));
}

export function readStyle(input: StyleInput): SideStyle {
  const five = openingFive(input.players);
  const facts = measure(five, input.pace, input.built === true);
  const picked = pickName(facts);
  const line = facts.built ? `Built side. ${picked.line}` : picked.line;
  return {
    name: picked.name,
    line,
    built: facts.built,
    pace: facts.pace,
    threeShare: facts.threeShare,
    defense: facts.defense,
    glass: facts.glass,
    facets: facetsOf(facts),
  };
}

export function meetStyles(aName: string, a: SideStyle, bName: string, b: SideStyle): string {
  const paceA = a.pace.toFixed(2);
  const paceB = b.pace.toFixed(2);
  const avg = ((a.pace + b.pace) / 2).toFixed(2);
  const pace = paceA === paceB
    ? `Both sides are pace ${paceA}, so the possession stays there`
    : `${aName} at pace ${paceA} against ${bName} at ${paceB} puts the possession at ${avg}`;
  const glassA = Math.round(a.glass);
  const glassB = Math.round(b.glass);
  const glass = glassA === glassB
    ? `the opening glass rating is level at ${glassA}`
    : `${glassA > glassB ? aName : bName} has the higher opening glass rating, ${Math.max(glassA, glassB)} to ${Math.min(glassA, glassB)}`;
  return `${pace}, and ${glass}.`;
}

export function readPlayerStyle(player: Player): PlayerStyle {
  const built = player.nationality === "Construct";
  const r = player.ratings;
  const kind = built ? "built " : "";
  const share = `Three-point share ${r.threeRate}.`;
  const stop = r.def >= 90 && Math.max(r.shot, r.play) >= 86 && r.def + 6 >= Math.max(r.shot, r.play);
  const stopperArch = player.arch === "slasher" || player.arch === "wing" || player.arch === "defender";

  if (stop && player.arch === "defender") {
    return {
      name: built ? "Built two-way stopper" : "Two-way stopper",
      line: `A ${kind}two-way stopper. Defense ${r.def} and shot ${r.shot} are both on the card. Athlete ${r.ath}. ${share}`,
    };
  }
  if (stop && stopperArch) {
    return {
      name: built ? "Built two-way stopper" : "Two-way stopper",
      line: `A ${kind}${player.arch} who also stops the ball. Shot ${r.shot}, defense ${r.def}, athlete ${r.ath}. ${share}`,
    };
  }

  switch (player.arch) {
    case "point":
      if (r.def >= 90 && r.play >= 88) {
        return {
          name: built ? "Built two-way point" : "Two-way point",
          line: `A ${kind}point who also defends. Play ${r.play}, defense ${r.def}, shot ${r.shot}. ${share}`,
        };
      }
      if (r.shot > r.play + 6) {
        return {
          name: built ? "Built scoring point" : "Scoring point",
          line: `A ${kind}point who scores it. Shot ${r.shot} leads play ${r.play}. Defense ${r.def}. ${share}`,
        };
      }
      return {
        name: built ? "Built point" : "Point",
        line: `A ${kind}point. Play ${r.play} runs the possession. Shot ${r.shot}, defense ${r.def}. ${share}`,
      };
    case "shooter":
      return {
        name: built ? "Built shooter" : "Shooter",
        line: `A ${kind}shooter. Three ${r.three}, and ${r.threeRate}% of the shots are threes. Play ${r.play}, defense ${r.def}.`,
      };
    case "slasher":
      return {
        name: built ? "Built slasher" : "Slasher",
        line: `A ${kind}slasher. Shot ${r.shot}, athlete ${r.ath}, defense ${r.def}. ${share}`,
      };
    case "creator":
      if (r.def >= 90 && r.shot >= 86 && r.play >= 88) {
        return {
          name: built ? "Built two-way creator" : "Two-way creator",
          line: `A ${kind}creator who also defends. Play ${r.play}, shot ${r.shot}, defense ${r.def}. ${share}`,
        };
      }
      return {
        name: built ? "Built creator" : "Creator",
        line: `A ${kind}creator. Play ${r.play} and shot ${r.shot}. Defense ${r.def}. ${share}`,
      };
    case "wing":
      return {
        name: built ? "Built wing" : "Wing",
        line: `A ${kind}wing. Shot ${r.shot}, defense ${r.def}, glass ${r.reb}. ${share}`,
      };
    case "defender":
      if (r.reb >= 94 && r.reb + 2 >= r.def) {
        return {
          name: built ? "Built glass stopper" : "Glass stopper",
          line: `A ${kind}stopper whose glass is the high number. Rebound ${r.reb}, defense ${r.def}, shot ${r.shot}. ${share}`,
        };
      }
      return {
        name: built ? "Built stopper" : "Stopper",
        line: `A ${kind}stopper. Defense ${r.def} leads the card. Shot ${r.shot}, glass ${r.reb}. ${share}`,
      };
    case "stretch":
      return {
        name: built ? "Built stretch" : "Stretch",
        line: `A ${kind}stretch big. Three ${r.three}, and ${r.threeRate}% of the shots are threes. Glass ${r.reb}, defense ${r.def}.`,
      };
    case "post":
      if (r.play >= 90) {
        return {
          name: built ? "Built passing post" : "Passing post",
          line: `A ${kind}post who passes. Play ${r.play}, glass ${r.reb}, shot ${r.shot}. Defense ${r.def}. ${share}`,
        };
      }
      return {
        name: built ? "Built post" : "Post",
        line: `A ${kind}post. Shot ${r.shot}, glass ${r.reb}, defense ${r.def}. ${share}`,
      };
    case "rim":
      if (r.three >= 75 && r.threeRate >= 28) {
        return {
          name: built ? "Built spacing rim" : "Spacing rim",
          line: `A ${kind}rim protector who also spaces. Defense ${r.def}, glass ${r.reb}, three ${r.three}. ${share}`,
        };
      }
      return {
        name: built ? "Built rim protector" : "Rim protector",
        line: `A ${kind}rim protector. Defense ${r.def}, glass ${r.reb}, shot ${r.shot}. ${share}`,
      };
    case "glue":
      return {
        name: built ? "Built connector" : "Connector",
        line: `A ${kind}connector. Play ${r.play}, defense ${r.def}, glass ${r.reb}. Usage ${r.usg}. ${share}`,
      };
  }
}

function openingFive(players: Player[]): Player[] {
  const starters = players.filter((player) => player.starts);
  if (starters.length === 5) return starters;
  return players
    .slice()
    .sort((a, b) => Number(b.starts) - Number(a.starts) || b.ratings.ovr - a.ratings.ovr || a.name.localeCompare(b.name))
    .slice(0, 5);
}

function measure(five: Player[], pace: number, builtFlag: boolean): FiveFacts {
  const weight = five.reduce((sum, player) => sum + player.ratings.usg, 0);
  const threeShare = weight > 0
    ? five.reduce((sum, player) => sum + player.ratings.usg * player.ratings.threeRate, 0) / weight
    : 0;
  const defense = mean(five.map((player) => player.ratings.def));
  const glass = mean(five.map((player) => player.ratings.reb));
  const height = mean(five.map((player) => inches(player.height)));
  const passers = five.slice().sort((a, b) => b.ratings.play - a.ratings.play || b.ratings.usg - a.ratings.usg || a.name.localeCompare(b.name));
  const built = builtFlag || (five.length > 0 && five.every((player) => player.nationality === "Construct"));
  return {
    five,
    pace,
    threeShare,
    defense,
    glass,
    height,
    creator: passers[0] ?? emptyPlayer(),
    second: passers[1] ?? passers[0] ?? emptyPlayer(),
    posts: five.filter((player) => player.arch === "post" || player.arch === "rim"),
    shooters: five.filter((player) => player.ratings.threeRate >= 34).length,
    spaced: five.filter((player) => player.ratings.threeRate >= 30).length,
    slashers: five.filter((player) => player.arch === "slasher").length,
    built,
  };
}

function pickName(facts: FiveFacts): { name: string; line: string } {
  const three = Math.round(facts.threeShare);
  const defense = Math.round(facts.defense);
  const glass = Math.round(facts.glass);
  const posts = facts.posts.length;
  const play = facts.creator.ratings.play;
  const next = facts.second.ratings.play;
  const pace = facts.pace;
  const who = facts.creator.name;
  const postNames = listNames(facts.posts);
  const slasherNames = listNames(facts.five.filter((player) => player.arch === "slasher"));

  if (facts.built && defense >= 88 && three >= 24 && three < 40) {
    return {
      name: "Spaced wall",
      line: `Opening defense is ${defense} and the three-point share is ${three}%. ${who} creates (play ${play}).`,
    };
  }
  if (facts.shooters >= 5 && three >= 32) {
    return {
      name: "Five shooters",
      line: `All five openers put at least 34% of their shots up from three. The usage-weighted share is ${three}%.`,
    };
  }
  if ((facts.creator.arch === "post" || facts.creator.arch === "rim") && play >= 92) {
    return {
      name: "Pass from the post",
      line: `${who} is the post and the passer (play ${play}). The opening three-point share is ${three}%.`,
    };
  }
  if (posts >= 2 && play >= 94 && next >= 90) {
    return {
      name: "Two posts, two creators",
      line: `${postNames} start inside. ${who} (play ${play}) and ${facts.second.name} (play ${next}) create.`,
    };
  }
  if (posts >= 2 && play >= 92 && three >= 16 && three < 28) {
    return {
      name: "Post and kick",
      line: `${postNames} start inside. ${who} creates (play ${play}). Threes are ${three}% of the opening shots.`,
    };
  }
  if (posts >= 2 && play >= 92 && three >= 8 && three < 16) {
    return {
      name: "Posts and a creator",
      line: `${postNames} start inside. ${who} creates (play ${play}). Threes are ${three}% of the opening shots.`,
    };
  }
  if (pace >= 1.04 && posts >= 2) {
    return {
      name: "Run to the rim",
      line: `Pace ${pace.toFixed(2)} is the fast end of the book, and ${postNames} play the rim. Threes are ${three}%.`,
    };
  }
  if (pace >= 1.035 && three >= 30) {
    return {
      name: "Pace and space",
      line: `Pace ${pace.toFixed(2)} with a ${three}% three-point share from the opening five.`,
    };
  }
  if (pace <= 0.985 && defense >= 86 && three < 22) {
    return {
      name: "Half-court defense",
      line: `Pace ${pace.toFixed(2)} holds the ball. Opening defense is ${defense}. Threes are ${three}% of the shots.`,
    };
  }
  if (pace <= 1 && posts >= 2 && three < 22) {
    return {
      name: "Half-court post",
      line: `Pace ${pace.toFixed(2)}. ${postNames} start inside, and the three-point share is ${three}%.`,
    };
  }
  if (posts >= 3 && three < 26) {
    return {
      name: "Three in the paint",
      line: `${postNames} start. The three-point share is ${three}%.`,
    };
  }
  if (posts >= 2 && three < 22) {
    return {
      name: "Twin posts",
      line: `${postNames} start inside. The three-point share is ${three}%. Pace ${pace.toFixed(2)}.`,
    };
  }
  if (facts.height <= 76.8 && three >= 30) {
    return {
      name: "Small and spaced",
      line: `The opening five average ${heightLabel(facts.height)}. The three-point share is ${three}%.`,
    };
  }
  if (glass >= 74 && posts >= 1) {
    return {
      name: "Own the glass",
      line: `Opening glass averages ${glass}. ${boardName(facts)} is the high board.`,
    };
  }
  if (defense >= 86 && three < 22) {
    return {
      name: "Glass and defense",
      line: `Opening defense is ${defense} and glass is ${glass}. Threes are ${three}% of the shots.`,
    };
  }
  if (facts.shooters >= 4 && three >= 32) {
    return {
      name: "Four shooters",
      line: `Four openers put at least 34% of their shots up from three. The usage-weighted share is ${three}%.`,
    };
  }
  if (play >= 94 && three >= 26) {
    return {
      name: "Create and kick",
      line: `${who} creates (play ${play}). The opening five put ${three}% of their shots up from three.`,
    };
  }
  if (facts.slashers >= 2 && three < 22 && pace <= 0.98) {
    return {
      name: "Half-court slash",
      line: `Pace ${pace.toFixed(2)}. ${slasherNames} start as slashers. The three-point share is ${three}%.`,
    };
  }
  if (facts.slashers >= 2 && three < 22) {
    return {
      name: "Slash to the rim",
      line: `${slasherNames} start as slashers. The three-point share is ${three}%. Pace ${pace.toFixed(2)}.`,
    };
  }
  if (defense >= 86 && three >= 26 && facts.spaced >= 2) {
    return {
      name: "Stretch and guard",
      line: `Opening defense is ${defense} and the three-point share is ${three}%.`,
    };
  }
  if (posts >= 2 && three < 28) {
    return {
      name: "Twin posts",
      line: `${postNames} start inside. The three-point share is ${three}%.`,
    };
  }
  if (facts.height >= 80.6 && three >= 22) {
    return {
      name: "Long and spaced",
      line: `The opening five average ${heightLabel(facts.height)}. The three-point share is ${three}%.`,
    };
  }
  if (three >= 28 && facts.spaced >= 3) {
    return {
      name: "Stretch the floor",
      line: `${facts.spaced} openers put at least 30% of their shots up from three. The usage-weighted share is ${three}%.`,
    };
  }
  if (pace <= 0.985 && three < 22) {
    return {
      name: "Half-court",
      line: `Pace ${pace.toFixed(2)}. Opening threes are ${three}% of the shots.`,
    };
  }
  if (three <= 16) {
    return {
      name: "Play inside",
      line: `The opening three-point share is ${three}%. The shots are inside. Pace ${pace.toFixed(2)}.`,
    };
  }
  if (three >= 26) {
    return {
      name: "Stretch the floor",
      line: `The usage-weighted three-point share is ${three}%. Pace ${pace.toFixed(2)}.`,
    };
  }
  return {
    name: "Inside and out",
    line: `The opening three-point share is ${three}%, pace ${pace.toFixed(2)}. ${who} is the high pass (play ${play}).`,
  };
}

function shooterCount(count: number): string {
  if (count <= 0) return "None of the five put 34% or more of their shots up from three.";
  if (count >= 5) return "All five put at least 34% of their shots up from three.";
  return `${count} of 5 put at least 34% of their shots up from three.`;
}

function facetsOf(facts: FiveFacts): StyleFacet[] {
  const three = Math.round(facts.threeShare);
  const defense = Math.round(facts.defense);
  const glass = Math.round(facts.glass);
  const play = facts.creator.ratings.play;
  const next = facts.second.ratings.play;
  const shared = facts.second.id !== facts.creator.id && next >= play - 8;
  const paceWord = facts.pace >= 1.04
    ? "Fast end of this book. Higher shortens the possession."
    : facts.pace <= 0.975
      ? "Slow end of this book. Lower lengthens the possession."
      : "Near 1.00. Higher shortens the possession, lower lengthens it.";
  const lean = defense >= 86
    ? "The lean is toward defense."
    : defense <= 72
      ? "The lean is away from defense."
      : "The lean sits in the middle of this field.";
  return [
    {
      label: "Pace",
      value: facts.pace.toFixed(2),
      detail: paceWord,
    },
    {
      label: "Threes",
      value: `${three}%`,
      detail: `Usage-weighted share of the opening five. ${shooterCount(facts.shooters)}`,
    },
    {
      label: "Defense",
      value: String(defense),
      detail: `Average of the opening five. ${lean}`,
    },
    {
      label: "Glass",
      value: String(glass),
      detail: `Average rebound rating. ${boardName(facts)}.`,
    },
    {
      label: "Creation",
      value: shared ? `${play} / ${next}` : String(play),
      detail: shared
        ? `${facts.creator.name} and ${facts.second.name} share the high pass.`
        : `${facts.creator.name} is the high pass. Next is ${facts.second.name} at ${next}.`,
    },
  ];
}

function boardName(facts: FiveFacts): string {
  const board = facts.five.slice().sort((a, b) => b.ratings.reb - a.ratings.reb || a.name.localeCompare(b.name))[0];
  if (!board) return "No opener";
  return `${board.name} is the high board at ${board.ratings.reb}`;
}

function listNames(players: Player[]): string {
  const names = players.map((player) => player.name);
  if (names.length === 0) return "No post";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function inches(height: string): number {
  const [feet, inch] = height.split("-").map(Number);
  if (!Number.isFinite(feet)) return 0;
  return feet * 12 + (Number.isFinite(inch) ? inch : 0);
}

function heightLabel(total: number): string {
  const rounded = Math.round(total);
  return `${Math.floor(rounded / 12)}'${rounded % 12}"`;
}

function emptyPlayer(): Player {
  return {
    id: "",
    name: "No one",
    pos: "PG",
    height: "6-0",
    primeYear: 1955,
    nationality: "",
    teamId: "",
    role: "deep",
    contract: "standard",
    starts: false,
    arch: "glue",
    ratings: { ovr: 0, shot: 0, three: 0, play: 0, reb: 0, def: 0, ath: 0, ft: 0, usg: 0, threeRate: 0, clutch: 0 },
  };
}
