import { Link } from "react-router-dom";
import { useVisit } from "../state/visit";

const COPY = {
  rankings: {
    text: "This week: learn the book. Rankings is who is best before tip.",
    to: "/rankings",
    label: "Open rankings",
  },
  team: {
    text: "This week: look at a side. Every roster is 22 real primes.",
    to: "/teams",
    label: "Open teams",
  },
  play: {
    text: "This week: start a night. The Call is one NBA game. Horse and the six book games are in Play.",
    to: "/play",
    label: "Open Play",
  },
  stake: {
    text: "This week: back a side. The purse is made-up marks in this browser. They are not money.",
    to: { pathname: "/", hash: "back-a-side" },
    label: "Back a side",
  },
} as const;

export function Guide() {
  const { seen, tourOpen, guide, guideStep } = useVisit();
  if (!seen || tourOpen || guide.done) return null;
  const step = COPY[guideStep];
  return (
    <div className="guide-card">
      <div className="inner">
        <p>{step.text}</p>
        <Link to={step.to}>{step.label}</Link>
      </div>
    </div>
  );
}
