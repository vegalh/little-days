// My week, My Places and saved settings (PRD.md 7.9, 7.17, 7.18). No page code here, so
// tests can run it in Node. Functions return new objects instead of changing the ones
// passed in.
//
// A plan is { "YYYY-MM-DD": [entry, ...] }. An entry is a RootMap activity ID (a string,
// exactly as in v1) or a planned place visit:
// { kind: "place", entry, placeId, category, time, theme, notes }
// entry is the visit's own ID, so it can be edited or removed. Only IDs, dates, fixed
// choices and the adult's own words: never a Google name, address or coordinate.

const PLAN_KEY = "littleDays.plan.v2";
const OLD_PLAN_KEY = "littleDays.plan.v1";
const SETTINGS_KEY = "littleDays.settings.v2";
const OLD_SETTINGS_KEY = "littleDays.settings.v1";
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const text = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");
// Google place IDs and Little Days entry IDs use only these characters. Anything else, such as
// "__proto__" or "constructor" from an imported file, is refused rather than used as a key.
const SAFE_ID = /^[A-Za-z0-9_-]{1,300}$/;
const isSafeId = (id) => typeof id === "string" && SAFE_ID.test(id) && !(id in Object.prototype);

function isPlanned(plan, date, id) {
  return (plan[date] || []).includes(id);
}

// Adding the same activity to the same date twice changes nothing.
function addToPlan(plan, date, id) {
  if (isPlanned(plan, date, id)) return plan;
  return { ...plan, [date]: [...(plan[date] || []), id] };
}

function withDate(plan, date, entries) {
  const next = { ...plan };
  if (entries.length) next[date] = entries;
  else delete next[date];
  return next;
}

function removeFromPlan(plan, date, id) {
  return withDate(plan, date, (plan[date] || []).filter((x) => x !== id));
}

// --- Planned place visits ---

function cleanPlannedPlace(visit) {
  if (!visit || visit.kind !== "place" || !isSafeId(visit.placeId) || !isSafeId(visit.entry)) return null;
  return {
    kind: "place",
    entry: text(visit.entry, 100),
    placeId: text(visit.placeId, 300),
    category: text(visit.category, 40) || null,
    time: /^\d{2}:\d{2}$/.test(visit.time) ? visit.time : "",
    theme: text(visit.theme, 80),
    notes: text(visit.notes, 500),
  };
}

function plannedPlaces(plan, date) {
  return (plan[date] || []).filter((x) => typeof x === "object");
}

function isPlacePlanned(plan, date, placeId) {
  return plannedPlaces(plan, date).some((visit) => visit.placeId === placeId);
}

// details: { placeId, category, time, theme, notes }. entry is a new unique ID from the caller.
// The same place can't be planned twice on one date.
function addPlaceToPlan(plan, date, details, entry) {
  const visit = cleanPlannedPlace({ ...details, kind: "place", entry });
  if (!visit || isPlacePlanned(plan, date, visit.placeId)) return plan;
  return { ...plan, [date]: [...(plan[date] || []), visit] };
}

// Returns [date, visit] for a planned visit's entry ID, or null.
function findPlannedPlace(plan, entry) {
  for (const [date, entries] of Object.entries(plan)) {
    const visit = entries.find((x) => typeof x === "object" && x.entry === entry);
    if (visit) return [date, visit];
  }
  return null;
}

function removePlannedPlace(plan, entry) {
  const found = findPlannedPlace(plan, entry);
  if (!found) return plan;
  return withDate(plan, found[0], plan[found[0]].filter((x) => x !== found[1]));
}

// changes: { date, time, theme, notes }. Moving to a date where the same place is
// already planned changes nothing.
function updatePlannedPlace(plan, entry, changes) {
  const found = findPlannedPlace(plan, entry);
  if (!found) return plan;
  const [oldDate, visit] = found;
  const date = ISO_DATE.test(changes.date) ? changes.date : oldDate;
  if (date !== oldDate && isPlacePlanned(plan, date, visit.placeId)) return plan;
  const updated = cleanPlannedPlace({ ...visit, ...changes });
  const without = removePlannedPlace(plan, entry);
  return { ...without, [date]: [...(without[date] || []), updated] };
}

// Drops dates before today, IDs that aren't known activities, and anything malformed.
// Place visits are kept: their place IDs can only be checked with Google.
function cleanPlan(plan, today, knownIds) {
  const clean = {};
  if (!plan || typeof plan !== "object" || Array.isArray(plan)) return clean;
  for (const [date, entries] of Object.entries(plan)) {
    if (!ISO_DATE.test(date) || date < today || !Array.isArray(entries)) continue;
    const kept = [];
    for (const entry of entries) {
      if (typeof entry === "string") {
        if (knownIds.includes(entry) && !kept.includes(entry)) kept.push(entry);
      } else {
        const visit = cleanPlannedPlace(entry);
        if (visit && !kept.some((x) => x.placeId === visit.placeId)) kept.push(visit);
      }
    }
    if (kept.length) clean[date] = kept;
  }
  return clean;
}

