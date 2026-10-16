import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Expand, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface BreakPlan { title: string; minutes: number; preset: string }

interface TeaBreakModalProps {
  onCancel: () => void;
  onBreakComplete: () => void;
  /** When set, the break starts immediately (used by scheduled breaks). */
  autoStart?: BreakPlan | null;
  /** Queue the break to start when the current timer block ends. */
  onSchedule?: (plan: BreakPlan) => void;
  canSchedule?: boolean;
}

const PRESET_TITLES = [
  "Tea Break 🍵",
  "Herbal Tea Break 🍵",
  "Coffee Break ☕",
  "Coffee Timer ☕",
  "Coffee Break 1 ☕",
  "Coffee Break 2 ☕",
  "Lunch Break 🥗",
  "Relax Break",
  "Study Break",
  "Focus Break",
];

const DEFAULT_PRESET = "Tea Break 🍵";

const getBreakMedia = (preset: string) => {
  const mediaByPreset: Record<string, { src: string; alt: string; type: "image" | "video" }> = {
    "Tea Break 🍵": { src: "/tea-break1.gif", alt: "Stretching person", type: "image" },
    "Herbal Tea Break 🍵": { src: "/herbal-tea.gif", alt: "Herbal tea break", type: "image" },
    "Coffee Break ☕": { src: "/sip-coffee.gif", alt: "Coffee break", type: "image" },
    "Coffee Timer ☕": { src: "/coffee-timer.gif", alt: "Coffee timer break", type: "image" },
    "Coffee Break 1 ☕": { src: "/coffee-1.mp4", alt: "Coffee break animation one", type: "video" },
    "Coffee Break 2 ☕": { src: "/coffee-2.mp4", alt: "Coffee break animation two", type: "video" },
    "Lunch Break 🥗": { src: "/launch-time.gif", alt: "Lunch break", type: "image" },
    "Relax Break": { src: "/custom-break.gif", alt: "Relax break", type: "image" },
    "Study Break": { src: "/focus.gif", alt: "Study break", type: "image" },
    "Focus Break": { src: "/focus2.gif", alt: "Focus break", type: "image" },
  };

  return mediaByPreset[preset] ?? { src: "/custom-break.gif", alt: "Custom break", type: "image" };
};

function BreakMedia({ preset }: { preset: string }) {
  const media = getBreakMedia(preset);

  return media.type === "video" ? (
    <video
      src={media.src}
      autoPlay
      loop
      muted
      playsInline
      className="h-full w-full object-contain"
    />
  ) : (
    <img src={media.src} alt={media.alt} className="h-full w-full object-contain" />
  );
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
};

