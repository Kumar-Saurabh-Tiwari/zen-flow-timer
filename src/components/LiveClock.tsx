import { useEffect, useState } from "react";
import { CalendarDays, Plus, Trash2, Pencil, Check, X } from "lucide-react";
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
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-card p-0 sm:max-w-[760px]">
        <DialogHeader className="border-b border-border px-6 py-5 text-left">
          <DialogTitle className="flex items-center gap-2 text-xl"><CalendarDays className="size-5 text-primary" />Calendar & events</DialogTitle>
          <DialogDescription>{timezone.replace(/_/g, " ")} · <span className="tabular-nums">{now ? formatInTimezone(now, timezone) : "--:--:--"}</span></DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 p-5 sm:grid-cols-[auto_1fr]">
          <div className="min-w-0">
            <Calendar mode="single" required selected={selected} onSelect={selectDay} {...(month ? { month } : {})} onMonthChange={setMonth} {...(today ? { today } : {})} captionLayout="dropdown" startMonth={new Date(1970, 0)} endMonth={new Date(2100, 11)} className="mx-auto bg-transparent" modifiers={{ event: events.filter((event) => event.timezone === timezone).map((event) => wallDate(event.date)) }} modifiersClassNames={{ event: "calendar-event-day" }} />
            <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => { if (today) { setSelected(today); setMonth(today); resetDraft(); } }}>Today</Button>
          </div>
          <section className="min-w-0 border-t border-border pt-5 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
            <h3 className="text-base font-semibold">{selected ? new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(selected) : "Day events"}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{dayEvents.length} event{dayEvents.length === 1 ? "" : "s"} · {timezone.split("/").pop()?.replace(/_/g, " ")}</p>
            <div className="my-4 max-h-48 space-y-2 overflow-y-auto">
              {dayEvents.length === 0 && <p className="py-4 text-sm text-muted-foreground">No events planned.</p>}
              {dayEvents.map((event) => <div key={event.id} className="flex items-start gap-2 border-b border-border py-2">
                <span className="mt-1 shrink-0 text-xs font-medium tabular-nums text-primary">{event.time}</span>
                <span className="min-w-0 flex-1 break-words text-sm">{event.title}</span>
                <Button variant="ghost" size="icon" className="size-7 shrink-0" aria-label={`Edit event ${event.title}`} onClick={() => { setEditingId(event.id); setTitle(event.title); setTime(event.time); }}><Pencil /></Button>
                <Button variant="ghost" size="icon" className="size-7 shrink-0 text-destructive" aria-label={`Delete event ${event.title}`} onClick={() => { setEvents((prev) => prev.filter((item) => item.id !== event.id)); if (editingId === event.id) resetDraft(); }}><Trash2 /></Button>
              </div>)}
            </div>
            <form onSubmit={saveEvent} className="grid gap-3 border-t border-border pt-4">
              <div className="grid gap-1.5"><Label htmlFor="event-title" className="text-sm">Event title</Label><Input id="event-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Practice, meeting, or break" required maxLength={160} /></div>
              <div className="grid gap-1.5"><Label htmlFor="event-time" className="text-sm">Local time</Label><Input id="event-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required /></div>
              <div className="flex gap-2"><Button type="submit" disabled={!title.trim()}>{editingId ? <Check /> : <Plus />}{editingId ? "Save event" : "Add event"}</Button>{editingId && <Button type="button" variant="ghost" size="icon" aria-label="Cancel event edit" onClick={resetDraft}><X /></Button>}</div>
            </form>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
