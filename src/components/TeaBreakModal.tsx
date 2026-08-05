import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface TeaBreakModalProps {
  onClose: () => void;
}

export default function TeaBreakModal({ onClose }: TeaBreakModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="dialog"
      aria-modal="true"
      aria-label="Tea break"
      className="fixed inset-0 z-50 grid place-items-center bg-background/85 p-6 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md rounded-3xl border border-border bg-card p-10 text-center shadow-soft"
      >
        <div className="relative mx-auto mb-8 h-28 w-28">
          <div className="absolute inset-x-0 top-0 flex justify-center gap-3">
            <span className="tea-steam tea-steam-1" />
            <span className="tea-steam tea-steam-2" />
            <span className="tea-steam tea-steam-3" />
          </div>
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 left-1/2 h-16 w-24 -translate-x-1/2 overflow-hidden rounded-b-[2.5rem] rounded-t-lg border-2 border-primary/60 bg-card"
          >
            <div className="tea-liquid absolute inset-x-0 bottom-0 h-10 bg-primary/70" />
          </motion.div>
          <div className="absolute bottom-4 left-[calc(50%+48px)] h-8 w-6 rounded-r-full border-2 border-l-0 border-primary/60" />
        </div>

        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Time for a Tea Break 🍵
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Take a deep breath and sip your tea. Stretch, soften your shoulders — your
          practice will be waiting for you.
        </p>

        <Button className="mt-8" onClick={onClose}>
          Close &amp; return to session
        </Button>
      </motion.div>
    </motion.div>
  );
}
