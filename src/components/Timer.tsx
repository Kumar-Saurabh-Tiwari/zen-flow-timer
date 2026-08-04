import { useEffect, useMemo, useRef, useState } from "react";

interface TimerProps {
  title: string;
  duration: number;
  isActive: boolean;
  isPaused?: boolean;
  onComplete: () => void;
}

const formatTime = (total: number) => {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

export default function Timer({
  title,
  duration,
  isActive,
  isPaused = false,
  onComplete,
}: TimerProps) {
  const [remainingTime, setRemainingTime] = useState(duration);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    console.log("[dbg] duration effect", title, duration);
    setRemainingTime(duration);
  }, [duration]);

  useEffect(() => {
    console.log("[dbg] active effect", title, isActive, isPaused);
    if (!isActive) {
      setRemainingTime(duration);
      return;
    }
    if (isPaused) return;
    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => onCompleteRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isPaused]);

  const running = isActive && !isPaused;


  const progress = useMemo(
    () => (duration > 0 ? ((duration - remainingTime) / duration) * 100 : 0),
    [duration, remainingTime],
  );

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-1 items-center gap-5">
      <div className="relative grid size-[68px] shrink-0 place-items-center">
        <svg width="68" height="68" className="absolute inset-0">
          <circle
            stroke="var(--color-muted)"
            strokeWidth="4"
            fill="transparent"
            r={radius}
            cx="34"
            cy="34"
          />
          <circle
            stroke={isPaused ? "var(--color-destructive)" : "var(--color-primary)"}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx="34"
            cy="34"
            style={{
              transition: running
                ? "stroke-dashoffset 1s linear, stroke 0.3s ease-out"
                : "stroke-dashoffset 0.3s ease-out, stroke 0.3s ease-out",
              transform: "rotate(-90deg)",
              transformOrigin: "50% 50%",
            }}
          />
        </svg>
        <span className="relative text-xs font-semibold tabular-nums text-foreground">
          {formatTime(remainingTime)}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-base font-medium text-foreground">{title}</p>
          {isActive && (
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                isPaused
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-primary/15 text-primary"
              }`}
            >
              {isPaused ? "Paused" : "Running"}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
          {formatTime(remainingTime)} left of {formatTime(duration)}
        </p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full ${isPaused ? "bg-muted-foreground/60" : "bg-primary"}`}
            style={{
              width: `${progress}%`,
              transition: running ? "width 1s linear" : "width 0.3s ease-out",
            }}
          />
        </div>
      </div>

    </div>
  );
}
