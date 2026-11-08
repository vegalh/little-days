// Run with: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { ACTIVITIES } = require("../../data/activities.js");
const {
  PLAN_KEY, SETTINGS_KEY, OLD_SETTINGS_KEY, isPlanned, addToPlan, removeFromPlan, cleanPlan,
  loadPlan, savePlan, loadSettings, saveSettings,
  OLD_PLAN_KEY, addPlaceToPlan, plannedPlaces, isPlacePlanned, removePlannedPlace, updatePlannedPlace,
  PLACES_KEY, OLD_PLACES_KEY, cleanPlaces, savePlace, setPlaceStatus, recordVisit, removePlace, visitCount,
  loadPlaces, storePlaces, deleteSavedData, exportData, readImport, replaceSavedData,
} = require("../../js/plan.js");

const IDS = ACTIVITIES.map((a) => a.id);
const TODAY = "2026-10-31";

// Stands in for localStorage.
function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => { data[key] = String(value); },
    removeItem: (key) => { delete data[key]; },
  };
}
const blockedStorage = {
  getItem() { throw new Error("blocked"); },
  setItem() { throw new Error("blocked"); },
  removeItem() { throw new Error("blocked"); },
};
const DEFAULTS = { unit: "F", mode: "classroom", ages: "2-6", minutes: 15, interest: "all", lang: null, location: null };

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
  assert.deepEqual(loadSettings(blockedStorage), DEFAULTS);
  assert.doesNotThrow(() => saveSettings(blockedStorage, { ...DEFAULTS, unit: "C" }));
});

test("settings: saved and loaded, with defaults for bad values", () => {
  const storage = fakeStorage();
  assert.deepEqual(loadSettings(storage), DEFAULTS);
  const chosen = {
    unit: "C", mode: "classroom", ages: "4-6", minutes: 30, interest: "nature", lang: "zh",
    location: { kind: "place", placeId: "ChIJexample" },
  };
  saveSettings(storage, chosen);
  assert.deepEqual(loadSettings(storage), chosen);
  storage.data[SETTINGS_KEY] = JSON.stringify({ unit: "K", mode: "school", ages: "7-9", minutes: 45, interest: "zoo", lang: "fr", location: 42 });
  assert.deepEqual(loadSettings(storage), DEFAULTS);
});

test("settings: only a Google place ID or a city name is kept as the location", () => {
  const storage = fakeStorage();
  saveSettings(storage, { ...DEFAULTS, location: { kind: "city", name: " Boston " } });
  assert.deepEqual(loadSettings(storage).location, { kind: "city", name: "Boston" });
  // Device positions and the example address are never saved, even if passed in.
  saveSettings(storage, { ...DEFAULTS, location: { kind: "device", latitude: 42.3, longitude: -71.2 } });
  assert.equal(loadSettings(storage).location, null);
  assert.ok(!storage.data[SETTINGS_KEY].includes("42.3"));
  saveSettings(storage, { ...DEFAULTS, location: { kind: "example", placeId: "ChIJdemo" } });
  assert.equal(loadSettings(storage).location, null);
  // Extra fields from Google (names, coordinates) are dropped from a saved place.
  saveSettings(storage, { ...DEFAULTS, location: { kind: "place", placeId: "ChIJx", label: "221 Washington St", latitude: 42.35 } });
  assert.deepEqual(JSON.parse(storage.data[SETTINGS_KEY]).location, { kind: "place", placeId: "ChIJx" });
});

test("settings: an existing v1 city and unit carry over, and v1 is removed after saving", () => {
  const storage = fakeStorage({ [OLD_SETTINGS_KEY]: JSON.stringify({ city: "Boston, Massachusetts, United States", unit: "C" }) });
  const settings = loadSettings(storage);
  assert.deepEqual(settings, { ...DEFAULTS, unit: "C", location: { kind: "city", name: "Boston, Massachusetts, United States" } });
  saveSettings(storage, settings);
  assert.equal(storage.data[OLD_SETTINGS_KEY], undefined);
  assert.deepEqual(loadSettings(storage), settings);
});

