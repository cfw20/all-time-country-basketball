import { Link } from "react-router-dom";
import { CONCORD_ID, playerById, sideById } from "../data";
import type { Team } from "../data/types";

export function Mark({ team, size = 36 }: { team: Team; size?: number }) {
  const c = team.colors.primary;
  const s = team.colors.secondary;
  const common = { width: size, height: size, viewBox: "0 0 48 48", "aria-hidden": true as const };
  if (team.mark === "shield") {
    return (
      <svg {...common}>
        <path d="M24 4 40 10v14c0 10-7 16-16 20C15 40 8 34 8 24V10Z" fill={s} />
        <path d="M24 8 36 13v11c0 8-5.2 13-12 16.4C17.2 37 12 32 12 24V13Z" fill="none" stroke={c} strokeWidth="1.6" />
      </svg>
    );
  }
  if (team.mark === "diamond") {
    return (
      <svg {...common}>
        <path d="M24 4 44 24 24 44 4 24Z" fill={s} />
        <path d="M24 11 37 24 24 37 11 24Z" fill="none" stroke={c} strokeWidth="1.6" />
      </svg>
    );
  }
  if (team.mark === "arch") {
    return (
      <svg {...common}>
        <path d="M8 42V20a16 16 0 0 1 32 0v22" fill="none" stroke={c} strokeWidth="2.2" />
        <path d="M18 42V26a6 6 0 0 1 12 0v16" fill={s} />
      </svg>
    );
  }
  if (team.mark === "bars") {
    return (
      <svg {...common}>
        <rect x="8" y="10" width="6" height="28" fill={c} />
        <rect x="21" y="6" width="6" height="32" fill={s} />
        <rect x="34" y="14" width="6" height="24" fill={c} />
      </svg>
    );
  }
  if (team.mark === "lattice") {
    return (
      <svg {...common}>
        <rect x="7" y="7" width="34" height="34" fill="none" stroke={c} strokeWidth="1.6" />
        <path d="M7 24h34M24 7v34M7 7l34 34M41 7 7 41" stroke={s} strokeWidth="1.15" />
        <circle cx="24" cy="24" r="3.2" fill={c} />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="24" cy="24" r="16" fill="none" stroke={c} strokeWidth="2" />
      <circle cx="24" cy="24" r="7" fill="none" stroke={s} strokeWidth="2" />
      <circle cx="24" cy="24" r="2" fill={c} />
    </svg>
  );
}

export function SideLink({ id, score, dim }: { id: string; score?: number; dim?: boolean }) {
  const team = sideById(id);
  if (!team) return <span>{id}</span>;
  const to = team.id === CONCORD_ID ? "/siege" : `/teams/${team.id}`;
  return (
    <Link to={to} className={`side${dim ? " dim" : ""}`}>
      <i style={{ background: team.colors.primary }} />
      <Mark team={team} size={28} />
      <span>
        <strong>{team.name}</strong>
        <em>{team.code}</em>
      </span>
      {score !== undefined && <b className="mono">{score}</b>}
    </Link>
  );
}

export function PlayerLink({ id }: { id: string }) {
  const player = playerById(id);
  if (!player) return <span>{id}</span>;
  return <Link to={`/players/${player.id}`}>{player.name}</Link>;
}