// storage is localStorage in the page, or a fake in tests. Storage can be blocked
// (private browsing), so every read and write is wrapped and failures are ignored.
function readJson(storage, key) {
  try {
    return JSON.parse(storage.getItem(key));
  } catch {
    return null;
  }
}

function writeJson(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Nothing is saved this visit; the page still works.
  }
}

function removeKey(storage, key) {
  try {
    storage.removeItem(key);
  } catch {
    // Nothing to remove, or storage is blocked.
  }
}

// v1 plans ({ date: ["activity-id"] }) are valid v2 plans, so they're read as they are.
function loadPlan(storage, today, knownIds) {
  return cleanPlan(readJson(storage, PLAN_KEY) || readJson(storage, OLD_PLAN_KEY), today, knownIds);
}

// Saves v2 and removes v1, so the migration happens once.
function savePlan(storage, plan) {
  writeJson(storage, PLAN_KEY, plan);
  removeKey(storage, OLD_PLAN_KEY);
}

// --- My Places and the exploration journal (PRD.md 7.17) ---
// { "placeId": { status, category, saved, visits: [{ date, observation, next }], note } }
// status: "want" | "explored" | "revisit". category is a Little Days category key.
// visits is the journal, oldest first: each recorded visit is kept, never overwritten.
// note only carries over a v1 note (Little Days never showed a field to write one).

const PLACES_KEY = "littleDays.places.v2";
const OLD_PLACES_KEY = "littleDays.places.v1";
const PLACE_STATUSES = ["want", "explored", "revisit"];

function cleanVisit(visit) {
  // v1 recorded a visit as just its date.
  if (typeof visit === "string") visit = { date: visit };
  if (!visit || !ISO_DATE.test(visit.date)) return null;
  return { date: visit.date, observation: text(visit.observation, 500), next: text(visit.next, 200) };
}

function cleanPlaces(places) {
  const clean = {};
  if (!places || typeof places !== "object" || Array.isArray(places)) return clean;
  for (const [id, entry] of Object.entries(places)) {
    if (!isSafeId(id) || !entry || !PLACE_STATUSES.includes(entry.status)) continue;
    const visits = (Array.isArray(entry.visits) ? entry.visits : []).map(cleanVisit).filter(Boolean);
    clean[id] = {
      status: entry.status,
      category: text(entry.category, 40) || null,
      saved: ISO_DATE.test(entry.saved) ? entry.saved : "",
      visits: visits.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)),
      note: text(entry.note, 500),
    };
  }
  return clean;
}

function placeEntry(places, id, category, today) {
  return places[id] || { status: "want", category: category || null, saved: today, visits: [], note: "" };
}

// Save keeps any status, visits and note already recorded.
function savePlace(places, id, category, today) {
  return { ...places, [id]: placeEntry(places, id, category, today) };
}

// Want to explore, or Revisit (another visit with fresh ideas). Visits stay.
function setPlaceStatus(places, id, status, category, today) {
  if (status !== "want" && status !== "revisit") return places;
  return { ...places, [id]: { ...placeEntry(places, id, category, today), status } };
}

// Marks a place explored by adding a journal entry; earlier entries are kept as they are.
function recordVisit(places, id, category, today, visit) {
  const clean = cleanVisit(visit);
  if (!clean) return places;
  const entry = placeEntry(places, id, category, today);
  const visits = [...entry.visits, clean].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return { ...places, [id]: { ...entry, status: "explored", visits } };
}

// Removes the place and its journal.
function removePlace(places, id) {
  const next = { ...places };
  delete next[id];
  return next;
}

function visitCount(places, id) {
  return places[id] ? places[id].visits.length : 0;
}

function loadPlaces(storage) {
  return cleanPlaces(readJson(storage, PLACES_KEY) || readJson(storage, OLD_PLACES_KEY));
}

// Saves v2 and removes v1, so the migration happens once.
function storePlaces(storage, places) {
  writeJson(storage, PLACES_KEY, places);
  removeKey(storage, OLD_PLACES_KEY);
}

// "Delete my saved data" (PRD.md 7.18): every Little Days key, old versions included.
function deleteSavedData(storage) {
  const keys = new Set([PLAN_KEY, OLD_PLAN_KEY, SETTINGS_KEY, OLD_SETTINGS_KEY, PLACES_KEY, OLD_PLACES_KEY]);
  try {
    for (let i = 0; i < storage.length; i++) {
      if (storage.key(i).startsWith("littleDays.")) keys.add(storage.key(i));
    }
  } catch {
    // The known keys are removed below either way.
  }
  for (const key of keys) removeKey(storage, key);
}

// Settings (PRD.md 7.18). The first value of each list is the default.
const SETTING_CHOICES = {
  unit: ["F", "C"],
  mode: ["classroom", "family"],
  ages: ["2-6", "under-2", "2-3", "4-6"],
  minutes: [15, 5, 10, 20, 30],
  interest: ["all", "nature", "everyday-life", "community-helpers", "art-culture", "animals-wildlife", "movement"],
  lang: [null, "en", "zh"], // null: not chosen yet, so Chinese
};

