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
      className="fixed inset-0 z-50 grid place-items-center bg-background/85 p-6 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.96, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-soft"
      >
        {phase === "setup" && (
          <>
            {selectedPreset === "Tea Break 🍵" && (
              <div className="relative mx-auto mb-6 h-55 w-55">
                <img
                  src="/tea-break1.gif"
                  alt="Stretching person"
                  className="h-full w-full object-contain"
                />
              </div>
            )}
            {selectedPreset === "Herbal Tea Break 🍵" && (
              <div className="relative mx-auto mb-6 h-50 w-50">
                <img
                  src="/herbal-tea.gif"
                  alt="Stretching person"
                  className="h-full w-full object-contain"
                />
              </div>
            )}
            {selectedPreset === "Coffee Break ☕" && (
              <div className="relative mx-auto mb-6 h-50 w-50">
                <img
                  src="/sip-coffee.gif"
                  alt="Stretching person"
                  className="h-full w-full object-contain"
                />
              </div>
            )}
            {selectedPreset === "Coffee Timer ☕" && (
              <div className="relative mx-auto mb-6 h-50 w-50">
                <img
                  src="/coffee-timer.gif"
                  alt="Stretching person"
                  className="h-full w-full object-contain"
                />
              </div>
            )}
            {selectedPreset === "Lunch Break 🥗" && (
              <div className="relative mx-auto mb-6 h-55 w-55">
                <img
                  src="/launch-time.gif"
                  alt="Lunch person"
                  className="h-full w-full object-contain"
                />
              </div>
            )}
            {selectedPreset === "Relax Break" && (
              <div className="relative mx-auto mb-6 h-50 w-50">
                <img
                  src="/custom-break.gif"
                  alt="Stretching person"
                  className="h-full w-full object-contain"
                />
              </div>
            )}
          </>
        )}

        {phase === "setup" ? (
          <>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Choose your break
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Pick a preset, customize the label, and choose the duration in minutes.
            </p>

            <div className="preset-chips-grid mt-6">
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

            <div className="mt-6 grid gap-4 text-left sm:grid-cols-[2fr_1fr]">
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
                  onFocus={(e) => {
                    if (minutes === "" || minutes === "0" || minutes === "00") {
                      setMinutes("");
                    }
                  }}
                  placeholder="0"
                />
              </div>
            </div>

            <p className="mx-auto mt-4 max-w-sm text-sm font-medium text-foreground">
              Break duration: {formattedDuration}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                className="w-full sm:w-auto"
                onClick={startBreak}
                disabled={duration <= 0}
              >
                Start Break
              </Button>
              <Button variant="secondary" className="w-full sm:w-auto" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-4xl font-semibold tracking-tight text-foreground">
              Enjoy your {activeLabel}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Your break is active. Relax, breathe, and the timer will return you to practice when finished.
            </p>

            <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-soft">
              {selectedPreset === "Tea Break 🍵" && (
                <div className="relative mx-auto mb-6 h-60 w-60">
                  <img
                    src="/tea-break1.gif"
                    alt="Stretching person"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              {selectedPreset === "Herbal Tea Break 🍵" && (
                <div className="relative mx-auto mb-6 h-60 w-60">
                  <img
                    src="/herbal-tea.gif"
                    alt="Stretching person"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              {selectedPreset === "Coffee Break ☕" && (
                <div className="relative mx-auto mb-6 h-60 w-60">
                  <img
                    src="/sip-coffee.gif"
                    alt="Stretching person"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              {selectedPreset === "Coffee Timer ☕" && (
                <div className="relative mx-auto mb-6 h-60 w-60">
                  <img
                    src="/coffee-timer.gif"
                    alt="Stretching person"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              {selectedPreset === "Lunch Break 🥗" && (
                <div className="relative mx-auto mb-6 h-60 w-60">
                  <img
                    src="/launch-time.gif"
                    alt="Lunch person"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              {selectedPreset === "Relax Break" && (
                <div className="relative mx-auto mb-6 h-60 w-60">
                  <img
                    src="/custom-break.gif"
                    alt="Stretching person"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}

              <div className="break-live-timer mx-auto mt-4 w-fit font-extrabold text-primary">
                {formatTime(remainingSeconds)}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
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
