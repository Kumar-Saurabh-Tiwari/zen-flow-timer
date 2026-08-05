import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TIMEZONES } from "@/lib/timezones";

interface TimezoneSelectProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

export default function TimezoneSelect({ value, onChange, id }: TimezoneSelectProps) {
  const options = TIMEZONES.includes(value) ? TIMEZONES : [value, ...TIMEZONES];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder="Select timezone" />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {options.map((tz) => (
          <SelectItem key={tz} value={tz}>
            {tz.replace(/_/g, " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
