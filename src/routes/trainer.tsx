import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Eye, Plus, Trash2, X, GraduationCap, ListChecks, Sparkles, Check, Camera, Minus, Type, Settings2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

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
  photo: string;
  done: number[];
  textScale: number;
  headingScale: number;
  photoScale: number;
  font: string;
}

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  course: z.string().trim().min(1, "Course name is required").max(120),
});

const empty: TrainerProfile = {
  name: "", role: "", course: "", description: "", agenda: [""], fields: [], photo: "", done: [], textScale: 1, headingScale: 1, photoScale: 100, font: "classic",
};
const FONTS: Record<string, { label: string; heading: string; body: string }> = {
  classic: { label: "Classic", heading: "inherit", body: "inherit" },
  editorial: { label: "Editorial serif", heading: "'Playfair Display', serif", body: "'Outfit', sans-serif" },
  elegant: { label: "Elegant", heading: "'Fraunces', serif", body: "'Fraunces', serif" },
  modern: { label: "Modern", heading: "'Space Grotesk', sans-serif", body: "'Outfit', sans-serif" },
  display: { label: "Display", heading: "'DM Serif Display', serif", body: "'Outfit', sans-serif" },
};
const SCALE_MIN = 0.8, SCALE_MAX = 1.5;
const clampScale = (v: number) => Math.min(SCALE_MAX, Math.max(SCALE_MIN, Math.round(v * 10) / 10));

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const size = 320, c = document.createElement("canvas");
        c.width = c.height = size;
        const ctx = c.getContext("2d")!;
        const m = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, size, size);
        resolve(c.toDataURL("image/jpeg", 0.85));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
const uid = () => Math.random().toString(36).slice(2, 10);

