import { useEffect, useState } from "react";
import { formatInTimezone } from "@/lib/timezones";

export default function LiveClock({ timezone }: { timezone: string }) {
  const [now, setNow] = useState<Date | null>(null);

  const formatDate = (date: Date) => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        timeZone: timezone,
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    } catch {
      return date.toLocaleDateString();
    }
  };

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-[15px] font-medium tabular-nums text-muted-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:border-primary/40 hover:bg-card hover:text-foreground hover:shadow-md motion-reduce:transition-none">
      <span className="size-1.5 animate-pulse rounded-full bg-primary" />
      {now ? formatInTimezone(now, timezone) : "--:--:--"}
      <span className="text-[12px] tabular-nums opacity-80">
        {now ? formatDate(now) : "--- --, ----"}
      </span>
      <span className="text-[10px] uppercase tracking-[0.12em] opacity-70">
        {timezone.split("/").pop()?.replace(/_/g, " ")}
      </span>
    </span>
  );
}
