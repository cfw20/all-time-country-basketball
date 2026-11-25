import { Link, NavLink, Outlet } from "react-router-dom";
import { formatSeed } from "../engine/rng";
import { STAGE_LABELS } from "../engine/tournament";
import { usePantheon } from "../state/store";

const LINKS = [
  ["/", "Floor"],
  ["/standings", "Groups"],
  ["/bracket", "Bracket"],
  ["/schedule", "Games"],
  ["/teams", "Sides"],
  ["/players", "Players"],
  ["/awards", "Honors"],
  ["/leaders", "Leaders"],
  ["/events", "Interval"],
  ["/news", "Wire"],
  ["/trials", "Trials"],
  ["/rules", "Rules"],
];

export function Shell() {
  const { tournament, busy, progress, newDraw, replay, simNext, simRest } = usePantheon();
  const done = tournament.through >= 8;
  return (
    <div className="shell">
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
