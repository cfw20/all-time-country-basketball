import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { TEAM_BY_ID } from "../data";
import type { SeriesResult, Tournament } from "../data/types";
import { seriesRecord } from "../engine/series";
import { usePantheon } from "./store";
import { GUIDE_KEY, STAKE_KEY, TOUR_KEY } from "./visitKeys";

export const STAKE_AMOUNTS = [100, 250, 500] as const;
const OPENING_PURSE = 1000;

export type GuideFlags = {
  rankings: boolean;
  team: boolean;
  play: boolean;
  done: boolean;
};

export type Ticket = {
  seed: number;
  teamId: string;
  amount: number;
  seriesId: string | null;
  settled: boolean;
  won: boolean;
  sentence: string;
};

export type StakeBook = {
  purse: number;
  last: string;
  settledKeys: string[];
  ticket: Ticket | null;
};

type VisitApi = {
  tourOpen: boolean;
  seen: boolean;
  guide: GuideFlags;
  guideStep: "rankings" | "team" | "play" | "stake";
  stake: StakeBook;
  openTour: () => void;
  dismissTour: () => void;
  place: (teamId: string, amount: number) => void;
  stakeLine: (series: SeriesResult) => string | null;
};

const Ctx = createContext<VisitApi | null>(null);

export function openingSeries(tournament: Tournament, teamId: string): SeriesResult | undefined {
  return tournament.series.find(
    (series) => !series.exhibition && (series.homeId === teamId || series.awayId === teamId),
  );
}

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function readSeen(): boolean {
  const parsed = readJson(TOUR_KEY);
  return Boolean(parsed && typeof parsed === "object" && "seen" in parsed && (parsed as { seen?: unknown }).seen);
}

function readGuide(): GuideFlags {
  const empty: GuideFlags = { rankings: false, team: false, play: false, done: false };
  const parsed = readJson(GUIDE_KEY);
  if (!parsed || typeof parsed !== "object") return empty;
  const row = parsed as Partial<GuideFlags>;
  return {
    rankings: Boolean(row.rankings),
    team: Boolean(row.team),
    play: Boolean(row.play),
    done: Boolean(row.done),
  };
}

function readTicket(value: unknown): Ticket | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<Ticket>;
  if (typeof row.teamId !== "string" || typeof row.amount !== "number" || typeof row.seed !== "number") return null;
  const team = TEAM_BY_ID[row.teamId];
  if (!team || team.kind === "construct") return null;
  if (!Number.isFinite(row.amount) || row.amount <= 0) return null;
  return {
    seed: row.seed >>> 0,
    teamId: row.teamId,
    amount: Math.round(row.amount),
    seriesId: typeof row.seriesId === "string" ? row.seriesId : null,
    settled: Boolean(row.settled),
    won: Boolean(row.won),
    sentence: typeof row.sentence === "string" ? row.sentence.slice(0, 400) : "",
  };
}

function readStake(): StakeBook {
  const empty: StakeBook = { purse: OPENING_PURSE, last: "", settledKeys: [], ticket: null };
  const parsed = readJson(STAKE_KEY);
  if (!parsed || typeof parsed !== "object") return empty;
  const row = parsed as Partial<StakeBook>;
  const purse = typeof row.purse === "number" && Number.isFinite(row.purse) ? Math.max(0, Math.round(row.purse)) : OPENING_PURSE;
  return {
    purse,
    last: typeof row.last === "string" ? row.last.slice(0, 400) : "",
    settledKeys: Array.isArray(row.settledKeys) ? row.settledKeys.filter((key) => typeof key === "string").slice(-24) : [],
    ticket: readTicket(row.ticket),
  };
}

function settlementSentence(name: string, won: boolean, wins: number, losses: number, amount: number, purse: number): string {
  const marks = amount.toLocaleString("en-US");
  const bank = purse.toLocaleString("en-US");
  if (won) {
    return `${name} won the series ${wins}–${losses}, so your ${marks} marks come back doubled and the purse is ${bank}.`;
  }
  return `${name} lost the series ${wins}–${losses}, so the ${marks} marks stay in the book and the purse is ${bank}.`;
}

export function applySeries(prev: StakeBook, tournament: Tournament): StakeBook {
  const ticket = prev.ticket;
  if (!ticket) return prev;
  if (ticket.seed !== tournament.seed && ticket.settled) {
    return {
      purse: prev.purse,
      last: ticket.sentence || prev.last,
      settledKeys: prev.settledKeys,
      ticket: null,
    };
  }
  const live: Ticket = ticket.seed === tournament.seed ? ticket : { ...ticket, seed: tournament.seed, seriesId: null, sentence: "" };
  const series = openingSeries(tournament, live.teamId);
  if (!series) {
    if (!live.settled) {
      if (live === ticket) return prev;
      return { ...prev, ticket: live };
    }
    const purse = Math.max(0, live.won ? prev.purse - live.amount * 2 : prev.purse);
    const key = `${live.seed}:${live.seriesId ?? ""}`;
    return {
      purse,
      last: "",
      settledKeys: prev.settledKeys.filter((item) => item !== key),
      ticket: { ...live, seriesId: null, settled: false, won: false, sentence: "" },
    };
  }
  const key = `${tournament.seed}:${series.id}`;
  if (live.settled && live.seriesId === series.id) return live === ticket ? prev : { ...prev, ticket: live };
  if (prev.settledKeys.includes(key)) {
    if (!live.settled) {
      return { ...prev, purse: prev.purse + live.amount, ticket: null };
    }
    const sentence = live.sentence || prev.last;
    return {
      ...prev,
      last: sentence,
      ticket: { ...live, seriesId: series.id, settled: true, won: series.winnerId === live.teamId, sentence },
    };
  }
  const won = series.winnerId === live.teamId;
  const record = seriesRecord(series);
  const name = TEAM_BY_ID[live.teamId]?.name ?? live.teamId;
  const purse = won ? prev.purse + live.amount * 2 : prev.purse;
  const sentence = settlementSentence(name, won, record.winnerWins, record.loserWins, live.amount, purse);
  return {
    purse,
    last: sentence,
    settledKeys: prev.settledKeys.concat(key).slice(-24),
    ticket: { ...live, seed: tournament.seed, seriesId: series.id, settled: true, won, sentence },
  };
}

