import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TeaBreakModalProps {
  onCancel: () => void;
  onBreakComplete: () => void;
}

const PRESET_TITLES = [
  "Tea Break 🍵",
  "Herbal Tea Break 🍵",
  "Coffee Break ☕",
  "Coffee Timer ☕",
  "Lunch Break 🥗",
  "Relax Break",
  "Study Break",
  "Focus Break",
];

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
};

export default function TeaBreakModal({ onCancel, onBreakComplete }: TeaBreakModalProps) {
  const [phase, setPhase] = useState<"setup" | "active">("setup");
  const [minutes, setMinutes] = useState<string>("5");
  const [selectedPreset, setSelectedPreset] = useState(PRESET_TITLES[0]);
  const [title, setTitle] = useState(PRESET_TITLES[0]);
  const [remainingSeconds, setRemainingSeconds] = useState(5 * 60);
  const [activeLabel, setActiveLabel] = useState(PRESET_TITLES[0]);
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
    setActiveLabel(title.trim() || PRESET_TITLES[0]);
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
      aria-label="Tea break setup"
      className="fixed inset-0 z-50 flex min-h-full items-center justify-center overflow-y-auto bg-background/70 p-3 backdrop-blur-lg sm:p-6"
    >
      <motion.div
        initial={{ scale: 0.96, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`break-dialog my-auto max-h-[calc(100dvh-1.5rem)] w-full overflow-y-auto rounded-3xl border border-border text-center shadow-soft backdrop-blur-xl sm:max-h-[calc(100dvh-3rem)] ${phase === "setup" ? "max-w-4xl p-5 sm:p-8" : "max-w-lg p-4 sm:p-6"}`}
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

              <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
                <Button className="w-full sm:w-auto" onClick={startBreak} disabled={duration <= 0}>
                  Start Break
                </Button>
                <Button variant="secondary" className="w-full sm:w-auto" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </div>

            <div className="break-preview-pane order-first flex h-60 items-center justify-center overflow-hidden rounded-2xl p-0 md:order-last md:h-72">
              {selectedPreset === "Tea Break 🍵" && (
                <img src="/tea-break1.gif" alt="Stretching person" className="h-full w-full object-contain" />
              )}
              {selectedPreset === "Herbal Tea Break 🍵" && (
                <img src="/herbal-tea.gif" alt="Stretching person" className="h-full w-full object-contain" />
              )}
              {selectedPreset === "Coffee Break ☕" && (
                <img src="/sip-coffee.gif" alt="Stretching person" className="h-full w-full object-contain" />
              )}
              {selectedPreset === "Coffee Timer ☕" && (
                <img src="/coffee-timer.gif" alt="Stretching person" className="h-full w-full object-contain" />
              )}
              {selectedPreset === "Lunch Break 🥗" && (
                <img src="/launch-time.gif" alt="Lunch person" className="h-full w-full object-contain" />
              )}
              {selectedPreset === "Relax Break" && (
                <img src="/custom-break.gif" alt="Stretching person" className="h-full w-full object-contain" />
              )}
              {selectedPreset === "Study Break" && (
                <img src="/focus.gif" alt="Stretching person" className="h-full w-full object-contain" />
              )}
              {selectedPreset === "Focus Break" && (
                <img src="/focus2.gif" alt="Stretching person" className="h-full w-full object-contain" />
              )}
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Enjoy your {activeLabel}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Your break is active. Relax, breathe, and the timer will return you to practice when finished.
            </p>

            <div className="break-active-panel mt-5 rounded-2xl border border-border p-3 sm:mt-6 sm:p-4">
              {selectedPreset === "Tea Break 🍵" && (
                <div className="relative mx-auto mb-3 h-64 w-64">
                  <img
                    src="/tea-break1.gif"
                    alt="Stretching person"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              {selectedPreset === "Herbal Tea Break 🍵" && (
                <div className="relative mx-auto mb-3 h-64 w-64">
                  <img
                    src="/herbal-tea.gif"
                    alt="Stretching person"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              {selectedPreset === "Coffee Break ☕" && (
                <div className="relative mx-auto mb-3 h-64 w-64">
                  <img
                    src="/sip-coffee.gif"
                    alt="Stretching person"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              {selectedPreset === "Coffee Timer ☕" && (
                <div className="relative mx-auto mb-3 h-64 w-64">
                  <img
                    src="/coffee-timer.gif"
                    alt="Stretching person"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              {selectedPreset === "Lunch Break 🥗" && (
                <div className="relative mx-auto mb-3 h-64 w-64">
                  <img
                    src="/launch-time.gif"
                    alt="Lunch person"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              {selectedPreset === "Relax Break" && (
                <div className="relative mx-auto mb-3 h-64 w-64">
                  <img
                    src="/custom-break.gif"
                    alt="Stretching person"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              {selectedPreset === "Study Break" && (
                <div className="relative mx-auto mb-3 h-64 w-64">
                  <img
                    src="/focus.gif"
                    alt="Stretching person"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              {selectedPreset === "Focus Break" && (
                <div className="relative mx-auto mb-3 h-64 w-64">
                  <img
                    src="/focus2.gif"
                    alt="Stretching person"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}

              <div className="break-live-timer mx-auto mt-4 w-fit font-extrabold text-primary">
                {formatTime(remainingSeconds)}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:justify-center">
              <Button className="w-full sm:w-auto" onClick={onBreakComplete}>
                End Break Early
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
