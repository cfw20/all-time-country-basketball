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
  return "Country";
}