export function tryPlace(prev: StakeBook, tournament: Tournament, teamId: string, amount: number): StakeBook {
  if (prev.ticket?.settled) return prev;
  if (!STAKE_AMOUNTS.includes(amount as (typeof STAKE_AMOUNTS)[number])) return prev;
  const team = TEAM_BY_ID[teamId];
  if (!team || team.kind === "construct") return prev;
  const series = openingSeries(tournament, teamId);
  if (series && prev.settledKeys.includes(`${tournament.seed}:${series.id}`)) return prev;
  const refund = prev.ticket && !prev.ticket.settled ? prev.ticket.amount : 0;
  const purse = prev.purse + refund;
  if (purse < amount) return prev;
  return {
    ...prev,
    purse: purse - amount,
    ticket: {
      seed: tournament.seed,
      teamId,
      amount,
      seriesId: null,
      settled: false,
      won: false,
      sentence: "",
    },
  };
}

function lineFor(stake: StakeBook, tournament: Tournament, series: SeriesResult): string | null {
  const ticket = stake.ticket;
  if (!ticket) return null;
  if (ticket.teamId !== series.homeId && ticket.teamId !== series.awayId) return null;
  if (series.exhibition) return null;
  if (ticket.settled && ticket.seriesId === series.id) return ticket.sentence;
  if (ticket.settled) return null;
  const opening = openingSeries(tournament, ticket.teamId);
  if (opening && opening.id !== series.id) return null;
  const name = TEAM_BY_ID[ticket.teamId]?.name ?? ticket.teamId;
  return `Backing ${name} for ${ticket.amount.toLocaleString("en-US")} marks. This series has not settled, and you can still change the side on Home.`;
}

export function guideStepOf(flags: GuideFlags): VisitApi["guideStep"] {
  if (!flags.rankings) return "rankings";
  if (!flags.team) return "team";
  if (!flags.play) return "play";
  return "stake";
}

export function VisitProvider({ children }: { children: ReactNode }) {
  const { tournament } = usePantheon();
  const location = useLocation();
  const [seen, setSeen] = useState(readSeen);
  const [tourOpen, setTourOpen] = useState(() => !readSeen());
  const [guide, setGuide] = useState(readGuide);
  const [stake, setStake] = useState(readStake);
  const tournamentRef = useRef(tournament);
  tournamentRef.current = tournament;

  useEffect(() => {
    setStake((prev) => applySeries(prev, tournament));
  }, [tournament]);

  useEffect(() => {
    localStorage.setItem(STAKE_KEY, JSON.stringify(stake));
  }, [stake]);

  useEffect(() => {
    localStorage.setItem(GUIDE_KEY, JSON.stringify(guide));
  }, [guide]);

  useEffect(() => {
    if (!seen || tourOpen) return;
    const path = location.pathname;
    setGuide((prev) => {
      const next: GuideFlags = { ...prev };
      if (path.startsWith("/rankings")) next.rankings = true;
      if (path === "/teams" || path.startsWith("/teams/")) next.team = true;
      if (path.startsWith("/play")) next.play = true;
      if (next.rankings === prev.rankings && next.team === prev.team && next.play === prev.play && next.done === prev.done) return prev;
      return next;
    });
  }, [location.pathname, seen, tourOpen]);

  const api: VisitApi = {
    tourOpen,
    seen,
    guide,
    guideStep: guideStepOf(guide),
    stake,
    openTour: () => setTourOpen(true),
    dismissTour: () => {
      localStorage.setItem(TOUR_KEY, JSON.stringify({ seen: true }));
      setSeen(true);
      setTourOpen(false);
    },
    place: (teamId, amount) => {
      let placed = false;
      setStake((prev) => {
        const drafted = tryPlace(prev, tournamentRef.current, teamId, amount);
        placed = drafted !== prev;
        return applySeries(drafted, tournamentRef.current);
      });
      if (placed) setGuide((prev) => (prev.done ? prev : { ...prev, done: true }));
    },
    stakeLine: (series) => lineFor(stake, tournament, series),
  };

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useVisit(): VisitApi {
  const value = useContext(Ctx);
  if (!value) throw new Error("Visit store is missing");
  return value;
}
