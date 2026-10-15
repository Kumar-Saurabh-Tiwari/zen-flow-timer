import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { holidaysForDay, regionForTimezone, upcomingHolidays } from "./holidays";

describe("regional default events", () => {
  test("Christmas shows for every region", () => {
    assert.equal(holidaysForDay("2026-12-25", "Asia/Tokyo")[0]?.title, "Christmas Day");
    assert.equal(holidaysForDay("2026-12-25", "Asia/Kolkata")[0]?.title, "Christmas Day");
  });
  test("India timezone gets Indian national days", () => {
    assert.equal(regionForTimezone("Asia/Kolkata"), "India");
    assert.equal(holidaysForDay("2026-08-15", "Asia/Kolkata")[0]?.title, "Independence Day");
    assert.equal(holidaysForDay("2026-08-15", "Europe/Berlin").length, 0);
  });
  test("US Thanksgiving is the 4th Thursday of November", () => {
    assert.equal(holidaysForDay("2026-11-26", "America/New_York")[0]?.title, "Thanksgiving");
  });
  test("upcoming list rolls into next year", () => {
    const next = upcomingHolidays("2026-12-30", "UTC", 2);
    assert.deepEqual(next.map((h) => h.date), ["2026-12-31", "2027-01-01"]);
  });
});
