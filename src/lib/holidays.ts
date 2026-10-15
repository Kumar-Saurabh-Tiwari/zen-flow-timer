export interface Holiday {
  date: string; // YYYY-MM-DD
  title: string;
  region: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const key = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

/** nth weekday (0=Sun) of a month; n=-1 means last. */
function nthWeekday(year: number, month: number, weekday: number, n: number) {
  if (n > 0) {
    const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
    return 1 + ((weekday - first + 7) % 7) + (n - 1) * 7;
  }
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const last = new Date(Date.UTC(year, month - 1, lastDay)).getUTCDay();
  return lastDay - ((last - weekday + 7) % 7);
}

/** Region inferred from an IANA timezone. */
export function regionForTimezone(tz: string): string {
  if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") return "India";
  if (["America/Toronto", "America/Vancouver", "America/Halifax"].includes(tz)) return "Canada";
  if (tz.startsWith("America/") && ["New_York", "Chicago", "Denver", "Los_Angeles", "Phoenix", "Anchorage"].some((c) => tz.endsWith(c))) return "United States";
  if (tz === "Pacific/Honolulu") return "United States";
  if (tz === "Europe/London" || tz === "Europe/Dublin") return "United Kingdom & Ireland";
  if (tz.startsWith("Australia/")) return "Australia";
  if (tz.startsWith("Europe/")) return "Europe";
  return "Global";
}

export function holidaysForYear(year: number, timezone: string): Holiday[] {
  const region = regionForTimezone(timezone);
  const g = (m: number, d: number, title: string): Holiday => ({ date: key(year, m, d), title, region: "Global" });
  const r = (m: number, d: number, title: string): Holiday => ({ date: key(year, m, d), title, region });
  const list: Holiday[] = [
    g(1, 1, "New Year's Day"),
    g(2, 14, "Valentine's Day"),
    g(3, 8, "International Women's Day"),
    g(4, 22, "Earth Day"),
    g(10, 31, "Halloween"),
    g(12, 24, "Christmas Eve"),
    g(12, 25, "Christmas Day"),
    g(12, 31, "New Year's Eve"),
  ];
  switch (region) {
    case "India":
      list.push(r(1, 26, "Republic Day"), r(8, 15, "Independence Day"), r(10, 2, "Gandhi Jayanti"), r(11, 14, "Children's Day"), r(9, 5, "Teachers' Day"));
      break;
    case "United States":
      list.push(r(1, nthWeekday(year, 1, 1, 3), "Martin Luther King Jr. Day"), r(5, nthWeekday(year, 5, 1, -1), "Memorial Day"), r(7, 4, "Independence Day"), r(9, nthWeekday(year, 9, 1, 1), "Labor Day"), r(11, 11, "Veterans Day"), r(11, nthWeekday(year, 11, 4, 4), "Thanksgiving"));
      break;
    case "Canada":
      list.push(r(7, 1, "Canada Day"), r(9, nthWeekday(year, 9, 1, 1), "Labour Day"), r(10, nthWeekday(year, 10, 1, 2), "Thanksgiving"), r(12, 26, "Boxing Day"));
      break;
    case "United Kingdom & Ireland":
      list.push(r(3, 17, "St. Patrick's Day"), r(5, nthWeekday(year, 5, 1, -1), "Spring Bank Holiday"), r(11, 5, "Bonfire Night"), r(12, 26, "Boxing Day"));
      break;
    case "Australia":
      list.push(r(1, 26, "Australia Day"), r(4, 25, "Anzac Day"), r(12, 26, "Boxing Day"));
      break;
    case "Europe":
      list.push(r(5, 1, "Labour Day"), r(5, 9, "Europe Day"), r(12, 26, "St. Stephen's Day"));
      break;
  }
  return list.sort((a, b) => a.date.localeCompare(b.date));
}

export function holidaysForDay(date: string, timezone: string): Holiday[] {
  const year = Number(date.slice(0, 4));
  return holidaysForYear(year, timezone).filter((h) => h.date === date);
}

export function upcomingHolidays(fromDate: string, timezone: string, count = 4): Holiday[] {
  const year = Number(fromDate.slice(0, 4));
  return [...holidaysForYear(year, timezone), ...holidaysForYear(year + 1, timezone)]
    .filter((h) => h.date >= fromDate)
    .slice(0, count);
}
