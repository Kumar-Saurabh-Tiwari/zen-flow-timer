import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  SlidersHorizontal,
  PanelTop,
  Coffee,
  ListPlus,
  Pencil,
  Play,
  RotateCcw,
  Trash2,
} from "lucide-react";
import Swal from "sweetalert2";
import Timer from "@/components/Timer";
import WelcomeScreen from "@/components/WelcomeScreen";
import SettingsSidebar from "@/components/SettingsSidebar";
import HeadingSizeControl from "@/components/HeadingSizeControl";
import { headingSize } from "@/lib/customization";
import LiveClock from "@/components/LiveClock";
import TeaBreakModal from "@/components/TeaBreakModal";

import { getDefaultTimezone } from "@/lib/timezones";
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
  message: "timerApp_sessionMessage",
  timers: "timerApp_timers",
  timezone: "timerApp_userTimezone",
  headingSize: "timerApp_headingSize",
  timerHeadingSize: "timerApp_timerHeadingSize",
};

interface TimerBlock {
  id: string;
  title: string;
  headingSize?: number;
  duration: number;
  isActive: boolean;
  isExpired: boolean;
  editing: boolean;
  tempMinutes: number;
  tempSeconds: number;
}

const makeId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const TEA_BREAK_TITLE = "Tea Break";
const TEA_BREAK_DURATION = 5 * 60;

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
  const [sessionMessage, setSessionMessage] = useState("Day 1");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [timers, setTimers] = useState<TimerBlock[]>([]);
  const [newTimerTitle, setNewTimerTitle] = useState("");
  const [newTimerMinutes, setNewTimerMinutes] = useState(0);
  const [newTimerSeconds, setNewTimerSeconds] = useState(0);
  const [activeTimerIndex, setActiveTimerIndex] = useState(-1);
  const [timersStarted, setTimersStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userTimezone, setUserTimezone] = useState("UTC");
  const [showPlanCard, setShowPlanCard] = useState(true);
  const [profileHeadingSize, setProfileHeadingSize] = useState(28);
  const [newTimerHeadingSize, setNewTimerHeadingSize] = useState(24);
  const [showControlPanel, setShowControlPanel] = useState(true);
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);


  useEffect(() => {
    const storedName = loadFromStorage(STORAGE_KEYS.name, "");
    setUserName(storedName || "there");
    setPracticeTitle(loadFromStorage(STORAGE_KEYS.title, "Practice Time"));
    setSessionMessage(loadFromStorage(STORAGE_KEYS.message, "Day 1"));
    setProfileHeadingSize(headingSize(loadFromStorage(STORAGE_KEYS.headingSize, 28)));
    setNewTimerHeadingSize(headingSize(loadFromStorage(STORAGE_KEYS.timerHeadingSize, 24), 24));
    setUserTimezone(loadFromStorage(STORAGE_KEYS.timezone, getDefaultTimezone()));
    setTimers(
      loadFromStorage<TimerBlock[]>(STORAGE_KEYS.timers, []).map((t) => ({
        ...t,
        id: t.id ?? makeId(),
        headingSize: headingSize(t.headingSize, 24),
        isActive: false,
        isExpired: false,
        editing: false,
      })),
    );
    if (!storedName.trim() || storedName.trim() === "there") setShowWelcome(true);

    setHydrated(true);
  }, []);

  const completeWelcome = (name: string, goal: string, timezone: string) => {
    setUserName(name);
    setPracticeTitle(goal);
    setUserTimezone(timezone);
    setShowWelcome(false);
  };


  useEffect(() => {
    if (!hydrated || showWelcome) return;
    window.localStorage.setItem(STORAGE_KEYS.name, JSON.stringify(userName));
    window.localStorage.setItem(STORAGE_KEYS.title, JSON.stringify(practiceTitle));
    window.localStorage.setItem(STORAGE_KEYS.message, JSON.stringify(sessionMessage));
    window.localStorage.setItem(STORAGE_KEYS.timezone, JSON.stringify(userTimezone));
    window.localStorage.setItem(STORAGE_KEYS.headingSize, JSON.stringify(profileHeadingSize));
    window.localStorage.setItem(STORAGE_KEYS.timerHeadingSize, JSON.stringify(newTimerHeadingSize));
    window.localStorage.setItem(STORAGE_KEYS.timers, JSON.stringify(timers));
  }, [hydrated, showWelcome, userName, practiceTitle, sessionMessage, userTimezone, timers, profileHeadingSize, newTimerHeadingSize]);

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
        id: makeId(),
        title: newTimerTitle.trim(),
        headingSize: newTimerHeadingSize,

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
    setIsPaused(false);
    setShowPlanCard(false);
  };

  const openTeaBreak = () => {
    if (timersStarted && !isPaused) {
      setIsPaused(true);
    }
    setIsBreakModalOpen(true);
  };

  const handleBreakComplete = () => {
    setIsBreakModalOpen(false);

    if (!timersStarted && timers.length > 0) {
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
      setIsPaused(false);
      setShowPlanCard(false);
      return;
    }

    if (timersStarted) {
      setIsPaused(false);
    }
  };

  const togglePause = () => {
    if (!timersStarted) return;
    setIsPaused((v) => !v);
  };

  const resetTimers = () => {
    setActiveTimerIndex(-1);
    setTimersStarted(false);
    setIsPaused(false);
    setTimers((prev) =>
      prev.map((t) => ({ ...t, isActive: false, isExpired: false, editing: false })),
    );
  };

  const handleTimerComplete = useCallback((completedIndex: number) => {
    setTimers((prev) => {
      const nextIndex = completedIndex + 1;
      const isFinished = nextIndex >= prev.length;
      if (isFinished) {
        setActiveTimerIndex(-1);
        setTimersStarted(false);
        setIsPaused(false);
        Swal.fire({
          title: "Session complete!",
          text: "Great work — your practice session is finished.",
          icon: "success",
          confirmButtonText: "Nice",
          confirmButtonColor: "#b4784f",
        });
      } else {
        setActiveTimerIndex(nextIndex);
      }
      return prev.map((timer, idx) => ({
        ...timer,
        isActive: idx === nextIndex,
        isExpired: idx <= completedIndex ? true : timer.isExpired,
      }));
    });
  }, []);



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
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= timers.length) return;
    setTimers((prev) => {
      const copy = [...prev];
      const current = copy[index];
      const next = copy[nextIndex];
      if (!current || !next) return prev;
      [copy[index], copy[nextIndex]] = [next, current];
      return copy;
    });
    if (activeTimerIndex === index) {
      // The running block moved: follow it and pause so the user can review.
      setActiveTimerIndex(nextIndex);
      if (timersStarted) setIsPaused(true);
    } else if (activeTimerIndex === nextIndex) {
      setActiveTimerIndex(index);
    }
  };

  const profileAvatar = useMemo(
    () => (userName ? userName.charAt(0).toUpperCase() : "U"),
    [userName],
  );

  const totalDuration = timers.reduce((sum, t) => sum + t.duration, 0);

  return (
    <AnimatePresence mode="wait">
      {showWelcome ? (
        <WelcomeScreen key="welcome" onComplete={completeWelcome} />
      ) : (
        <motion.main
          key="app"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:py-16"
        >
          <div className="mx-auto flex w-full max-w-[1140px] flex-col gap-5">

            <section className="overflow-hidden rounded-3xl border border-border bg-gradient-warm px-6 py-4 shadow-soft">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 basis-full sm:flex-1 sm:basis-auto">
                  {/* <div className="red-hat-lockup mt-1 shrink-0" aria-label="Red Hat">
                    <img src="/Red_Hat_logo.svg.webp" alt="Red Hat logo" />
                  </div> */}
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground sm:text-[15px]">
                    Welcome to <span className="font-bold text-foreground">Red Hat</span> Training
                  </p>
                </div>
                <div className="min-w-0 max-w-full">
                  <LiveClock timezone={userTimezone} />
                </div>
                <Button variant="outline" onClick={() => { setProfileDraft(userName); setIsEditingProfile(true); }} aria-expanded={isEditingProfile}>
                  <SlidersHorizontal className="size-4" /> Settings
                </Button>
              </div>
              <h1 className="custom-heading mt-4 break-words font-semibold text-foreground" style={{ fontSize: `${profileHeadingSize}px` }}>{practiceTitle}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="grid size-7 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">{profileAvatar}</span>
                <span>{userName}</span><span aria-hidden="true">·</span>
                <span>{timers.length} blocks · {fmt(totalDuration)} total</span>
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setShowControlPanel((v) => !v)} aria-expanded={showControlPanel}>
                  <PanelTop className="size-4" />{showControlPanel ? "Hide session controls" : "Show session controls"}
                </Button>
              </div>

              <motion.div
                initial={false}
                animate={{ height: showControlPanel ? "auto" : 0, opacity: showControlPanel ? 1 : 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="overflow-hidden"
              >
              <div className="mt-5 grid gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-xl"
                    onClick={timersStarted ? togglePause : startTimers}
                    disabled={timers.length === 0}
                  >
                    {!timersStarted && <Play className="size-3.5" />}
                    {timersStarted ? (isPaused ? "Resume" : "Pause") : "Start"}
                  </Button>
                  <Button variant="destructive" size="sm" className="rounded-xl" onClick={resetTimers}>
                    <RotateCcw className="size-3.5" />
                    Reset
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={openTeaBreak}>
                    <Coffee className="size-3.5" />
                    Take a Break
                  </Button>
                </div>

                <Input
                  value={sessionMessage}
                  onChange={(event) => setSessionMessage(event.target.value)}
                  aria-label="Session message"
                  placeholder="Day 1 / Morning Tea Break"
                  className="h-9 w-full min-w-[190px] rounded-xl border-transparent bg-muted/60 px-3 text-center text-sm font-medium shadow-none focus-visible:border-ring focus-visible:bg-background sm:w-[280px]"
                />

                <div className="flex justify-start sm:justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl"
                    aria-expanded={showPlanCard}
                    onClick={() => setShowPlanCard((v) => !v)}
                  >
                    {!showPlanCard && <ListPlus className="size-3.5" />}
                    {showPlanCard ? "Hide plan panel" : "Plan / Add block"}
                  </Button>
                </div>
              </div>
              </motion.div>

              <p className="group ml-auto mt-3 w-fit cursor-default rounded-full border border-border/70 bg-card/60 px-3 py-1 font-serif text-[13px] italic tracking-[0.1em] text-foreground/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card/85 hover:text-primary hover:tracking-[0.15em] motion-reduce:transition-none">
                Instructor <span className="font-semibold not-italic text-foreground transition-colors duration-300 group-hover:text-primary motion-reduce:transition-none">Manas Kumar</span>
              </p>
            </section>

            <SettingsSidebar
              open={isEditingProfile} onOpenChange={setIsEditingProfile}
              name={profileDraft} onNameChange={setProfileDraft}
              heading={practiceTitle} onHeadingChange={setPracticeTitle}
              timezone={userTimezone} onTimezoneChange={setUserTimezone}
              headingSize={profileHeadingSize} onHeadingSizeChange={setProfileHeadingSize}
              timerHeadingSize={newTimerHeadingSize} onTimerHeadingSizeChange={setNewTimerHeadingSize}
              showControls={showControlPanel} onShowControlsChange={setShowControlPanel}
              showPlan={showPlanCard} onShowPlanChange={setShowPlanCard}
              onSave={saveProfile}
              onOnboarding={() => { setIsEditingProfile(false); setShowWelcome(true); }}
            />

            <motion.div
              initial={false}
              animate={{ height: showPlanCard ? "auto" : 0, opacity: showPlanCard ? 1 : 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
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
                  <Button onClick={addTimer} disabled={!newTimerTitle.trim() || newTimerMinutes <= 0}><ListPlus className="size-4" />Add timer</Button>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-[3fr_1fr]">
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
                      min="1"
                      value={newTimerMinutes === 0 ? "" : newTimerMinutes}
                      onChange={(e) =>
                        setNewTimerMinutes(e.target.value === "" ? 0 : Number(e.target.value))
                      }
                      onFocus={(e) => {
                        if (newTimerMinutes === 0) e.target.select();
                      }}
                      placeholder="Enter minutes..."
                    />
                  </div>
                </div>

                <div className="mt-5 max-w-sm"><HeadingSizeControl label="Timer heading size" value={newTimerHeadingSize} onChange={setNewTimerHeadingSize} /></div>
              </section>
            </motion.div>


            <section className="flex flex-col gap-3">
              {timers.length === 0 && (
                <p className="rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
                  No blocks yet — add your first one above to begin.
                </p>
              )}

              <AnimatePresence initial={false}>
                {timers.map((timer, index) => (
                  <motion.div
                    key={timer.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{
                      opacity: timer.isExpired ? 0.6 : 1,
                      y: 0,
                      scale: activeTimerIndex === index ? 1.015 : 1,
                      boxShadow:
                        activeTimerIndex === index
                          ? "0 22px 50px -22px oklch(0.62 0.11 45 / 0.55)"
                          : "0 0px 0px 0px oklch(0.62 0.11 45 / 0)",
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={`relative rounded-3xl border bg-card p-5 ${activeTimerIndex === index
                        ? "border-primary ring-2 ring-primary/25"
                        : "border-border"
                      }`}
                  >

                    {timer.editing ? (
                      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
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
                          min="1"
                          placeholder="Enter minutes..."
                          value={timer.tempMinutes === 0 ? "" : timer.tempMinutes}
                          onFocus={(e) => {
                            if (timer.tempMinutes === 0) e.target.select();
                          }}
                          onChange={(e) =>
                            setTimers((prev) =>
                              prev.map((item, idx) =>
                                idx === index
                                  ? {
                                    ...item,
                                    tempMinutes:
                                      e.target.value === "" ? 0 : Number(e.target.value),
                                    tempSeconds: 0,
                                  }
                                  : item,
                              ),
                            )
                          }
                        />
                        <Button onClick={() => saveTimer(index)}>Save</Button>
                        <div className="sm:col-span-3 max-w-sm"><HeadingSizeControl label="Timer heading size" value={timer.headingSize ?? 24} onChange={(size) => setTimers((prev) => prev.map((item) => item.id === timer.id ? { ...item, headingSize: size } : item))} /></div>
                      </div>

                    ) : (
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="min-w-0 w-full flex-1 pt-10 sm:pt-0 sm:pr-36">
                          <Timer
                            id={timer.id}
                            title={timer.title}
                            headingSize={timer.headingSize ?? 24}
                            duration={timer.duration}
                            isActive={timer.isActive}
                            isPaused={isPaused}
                            onComplete={() => handleTimerComplete(index)}
                          />
                        </div>
                        <div className="absolute right-5 top-5 flex items-center gap-1.5">
                          {timer.isExpired && (
                            <span className="mr-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                              Done
                            </span>
                          )}
                          <Button
                            variant="secondary"
                            size="icon"
                            className="size-7"
                            aria-label="Edit timer"
                            title="Edit timer"
                            onClick={() => editTimer(index)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="size-7"
                            aria-label="Delete timer"
                            title="Delete timer"
                            onClick={() => deleteTimer(index)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            aria-label="Move up"
                            onClick={() => moveTimer(index, -1)}
                          >
                            ▲
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            aria-label="Move down"
                            onClick={() => moveTimer(index, 1)}
                          >
                            ▼
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

            </section>

          </div>

          <AnimatePresence>
            {isBreakModalOpen && (
              <TeaBreakModal
                onCancel={() => setIsBreakModalOpen(false)}
                onBreakComplete={handleBreakComplete}
              />
            )}
          </AnimatePresence>

        </motion.main>
      )}
    </AnimatePresence>
  );
}
