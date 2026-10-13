import { Minus, Plus, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { HEADING_MAX, HEADING_MIN, headingSize } from "@/lib/customization";

export default function HeadingSizeControl({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div className="grid min-w-0 gap-3">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="flex items-center gap-2 font-medium"><Type className="size-4 text-muted-foreground" />{label}</span>
        <output className="shrink-0 tabular-nums text-muted-foreground">{value}px</output>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="size-8 shrink-0" aria-label={`Decrease ${label.toLowerCase()}`} disabled={value <= HEADING_MIN} onClick={() => onChange(headingSize(value - 2))}><Minus /></Button>
        <Slider aria-label={label} min={HEADING_MIN} max={HEADING_MAX} step={1} value={[value]} onValueChange={(values) => onChange(headingSize(values[0], value))} />
        <Button variant="outline" size="icon" className="size-8 shrink-0" aria-label={`Increase ${label.toLowerCase()}`} disabled={value >= HEADING_MAX} onClick={() => onChange(headingSize(value + 2))}><Plus /></Button>
      </div>
    </div>
  );
}