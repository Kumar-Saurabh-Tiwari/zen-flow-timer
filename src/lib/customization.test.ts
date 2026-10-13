import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { calendarDateKey, eventsForDay, headingSize } from "./customization";

describe("heading control", () => {
  test("can increase and decrease an independent heading", () => {
    assert.equal(headingSize(36), 36);
    assert.equal(headingSize(18), 18);
    assert.equal(headingSize(undefined, 24), 24);
  });
});
describe("timezone day events", () => {
  test("uses the selected timezone across a month boundary", () => {
    const instant = new Date("2026-10-31T20:00:00Z");
    assert.equal(calendarDateKey(instant, "Asia/Kolkata"), "2026-11-01");
    assert.equal(calendarDateKey(instant, "America/New_York"), "2026-10-31");
  });
  test("shows only events for the selected local day and timezone", () => {
    const events = [{ id: "1", title: "Practice", date: "2026-11-01", timezone: "Asia/Kolkata", time: "09:00" }];
    assert.equal(eventsForDay(events, "2026-11-01", "Asia/Kolkata").length, 1);
    assert.equal(eventsForDay(events, "2026-10-31", "Asia/Kolkata").length, 0);
    assert.equal(eventsForDay(events, "2026-11-01", "America/New_York").length, 0);
  });
});