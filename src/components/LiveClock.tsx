import { useEffect, useState } from "react";
import { CalendarDays, Plus, Trash2, Pencil, Check, X, Sparkles, Clock3 } from "lucide-react";
import { holidaysForDay, holidaysForYear, regionForTimezone, upcomingHolidays } from "@/lib/holidays";
import { formatInTimezone } from "@/lib/timezones";
import { calendarDateKey, eventsForDay, type CalendarEvent } from "@/lib/customization";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const EVENTS_KEY = "timerApp_calendarEvents";
const wallDate = (key: string) => {
  const [year = 2026, month = 1, day = 1] = key.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
};
const wallKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function LiveClock({ timezone }: { timezone: string }) {
  const [now, setNow] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date>();
  const [month, setMonth] = useState<Date>();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [editingId, setEditingId] = useState<string | null>(null);
  const todayKey = now ? calendarDateKey(now, timezone) : "";
  const today = todayKey ? wallDate(todayKey) : undefined;
  const selectedKey = selected ? wallKey(selected) : todayKey;
  const dayEvents = eventsForDay(events, selectedKey, timezone);
  const dayHolidays = selectedKey ? holidaysForDay(selectedKey, timezone) : [];
  const viewYear = (month ?? today ?? new Date()).getFullYear();
  const holidayDates = [viewYear - 1, viewYear, viewYear + 1].flatMap((y) => holidaysForYear(y, timezone)).map((h) => wallDate(h.date));
  const upcoming = todayKey ? upcomingHolidays(todayKey, timezone, 4) : [];
  const region = regionForTimezone(timezone);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    try {
      const stored = JSON.parse(localStorage.getItem(EVENTS_KEY) ?? "[]");
      if (Array.isArray(stored)) setEvents(stored.filter((event) => event && typeof event.id === "string" && typeof event.date === "string" && typeof event.timezone === "string" && typeof event.title === "string" && typeof event.time === "string"));
    } catch { /* Keep an empty calendar if saved data is unavailable. */ }
    setLoaded(true);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  }, [events, loaded]);

  const resetDraft = () => { setTitle(""); setTime("09:00"); setEditingId(null); };
  const selectDay = (date: Date | undefined) => { if (date) { setSelected(date); resetDraft(); } };
  const saveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedKey || !time) return;
    const event = { id: editingId ?? crypto.randomUUID(), date: selectedKey, timezone, title: title.trim(), time };
    setEvents((prev) => editingId ? prev.map((item) => item.id === editingId ? event : item) : [...prev, event]);
    resetDraft();
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      setOpen(value);
      if (value) {
        const date = wallDate(calendarDateKey(new Date(), timezone));
        setSelected(date); setMonth(date); resetDraft();
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" aria-label="Open date and time details" className="h-auto max-w-full flex-wrap gap-2 bg-card/70 px-3 py-2">
          <CalendarDays className="size-4 text-primary" />
          <span className="font-medium tabular-nums text-foreground">{now ? formatInTimezone(now, timezone) : "--:--:--"}</span>
          <span className="text-xs text-muted-foreground">{now ? new Intl.DateTimeFormat("en-US", { timeZone: timezone, month: "short", day: "numeric", year: "numeric" }).format(now) : "Loading date"}</span>
          <span className="text-xs text-muted-foreground">{timezone.split("/").pop()?.replace(/_/g, " ")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-card p-0 sm:max-w-[820px]">
        <DialogHeader className="border-b border-border px-6 py-5 text-left">
          <DialogTitle className="flex items-center gap-2 text-xl"><CalendarDays className="size-5 text-primary" />Calendar & events</DialogTitle>
          <DialogDescription>{timezone.replace(/_/g, " ")} · <span className="tabular-nums">{now ? formatInTimezone(now, timezone) : "--:--:--"}</span></DialogDescription>
        </DialogHeader>
        <div className="grid gap-0 sm:grid-cols-[auto_1fr]">
          <div className="min-w-0 space-y-4 p-5">
            <div className="calendar-shell rounded-2xl border border-border p-2">
              <Calendar mode="single" required selected={selected} onSelect={selectDay} {...(month ? { month } : {})} onMonthChange={setMonth} {...(today ? { today } : {})} captionLayout="dropdown" startMonth={new Date(1970, 0)} endMonth={new Date(2100, 11)} className="mx-auto bg-transparent" modifiers={{ event: events.filter((event) => event.timezone === timezone).map((event) => wallDate(event.date)), holiday: holidayDates }} modifiersClassNames={{ event: "calendar-event-day", holiday: "calendar-holiday-day" }} />
            </div>
            <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Your events</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-accent-foreground" />Holidays · {region}</span>
              <Button variant="outline" size="sm" className="h-7 rounded-full px-3 text-xs" onClick={() => { if (today) { setSelected(today); setMonth(today); resetDraft(); } }}>Today</Button>
            </div>
            {upcoming.length > 0 && <div className="rounded-2xl bg-muted/40 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"><Sparkles className="size-3.5 text-primary" />Coming up</p>
              <ul className="space-y-1">
                {upcoming.map((h) => <li key={h.date + h.title}><button type="button" className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-card" onClick={() => { const d = wallDate(h.date); setSelected(d); setMonth(d); resetDraft(); }}>
                  <span className="truncate">{h.title}</span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(wallDate(h.date))}</span>
                </button></li>)}
              </ul>
            </div>}
          </div>
          <section className="min-w-0 border-t border-border bg-muted/20 p-5 sm:border-l sm:border-t-0">
            <div className="flex items-start gap-3">
              {selected && <div className="grid w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-card text-center shadow-sm">
                <span className="bg-primary py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">{new Intl.DateTimeFormat("en-US", { month: "short" }).format(selected)}</span>
                <span className="py-1 text-xl font-bold tabular-nums">{selected.getDate()}</span>
              </div>}
              <div className="min-w-0">
                <h3 className="text-base font-semibold">{selected ? new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(selected) : "Day events"}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{dayEvents.length + dayHolidays.length} item{dayEvents.length + dayHolidays.length === 1 ? "" : "s"} · {timezone.split("/").pop()?.replace(/_/g, " ")}</p>
              </div>
            </div>
            <div className="my-4 max-h-56 space-y-2 overflow-y-auto">
              {dayHolidays.map((h) => <div key={h.title} className="flex items-center gap-2 rounded-xl border border-border bg-accent/40 px-3 py-2">
                <Sparkles className="size-4 shrink-0 text-accent-foreground" />
                <span className="min-w-0 flex-1 text-sm font-medium">{h.title}</span>
                <span className="shrink-0 rounded-full bg-card px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{h.region}</span>
              </div>)}
              {dayEvents.length === 0 && dayHolidays.length === 0 && <p className="rounded-xl border border-dashed border-border py-6 text-center text-sm text-muted-foreground">Nothing planned — add an event below.</p>}
              {dayEvents.map((event) => <div key={event.id} className="group flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-sm">
                <span className="flex shrink-0 items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-medium tabular-nums text-primary"><Clock3 className="size-3" />{event.time}</span>
                <span className="min-w-0 flex-1 break-words text-sm">{event.title}</span>
                <Button variant="ghost" size="icon" className="size-7 shrink-0" aria-label={`Edit event ${event.title}`} onClick={() => { setEditingId(event.id); setTitle(event.title); setTime(event.time); }}><Pencil /></Button>
                <Button variant="ghost" size="icon" className="size-7 shrink-0 text-destructive" aria-label={`Delete event ${event.title}`} onClick={() => { setEvents((prev) => prev.filter((item) => item.id !== event.id)); if (editingId === event.id) resetDraft(); }}><Trash2 /></Button>
              </div>)}
            </div>
            <form onSubmit={saveEvent} className="grid gap-3 rounded-2xl border border-border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{editingId ? "Edit event" : "New event"}</p>
              <div className="grid gap-3 sm:grid-cols-[1fr_7.5rem]">
                <div className="grid gap-1.5"><Label htmlFor="event-title" className="text-sm">Event title</Label><Input id="event-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Practice, meeting, or break" required maxLength={160} /></div>
                <div className="grid gap-1.5"><Label htmlFor="event-time" className="text-sm">Local time</Label><Input id="event-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required /></div>
              </div>
              <div className="flex gap-2"><Button type="submit" disabled={!title.trim()}>{editingId ? <Check /> : <Plus />}{editingId ? "Save event" : "Add event"}</Button>{editingId && <Button type="button" variant="ghost" size="icon" aria-label="Cancel event edit" onClick={resetDraft}><X /></Button>}</div>
            </form>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