test("settings: a v1 with no city migrates to no location", () => {
  const storage = fakeStorage({ [OLD_SETTINGS_KEY]: JSON.stringify({ city: "", unit: "F" }) });
  assert.deepEqual(loadSettings(storage), DEFAULTS);
});

test("settings: v2 wins over a leftover v1", () => {
  const storage = fakeStorage({
    [OLD_SETTINGS_KEY]: JSON.stringify({ city: "Paris", unit: "C" }),
    [SETTINGS_KEY]: JSON.stringify({ unit: "F", location: null }),
  });
  assert.deepEqual(loadSettings(storage), DEFAULTS);
});

// --- My week: place visits (PRD.md 7.9) ---

const PARK = { placeId: "ChIJpark", category: "nature", time: "10:00", theme: "Leaves", notes: "Bring a bag" };

test("my week: a v1 plan carries over unchanged, and v1 is removed after saving", () => {
  const v1 = { "2026-11-01": ["duck-walk", "statue-game"], "2026-10-01": ["duck-walk"] };
  const storage = fakeStorage({ [OLD_PLAN_KEY]: JSON.stringify(v1) });
  const plan = loadPlan(storage, TODAY, IDS);
  assert.deepEqual(plan, { "2026-11-01": ["duck-walk", "statue-game"] });
  savePlan(storage, plan);
  assert.equal(storage.data[OLD_PLAN_KEY], undefined);
  assert.deepEqual(loadPlan(storage, TODAY, IDS), plan);
});

test("my week: places sit beside activities, once per date, with time, theme and notes", () => {
  let plan = addToPlan({}, "2026-11-07", "duck-walk");
  plan = addPlaceToPlan(plan, "2026-11-07", PARK, "e1");
  plan = addPlaceToPlan(plan, "2026-11-07", { ...PARK, theme: "Again" }, "e2");
  assert.equal(plannedPlaces(plan, "2026-11-07").length, 1);
  assert.ok(isPlanned(plan, "2026-11-07", "duck-walk"));
  assert.ok(isPlacePlanned(plan, "2026-11-07", "ChIJpark"));
  assert.deepEqual(plan["2026-11-07"][1], { kind: "place", entry: "e1", placeId: "ChIJpark", category: "nature", time: "10:00", theme: "Leaves", notes: "Bring a bag" });
  // Removing the activity leaves the place, and the other way round.
  assert.deepEqual(removeFromPlan(plan, "2026-11-07", "duck-walk")["2026-11-07"].length, 1);
  assert.deepEqual(removePlannedPlace(plan, "e1"), { "2026-11-07": ["duck-walk"] });
});

test("my week: a planned visit can be edited and moved to another date", () => {
  let plan = addPlaceToPlan({}, "2026-11-07", PARK, "e1");
  plan = updatePlannedPlace(plan, "e1", { date: "2026-11-08", time: "", theme: "Sounds", notes: "" });
  assert.equal(plan["2026-11-07"], undefined);
  assert.deepEqual(plan["2026-11-08"], [{ kind: "place", entry: "e1", placeId: "ChIJpark", category: "nature", time: "", theme: "Sounds", notes: "" }]);
  // A date where the same place is already planned is refused.
  plan = addPlaceToPlan(plan, "2026-11-09", PARK, "e2");
  assert.deepEqual(updatePlannedPlace(plan, "e2", { date: "2026-11-08" }), plan);
});

test("my week: cleaning keeps valid place visits and drops malformed ones", () => {
  const raw = { "2026-11-07": ["duck-walk", { kind: "place", entry: "e1", placeId: "ChIJ", time: "9am", theme: 4 }, { kind: "place" }, "not-an-activity"] };
  assert.deepEqual(cleanPlan(raw, TODAY, IDS), { "2026-11-07": ["duck-walk", { kind: "place", entry: "e1", placeId: "ChIJ", category: null, time: "", theme: "", notes: "" }] });
});

// --- My Places and the journal (PRD.md 7.17) ---

