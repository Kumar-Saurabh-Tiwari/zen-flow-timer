import { useEffect, useMemo, useRef, useState } from "react";

interface TimerProps {
  id: string;
  title: string;
  duration: number;
  isActive: boolean;
  isPaused?: boolean;
  onComplete: () => void;
}

/**
 * Survives reorder-driven remounts so a running block keeps its exact second.
 */
const remainingCache = new Map<string, { duration: number; remaining: number }>();

const formatTime = (total: number) => {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export default function Timer({
  id,
  title,
  duration,
  isActive,
  isPaused = false,
  onComplete,
}: TimerProps) {
  const [remainingTime, setRemainingTime] = useState(() => {
    const cached = remainingCache.get(id);
    return cached && cached.duration === duration ? cached.remaining : duration;
  });
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    remainingCache.set(id, { duration, remaining: remainingTime });
  }, [id, duration, remainingTime]);

  const durationRef = useRef(duration);
  useEffect(() => {
    if (durationRef.current === duration) return;
    durationRef.current = duration;
    setRemainingTime(duration);
  }, [duration]);

  useEffect(() => {
    if (!isActive) {
      setRemainingTime(duration);
      remainingCache.delete(id);
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

  const size = 96;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-1 min-w-0 items-center gap-5">
      <div className="relative flex h-[130px] w-[130px] min-w-[130px] shrink-0 items-center justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0"
          preserveAspectRatio="xMidYMid meet"
        >
          <circle
            stroke="var(--color-muted)"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            stroke={isPaused ? "var(--color-destructive)" : "var(--color-primary)"}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            style={{
              transition: running
                ? "stroke-dashoffset 1s linear, stroke 0.3s ease-out"
                : "stroke-dashoffset 0.3s ease-out, stroke 0.3s ease-out",
              transform: "rotate(-90deg)",
              transformOrigin: "50% 50%",
            }}
          />
        </svg>
        <span className="relative text-4xl font-extrabold leading-none tracking-tight tabular-nums text-foreground">
          {formatTime(remainingTime)}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-2xl font-medium text-foreground">{title}</p>
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
        <p className="mt-1 text-xl tabular-nums text-muted-foreground">
          {formatTime(remainingTime)} left of {formatTime(duration)}
        </p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full ${isPaused ? "bg-muted-foreground/60" : "bg-primary"}`}
            style={{
              width: `${Math.min(Math.max(progress, 0), 100)}%`,
              transition: running ? "width 1s linear" : "width 0.3s ease-out",
            }}
          />
        </div>
      </div>
    </div>
  );
}