// Only a picked Google address or a searched city is ever saved, never a device position.
function cleanLocation(location) {
  if (!location || typeof location !== "object") return null;
  if (location.kind === "place" && typeof location.placeId === "string" && location.placeId) {
    return { kind: "place", placeId: location.placeId };
  }
  if (location.kind === "city" && typeof location.name === "string" && location.name.trim()) {
    return { kind: "city", name: location.name.trim() };
  }
  return null;
}

// v1 was { city, unit }. Its city is kept as a fallback city so a returning visitor
// still gets their weather.
function settingsFromV1(old) {
  if (!old || typeof old !== "object") return {};
  return { unit: old.unit, location: { kind: "city", name: old.city } };
}

// Returns { unit, mode, ages, minutes, interest, lang, location } with defaults for
// anything missing or invalid. Reads v1 when there is no v2 yet.
function loadSettings(storage) {
  return cleanSettings(readJson(storage, SETTINGS_KEY) || settingsFromV1(readJson(storage, OLD_SETTINGS_KEY)));
}

function cleanSettings(saved) {
  if (!saved || typeof saved !== "object") saved = {};
  const settings = {};
  for (const [name, choices] of Object.entries(SETTING_CHOICES)) {
    settings[name] = choices.includes(saved[name]) ? saved[name] : choices[0];
  }
  settings.location = cleanLocation(saved.location);
  if (settings.location && settings.location.kind === "place" && !isSafeId(settings.location.placeId)) settings.location = null;
  return settings;
}

// --- Export and import (PRD.md 7.18) ---
// The file holds only what Little Days stores itself: settings, My Places with the journal,
// and My week. No API key (it's never stored) and no Google place details (only place IDs).

const EXPORT_FORMAT = "little-days-data";
const EXPORT_VERSION = 1;
const MAX_IMPORT_BYTES = 1000000;

function exportData(storage, today, knownIds, now = new Date()) {
  return {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    exported: now.toISOString(),
    settings: loadSettings(storage),
    places: loadPlaces(storage),
    plan: loadPlan(storage, today, knownIds),
  };
}

// Returns { data } with the cleaned contents, or { error } with a sentence for the page.
// Nothing is written here.
function readImport(fileText, today, knownIds) {
  if (typeof fileText !== "string" || fileText.length > MAX_IMPORT_BYTES) {
    return { error: "That file is too large to be a Little Days backup." };
  }
  let raw;
  try {
    raw = JSON.parse(fileText);
  } catch {
    return { error: "That file isn't a Little Days backup (it isn't valid JSON)." };
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw) || raw.format !== EXPORT_FORMAT) {
    return { error: "That file isn't a Little Days backup." };
  }
  if (raw.version !== EXPORT_VERSION) {
    return { error: "This backup was made by a different version of Little Days and can't be imported." };
  }
  for (const part of ["settings", "places", "plan"]) {
    if (!raw[part] || typeof raw[part] !== "object" || Array.isArray(raw[part])) {
      return { error: "That backup is incomplete, so nothing was imported." };
    }
  }
  return {
    data: {
      settings: cleanSettings(raw.settings),
      places: cleanPlaces(raw.places),
      plan: cleanPlan(raw.plan, today, knownIds),
    },
  };
}

// Replaces everything Little Days has saved with data from readImport. If storage
// refuses any write (full, or blocked), what was there before is put back and false
// is returned.
function replaceSavedData(storage, data) {
  const writes = [[SETTINGS_KEY, data.settings], [PLACES_KEY, data.places], [PLAN_KEY, data.plan]];
  const before = writes.map(([key]) => {
    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  });
  try {
    for (const [key, value] of writes) storage.setItem(key, JSON.stringify(value));
  } catch {
    writes.forEach(([key], i) => {
      try {
        if (before[i] == null) storage.removeItem(key);
        else storage.setItem(key, before[i]);
      } catch {
        // Storage is refusing everything; there's nothing more to do.
      }
    });
    return false;
  }
  for (const key of [OLD_SETTINGS_KEY, OLD_PLACES_KEY, OLD_PLAN_KEY]) removeKey(storage, key);
  return true;
}

// Saves v2 and removes v1, so the migration happens once.
function saveSettings(storage, settings) {
  writeJson(storage, SETTINGS_KEY, { ...settings, location: cleanLocation(settings.location) });
  removeKey(storage, OLD_SETTINGS_KEY);
}

if (typeof module !== "undefined") {
  module.exports = {
    PLAN_KEY, OLD_PLAN_KEY, SETTINGS_KEY, OLD_SETTINGS_KEY, SETTING_CHOICES, isPlanned, addToPlan, removeFromPlan,
    cleanPlan, loadPlan, savePlan, loadSettings, saveSettings,
    plannedPlaces, isPlacePlanned, addPlaceToPlan, findPlannedPlace, removePlannedPlace, updatePlannedPlace,
    PLACES_KEY, OLD_PLACES_KEY, cleanPlaces, savePlace, setPlaceStatus, recordVisit, removePlace, visitCount,
    loadPlaces, storePlaces, deleteSavedData, cleanSettings, exportData, readImport, replaceSavedData,
  };
}
