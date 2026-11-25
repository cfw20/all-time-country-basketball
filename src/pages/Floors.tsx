import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ScoreTable } from "../components/ScoreTable";
import {
  playDecade,
  playFive,
  playFortnight,
  playGauntlet,
  playHill,
  playOpen,
  playSurvivor,
  watchSeriesGame,
  type NightGame,
} from "../engine/floors";
import { freshSeed, formatSeed } from "../engine/rng";
import type { GameResult } from "../data/types";

function Shell({
  kicker,
  title,
  lede,
  onAgain,
  children,
  watched,
}: {
  kicker: string;
  title: string;
  lede: string;
  onAgain: () => void;
  children: ReactNode;
  watched: GameResult | null;
}) {
  return (
    <main className="page" data-floor="play">
      <p className="kicker">{kicker}</p>
      <h2 className="display" style={{ fontSize: 64 }}>{title}</h2>
      <p className="lede">{lede}</p>
      <div className="filters">
        <button className="solid" type="button" onClick={onAgain}>Play another</button>
        <Link className="text-btn" to="/play">All floors</Link>
      </div>
      {children}
      {watched ? <ScoreTable game={watched} /> : <p className="empty">Open a night for the line.</p>}
    </main>
  );
}

function GameButton({ game, on, open }: { game: NightGame; on: boolean; open: () => void }) {
  return (
    <button type="button" className={`panel door${on ? " on" : ""}`} onClick={open}>
      <span className="tag">{game.winnerName}</span>
      <h3>{game.awayScore}–{game.homeScore}</h3>
      <p>{game.awayName} at {game.homeName}{game.note ? ` · ${game.note}` : ""}</p>
    </button>
  );
}

export function Hill() {
  const [seed, setSeed] = useState(() => freshSeed());
  const [watch, setWatch] = useState<GameResult | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const night = useMemo(() => playHill(seed), [seed]);
  return (
    <Shell
      kicker={`Side floor · seed ${formatSeed(seed)}`}
      title={night.king}
      lede={`${night.king} is on the hill. ${night.longest.name} held it for ${night.longest.games} ${night.longest.games === 1 ? "night" : "nights"}. The winner stays. The last challenger is the Construct.`}
      onAgain={() => { setSeed(freshSeed()); setWatch(null); setOpen(null); }}
      watched={watch}
    >
      <div className="team-grid">
        {night.games.map((game, index) => (
          <GameButton key={game.label + index} game={game} on={open === index} open={() => { setOpen(index); setWatch(game.watch()); }} />
        ))}
      </div>
    </Shell>
  );
}

export function Gauntlet() {
  const [seed, setSeed] = useState(() => freshSeed());
  const [watch, setWatch] = useState<GameResult | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const night = useMemo(() => playGauntlet(seed), [seed]);
  return (
    <Shell
      kicker={`Side floor · seed ${formatSeed(seed)}`}
      title={night.climber}
      lede={`${night.climber} climbs seven rungs, from a mid-table side to the Construct. They cleared ${night.cleared} before a loss. Every rung is one NBA game.`}
      onAgain={() => { setSeed(freshSeed()); setWatch(null); setOpen(null); }}
      watched={watch}
    >
      <div className="team-grid">
        {night.games.map((game, index) => (
          <GameButton key={game.label} game={{ ...game, label: game.label }} on={open === index} open={() => { setOpen(index); setWatch(game.watch()); }} />
        ))}
      </div>
    </Shell>
  );
}

export function Decade() {
  const [seed, setSeed] = useState(() => freshSeed());
  const [watch, setWatch] = useState<GameResult | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const night = useMemo(() => playDecade(seed), [seed]);
  return (
    <Shell
      kicker={`Side floor · seed ${formatSeed(seed)}`}
      title={night.champion}
      lede="Every prime plays for the decade on the card. The cup is a round robin, then one final. The last line is that final."
      onAgain={() => { setSeed(freshSeed()); setWatch(null); setOpen(null); }}
      watched={watch}
    >
      <Table rows={night.rows} />
      <div className="team-grid">
        {night.games.map((game, index) => (
          <GameButton key={`${game.homeName}-${game.awayName}-${index}`} game={game} on={open === index} open={() => { setOpen(index); setWatch(game.watch()); }} />
        ))}
      </div>
    </Shell>
  );
}

