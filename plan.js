// My week and saved settings (PRD.md 7.9). No page code here, so tests can run it in Node.
// A plan is { "YYYY-MM-DD": ["activity-id", ...] }: RootMap IDs and ISO dates only.
// Functions return a new plan instead of changing the one passed in.

const PLAN_KEY = "littleDays.plan.v1";
const SETTINGS_KEY = "littleDays.settings.v1";

function isPlanned(plan, date, id) {
  return (plan[date] || []).includes(id);
}

// Adding the same activity to the same date twice changes nothing.
function addToPlan(plan, date, id) {
  if (isPlanned(plan, date, id)) return plan;
  return { ...plan, [date]: [...(plan[date] || []), id] };
}

function removeFromPlan(plan, date, id) {
  const rest = (plan[date] || []).filter((x) => x !== id);
  const next = { ...plan };
  if (rest.length) next[date] = rest;
  else delete next[date];
  return next;
}

// Drops dates before today, IDs that aren't known activities, and anything malformed.
function cleanPlan(plan, today, knownIds) {
  const clean = {};
  if (!plan || typeof plan !== "object" || Array.isArray(plan)) return clean;
  for (const [date, ids] of Object.entries(plan)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < today || !Array.isArray(ids)) continue;
    const kept = [...new Set(ids.filter((id) => knownIds.includes(id)))];
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

function loadPlan(storage, today, knownIds) {
  return cleanPlan(readJson(storage, PLAN_KEY), today, knownIds);
}

function savePlan(storage, plan) {
  writeJson(storage, PLAN_KEY, plan);
}

// Returns { city, unit } with defaults for anything missing or invalid.
function loadSettings(storage) {
  const saved = readJson(storage, SETTINGS_KEY) || {};
  return {
    city: typeof saved.city === "string" ? saved.city : "",
    unit: saved.unit === "C" ? "C" : "F",
  };
}

function saveSettings(storage, settings) {
  writeJson(storage, SETTINGS_KEY, settings);
}

if (typeof module !== "undefined") {
  module.exports = {
    PLAN_KEY, SETTINGS_KEY, isPlanned, addToPlan, removeFromPlan, cleanPlan,
    loadPlan, savePlan, loadSettings, saveSettings,
  };
}
