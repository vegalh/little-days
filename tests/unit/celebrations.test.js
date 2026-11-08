// Run with: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { CELEBRATIONS, celebrationsOn } = require("../../data/celebrations.js");

test("Halloween shows only in the listed countries", () => {
  for (const country of ["US", "CA", "IE", "GB"]) {
    assert.deepEqual(celebrationsOn("2026-10-31", country), ["Halloween"], country);
  }
  for (const country of ["FR", "AE", "CN", "AU", "DE"]) {
    assert.deepEqual(celebrationsOn("2026-10-31", country), [], country);
  }
});

test("celebrations only match their own date", () => {
  assert.deepEqual(celebrationsOn("2026-10-30", "US"), []);
  assert.deepEqual(celebrationsOn("2026-11-01", "US"), []);
  assert.deepEqual(celebrationsOn("2027-02-14", "AU"), ["Valentine's Day"]);
  assert.deepEqual(celebrationsOn("2027-02-14", "JP"), []);
});

test("the list is small, dated month-day, and names its countries", () => {
  assert.ok(CELEBRATIONS.length <= 5);
  for (const c of CELEBRATIONS) {
    assert.match(c.date, /^\d{2}-\d{2}$/);
    assert.ok(c.countries.length > 0 && c.countries.every((code) => /^[A-Z]{2}$/.test(code)));
  }
});

test("a missing country code shows nothing", () => {
  assert.deepEqual(celebrationsOn("2026-10-31", undefined), []);
});