export function OpenFloor() {
  const [seed, setSeed] = useState(() => freshSeed());
  const [watch, setWatch] = useState<GameResult | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const night = useMemo(() => playOpen(seed), [seed]);
  return (
    <Shell
      kicker={`Side floor · seed ${formatSeed(seed)}`}
      title={night.champion}
      lede="Sixteen field sides, one NBA game per night, loser out. The Construct stays in the championship. This floor is humans only."
      onAgain={() => { setSeed(freshSeed()); setWatch(null); setOpen(null); }}
      watched={watch}
    >
      {night.rounds.map((round) => (
        <section key={round.name} className="section">
          <h3>{round.name}</h3>
          <div className="team-grid">
            {round.games.map((game, index) => {
              const key = `${round.name}-${index}`;
              return <GameButton key={key} game={game} on={open === key} open={() => { setOpen(key); setWatch(game.watch()); }} />;
            })}
          </div>
        </section>
      ))}
    </Shell>
  );
}

export function Fortnight() {
  const [seed, setSeed] = useState(() => freshSeed());
  const [watch, setWatch] = useState<GameResult | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const night = useMemo(() => playFortnight(seed), [seed]);
  return (
    <Shell
      kicker={`Side floor · seed ${formatSeed(seed)}`}
      title={night.champion}
      lede={`Six sides, a round robin, then a best-of-seven between the top two. ${night.finalLabel ?? night.champion} took the final.`}
      onAgain={() => { setSeed(freshSeed()); setWatch(null); setOpen(null); }}
      watched={watch}
    >
      <Table rows={night.rows} />
      <section className="section">
        <h3>Final series · {night.finalLabel}</h3>
        <div className="team-grid">
          {night.series.games.map((game, index) => (
            <button key={game.id} type="button" className={`panel door${open === game.id ? " on" : ""}`} onClick={() => { setOpen(game.id); setWatch(watchSeriesGame(night.series, index)); }}>
              <span className="tag">Game {index + 1}</span>
              <h3>{game.awayScore}–{game.homeScore}</h3>
              <p>{game.awayName} at {game.homeName}</p>
            </button>
          ))}
        </div>
      </section>
      <section className="section">
        <h3>The week</h3>
        <div className="team-grid">
          {night.games.map((game, index) => (
            <GameButton key={`${game.homeName}-${index}`} game={game} on={open === `w${index}`} open={() => { setOpen(`w${index}`); setWatch(game.watch()); }} />
          ))}
        </div>
      </section>
    </Shell>
  );
}

export function Survivor() {
  const [seed, setSeed] = useState(() => freshSeed());
  const [watch, setWatch] = useState<GameResult | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const night = useMemo(() => playSurvivor(seed), [seed]);
  return (
    <Shell
      kicker={`Side floor · seed ${formatSeed(seed)}`}
      title={night.champion}
      lede="Eight sides. Each night the heaviest loss goes home. The last two play for the floor. A bye, when the field is odd, is safe."
      onAgain={() => { setSeed(freshSeed()); setWatch(null); setOpen(null); }}
      watched={watch}
    >
      {night.rounds.map((round) => (
        <section key={round.name} className="section">
          <h3>{round.name} · out: {round.out}</h3>
          <div className="team-grid">
            {round.games.map((game, index) => {
              const key = `${round.name}-${index}`;
              return <GameButton key={key} game={game} on={open === key} open={() => { setOpen(key); setWatch(game.watch()); }} />;
            })}
          </div>
        </section>
      ))}
    </Shell>
  );
}

export function Five() {
  const [seed, setSeed] = useState(() => freshSeed());
  const [watch, setWatch] = useState<GameResult | null>(null);
  const night = useMemo(() => playFive(seed), [seed]);
  return (
    <Shell
      kicker={`Side floor · seed ${formatSeed(seed)}`}
      title={`${night.game.winnerName} ${night.game.awayScore}–${night.game.homeScore}`}
      lede="Two fives, drawn from the whole human book, one at each position. One NBA game. Nobody keeps the teammates."
      onAgain={() => { setSeed(freshSeed()); setWatch(null); }}
      watched={watch}
    >
      <div className="paths">
        <article className="path"><strong>First five</strong><span>{night.home.join(", ")}</span></article>
        <article className="path"><strong>Second five</strong><span>{night.away.join(", ")}</span></article>
      </div>
      <div className="filters">
        <button className="solid" type="button" onClick={() => setWatch(night.game.watch())}>Open the line</button>
      </div>
    </Shell>
  );
}

function Table({ rows }: { rows: { name: string; w: number; l: number; diff: number }[] }) {
  return (
    <div className="panel" style={{ overflowX: "auto", margin: "18px 0" }}>
      <table>
        <thead>
          <tr><th>Side</th><th className="num">W</th><th className="num">L</th><th className="num">Diff</th></tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td>{row.name}</td>
              <td className="num">{row.w}</td>
              <td className="num">{row.l}</td>
              <td className="num">{row.diff > 0 ? `+${row.diff}` : row.diff}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
