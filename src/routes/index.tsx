import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Swal from "sweetalert2";
import Timer from "@/components/Timer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Practice Timer — Calm Sequential Sessions" },
      {
        name: "description",
        content:
          "Build calm, intentional practice sessions with sequential timer blocks, live progress and saved routines.",
      },
      { property: "og:title", content: "Practice Timer — Calm Sequential Sessions" },
      {
        property: "og:description",
        content:
          "Create, reorder and play timed practice blocks one after another with a warm, focused interface.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const STORAGE_KEYS = {
  name: "timerApp_userName",
  title: "timerApp_practiceTitle",
  timers: "timerApp_timers",
};

interface TimerBlock {
  id: string;
  title: string;
  duration: number;
  isActive: boolean;
  isExpired: boolean;
  editing: boolean;
  tempMinutes: number;
  tempSeconds: number;
}

const makeId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;


function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

const fmt = (total: number) =>
  `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;

function Index() {
  const [userName, setUserName] = useState("there");
  const [profileDraft, setProfileDraft] = useState("");
  const [practiceTitle, setPracticeTitle] = useState("Practice Time");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [timers, setTimers] = useState<TimerBlock[]>([]);
  const [newTimerTitle, setNewTimerTitle] = useState("");
  const [newTimerMinutes, setNewTimerMinutes] = useState(0);
  const [newTimerSeconds, setNewTimerSeconds] = useState(0);
  const [activeTimerIndex, setActiveTimerIndex] = useState(-1);
  const [timersStarted, setTimersStarted] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUserName(loadFromStorage(STORAGE_KEYS.name, "there"));
    setPracticeTitle(loadFromStorage(STORAGE_KEYS.title, "Practice Time"));
    setTimers(
      loadFromStorage<TimerBlock[]>(STORAGE_KEYS.timers, []).map((t) => ({
        ...t,
        isActive: false,
        isExpired: false,
        editing: false,
      })),
    );
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEYS.name, JSON.stringify(userName));
    window.localStorage.setItem(STORAGE_KEYS.title, JSON.stringify(practiceTitle));
    window.localStorage.setItem(STORAGE_KEYS.timers, JSON.stringify(timers));
  }, [hydrated, userName, practiceTitle, timers]);

  const saveProfile = () => {
    setUserName(profileDraft.trim() || "there");
    setIsEditingProfile(false);
  };

  const addTimer = () => {
    const duration = newTimerMinutes * 60 + newTimerSeconds;
    if (duration <= 0 || !newTimerTitle.trim()) return;
    setTimers((prev) => [
      ...prev,
      {
        title: newTimerTitle.trim(),
        duration,
        isActive: false,
        isExpired: false,
        editing: false,
        tempMinutes: newTimerMinutes,
        tempSeconds: newTimerSeconds,
      },
    ]);
    setNewTimerTitle("");
    setNewTimerMinutes(0);
    setNewTimerSeconds(0);
  };

  const startTimers = () => {
    if (!timers.length || activeTimerIndex !== -1) return;
    setActiveTimerIndex(0);
    setTimers((prev) =>
      prev.map((timer, index) => ({
        ...timer,
        isActive: index === 0,
        isExpired: false,
        editing: false,
      })),
    );
    setTimersStarted(true);
  };

  const resetTimers = () => {
    setTimers([]);
    setActiveTimerIndex(-1);
    setTimersStarted(false);
  };

  const handleTimerComplete = useCallback(
    (index: number) => {
      const isLast = index >= timers.length - 1;
      setTimers((prev) =>
        prev.map((timer, idx) => ({
          ...timer,
          isExpired: idx === index ? true : timer.isExpired,
          isActive: !isLast && idx === index + 1,
        })),
      );
      if (!isLast) {
        setActiveTimerIndex(index + 1);
      } else {
        setActiveTimerIndex(-1);
        setTimersStarted(false);
        Swal.fire({
          title: "Session complete!",
          text: "Great work — your practice session is finished.",
          icon: "success",
          confirmButtonText: "Nice",
          confirmButtonColor: "#b4784f",
        });
      }
    },
    [timers.length],
  );


  const deleteTimer = (index: number) => {
    setTimers((prev) => prev.filter((_, idx) => idx !== index));
    if (activeTimerIndex === index || activeTimerIndex > index) {
      setActiveTimerIndex((current) => (current > 0 ? current - 1 : -1));
      setTimersStarted(false);
    }
  };

  const editTimer = (index: number) => {
    setTimers((prev) =>
      prev.map((timer, idx) =>
        idx === index
          ? {
              ...timer,
              editing: true,
              tempMinutes: Math.floor(timer.duration / 60),
              tempSeconds: timer.duration % 60,
            }
          : timer,
      ),
    );
  };

  const saveTimer = (index: number) => {
    setTimers((prev) =>
      prev.map((timer, idx) => {
        if (idx !== index) return timer;
        const newDuration = timer.tempMinutes * 60 + timer.tempSeconds;
        if (!timer.title.trim() || newDuration <= 0) return timer;
        return { ...timer, duration: newDuration, editing: false };
      }),
    );
  };

  const moveTimer = (index: number, direction: number) => {
    setTimers((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const copy = [...prev];
      [copy[index], copy[nextIndex]] = [copy[nextIndex]!, copy[index]!];
      return copy;
    });
    if (activeTimerIndex === index) setActiveTimerIndex(index + direction);
    else if (activeTimerIndex === index + direction) setActiveTimerIndex(index);
  };

  const profileAvatar = useMemo(
    () => (userName ? userName.charAt(0).toUpperCase() : "U"),
    [userName],
  );

  const totalDuration = timers.reduce((sum, t) => sum + t.duration, 0);

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:py-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <section className="overflow-hidden rounded-3xl border border-border bg-gradient-warm p-8 shadow-soft">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Focused practice, beautifully paced
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
            {practiceTitle}
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Create calm, intentional study or workout sessions and keep your flow going,
            one block at a time.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-4 rounded-2xl bg-card/70 p-4 backdrop-blur">
            <div className="grid size-12 place-items-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
              {profileAvatar}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-medium text-foreground">
                Welcome back, {userName || "friend"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {timers.length} block{timers.length === 1 ? "" : "s"} · {fmt(totalDuration)}{" "}
                total
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                setProfileDraft(userName);
                setIsEditingProfile((v) => !v);
              }}
            >
              {isEditingProfile ? "Close" : "Edit profile"}
            </Button>
          </div>
        </section>

        {isEditingProfile && (
          <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h3 className="text-lg font-medium text-foreground">Profile settings</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profileDraft}
                  onChange={(e) => setProfileDraft(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="heading">Heading</Label>
                <Input
                  id="heading"
                  value={practiceTitle}
                  onChange={(e) => setPracticeTitle(e.target.value)}
                  placeholder="Practice title"
                />
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <Button onClick={saveProfile}>Save profile</Button>
              <Button variant="ghost" onClick={() => setIsEditingProfile(false)}>
                Cancel
              </Button>
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Plan your session
              </p>
              <h3 className="mt-1 text-lg font-medium text-foreground">
                Create a new practice block
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={addTimer}>Add timer</Button>
              <Button
                variant="secondary"
                onClick={startTimers}
                disabled={timersStarted || timers.length === 0}
              >
                Start
              </Button>
              <Button variant="destructive" onClick={resetTimers}>
                Reset
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
            <div className="grid gap-2">
              <Label htmlFor="t-title">Title</Label>
              <Input
                id="t-title"
                value={newTimerTitle}
                onChange={(e) => setNewTimerTitle(e.target.value)}
                placeholder="Warm up"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="t-min">Minutes</Label>
              <Input
                id="t-min"
                type="number"
                min="0"
                value={newTimerMinutes}
                onChange={(e) => setNewTimerMinutes(Number(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="t-sec">Seconds</Label>
              <Input
                id="t-sec"
                type="number"
                min="0"
                max="59"
                value={newTimerSeconds}
                onChange={(e) => setNewTimerSeconds(Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          {timers.length === 0 && (
            <p className="rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
              No blocks yet — add your first one above to begin.
            </p>
          )}

          {timers.map((timer, index) => (
            <div
              key={index}
              className={`rounded-3xl border bg-card p-5 transition-all ${
                activeTimerIndex === index
                  ? "border-primary shadow-soft ring-2 ring-primary/25"
                  : "border-border"
              } ${timer.isExpired ? "opacity-60" : ""}`}
            >
              {timer.editing ? (
                <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
                  <Input
                    value={timer.title}
                    onChange={(e) =>
                      setTimers((prev) =>
                        prev.map((item, idx) =>
                          idx === index ? { ...item, title: e.target.value } : item,
                        ),
                      )
                    }
                    placeholder="Timer title"
                  />
                  <Input
                    type="number"
                    min="0"
                    value={timer.tempMinutes}
                    onChange={(e) =>
                      setTimers((prev) =>
                        prev.map((item, idx) =>
                          idx === index
                            ? { ...item, tempMinutes: Number(e.target.value) }
                            : item,
                        ),
                      )
                    }
                  />
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={timer.tempSeconds}
                    onChange={(e) =>
                      setTimers((prev) =>
                        prev.map((item, idx) =>
                          idx === index
                            ? { ...item, tempSeconds: Number(e.target.value) }
                            : item,
                        ),
                      )
                    }
                  />
                  <Button onClick={() => saveTimer(index)}>Save</Button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-4">
                  <Timer
                    title={timer.title}
                    duration={timer.duration}
                    isActive={timer.isActive}
                    onComplete={() => handleTimerComplete(index)}
                  />
                  <div className="flex items-center gap-1.5">
                    {timer.isExpired && (
                      <span className="mr-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                        Done
                      </span>
                    )}
                    <Button variant="secondary" size="sm" onClick={() => editTimer(index)}>
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteTimer(index)}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Move up"
                      onClick={() => moveTimer(index, -1)}
                    >
                      ▲
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Move down"
                      onClick={() => moveTimer(index, 1)}
                    >
                      ▼
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