function TrainerPage() {
  const [profile, setProfile] = useState<TrainerProfile>(empty);
  const [loaded, setLoaded] = useState(false);
  const [preview, setPreview] = useState(false);
  const [previewSettingsOpen, setPreviewSettingsOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      if (stored && typeof stored === "object") setProfile({ ...empty, ...stored, agenda: Array.isArray(stored.agenda) && stored.agenda.length ? stored.agenda : [""], fields: Array.isArray(stored.fields) ? stored.fields : [], done: Array.isArray(stored.done) ? stored.done : [], photo: typeof stored.photo === "string" ? stored.photo : "", textScale: typeof stored.textScale === "number" ? clampScale(stored.textScale) : 1, headingScale: typeof stored.headingScale === "number" ? clampScale(stored.headingScale) : 1, photoScale: typeof stored.photoScale === "number" ? Math.min(150, Math.max(60, stored.photoScale)) : 100, font: typeof stored.font === "string" && stored.font in FONTS ? stored.font : "classic" });
    } catch { /* start fresh */ }
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); }, [profile, loaded]);

  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreview(false);
        setPreviewSettingsOpen(false);
      }
    };
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

  const agenda = profile.agenda.map((text, index) => ({ text, index })).filter((a) => a.text.trim());
  const doneCount = agenda.filter((a) => profile.done.includes(a.index)).length;
  const toggleDone = (index: number) => set("done", profile.done.includes(index) ? profile.done.filter((d) => d !== index) : [...profile.done, index]);
  const sc = profile.textScale;
  const hs = profile.headingScale;
  const font = FONTS[profile.font] ?? { label: "Classic", heading: "inherit", body: "inherit" };
  const [photoError, setPhotoError] = useState("");
  const onPhoto = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setPhotoError("Please choose an image file."); return; }
    if (file.size > 8 * 1024 * 1024) { setPhotoError("Image must be under 8 MB."); return; }
    try { set("photo", await resizeImage(file)); setPhotoError(""); } catch { setPhotoError("Could not read this image."); }
  };
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
          <div className="flex items-center gap-4">
            <label className="group relative grid size-20 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-2xl border border-border bg-muted text-muted-foreground transition hover:border-primary/50 focus-within:ring-2 focus-within:ring-ring">
              {profile.photo ? <img src={profile.photo} alt="Instructor" className="size-full object-cover" /> : <Camera className="size-6" />}
              <span className="absolute inset-0 grid place-items-center bg-background/60 text-xs font-medium text-foreground opacity-0 transition group-hover:opacity-100">Change</span>
              <input type="file" accept="image/*" className="sr-only" aria-label="Upload profile picture" onChange={(e) => { onPhoto(e.target.files?.[0]); e.target.value = ""; }} />
            </label>
            <div className="grid gap-1">
              <p className="text-sm font-medium text-foreground">Profile picture</p>
              <p className="text-xs text-muted-foreground">Square photos look best. Saved on this device.</p>
              {photoError && <p className="text-xs text-destructive">{photoError}</p>}
              {profile.photo && <Button variant="ghost" size="sm" className="h-7 w-fit px-2" onClick={() => set("photo", "")}>Remove photo</Button>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2"><Label htmlFor="tr-name">Instructor name</Label><Input id="tr-name" value={profile.name} maxLength={80} onChange={(e) => set("name", e.target.value)} placeholder="Manas Kumar" />{errors["name"] && <p className="text-xs text-destructive">{errors["name"]}</p>}</div>
            <div className="grid gap-2"><Label htmlFor="tr-role">Title / role</Label><Input id="tr-role" value={profile.role} maxLength={80} onChange={(e) => set("role", e.target.value)} placeholder="Senior Technical Instructor" /></div>
          </div>
          <div className="grid gap-2"><Label htmlFor="tr-course">Course name</Label><Input id="tr-course" value={profile.course} maxLength={120} onChange={(e) => set("course", e.target.value)} placeholder="Red Hat System Administration I" />{errors["course"] && <p className="text-xs text-destructive">{errors["course"]}</p>}</div>
          <div className="grid gap-2"><Label htmlFor="tr-desc">Description</Label><Textarea id="tr-desc" rows={4} value={profile.description} maxLength={1000} onChange={(e) => set("description", e.target.value)} placeholder="What learners will achieve in this course…" /></div>

          <div className="grid gap-2">
            <Label>Agenda</Label>
            {profile.agenda.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-6 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{i + 1}.</span>
                <Input aria-label={`Agenda item ${i + 1}`} value={item} maxLength={160} onChange={(e) => set("agenda", profile.agenda.map((a, j) => j === i ? e.target.value : a))} placeholder="Introduction & setup" />
                <Button variant="ghost" size="icon" aria-label="Remove agenda item" disabled={profile.agenda.length === 1} onClick={() => setProfile((p) => ({ ...p, agenda: p.agenda.filter((_, j) => j !== i), done: p.done.filter((d) => d !== i).map((d) => d > i ? d - 1 : d) }))}><X /></Button>
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
            <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
              <motion.div className="absolute -left-24 top-10 size-96 rounded-full bg-primary/15 blur-3xl" animate={{ x: [0, 40, 0], y: [0, 30, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} />
              <motion.div className="absolute -right-20 bottom-0 size-[28rem] rounded-full bg-accent/40 blur-3xl" animate={{ x: [0, -30, 0], y: [0, -40, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} />
            </div>
            <div className="fixed right-5 top-5 z-10 flex items-center gap-2">
              <div className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-card/70 backdrop-blur"
                  aria-label="Preview settings"
                  aria-expanded={previewSettingsOpen}
                  aria-controls="trainer-preview-settings"
                  onClick={() => setPreviewSettingsOpen((open) => !open)}
                >
                  <Settings2 className="size-4" />
                </Button>
                <AnimatePresence>
                  {previewSettingsOpen && (
                    <motion.div
                      id="trainer-preview-settings"
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 top-12 grid min-w-52 gap-2 rounded-2xl border border-border bg-card/95 p-3 shadow-soft backdrop-blur"
                      style={{ transformOrigin: "top right" }}
                    >
                      <Select value={profile.font} onValueChange={(v) => set("font", v)}>
                        <SelectTrigger aria-label="Font style" className="h-9 w-full rounded-full bg-card/70 backdrop-blur"><SelectValue /></SelectTrigger>
                        <SelectContent className="z-[60]">
                          {Object.entries(FONTS).map(([k, f]) => <SelectItem key={k} value={k}><span style={{ fontFamily: f.heading }}>{f.label}</span></SelectItem>)}
                        </SelectContent>
                      </Select>
                      {([["Heading", hs, "headingScale"], ["Text", sc, "textScale"]] as const).map(([label, val, key]) => (
                        <div key={key} className="flex items-center justify-between gap-2 rounded-full border border-border bg-card/70 px-1 py-1 backdrop-blur" role="group" aria-label={`${label} size`}>
                          <Button variant="ghost" size="icon" className="size-7 rounded-full" aria-label={`Decrease ${label.toLowerCase()} size`} disabled={val <= SCALE_MIN} onClick={() => set(key, clampScale(val - 0.1))}><Minus className="size-3.5" /></Button>
                          <span className="flex min-w-16 items-center justify-center gap-1 text-xs tabular-nums text-muted-foreground"><Type className={key === "headingScale" ? "size-4" : "size-3"} />{Math.round(val * 100)}%</span>
                          <Button variant="ghost" size="icon" className="size-7 rounded-full" aria-label={`Increase ${label.toLowerCase()} size`} disabled={val >= SCALE_MAX} onClick={() => set(key, clampScale(val + 0.1))}><Plus className="size-3.5" /></Button>
                        </div>
                      ))}
                      <div className="grid gap-2 rounded-xl border border-border bg-card/70 p-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Photo card size</span>
                          <span className="tabular-nums">{profile.photoScale}%</span>
                        </div>
                        <Slider
                          aria-label="Photo card size"
                          min={60}
                          max={150}
                          step={5}
                          value={[profile.photoScale]}
                          onValueChange={([value]) => { if (typeof value === "number") set("photoScale", value); }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Button variant="outline" size="sm" className="rounded-full bg-card/70 backdrop-blur" onClick={() => { setPreview(false); setPreviewSettingsOpen(false); }}><X className="size-4" />Close</Button>
            </div>
            <div className="relative mx-auto flex min-h-full w-full flex-col justify-center gap-10 px-8 pb-16 pt-28 sm:px-12 lg:px-16" style={{ fontFamily: font.body }}>
              <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col items-start gap-6 md:flex-row md:items-center">
                <div className="relative shrink-0">
                  <motion.span aria-hidden className="absolute -inset-2 rounded-[2rem] bg-primary/25 blur-md" animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.04, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="relative grid place-items-center overflow-hidden rounded-3xl bg-primary text-4xl font-bold text-primary-foreground shadow-soft ring-4 ring-card" style={{ width: `${8 * profile.photoScale / 100}rem`, height: `${8 * profile.photoScale / 100}rem` }}>
                    {profile.photo ? <img src={profile.photo} alt={profile.name} className="size-full object-cover" /> : initials}
                  </motion.div>
                </div>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary"><span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" /><span className="relative inline-flex size-2 rounded-full bg-primary" /></span><GraduationCap className="size-4" />Your instructor</p>
                  <motion.h2 layout className="trainer-shine mt-2 break-words font-bold leading-[1.05] tracking-tight" style={{ fontFamily: font.heading, fontSize: `clamp(2.25rem, ${4 * hs}vw, ${4.5 * hs}rem)` }}>{profile.name}</motion.h2>
                  {profile.role && <p className="mt-2 text-muted-foreground" style={{ fontSize: `${1.125 * sc}rem` }}>{profile.role}</p>}
                </div>
              </motion.div>

              <div className={`grid items-stretch gap-6 ${agenda.length > 0 ? "lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]" : ""}`}>
                <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="trainer-card rounded-3xl border border-border bg-card/80 p-8 shadow-soft backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Course</p>
                  <h3 className="mt-2 break-words font-semibold leading-tight text-foreground" style={{ fontFamily: font.heading, fontSize: `${2.25 * hs}rem` }}>{profile.course}</h3>
                  <motion.div aria-hidden className="mt-4 h-1 rounded-full bg-gradient-to-r from-primary via-primary/40 to-transparent" initial={{ width: 0 }} animate={{ width: "8rem" }} transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
                  {profile.description && <p className="mt-4 max-w-3xl whitespace-pre-line leading-relaxed text-muted-foreground" style={{ fontSize: `${1.0625 * sc}rem` }}>{profile.description}</p>}
                </motion.div>

                {agenda.length > 0 && (
                  <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="trainer-card rounded-3xl border border-border bg-card/80 p-6 shadow-soft backdrop-blur">
                    <div className="flex items-center justify-between gap-3">
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"><ListChecks className="size-4 text-primary" />Agenda</p>
                      <span className="text-xs tabular-nums text-muted-foreground">{doneCount}/{agenda.length} done</span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                      <motion.div className="h-full rounded-full bg-primary" initial={false} animate={{ width: `${(doneCount / agenda.length) * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
                    </div>
                    <ol className="mt-5 space-y-2">
                      {agenda.map((a, i) => {
                        const done = profile.done.includes(a.index);
                        return (
                          <motion.li key={a.index} initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 + i * 0.08, ease: "easeOut" }}>
                            <button type="button" aria-pressed={done} onClick={() => toggleDone(a.index)} className="group flex w-full items-start gap-4 rounded-2xl px-2 py-2 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                              <motion.span layout className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold tabular-nums transition-colors duration-300 ${done ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary group-hover:bg-primary/25"}`}>
                                <AnimatePresence mode="wait" initial={false}>
                                  {done
                                    ? <motion.span key="c" initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 400, damping: 18 }}><Check className="size-4" /></motion.span>
                                    : <motion.span key="n" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>{i + 1}</motion.span>}
                                </AnimatePresence>
                              </motion.span>
                              <span className="relative pt-1 transition-colors duration-300" style={{ fontSize: `${1.125 * sc}rem` }}>
                                <span className={done ? "text-muted-foreground" : "text-foreground"}>{a.text}</span>
                                <motion.span aria-hidden className="absolute left-0 top-1/2 mt-0.5 h-0.5 rounded-full bg-muted-foreground/70" initial={false} animate={{ width: done ? "100%" : "0%" }} transition={{ duration: 0.35, ease: "easeOut" }} />
                              </span>
                            </button>
                          </motion.li>
                        );
                      })}
                    </ol>
                  </motion.div>
                )}
              </div>
              {fields.length > 0 && (
                <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="trainer-card rounded-3xl border border-border bg-card/80 p-8 shadow-soft backdrop-blur">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"><Sparkles className="size-4 text-primary" />Details</p>
                  <dl className="mt-5 divide-y divide-border">
                    {fields.map((f, i) => (
                      <motion.div key={f.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.06 }} className="flex flex-wrap justify-between gap-2 py-3">
                        <dt className="text-muted-foreground" style={{ fontSize: `${0.875 * sc}rem` }}>{f.label}</dt>
                        <dd className="text-right font-medium text-foreground" style={{ fontSize: `${1 * sc}rem` }}>{f.value}</dd>
                      </motion.div>
                    ))}
                  </dl>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
