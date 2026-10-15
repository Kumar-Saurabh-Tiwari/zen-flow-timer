import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Eye, Plus, Trash2, X, GraduationCap, ListChecks, Sparkles } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/trainer")({
  head: () => ({
    meta: [
      { title: "Instructor Showcase — Practice Timer" },
      { name: "description", content: "Create a professional instructor and course showcase with agenda, description and custom details." },
      { property: "og:title", content: "Instructor Showcase — Practice Timer" },
      { property: "og:description", content: "Present your trainer profile, course agenda and details in a full-screen showcase." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrainerPage,
});

const STORAGE_KEY = "timerApp_trainerProfile";

interface CustomField { id: string; label: string; value: string }
interface TrainerProfile {
  name: string;
  role: string;
  course: string;
  description: string;
  agenda: string[];
  fields: CustomField[];
}

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  course: z.string().trim().min(1, "Course name is required").max(120),
});

const empty: TrainerProfile = {
  name: "", role: "", course: "", description: "", agenda: [""], fields: [],
};
const uid = () => Math.random().toString(36).slice(2, 10);

function TrainerPage() {
  const [profile, setProfile] = useState<TrainerProfile>(empty);
  const [loaded, setLoaded] = useState(false);
  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      if (stored && typeof stored === "object") setProfile({ ...empty, ...stored, agenda: Array.isArray(stored.agenda) && stored.agenda.length ? stored.agenda : [""], fields: Array.isArray(stored.fields) ? stored.fields : [] });
    } catch { /* start fresh */ }
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); }, [profile, loaded]);

  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPreview(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview]);

  const set = <K extends keyof TrainerProfile>(k: K, v: TrainerProfile[K]) => setProfile((p) => ({ ...p, [k]: v }));

  const openPreview = () => {
    const result = schema.safeParse(profile);
    if (!result.success) {
      setErrors(Object.fromEntries(result.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setPreview(true);
  };

  const agenda = profile.agenda.filter((a) => a.trim());
  const fields = profile.fields.filter((f) => f.label.trim() || f.value.trim());
  const initials = profile.name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "IN";

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto w-full max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-6"><Link to="/"><ArrowLeft className="size-4" />Back to timer</Link></Button>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Instructor preview</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Build your trainer showcase</h1>
        <p className="mt-2 text-sm text-muted-foreground">Fill in your details, then present them full screen to your learners. Everything saves automatically.</p>

        <section className="mt-8 grid gap-5 rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2"><Label htmlFor="tr-name">Instructor name</Label><Input id="tr-name" value={profile.name} maxLength={80} onChange={(e) => set("name", e.target.value)} placeholder="Manas Kumar" />{errors.name && <p className="text-xs text-destructive">{errors.name}</p>}</div>
            <div className="grid gap-2"><Label htmlFor="tr-role">Title / role</Label><Input id="tr-role" value={profile.role} maxLength={80} onChange={(e) => set("role", e.target.value)} placeholder="Senior Technical Instructor" /></div>
          </div>
          <div className="grid gap-2"><Label htmlFor="tr-course">Course name</Label><Input id="tr-course" value={profile.course} maxLength={120} onChange={(e) => set("course", e.target.value)} placeholder="Red Hat System Administration I" />{errors.course && <p className="text-xs text-destructive">{errors.course}</p>}</div>
          <div className="grid gap-2"><Label htmlFor="tr-desc">Description</Label><Textarea id="tr-desc" rows={4} value={profile.description} maxLength={1000} onChange={(e) => set("description", e.target.value)} placeholder="What learners will achieve in this course…" /></div>

          <div className="grid gap-2">
            <Label>Agenda</Label>
            {profile.agenda.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-6 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{i + 1}.</span>
                <Input aria-label={`Agenda item ${i + 1}`} value={item} maxLength={160} onChange={(e) => set("agenda", profile.agenda.map((a, j) => j === i ? e.target.value : a))} placeholder="Introduction & setup" />
                <Button variant="ghost" size="icon" aria-label="Remove agenda item" disabled={profile.agenda.length === 1} onClick={() => set("agenda", profile.agenda.filter((_, j) => j !== i))}><X /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-fit" onClick={() => set("agenda", [...profile.agenda, ""])}><Plus className="size-4" />Add agenda item</Button>
          </div>

          <div className="grid gap-2 border-t border-border pt-5">
            <Label>Custom fields</Label>
            <p className="text-xs text-muted-foreground">Add anything else — duration, venue, prerequisites, contact.</p>
            {profile.fields.map((f) => (
              <div key={f.id} className="grid grid-cols-[1fr_1.5fr_auto] gap-2">
                <Input aria-label="Field label" value={f.label} maxLength={40} placeholder="Label" onChange={(e) => set("fields", profile.fields.map((x) => x.id === f.id ? { ...x, label: e.target.value } : x))} />
                <Input aria-label="Field value" value={f.value} maxLength={160} placeholder="Value" onChange={(e) => set("fields", profile.fields.map((x) => x.id === f.id ? { ...x, value: e.target.value } : x))} />
                <Button variant="ghost" size="icon" aria-label="Remove field" onClick={() => set("fields", profile.fields.filter((x) => x.id !== f.id))}><Trash2 /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-fit" onClick={() => set("fields", [...profile.fields, { id: uid(), label: "", value: "" }])}><Plus className="size-4" />Add field</Button>
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-5">
            <Button variant="ghost" onClick={() => setProfile(empty)}>Clear</Button>
            <Button onClick={openPreview}><Eye className="size-4" />Preview full screen</Button>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {preview && (
          <motion.div role="dialog" aria-modal="true" aria-label="Instructor showcase" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="trainer-stage fixed inset-0 z-50 overflow-y-auto">
            <Button variant="outline" size="sm" className="fixed right-5 top-5 z-10 rounded-full bg-card/70 backdrop-blur" onClick={() => setPreview(false)}><X className="size-4" />Close</Button>
            <div className="mx-auto flex min-h-full max-w-6xl flex-col justify-center gap-10 px-6 py-16 lg:px-12">
              <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }} className="flex flex-col items-start gap-6 md:flex-row md:items-center">
                <div className="grid size-28 shrink-0 place-items-center rounded-3xl bg-primary text-4xl font-bold text-primary-foreground shadow-soft">{initials}</div>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary"><GraduationCap className="size-4" />Your instructor</p>
                  <h2 className="mt-2 break-words text-5xl font-bold tracking-tight text-foreground md:text-6xl">{profile.name}</h2>
                  {profile.role && <p className="mt-2 text-lg text-muted-foreground">{profile.role}</p>}
                </div>
              </motion.div>

              <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }} className="rounded-3xl border border-border bg-card/80 p-8 shadow-soft backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Course</p>
                <h3 className="mt-2 break-words text-3xl font-semibold text-foreground md:text-4xl">{profile.course}</h3>
                {profile.description && <p className="mt-4 max-w-3xl whitespace-pre-line text-base leading-relaxed text-muted-foreground md:text-lg">{profile.description}</p>}
              </motion.div>

              <div className={`grid gap-6 ${fields.length ? "lg:grid-cols-[1.4fr_1fr]" : ""}`}>
                {agenda.length > 0 && (
                  <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }} className="rounded-3xl border border-border bg-card/80 p-8 shadow-soft backdrop-blur">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"><ListChecks className="size-4 text-primary" />Agenda</p>
                    <ol className="mt-5 space-y-3">
                      {agenda.map((a, i) => (
                        <motion.li key={i} initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 + i * 0.08 }} className="flex items-start gap-4">
                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-semibold tabular-nums text-primary">{i + 1}</span>
                          <span className="pt-1 text-lg text-foreground">{a}</span>
                        </motion.li>
                      ))}
                    </ol>
                  </motion.div>
                )}
                {fields.length > 0 && (
                  <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }} className="rounded-3xl border border-border bg-card/80 p-8 shadow-soft backdrop-blur">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"><Sparkles className="size-4 text-primary" />Details</p>
                    <dl className="mt-5 divide-y divide-border">
                      {fields.map((f) => (
                        <div key={f.id} className="flex flex-wrap justify-between gap-2 py-3">
                          <dt className="text-sm text-muted-foreground">{f.label}</dt>
                          <dd className="text-right text-base font-medium text-foreground">{f.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
