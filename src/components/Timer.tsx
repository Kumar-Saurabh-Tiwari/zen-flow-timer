import { useEffect, useRef, useState } from "react";

interface TimerProps {
  title: string;
  duration: number;
  isActive: boolean;
  onComplete: () => void;
}

const formatTime = (total: number) => {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

export default function Timer({ title, duration, isActive, onComplete }: TimerProps) {
  const [remainingTime, setRemainingTime] = useState(duration);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isActive) setRemainingTime(duration);
  }, [duration, isActive]);

  useEffect(() => {
    if (!isActive) return;
    setRemainingTime(duration);
    const id = setInterval(() => {
      setRemainingTime((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(id);
  }, [isActive, duration]);

  useEffect(() => {
    if (isActive && remainingTime === 0) onCompleteRef.current();
  }, [isActive, remainingTime]);

  const progress = duration > 0 ? ((duration - remainingTime) / duration) * 100 : 0;

  return (
    <div className="flex flex-1 items-center gap-5">
      <div
        className="relative grid size-16 shrink-0 place-items-center rounded-full transition-colors"
        style={{
          background: `conic-gradient(var(--color-primary) ${progress * 3.6}deg, var(--color-muted) 0deg)`,
        }}
      >
        <div className="grid size-13 place-items-center rounded-full bg-card text-xs font-semibold tabular-nums text-foreground">
          {formatTime(remainingTime)}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
          {formatTime(remainingTime)} left of {formatTime(duration)}
        </p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
