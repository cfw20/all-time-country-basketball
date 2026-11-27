import { useState } from "react";
import { useVisit } from "../state/visit";

const STEPS: { title: string; body: string[] }[] = [
  {
    title: "Where everything is",
    body: [
      "This is a basketball floor under NBA rules. The primes are real people. The purse you meet at the end is made up, and it is not money.",
      "Home is this page. Play a game, Back a side, and How to play sit in the mast, in that order.",
      "Rankings is who is best. Teams holds every 22-man roster: five starters, two-ways, and a short deal.",
      "Games opens a series. A series is first to four.",
      "Play holds The Call, plus Horse, the Rack, the Stripe, the Poster, the Circuit, and Buzzer.",
      "Olympics is the draft of twelve primes. Season is the Unbroken Year.",
      "Compare, Trials, and Rules sit in the first row of buttons.",
      "Standings, Bracket, Siege, Honors, Leaders, Atlas, and Nights sit in the second row.",
    ],
  },
  {
    title: "Home, the board, a roster",
    body: [
      "Home shows this draw and who holds the floor.",
      "Rankings is the board before tip, then the series record.",
      "Open a team and read the book. Twenty-two real primes. Nobody on the card is invented.",
    ],
  },
  {
    title: "A series",
    body: [
      "From Games, open any series. First to four. Neutral floor. NBA rules.",
      "Open a night inside it. The score, the clock, the run, and who is in foul trouble are on that page. The box is the real one.",
    ],
  },
  {
    title: "Side games",
    body: [
      "Play is the hall. The Call is one NBA game, and you pick the two sides.",
      "Horse, the Rack, the Stripe, the Poster, the Circuit, and Buzzer are the six book games.",
      "Those nights stay off the country standings.",
    ],
  },
  {
    title: "Olympics, the year, and the rest",
    body: [
      "Olympics drafts twelve primes, at most three from one country. That side never enters the championship.",
      "The Unbroken Year opens after two championships and a series taken from the Construct.",
      "Compare sets two primes, or two sides, side by side. Trials reruns the championship. Rules is the NBA book.",
      "The second row is Standings, Bracket, Siege, Honors, Leaders, Atlas, and Nights. Interval and Wire are there too.",
    ],
  },
  {
    title: "This week",
    body: [
      "A short guide stays on the page until you have seen the board, a roster, and a night.",
      "Then you back a side. Following stays in the mast: the side, their series, and the latest game. The purse is made-up marks that live in this browser. They are not money. The stake does not change the games or the standings.",
      "How to play, in the mast, opens this tour again.",
    ],
  },
];

export function Tour() {
  const { tourOpen, dismissTour } = useVisit();
  if (!tourOpen) return null;
  return <TourCard onClose={dismissTour} />;
}

function TourCard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const last = step === STEPS.length - 1;
  return (
    <div className="tour-back">
      <div className="tour-card" role="dialog" aria-modal="true" aria-labelledby="tour-title">
        <div className="tour-top">
          <p className="kicker">Tour · {step + 1} of {STEPS.length}</p>
          <button type="button" className="tour-skip" onClick={onClose}>Skip</button>
        </div>
        <h2 id="tour-title">{current.title}</h2>
        {current.body.map((line) => <p key={line}>{line}</p>)}
        <div className="tour-actions">
          <button type="button" className="tour-back-btn" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}>Back</button>
          <button type="button" className="tour-next" onClick={() => (last ? onClose() : setStep((value) => value + 1))}>
            {last ? "Start this week" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
