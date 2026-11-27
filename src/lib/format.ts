export function clockMin(sec: number): string {
  const total = Math.max(0, Math.round(sec));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function one(n: number, games: number): string {
  if (!games) return "—";
  return (n / games).toFixed(1);
}

export function pct(made: number, att: number): string {
  if (!att) return "—";
  return `${Math.round((100 * made) / att)}%`;
}

/** True shooting percentage from points, field-goal attempts, and free-throw attempts. */
export function trueShooting(pts: number, fga: number, fta: number): string {
  const denom = 2 * (fga + 0.44 * fta);
  if (denom <= 0) return "—";
  return `${Math.round((100 * pts) / denom)}%`;
}

/** Possessions estimated from a box: FGA + turnovers + 0.44×FTA − offensive rebounds. */
export function estimatePossessions(fga: number, tov: number, fta: number, orb: number): number {
  return fga + tov + 0.44 * fta - orb;
}

export function outLabel(line: { suspended?: boolean; ejectReason?: string; ejected?: boolean; fouledOut?: boolean }): string {
  if (line.suspended) return "Suspended";
  if (line.ejected || line.fouledOut) return "Ejected";
  return "";
}

export function outWhy(line: { suspended?: boolean; suspendReason?: string; ejectReason?: string; fouledOut?: boolean; tech?: number; flagrant?: number }): string {
  if (line.suspended) return line.suspendReason ?? "Suspended for this game";
  if (line.ejectReason === "technicals") return "two technicals";
  if (line.ejectReason === "flagrant") return "flagrant foul";
  if (line.ejectReason === "fouls" || line.fouledOut) return "six fouls";
  const parts: string[] = [];
  if ((line.tech ?? 0) > 0) parts.push((line.tech ?? 0) === 1 ? "technical" : `${line.tech} technicals`);
  if ((line.flagrant ?? 0) > 0) parts.push((line.flagrant ?? 0) === 1 ? "flagrant" : `${line.flagrant} flagrants`);
  return parts.join(", ");
}

export function shotLine(made: number, att: number): string {
  return `${made}-${att}`;
}

export function signed(n: number): string {
  if (n > 0) return `+${n}`;
  return String(n);
}

export function finishName(place: number | undefined): string {
  if (!place) return "In the field";
  if (place === 1) return "Champion";
  if (place === 2) return "Finalist";
  if (place === 3) return "Third";
  if (place === 4) return "Fourth";
  if (place <= 8) return "Quarterfinal";
  if (place <= 16) return "Round of 16";
  return "Group stage";
}

export function kindLabel(kind: string): string {
  if (kind === "overflow") return "Overflow";
  if (kind === "homeland") return "Homeland";
  if (kind === "construct") return "Construct";
  if (kind === "concord") return "Concord";
  return "Country";
}

/** Region, or the overflow house number, when that word is not already the kind. */
export function placeLine(team: { kind: string; region: string; overflowRank?: number }): string | null {
  if (team.overflowRank) return `House ${team.overflowRank}`;
  if (team.region.toLowerCase() === kindLabel(team.kind).toLowerCase()) return null;
  return team.region;
}
