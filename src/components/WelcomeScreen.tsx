import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PRESET_GOALS = [
  "Deep Work",
  "Workout Flow",
  "Study Sprint",
  "Piano Practice",
  "Mindfulness",
];

interface WelcomeScreenProps {
  onComplete: (name: string, goal: string) => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("Practice Time");

  const avatarInitial = name.trim() ? name.trim().charAt(0).toUpperCase() : "✦";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(name.trim() || "Friend", goal.trim() || "Practice Time");
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-warm px-4 py-12 sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="mx-auto w-full max-w-lg rounded-3xl border border-border bg-card/85 p-8 shadow-soft backdrop-blur"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div className="flex justify-center">
          <motion.div
            key={avatarInitial}
            className="grid size-20 place-items-center rounded-full bg-primary text-3xl font-semibold text-primary-foreground shadow-soft"
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{
              scale: 1,
              rotate: 0,
              y: [0, -6, 0],
            }}
            transition={{
              scale: { type: "spring", stiffness: 300 },
              rotate: { type: "spring", stiffness: 300 },
              y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            {avatarInitial}
          </motion.div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Welcome to your space
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {name.trim() ? `Hello, ${name.trim()}` : "Let's personalize your practice"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Set your name and focus title to begin your continuous timer flow.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
          <div className="grid gap-2">
            <Label htmlFor="welcome-name">What should we call you?</Label>
            <Input
              id="welcome-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              autoFocus
              required
              className="transition-shadow focus-visible:shadow-soft"
            />
            {name.length > 0 && name.trim().length === 0 && (
              <p className="text-xs text-destructive">Please enter a real name.</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="welcome-goal">What are you practicing today?</Label>
            <Input
              id="welcome-goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Focus Session"
              className="transition-shadow focus-visible:shadow-soft"
            />
          </div>

          <div className="grid gap-2">
            <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Quick presets
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_GOALS.map((preset) => (
                <motion.button
                  key={preset}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setGoal(preset)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    goal === preset
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {preset}
                </motion.button>
              ))}
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button type="submit" className="w-full" size="lg">
              Start Practicing →
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
}
