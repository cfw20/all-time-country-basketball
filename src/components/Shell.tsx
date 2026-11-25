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
        <span className="horizon" />
        <svg className="constellation" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <g fill="none" stroke="rgba(201,182,255,0.4)" strokeWidth="1.1">
            <circle cx="170" cy="740" r="168" />
            <circle cx="170" cy="740" r="104" />
            <ellipse cx="170" cy="740" rx="168" ry="58" transform="rotate(-26 170 740)" />
          </g>
          <g fill="none" stroke="rgba(231,194,122,0.36)" strokeWidth="1.15">
            <path d="M40 700 C 260 600, 520 640, 760 560" />
            <path d="M880 800 C 1100 720, 1300 760, 1520 680" />
          </g>
          <g fill="none" stroke="rgba(159,214,255,0.36)" strokeWidth="1">
            <path d="M1080 70 C 1200 10, 1380 60, 1340 180" />
            <ellipse cx="1240" cy="150" rx="190" ry="58" transform="rotate(-18 1240 150)" />
          </g>
          <g fill="none" stroke="rgba(240,167,181,0.32)" strokeWidth="1">
            <path d="M980 460 L1110 410 L1180 540 L1050 590 Z" />
          </g>
          <g fill="#f6ead7">
            <circle cx="260" cy="412" r="2" />
            <circle cx="62" cy="610" r="1.6" />
            <circle cx="458" cy="610" r="1.5" />
            <circle cx="260" cy="808" r="1.4" />
            <circle cx="680" cy="320" r="1.8" />
            <circle cx="980" cy="460" r="1.7" />
            <circle cx="1110" cy="410" r="1.5" />
            <circle cx="1180" cy="540" r="1.6" />
            <circle cx="1050" cy="590" r="1.4" />
            <circle cx="1240" cy="92" r="1.8" />
            <circle cx="90" cy="180" r="1.3" />
            <circle cx="540" cy="120" r="1.4" />
            <circle cx="760" cy="250" r="1.2" />
            <circle cx="420" cy="780" r="1.5" />
            <circle cx="1320" cy="360" r="1.4" />
          </g>
        </svg>
        <span className="vignette" />
        <span className="moon" />
        <span className="planet-well">
          <span className="planet" />
          <span className="rings" />
        </span>
      </div>
      <header className="mast">
        <Link className="brand" to="/">
          <span className="sigil" aria-hidden="true" />
          <span className="brand-name">
            <p className="kicker">Private commission · NBA rules</p>
            <h1>Pan<em>theon</em></h1>
          </span>
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
