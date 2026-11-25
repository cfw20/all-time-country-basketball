import { Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell";
import { Atlas } from "./pages/Atlas";
import { Awards } from "./pages/Awards";
import { Bracket } from "./pages/Bracket";
import { Events } from "./pages/Events";
import { GamePage } from "./pages/Game";
import { Home } from "./pages/Home";
import { Leaders } from "./pages/Leaders";
import { Clash } from "./pages/Clash";
import { Decade, Five, Fortnight, Gauntlet, Hill, OpenFloor, Survivor } from "./pages/Floors";
import { Lamp } from "./pages/Lamp";
import { Play } from "./pages/Play";
import { PlayerPage } from "./pages/Player";
import { QuickSeries } from "./pages/QuickSeries";
import { Throne } from "./pages/Throne";
import { Players } from "./pages/Players";
import { Rivalries } from "./pages/Rivalries";
import { Rules } from "./pages/Rules";
import { Schedule } from "./pages/Schedule";
import { Season } from "./pages/Season";
import { SeriesPage } from "./pages/Series";
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
        <Route path="series/:id" element={<SeriesPage />} />
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
        <Route path="season" element={<Season />} />
        <Route path="play" element={<Play />} />
        <Route path="play/clash" element={<Clash />} />
        <Route path="play/series" element={<QuickSeries />} />
        <Route path="play/lamp" element={<Lamp />} />
        <Route path="play/throne" element={<Throne />} />
        <Route path="play/hill" element={<Hill />} />
        <Route path="play/gauntlet" element={<Gauntlet />} />
        <Route path="play/decade" element={<Decade />} />
        <Route path="play/open" element={<OpenFloor />} />
        <Route path="play/fortnight" element={<Fortnight />} />
        <Route path="play/survivor" element={<Survivor />} />
        <Route path="play/five" element={<Five />} />
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
