import { useEffect, useState } from "react";

const SIZE = 200;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreRing({ score }: { score: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setDisplay(score));
    return () => cancelAnimationFrame(id);
  }, [score]);

  const pct = Math.max(0, Math.min(100, display)) / 100;
  const offset = CIRCUMFERENCE * (1 - pct);

  return (
    <div className="relative mx-auto h-[200px] w-[200px]">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full -rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--crimson)"
          strokeOpacity="0.15"
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--rose)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="numeric font-display text-6xl leading-none text-primary">{score}</p>
        <p className="mt-1 text-sm text-muted-foreground">out of 100</p>
      </div>
    </div>
  );
}
