import { describe, expect, test } from "bun:test";
import { calendarDateKey, eventsForDay, headingSize } from "./customization";

describe("heading control", () => {
  test("can increase and decrease an independent heading", () => {
    expect(headingSize(36)).toBe(36);
    expect(headingSize(18)).toBe(18);
    expect(headingSize(undefined, 24)).toBe(24);
  });
});
describe("timezone day events", () => {
  test("uses the selected timezone across a month boundary", () => {
    const instant = new Date("2026-10-31T20:00:00Z");
    expect(calendarDateKey(instant, "Asia/Kolkata")).toBe("2026-11-01");
    expect(calendarDateKey(instant, "America/New_York")).toBe("2026-10-31");
  });
  test("shows only events for the selected local day and timezone", () => {
    const events = [{ id: "1", title: "Practice", date: "2026-11-01", timezone: "Asia/Kolkata", time: "09:00" }];
    expect(eventsForDay(events, "2026-11-01", "Asia/Kolkata")).toHaveLength(1);
    expect(eventsForDay(events, "2026-10-31", "Asia/Kolkata")).toHaveLength(0);
    expect(eventsForDay(events, "2026-11-01", "America/New_York")).toHaveLength(0);
  });
});