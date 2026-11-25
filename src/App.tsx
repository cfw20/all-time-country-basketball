import { Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell";
import { Atlas } from "./pages/Atlas";
import { Awards } from "./pages/Awards";
import { Bracket } from "./pages/Bracket";
import { Events } from "./pages/Events";
import { GamePage } from "./pages/Game";
import { Home } from "./pages/Home";
import { Leaders } from "./pages/Leaders";
import { PlayerPage } from "./pages/Player";
import { Players } from "./pages/Players";
import { Rivalries } from "./pages/Rivalries";
import { Rules } from "./pages/Rules";
import { Schedule } from "./pages/Schedule";
import { Siege } from "./pages/Siege";
import { Standings } from "./pages/Standings";
import { TeamPage } from "./pages/Team";
import { Teams } from "./pages/Teams";
import { Trials } from "./pages/Trials";
import { Wire } from "./pages/Wire";

export function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Home />} />
        <Route path="standings" element={<Standings />} />
        <Route path="bracket" element={<Bracket />} />
        <Route path="siege" element={<Siege />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="games/:id" element={<GamePage />} />
        <Route path="teams" element={<Teams />} />
        <Route path="teams/:id" element={<TeamPage />} />
        <Route path="players" element={<Players />} />
        <Route path="players/:id" element={<PlayerPage />} />
        <Route path="awards" element={<Awards />} />
        <Route path="leaders" element={<Leaders />} />
        <Route path="events" element={<Events />} />
        <Route path="atlas" element={<Atlas />} />
        <Route path="rivalries" element={<Rivalries />} />
        <Route path="news" element={<Wire />} />
        <Route path="trials" element={<Trials />} />
        <Route path="rules" element={<Rules />} />
        <Route path="*" element={<Missing />} />
      </Route>
    </Routes>
  );
}

function Missing() {
  return (
    <main className="page">
      <p className="kicker">Off the floor</p>
      <h2 className="display" style={{ fontSize: 64 }}>That page is not in the book.</h2>
    </main>
  );
}
