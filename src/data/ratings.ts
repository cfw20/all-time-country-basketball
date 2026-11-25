import type { Arch, Contract, Player, Ratings, Role } from "./types";

const clamp = (n: number, lo = 38, hi = 99) => Math.max(lo, Math.min(hi, Math.round(n)));

export function rate(
  arch: Arch,
  ovr: number,
  usg: number,
  threeRate: number,
  extra?: Partial<Ratings>,
): Ratings {
  const o = ovr;
  let shot = o;
  let three = o - 10;
  let play = o - 15;
  let reb = o - 20;
  let def = o - 8;
  let ath = o - 5;
  let ft = o - 8;
  const clutch = o - 3;
  switch (arch) {
    case "point":
      shot = o - 6;
      three = o - 12;
      play = o + 4;
      reb = o - 38;
      def = o - 10;
      ath = o - 6;
      ft = o - 4;
      break;
    case "shooter":
      shot = o - 8;
      three = o + 4;
      play = o - 12;
      reb = o - 36;
      def = o - 16;
      ath = o - 8;
      ft = o - 2;
      break;
    case "slasher":
      shot = o - 1;
      three = o - 20;
      play = o - 10;
      reb = o - 28;
      def = o - 8;
      ath = o + 2;
      ft = o - 8;
      break;
    case "creator":
      shot = o - 4;
      three = o - 8;
      play = o;
      reb = o - 18;
      def = o - 8;
      ath = o - 4;
      ft = o - 6;
      break;
    case "wing":
      shot = o - 6;
      three = o - 6;
      play = o - 12;
      reb = o - 22;
      def = o - 4;
      ath = o - 4;
      ft = o - 6;
      break;
    case "defender":
      shot = o - 16;
      three = o - 12;
      play = o - 16;
      reb = o - 16;
      def = o + 8;
      ath = o - 2;
      ft = o - 10;
      break;
    case "stretch":
      shot = o - 8;
      three = o - 2;
      play = o - 16;
      reb = o - 8;
      def = o - 8;
      ath = o - 10;
      ft = o - 4;
      break;
    case "post":
      shot = o - 2;
      three = o - 48;
      play = o - 20;
      reb = o - 6;
      def = o - 6;
      ath = o - 8;
      ft = o - 12;
      break;
    case "rim":
      shot = o - 12;
      three = o - 52;
      play = o - 24;
      reb = o - 2;
      def = o + 6;
      ath = o - 4;
      ft = o - 16;
      break;
    case "glue":
      shot = o - 12;
      three = o - 10;
      play = o - 6;
      reb = o - 14;
      def = o + 2;
      ath = o - 8;
      ft = o - 6;
      break;
  }
  const ratings: Ratings = {
    ovr: o,
    shot: clamp(shot),
    three: clamp(three, 28, 99),
    play: clamp(play, 32, 99),
    reb: clamp(reb, 28, 99),
    def: clamp(def),
    ath: clamp(ath),
    ft: clamp(ft, 42, 99),
    usg,
    threeRate,
    clutch: clamp(clutch),
  };
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (typeof v === "number") (ratings as unknown as Record<string, number>)[k] = v;
    }
  }
  ratings.ovr = o;
  ratings.usg = usg;
  ratings.threeRate = threeRate;
  return ratings;
}

export function minuteTarget(player: Pick<Player, "role" | "contract">): number {
  if (player.contract === "exhibit-10") return 4;
  if (player.contract === "ten-day") return 7;
  if (player.contract === "hardship") return 9;
  if (player.contract === "short") return 11;
  switch (player.role as Role) {
    case "star":
      return 35;
    case "starter":
      return 31;
    case "rotation":
      return 20;
    case "deep":
      return 11;
    case "two-way":
      return 6;
  }
}

export function contractLabel(contract: Contract): string {
  switch (contract) {
    case "standard":
      return "Standard";
    case "two-way":
      return "Two-way";
    case "ten-day":
      return "10-day";
    case "exhibit-10":
      return "Exhibit 10";
    case "hardship":
      return "Hardship";
    case "short":
      return "Short";
  }
}

export function roleLabel(role: Role): string {
  switch (role) {
    case "star":
      return "Star";
    case "starter":
      return "Starter";
    case "rotation":
      return "Rotation";
    case "deep":
      return "Deep bench";
    case "two-way":
      return "Two-way";
  }
}

/** Minute-band label. Constructed units use chassis classes for the same bands. */
export function dutyLabel(role: Role, constructed: boolean): string {
  if (!constructed) return roleLabel(role);
  switch (role) {
    case "star":
      return "Primary";
    case "starter":
      return "Line";
    case "rotation":
      return "Rotation";
    case "deep":
      return "Reserve";
    case "two-way":
      return "Spare";
  }
}

export function statusLabel(contract: Contract, constructed: boolean): string {
  if (!constructed) return contractLabel(contract);
  switch (contract) {
    case "standard":
      return "Chassis";
    case "two-way":
      return "Spare frame";
    case "ten-day":
      return "Trial frame";
    case "exhibit-10":
      return "Trial frame";
    case "hardship":
      return "Emergency frame";
    case "short":
      return "Short cycle";
  }
}

export function formatHeight(ht: string): string {
  const [f, i] = ht.split("-");
  if (!i) return ht;
  return `${f}'${i}"`;
}

export function slug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
