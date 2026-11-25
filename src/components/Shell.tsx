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
  ["/season", "Season"],
  ["/play", "Play"],
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
        <span className="moon" />
        <span className="planet" />
        <span className="rings" />
        <svg className="constellation" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <g fill="none" stroke="rgba(159,214,255,0.35)" strokeWidth="1">
            <ellipse cx="240" cy="180" rx="180" ry="70" transform="rotate(-18 240 180)" />
            <ellipse cx="240" cy="180" rx="230" ry="90" transform="rotate(-8 240 180)" />
            <path d="M40 620 C 220 540, 380 700, 560 610 S 900 520, 1160 640" />
            <path d="M80 140 L210 90 L260 210 L140 250 Z" />
            <path d="M640 520 L760 470 L820 610 L680 660 Z" />
          </g>
          <g fill="none" stroke="rgba(231,194,122,0.45)" strokeWidth="1.2">
            <path d="M900 120 C 980 40, 1120 80, 1080 180 S 900 240, 860 160" />
            <path d="M120 300 C 200 260, 280 340, 220 400" />
          </g>
          <g fill="#f6ead7">
            <circle cx="80" cy="140" r="1.8" />
            <circle cx="210" cy="90" r="2.2" />
            <circle cx="260" cy="210" r="1.6" />
            <circle cx="140" cy="250" r="1.4" />
            <circle cx="640" cy="520" r="2" />
            <circle cx="760" cy="470" r="1.5" />
            <circle cx="820" cy="610" r="1.8" />
            <circle cx="680" cy="660" r="1.4" />
            <circle cx="480" cy="90" r="1.3" />
            <circle cx="520" cy="240" r="1.6" />
            <circle cx="70" cy="480" r="1.5" />
            <circle cx="980" cy="420" r="1.7" />
            <circle cx="1100" cy="300" r="1.4" />
            <circle cx="360" cy="640" r="1.5" />
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
