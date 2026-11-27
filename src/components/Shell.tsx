import { Link, NavLink, Outlet } from "react-router-dom";
import { formatSeed } from "../engine/rng";
import { STAGE_LABELS } from "../engine/tournament";
import { usePantheon } from "../state/store";
import { useVisit } from "../state/visit";
import { FollowBar } from "./StakeDesk";
import { Guide } from "./Guide";
import { Tour } from "./Tour";

const PRIMARY = [
  ["/", "Home"],
  ["/rankings", "Rankings"],
  ["/compare", "Compare"],
  ["/teams", "Teams"],
  ["/players", "Players"],
  ["/play", "Play"],
  ["/season", "Season"],
  ["/olympics", "Olympics"],
  ["/trials", "Trials"],
  ["/rules", "Rules"],
];

const SECONDARY = [
  ["/standings", "Standings"],
  ["/bracket", "Bracket"],
  ["/siege", "Siege"],
  ["/schedule", "Games"],
  ["/awards", "Honors"],
  ["/leaders", "Leaders"],
  ["/atlas", "Atlas"],
  ["/rivalries", "Nights"],
  ["/events", "Interval"],
  ["/news", "Wire"],
];

export function Shell() {
  const { tournament, busy, progress, newDraw, replay, simNext, simRest } = usePantheon();
  const { openTour } = useVisit();
  const done = tournament.through >= 9;
  return (
    <div className="shell">
      <div className="sky" aria-hidden="true">
        <span className="orb orb-a" />
        <span className="orb orb-b" />
        <span className="orb orb-c" />
        <span className="orb orb-d" />
        <span className="orb orb-e" />
        <span className="comet" />
        <span className="shard" />
        <span className="gate" />
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
            <path d="M980 460 L1050 590" />
            <path d="M1110 410 L1180 540" />
          </g>
          <g fill="none" stroke="rgba(231,194,122,0.28)" strokeWidth="1">
            <path d="M620 120 L700 70 L760 150 L660 190 Z" />
            <path d="M300 160 C 420 90, 560 140, 640 80" />
          </g>
          <g fill="none" stroke="rgba(143,208,198,0.28)" strokeWidth="1">
            <ellipse cx="860" cy="240" rx="70" ry="22" transform="rotate(-20 860 240)" />
            <circle cx="860" cy="240" r="16" />
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
            <circle cx="700" cy="70" r="1.6" />
            <circle cx="760" cy="150" r="1.3" />
            <circle cx="620" cy="120" r="1.2" />
            <circle cx="860" cy="224" r="1.5" />
            <circle cx="210" cy="96" r="1.2" />
            <circle cx="990" cy="210" r="1.1" />
            <circle cx="150" cy="300" r="1.3" />
            <circle cx="1180" cy="280" r="1.2" />
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
        <div className="mast-top">
          <Link className="brand" to="/">
            <span className="sigil" aria-hidden="true" />
            <span className="brand-name">
              <p className="kicker">Private commission · NBA rules</p>
              <h1>Pan<em>theon</em></h1>
            </span>
          </Link>
          <div className="mast-actions">
            <Link to="/play/call" className="arrival-go">Play a game</Link>
            <Link to={{ pathname: "/", hash: "back-a-side" }} className="arrival-next">Back a side</Link>
            <button type="button" className="how-to" onClick={openTour}>How to play</button>
          </div>
        </div>
        <nav className="site-nav" aria-label="Pages">
          <div className="nav-row">
            {PRIMARY.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => (isActive ? "active" : "")}>
                {label}
              </NavLink>
            ))}
          </div>
          <div className="nav-row secondary">
            {SECONDARY.map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => (isActive ? "active" : "")}>
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
        <FollowBar />
      </header>
      <Guide />
      <Outlet />
      <Tour />
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