test("places: save, mark explored with journal entries, revisit, remove", () => {
  let places = savePlace({}, "ChIJpark", "nature", "2026-11-02");
  assert.deepEqual(places.ChIJpark, { status: "want", category: "nature", saved: "2026-11-02", visits: [], note: "" });
  places = recordVisit(places, "ChIJpark", "nature", "2026-11-04", { date: "2026-11-04", observation: "Different leaf shapes", next: "Look for changes in the trees" });
  places = setPlaceStatus(places, "ChIJpark", "revisit", "nature", "2026-11-05");
  places = recordVisit(places, "ChIJpark", "nature", "2026-11-12", { date: "2026-11-12", observation: "Birds by the pond" });
  const park = places.ChIJpark;
  assert.equal(park.status, "explored");
  assert.equal(visitCount(places, "ChIJpark"), 2);
  // Earlier observations are never overwritten.
  assert.deepEqual(park.visits[0], { date: "2026-11-04", observation: "Different leaf shapes", next: "Look for changes in the trees" });
  assert.deepEqual(park.visits[1], { date: "2026-11-12", observation: "Birds by the pond", next: "" });
  // Saving again keeps everything.
  assert.deepEqual(savePlace(places, "ChIJpark", "nature", "2026-12-01"), places);
  assert.deepEqual(removePlace(places, "ChIJpark"), {});
  // A visit can be recorded for a place that wasn't saved first.
  assert.equal(recordVisit({}, "ChIJnew", "art-culture", "2026-11-04", { date: "2026-11-04" }).ChIJnew.status, "explored");
  assert.deepEqual(recordVisit({}, "ChIJnew", null, "2026-11-04", { date: "Nov 4" }), {});
});

test("places: v1 visits and notes carry over, and v1 is removed after saving", () => {
  const v1 = { ChIJpark: { status: "explored", visits: ["2026-11-04"], note: "Lovely" }, broken: { status: "?" } };
  const storage = fakeStorage({ [OLD_PLACES_KEY]: JSON.stringify(v1) });
  const places = loadPlaces(storage);
  assert.deepEqual(places, { ChIJpark: { status: "explored", category: null, saved: "", visits: [{ date: "2026-11-04", observation: "", next: "" }], note: "Lovely" } });
  storePlaces(storage, places);
  assert.equal(storage.data[OLD_PLACES_KEY], undefined);
  assert.deepEqual(loadPlaces(storage), places);
  // Only IDs and the adult's own words are stored.
  assert.doesNotMatch(storage.data[PLACES_KEY], /lat|lng|address|displayName/);
});

test("delete my saved data removes every Little Days key, old versions included", () => {
  const storage = fakeStorage({
    [PLAN_KEY]: "{}", [OLD_PLAN_KEY]: "{}", [SETTINGS_KEY]: "{}", [OLD_SETTINGS_KEY]: "{}",
    [PLACES_KEY]: "{}", [OLD_PLACES_KEY]: "{}", "littleDays.future.v9": "{}", "someoneElse": "keep",
  });
  storage.key = (i) => Object.keys(storage.data)[i];
  Object.defineProperty(storage, "length", { get: () => Object.keys(storage.data).length });
  deleteSavedData(storage);
  assert.deepEqual(Object.keys(storage.data), ["someoneElse"]);
  assert.doesNotThrow(() => deleteSavedData(blockedStorage));
});

// --- Export and import (PRD.md 7.18) ---

function filledStorage() {
  const storage = fakeStorage();
  saveSettings(storage, { ...DEFAULTS, unit: "C", mode: "classroom", location: { kind: "place", placeId: "ChIJhome" } });
  storePlaces(storage, recordVisit({}, "ChIJpark", "nature", TODAY, { date: TODAY, observation: "Leaves", next: "Trees" }));
  savePlan(storage, addPlaceToPlan(addToPlan({}, "2026-11-07", "duck-walk"), "2026-11-07", PARK, "e1"));
  return storage;
}

