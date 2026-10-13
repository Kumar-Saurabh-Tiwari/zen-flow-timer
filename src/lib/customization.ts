export const HEADING_MIN = 16;
export const HEADING_MAX = 48;

export function headingSize(value: unknown, fallback = 28): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(HEADING_MAX, Math.max(HEADING_MIN, Math.round(value)))
    : fallback;
}

export function calendarDateKey(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  return ["year", "month", "day"].map((type) => parts.find((part) => part.type === type)?.value).join("-");
}

export interface CalendarEvent {
  id: string;
  date: string;
  timezone: string;
  title: string;
  time: string;
}

export function eventsForDay(events: CalendarEvent[], date: string, timezone: string) {
  return events.filter((event) => event.date === date && event.timezone === timezone)
    .sort((a, b) => a.time.localeCompare(b.time));
}