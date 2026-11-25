import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Tournament } from "../data/types";
import { freshSeed } from "../engine/rng";
import { simulateTournament, simulateTrial, summarizeTournament, type TrialSummary } from "../engine/tournament";

const KEY = "pantheon-v2";

interface Saved {
  seed: number;
  through: number;
  trials: TrialSummary[];
}

function readSaved(): Saved {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { seed: 20261125, through: 8, trials: [] };
    const parsed = JSON.parse(raw) as Partial<Saved>;
    return {
      seed: typeof parsed.seed === "number" ? parsed.seed >>> 0 : 20261125,
      through: typeof parsed.through === "number" ? Math.max(0, Math.min(8, parsed.through)) : 8,
      trials: Array.isArray(parsed.trials) ? parsed.trials.slice(0, 200) : [],
    };
  } catch {
    return { seed: 20261125, through: 8, trials: [] };
  }
}

function dedupe(list: TrialSummary[]): TrialSummary[] {
  const seen = new Set<number>();
  const out: TrialSummary[] = [];
  for (const trial of list) {
    if (seen.has(trial.seed)) continue;
    seen.add(trial.seed);
    out.push(trial);
  }
  return out.slice(0, 200);
}

interface PantheonState {
  tournament: Tournament;
  trials: TrialSummary[];
  busy: boolean;
  progress: string;
  newDraw: () => void;
  replay: () => void;
  simNext: () => void;
  simRest: () => void;
  runTrials: (count: number) => void;
  loadSeed: (seed: number) => void;
}

const Ctx = createContext<PantheonState | null>(null);

export function PantheonProvider({ children }: { children: ReactNode }) {
  const saved = useMemo(readSaved, []);
  const [seed, setSeed] = useState(saved.seed);
  const [through, setThrough] = useState(saved.through);
  const [trials, setTrials] = useState<TrialSummary[]>(saved.trials);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");

  const tournament = useMemo(
    () => simulateTournament(seed, { through, log: true, exhibitions: true }),
    [seed, through],
  );

  useEffect(() => {
    if (tournament.through < 8 || !tournament.awards) return;
    setTrials((prev) => {
      if (prev.some((trial) => trial.seed === tournament.seed)) return prev;
      return dedupe([summarizeTournament(tournament), ...prev]);
    });
  }, [tournament]);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify({ seed, through, trials }));
  }, [seed, through, trials]);

  const api = useMemo<PantheonState>(() => ({
    tournament,
    trials,
    busy,
    progress,
    newDraw: () => {
      if (busy) return;
      setSeed(freshSeed());
      setThrough(0);
    },
    replay: () => {
      if (busy) return;
      setThrough(0);
    },
    simNext: () => {
      if (busy) return;
      setThrough((value) => Math.min(8, value + 1));
    },
    simRest: () => {
      if (busy) return;
      setThrough(8);
    },
    loadSeed: (next: number) => {
      if (busy) return;
      setSeed(next >>> 0);
      setThrough(8);
    },
    runTrials: (count: number) => {
      if (busy || count <= 0) return;
      const seeds: number[] = [];
      for (let i = 0; i < count; i++) seeds.push(freshSeed());
      setBusy(true);
      setProgress(`1 of ${count}`);
      let index = 0;
      const step = () => {
        const summary = simulateTrial(seeds[index]);
        index += 1;
        setTrials((prev) => dedupe([summary, ...prev]));
        if (index < count) {
          setProgress(`${index + 1} of ${count}`);
          window.setTimeout(step, 0);
        } else {
          setBusy(false);
          setProgress("");
        }
      };
      window.setTimeout(step, 0);
    },
  }), [tournament, trials, busy, progress]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function usePantheon(): PantheonState {
  const value = useContext(Ctx);
  if (!value) throw new Error("Pantheon store is missing");
  return value;
}
