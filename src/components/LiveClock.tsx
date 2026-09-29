import { useEffect, useState } from "react";
import { formatInTimezone } from "@/lib/timezones";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function LiveClock({ timezone }: { timezone: string }) {
  const [now, setNow] = useState<Date | null>(null);

  const formatDate = (date: Date) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    } catch {
      return date.toLocaleDateString();
    }
  };

  const dateParts = now
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        day: "numeric",
        month: "numeric",
        year: "numeric",
      }).formatToParts(now)
    : [];
  const calendarDay = Number(dateParts.find((part) => part.type === "day")?.value ?? 1);
  const calendarMonth = Number(dateParts.find((part) => part.type === "month")?.value ?? 1);
  const calendarYear = Number(dateParts.find((part) => part.type === "year")?.value ?? 2026);
  const monthLabel = new Intl.DateTimeFormat(undefined, {
    timeZone: timezone,
    month: "long",
    year: "numeric",
  }).format(now ?? new Date());
  const daysInMonth = new Date(Date.UTC(calendarYear, calendarMonth, 0)).getUTCDate();
  const firstDayOffset = new Date(Date.UTC(calendarYear, calendarMonth - 1, 1)).getUTCDay();
  const calendarCells = Array.from(
    { length: firstDayOffset + daysInMonth },
    (_, index) => (index < firstDayOffset ? null : index - firstDayOffset + 1),
  );

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-[15px] font-medium tabular-nums text-muted-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:border-primary/40 hover:bg-card hover:text-foreground hover:shadow-md motion-reduce:transition-none"
          aria-label="Open date and time details"
        >
          <span className="size-1.5 animate-pulse rounded-full bg-primary" />
          <span className="font-sans text-sm font-medium tracking-tight tabular-nums text-foreground sm:text-base">
            {now ? formatInTimezone(now, timezone) : "--:--:--"}
          </span>
          <span className="font-sans text-xs font-medium tabular-nums tracking-tight text-foreground/65 sm:text-sm">
            {now ? formatDate(now) : "--- --, ----"}
          </span>
          <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/55">
            {timezone.split("/").pop()?.replace(/_/g, " ")}
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-hidden rounded-[28px] border-border/80 bg-card p-0 shadow-2xl sm:max-w-md">
        <div className="bg-gradient-warm px-6 py-5">
          <DialogHeader>
            <div className="flex items-center justify-between gap-4 pr-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Local time details
              </p>
              <span className="rounded-full border border-border/70 bg-card/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/60">
                Live
              </span>
            </div>
            <DialogTitle className="mt-4 font-sans text-3xl font-medium leading-none tabular-nums tracking-tight text-foreground">
              {now ? formatInTimezone(now, timezone) : "--:--:--"}
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm text-foreground/65">
              {now ? formatDate(now) : "Loading date"} <span className="px-1">·</span> {timezone.replace(/_/g, " ")}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-5">
          <div className="rounded-2xl border border-border bg-background/60 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-sans text-lg font-semibold tracking-tight text-foreground">{monthLabel}</h3>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                Today
              </span>
            </div>
            <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <span key={`${day}-${index}`}>{day}</span>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1 text-center text-sm">
              {calendarCells.map((day, index) => (
                <span
                  key={`${day ?? "empty"}-${index}`}
                  className={`grid h-9 place-items-center rounded-full tabular-nums transition-colors ${
                    day === calendarDay
                      ? "bg-primary font-semibold text-primary-foreground shadow-sm"
                      : day
                        ? "text-foreground/70 hover:bg-muted"
                        : ""
                  }`}
                >
                  {day}
                </span>
              ))}
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
