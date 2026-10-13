import { SlidersHorizontal, UserRound } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import TimezoneSelect from "@/components/TimezoneSelect";
import HeadingSizeControl from "@/components/HeadingSizeControl";

interface SettingsSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  onNameChange: (name: string) => void;
  heading: string;
  onHeadingChange: (heading: string) => void;
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
  headingSize: number;
  onHeadingSizeChange: (size: number) => void;
  timerHeadingSize: number;
  onTimerHeadingSizeChange: (size: number) => void;
  showControls: boolean;
  onShowControlsChange: (show: boolean) => void;
  showPlan: boolean;
  onShowPlanChange: (show: boolean) => void;
  onSave: () => void;
  onOnboarding: () => void;
}

export default function SettingsSidebar(props: SettingsSidebarProps) {
  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col overflow-y-auto bg-card p-0 sm:max-w-[410px]">
        <SheetHeader className="border-b border-border px-6 py-7 text-left">
          <div className="mb-3 flex items-center gap-2 text-primary"><SlidersHorizontal className="size-5" /><span className="text-xs font-semibold uppercase tracking-widest">Your workspace</span></div>
          <SheetTitle className="text-2xl">Profile & settings</SheetTitle>
          <SheetDescription className="sr-only">Profile, typography and workspace visibility settings</SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-7 px-6 py-6">
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold"><UserRound className="size-4 text-muted-foreground" />Profile</h3>
            <div className="grid gap-2"><Label htmlFor="name">Name</Label><Input id="name" value={props.name} onChange={(e) => props.onNameChange(e.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="heading">Heading</Label><Input id="heading" value={props.heading} onChange={(e) => props.onHeadingChange(e.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="timezone">Timezone</Label><TimezoneSelect id="timezone" value={props.timezone} onChange={props.onTimezoneChange} /></div>
          </section>
          <section className="space-y-5 border-t border-border pt-6">
            <h3 className="text-sm font-semibold">Typography</h3>
            <HeadingSizeControl label="Profile heading size" value={props.headingSize} onChange={props.onHeadingSizeChange} />
            <p className="custom-heading break-words font-semibold text-foreground" style={{ fontSize: `${props.headingSize}px` }}>{props.heading || "Practice Time"}</p>
            <HeadingSizeControl label="New timer heading size" value={props.timerHeadingSize} onChange={props.onTimerHeadingSizeChange} />
          </section>
          <section className="space-y-4 border-t border-border pt-6">
            <h3 className="text-sm font-semibold">Workspace</h3>
            <div className="flex items-center justify-between gap-3"><Label htmlFor="session-controls" className="text-sm font-normal">Session controls</Label><Switch id="session-controls" checked={props.showControls} onCheckedChange={props.onShowControlsChange} /></div>
            <div className="flex items-center justify-between gap-3"><Label htmlFor="plan-panel" className="text-sm font-normal">Plan / Add block</Label><Switch id="plan-panel" checked={props.showPlan} onCheckedChange={props.onShowPlanChange} /></div>
          </section>
        </div>
        <div className="sticky bottom-0 flex flex-wrap gap-2 border-t border-border bg-card px-6 py-5">
          <Button onClick={props.onSave} disabled={!props.name.trim()}>Save profile</Button>
          <Button variant="ghost" onClick={props.onOnboarding}>Re-run onboarding</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}