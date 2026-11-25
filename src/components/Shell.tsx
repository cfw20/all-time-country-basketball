import { Link, NavLink, Outlet } from "react-router-dom";
import { formatSeed } from "../engine/rng";
import { STAGE_LABELS } from "../engine/tournament";
import { usePantheon } from "../state/store";

const LINKS = [
  ["/", "Floor"],
  ["/standings", "Groups"],
  ["/bracket", "Bracket"],
  ["/siege", "Siege"],
  ["/schedule", "Games"],
  ["/teams", "Sides"],
  ["/players", "Players"],
  ["/awards", "Honors"],
  ["/leaders", "Leaders"],
  ["/events", "Interval"],
  ["/atlas", "Atlas"],
  ["/rivalries", "Nights"],
  ["/news", "Wire"],
  ["/trials", "Trials"],
  ["/rules", "Rules"],
];

export function Shell() {
  const { tournament, busy, progress, newDraw, replay, simNext, simRest } = usePantheon();
  const done = tournament.through >= 9;
  return (
    <div className="shell">
      <div className="sky" aria-hidden="true">
        <span className="orb orb-a" />
        <span className="orb orb-b" />
        <span className="orb orb-c" />
        <svg className="constellation" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <g fill="none" stroke="rgba(246,234,215,0.35)" strokeWidth="1">
            <path d="M80 140 L210 90 L260 210 L140 250 Z" />
            <path d="M860 80 L980 160 L910 280 L760 220 Z" />
            <path d="M640 520 L760 470 L820 610 L680 660 Z" />
          </g>
          <g fill="#f6ead7">
            <circle cx="80" cy="140" r="2.2" />
            <circle cx="210" cy="90" r="2.2" />
            <circle cx="260" cy="210" r="2.2" />
            <circle cx="140" cy="250" r="2.2" />
            <circle cx="860" cy="80" r="2.2" />
            <circle cx="980" cy="160" r="2.2" />
            <circle cx="910" cy="280" r="2.2" />
            <circle cx="760" cy="220" r="2.2" />
            <circle cx="640" cy="520" r="2.2" />
            <circle cx="760" cy="470" r="2.2" />
            <circle cx="820" cy="610" r="2.2" />
            <circle cx="680" cy="660" r="2.2" />
          </g>
        </svg>
      </div>
      <header className="mast">
        <Link className="brand" to="/">
          <p className="kicker">Private commission · NBA rules</p>
          <h1>Pan<em>theon</em></h1>
        </Link>
        <nav className="nav">
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => (isActive ? "active" : "")}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <Outlet />
      <footer className="dock">
        <div className="stage">
          <span className="kicker">Draw {formatSeed(tournament.seed)}</span>
          <strong>{busy ? progress || "Running trials" : STAGE_LABELS[tournament.through]}</strong>
        </div>
        <div className="actions">
          <button type="button" onClick={newDraw} disabled={busy}>New draw</button>
          <button type="button" onClick={replay} disabled={busy || tournament.through === 0}>Replay draw</button>
          <button type="button" onClick={simNext} disabled={busy || done}>Sim round</button>
          <button type="button" className="solid" onClick={simRest} disabled={busy || done}>Sim the rest</button>
        </div>
      </footer>
    </div>
  );
}