export default function TeaBreakModal({ onCancel, onBreakComplete, autoStart, onSchedule, canSchedule = false }: TeaBreakModalProps) {
  const [phase, setPhase] = useState<"setup" | "active">(autoStart ? "active" : "setup");
  const [minutes, setMinutes] = useState<string>(String(autoStart?.minutes ?? 5));
  const [selectedPreset, setSelectedPreset] = useState(autoStart?.preset ?? DEFAULT_PRESET);
  const [title, setTitle] = useState(autoStart?.title ?? DEFAULT_PRESET);
  const [remainingSeconds, setRemainingSeconds] = useState((autoStart?.minutes ?? 5) * 60);
  const [activeLabel, setActiveLabel] = useState(autoStart?.title ?? DEFAULT_PRESET);
  const [mode, setMode] = useState<"now" | "schedule">("now");
  const [expandedDialog, setExpandedDialog] = useState(false);
  const completedRef = useRef(false);
  const mountedRef = useRef(true);

  const numericMinutes = useMemo(() => Math.max(0, Number(minutes) || 0), [minutes]);
  const duration = useMemo(() => numericMinutes * 60, [numericMinutes]);
  const formattedDuration = useMemo(() => formatTime(duration), [duration]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!expandedDialog) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpandedDialog(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [expandedDialog]);

  useEffect(() => {
    if (phase !== "active") return;
    if (remainingSeconds <= 0) {
      if (!completedRef.current && mountedRef.current) {
        completedRef.current = true;
        onBreakComplete();
      }
      return;
    }
    const interval = window.setInterval(() => {
      setRemainingSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [phase, remainingSeconds, onBreakComplete]);

  const startBreak = () => {
    if (duration <= 0) return;
    setActiveLabel(title?.trim() || DEFAULT_PRESET);
    setRemainingSeconds(duration);
    completedRef.current = false;
    setPhase("active");
  };

  const selectPreset = (preset: string) => {
    setSelectedPreset(preset);
    setTitle(preset);
  };

  const handleMinutesChange = (value: string) => {
    if (value === "") {
      setMinutes("");
      return;
    }

    const numeric = Math.max(0, Number(value) || 0);
    setMinutes(String(numeric));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      role="dialog"
      aria-modal="true"
      aria-label={phase === "active" ? "Active break" : "Tea break setup"}
      className="fixed inset-0 z-50 flex min-h-full items-center justify-center overflow-y-auto bg-background/70 p-3 backdrop-blur-lg sm:p-6"
    >
      <motion.div
        initial={{ scale: 0.96, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`break-dialog my-auto max-h-[calc(100dvh-1.5rem)] w-full overflow-y-auto rounded-3xl border border-border text-center shadow-soft backdrop-blur-xl sm:max-h-[calc(100dvh-3rem)] ${
          expandedDialog
            ? "fixed inset-3 z-[60] my-0 flex h-[calc(100dvh-1.5rem)] max-h-none max-w-none flex-col p-4 sm:inset-6 sm:h-[calc(100dvh-3rem)] sm:p-8"
            : phase === "setup"
              ? "max-w-4xl p-5 sm:p-8"
              : "max-w-lg p-4 sm:p-6"
        }`}
      >
        {phase === "setup" ? (
          <div className="grid items-center gap-6 text-left md:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)] md:gap-10">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Choose your break
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:mt-3">
                Pick a preset, customize the label, and choose the duration in minutes.
              </p>

              <div className="preset-chips-grid mt-4 sm:mt-6">
                {PRESET_TITLES.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`chip ${selectedPreset === preset ? "active" : ""}`}
                    onClick={() => selectPreset(preset)}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-[2fr_1fr] sm:gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="break-title">Break title</Label>
                  <Input
                    id="break-title"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setSelectedPreset("");
                    }}
                    placeholder="Custom break title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="break-minutes">Minutes</Label>
                  <Input
                    id="break-minutes"
                    type="number"
                    min="0"
                    value={minutes}
                    onChange={(e) => handleMinutesChange(e.target.value)}
                    onFocus={() => {
                      if (minutes === "" || minutes === "0" || minutes === "00") {
                        setMinutes("");
                      }
                    }}
                    placeholder="0"
                  />
                </div>
              </div>

              <p className="mt-3 text-sm font-medium text-foreground sm:mt-4">
                Break duration: {formattedDuration}
              </p>

              <div role="radiogroup" aria-label="When to take the break" className="mt-4 grid gap-2 sm:grid-cols-2">
                {([
                  { id: "now", label: "Start right now", hint: "Pauses the session and begins the break." },
                  { id: "schedule", label: "Schedule after current timer", hint: canSchedule ? "Starts automatically when the running block ends." : "Add a timer block first to schedule a break." },
                ] as const).map((option) => {
                  const disabled = option.id === "schedule" && !canSchedule;
                  return (
                    <button key={option.id} type="button" role="radio" aria-checked={mode === option.id} disabled={disabled}
                      onClick={() => setMode(option.id)}
                      className={`rounded-xl border p-3 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${mode === option.id ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-card/60 hover:border-primary/40"}`}>
                      <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <span className={`grid size-4 place-items-center rounded-full border ${mode === option.id ? "border-primary" : "border-muted-foreground"}`}>{mode === option.id && <span className="size-2 rounded-full bg-primary" />}</span>
                        {option.label}
                      </span>
                      <span className="mt-1 block pl-6 text-xs text-muted-foreground">{option.hint}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
                {mode === "schedule" && canSchedule && onSchedule ? (
                  <Button className="w-full sm:w-auto" disabled={duration <= 0} onClick={() => onSchedule({ title: title?.trim() || DEFAULT_PRESET, minutes: numericMinutes, preset: selectedPreset })}>
                    Schedule Break
                  </Button>
                ) : (
                  <Button className="w-full sm:w-auto" onClick={startBreak} disabled={duration <= 0}>
                    Start Break
                  </Button>
                )}
                <Button variant="secondary" className="w-full sm:w-auto" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </div>

            <div className="break-preview-pane order-first flex h-60 items-center justify-center overflow-hidden rounded-2xl p-0 md:order-last md:h-72">
              <BreakMedia preset={selectedPreset} />
            </div>
          </div>
        ) : (
          <div className={expandedDialog ? "flex min-h-0 flex-1 flex-col" : ""}>
            <div className="flex items-start justify-center gap-3">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Enjoy your {activeLabel}
              </h2>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label={expandedDialog ? "Restore break dialog size" : "Expand break dialog"}
                title={expandedDialog ? "Restore dialog size" : "Expand dialog"}
                className="shrink-0"
                onClick={() => setExpandedDialog((expanded) => !expanded)}
              >
                {expandedDialog ? <Minimize2 /> : <Expand />}
              </Button>
            </div>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Your break is active. Relax, breathe, and the timer will return you to practice when
              finished.
            </p>

            <div
              className={`break-active-panel mt-5 rounded-2xl border border-border p-3 sm:mt-6 sm:p-4 ${
                expandedDialog ? "flex min-h-0 flex-1 flex-col" : ""
              }`}
            >
              <div
                className={`relative mx-auto mb-3 ${
                  expandedDialog ? "min-h-[12rem] w-full flex-1" : "h-64 w-64"
                }`}
              >
                <BreakMedia preset={selectedPreset} />
              </div>

              <div className="break-live-timer mx-auto mt-4 w-fit font-extrabold text-primary">
                {formatTime(remainingSeconds)}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:justify-center">
              <Button className="w-full sm:w-auto" onClick={onBreakComplete}>
                End Break Early
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
