import { useEffect, useState } from "react";
import { formatInTimezone } from "@/lib/timezones";

export default function LiveClock({ timezone }: { timezone: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium tabular-nums text-muted-foreground">
      <span className="size-1.5 animate-pulse rounded-full bg-primary" />
      {now ? formatInTimezone(now, timezone) : "--:--:--"}
      <span className="text-[10px] uppercase tracking-[0.12em] opacity-70">
        {timezone.split("/").pop()?.replace(/_/g, " ")}
      </span>
    </span>
  );
}