test("export: settings, places with the journal, and the plan, with nothing from Google", () => {
  const data = exportData(filledStorage(), TODAY, IDS, new Date("2026-10-31T12:00:00Z"));
  assert.equal(data.format, "little-days-data");
  assert.equal(data.version, 1);
  assert.equal(data.exported, "2026-10-31T12:00:00.000Z");
  assert.equal(data.settings.unit, "C");
  assert.deepEqual(data.places.ChIJpark.visits, [{ date: TODAY, observation: "Leaves", next: "Trees" }]);
  assert.deepEqual(data.plan["2026-11-07"][0], "duck-walk");
  assert.doesNotMatch(JSON.stringify(data), /AIza|displayName|formattedAddress|"lat"/);
});

test("import: a backup round-trips into empty storage", () => {
  const file = JSON.stringify(exportData(filledStorage(), TODAY, IDS));
  const { data, error } = readImport(file, TODAY, IDS);
  assert.equal(error, undefined);
  const target = fakeStorage({ [OLD_PLAN_KEY]: JSON.stringify({ "2026-11-01": ["statue-game"] }) });
  assert.equal(replaceSavedData(target, data), true);
  assert.deepEqual(exportData(target, TODAY, IDS, new Date(0)).places, data.places);
  assert.deepEqual(loadPlan(target, TODAY, IDS), data.plan);
  assert.equal(target.data[OLD_PLAN_KEY], undefined); // replaced, not merged
});

test("import: malformed, foreign, unsupported or incomplete files are refused", () => {
  assert.match(readImport("{not json", TODAY, IDS).error, /isn't valid JSON/);
  assert.match(readImport("[]", TODAY, IDS).error, /isn't a Little Days backup/);
  assert.match(readImport(JSON.stringify({ format: "other" }), TODAY, IDS).error, /isn't a Little Days backup/);
  assert.match(readImport(JSON.stringify({ format: "little-days-data", version: 2 }), TODAY, IDS).error, /different version/);
  assert.match(readImport(JSON.stringify({ format: "little-days-data", version: 1, settings: {}, places: [] }), TODAY, IDS).error, /incomplete/);
  assert.match(readImport("x".repeat(1000001), TODAY, IDS).error, /too large/);
});

test("import: unsafe keys and bad values never get in", () => {
  const file = `{"format":"little-days-data","version":1,"settings":{"unit":"K","location":{"kind":"place","placeId":"__proto__"}},
    "places":{"__proto__":{"status":"want"},"constructor":{"status":"want"},"ok-id":{"status":"explored","visits":[{"date":"2026-11-01","observation":"<b>hi</b>"}]},"bad id!":{"status":"want"}},
    "plan":{"__proto__":["duck-walk"],"2026-11-07":["duck-walk",{"kind":"place","entry":"__proto__","placeId":"x"},{"kind":"place","entry":"e1","placeId":"toString"}]}}`;
  const { data } = readImport(file, TODAY, IDS);
  assert.deepEqual(Object.keys(data.places), ["ok-id"]);
  assert.equal(Object.getPrototypeOf(data.places), Object.prototype);
  assert.equal(({}).status, undefined); // nothing leaked onto Object.prototype
  assert.equal(data.places["ok-id"].visits[0].observation, "<b>hi</b>"); // kept as text; the page escapes it
  assert.deepEqual(data.plan, { "2026-11-07": ["duck-walk"] });
  assert.equal(data.settings.unit, "F");
  assert.equal(data.settings.location, null);
});

test("import: if storage fills up part way, the old data is put back", () => {
  const storage = filledStorage();
  const before = { ...storage.data };
  let writes = 0;
  const setItem = storage.setItem;
  storage.setItem = (key, value) => {
    if (++writes === 2) throw new Error("QuotaExceededError");
    setItem(key, value);
  };
  const { data } = readImport(JSON.stringify({ format: "little-days-data", version: 1, settings: {}, places: {}, plan: {} }), TODAY, IDS);
  assert.equal(replaceSavedData(storage, data), false);
  assert.deepEqual(storage.data, before);
});
