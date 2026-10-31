// Run with: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { ACTIVITIES } = require("../activities.js");
const {
  PLAN_KEY, SETTINGS_KEY, isPlanned, addToPlan, removeFromPlan, cleanPlan,
  loadPlan, savePlan, loadSettings, saveSettings,
} = require("../plan.js");

const IDS = ACTIVITIES.map((a) => a.id);
const TODAY = "2026-10-31";

// Stands in for localStorage.
function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => { data[key] = String(value); },
  };
}
const blockedStorage = {
  getItem() { throw new Error("blocked"); },
  setItem() { throw new Error("blocked"); },
};

test("add: saves an activity to a date", () => {
  const plan = addToPlan({}, "2026-10-31", "washing-pumpkin");
  assert.deepEqual(plan, { "2026-10-31": ["washing-pumpkin"] });
  assert.ok(isPlanned(plan, "2026-10-31", "washing-pumpkin"));
  assert.ok(!isPlanned(plan, "2026-11-01", "washing-pumpkin"));
});

test("add: the same activity twice on the same date is ignored", () => {
  let plan = addToPlan({}, "2026-10-31", "duck-walk");
  plan = addToPlan(plan, "2026-10-31", "duck-walk");
  assert.deepEqual(plan, { "2026-10-31": ["duck-walk"] });
});

test("add: the same activity on different dates is allowed", () => {
  let plan = addToPlan({}, "2026-10-31", "duck-walk");
  plan = addToPlan(plan, "2026-11-01", "duck-walk");
  assert.deepEqual(plan, { "2026-10-31": ["duck-walk"], "2026-11-01": ["duck-walk"] });
});

test("add: doesn't change the plan passed in", () => {
  const before = { "2026-10-31": ["duck-walk"] };
  addToPlan(before, "2026-10-31", "dotting");
  assert.deepEqual(before, { "2026-10-31": ["duck-walk"] });
});

test("remove: takes one activity off a date and drops empty dates", () => {
  let plan = addToPlan(addToPlan({}, "2026-10-31", "duck-walk"), "2026-10-31", "dotting");
  plan = removeFromPlan(plan, "2026-10-31", "duck-walk");
  assert.deepEqual(plan, { "2026-10-31": ["dotting"] });
  plan = removeFromPlan(plan, "2026-10-31", "dotting");
  assert.deepEqual(plan, {});
  assert.deepEqual(removeFromPlan({}, "2026-10-31", "dotting"), {});
});

test("clean: drops past dates, unknown IDs, duplicates and malformed data", () => {
  const messy = {
    "2026-10-30": ["duck-walk"], // yesterday
    "2026-10-31": ["duck-walk", "duck-walk", "not-an-activity"],
    "2026-11-02": "dotting", // not a list
    "next tuesday": ["dotting"],
    "2026-11-03": ["not-an-activity"],
  };
  assert.deepEqual(cleanPlan(messy, TODAY, IDS), { "2026-10-31": ["duck-walk"] });
  assert.deepEqual(cleanPlan(null, TODAY, IDS), {});
  assert.deepEqual(cleanPlan(["duck-walk"], TODAY, IDS), {});
});

test("storage: a saved plan comes back after a reload", () => {
  const storage = fakeStorage();
  const plan = addToPlan(addToPlan({}, "2026-10-31", "washing-pumpkin"), "2026-11-02", "duck-walk");
  savePlan(storage, plan);
  assert.deepEqual(JSON.parse(storage.data[PLAN_KEY]), plan);
  assert.deepEqual(loadPlan(storage, TODAY, IDS), plan);
});

test("storage: only IDs and ISO dates are stored", () => {
  const storage = fakeStorage();
  savePlan(storage, addToPlan({}, "2026-10-31", "washing-pumpkin"));
  assert.equal(storage.data[PLAN_KEY], '{"2026-10-31":["washing-pumpkin"]}');
});

test("storage: corrupt or missing data gives an empty plan", () => {
  assert.deepEqual(loadPlan(fakeStorage(), TODAY, IDS), {});
  assert.deepEqual(loadPlan(fakeStorage({ [PLAN_KEY]: "{not json" }), TODAY, IDS), {});
});

test("storage: blocked storage doesn't break anything", () => {
  assert.deepEqual(loadPlan(blockedStorage, TODAY, IDS), {});
  assert.doesNotThrow(() => savePlan(blockedStorage, { "2026-10-31": ["duck-walk"] }));
  assert.deepEqual(loadSettings(blockedStorage), { city: "", age: 3, unit: "F" });
  assert.doesNotThrow(() => saveSettings(blockedStorage, { city: "Boston", age: 4, unit: "C" }));
});

test("settings: saved and loaded, with defaults for bad values", () => {
  const storage = fakeStorage();
  assert.deepEqual(loadSettings(storage), { city: "", age: 3, unit: "F" });
  saveSettings(storage, { city: "Boston", age: 5, unit: "C" });
  assert.deepEqual(loadSettings(storage), { city: "Boston", age: 5, unit: "C" });
  storage.data[SETTINGS_KEY] = JSON.stringify({ city: 42, age: 1, unit: "K" });
  assert.deepEqual(loadSettings(storage), { city: "", age: 3, unit: "F" });
});
