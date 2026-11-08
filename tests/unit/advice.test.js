// Run with: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { ACTIVITIES } = require("../../data/activities.js");
const { weatherFor, seasonFor, pickIdeas } = require("../../js/recommend.js");
const { toFahrenheit, toMph, formatTemp, formatWind, formatRain, WEAR_LIMITS, whatToWear, explainDay, activityDetails } = require("../../js/advice.js");

const CLEAR = { code: 0, feelsMax: 18, feelsMin: 14, gusts: 20, rainChance: 0, uv: 2 };
function day(values = {}) {
  const d = { ...CLEAR, ...values };
  return { ...d, weather: weatherFor(d) };
}
const byId = (id) => ACTIVITIES.find((a) => a.id === id);

// --- Units ---

test("units: Celsius to Fahrenheit and km/h to mph", () => {
  assert.equal(toFahrenheit(0), 32);
  assert.equal(toFahrenheit(100), 212);
  assert.equal(toFahrenheit(-40), -40);
  assert.ok(Math.abs(toMph(100) - 62.1371) < 1e-9);
});

test("units: display rounds and pairs °F with mph, °C with km/h", () => {
  assert.equal(formatTemp(12.0, "F"), "54°");
  assert.equal(formatTemp(12.0, "C"), "12°");
  assert.equal(formatTemp(-0.4, "C"), "0°"); // not "-0°"
  assert.equal(formatWind(42.8, "F"), "27 mph");
  assert.equal(formatWind(42.8, "C"), "43 km/h");
  assert.equal(formatTemp(null, "F"), "–");
  assert.equal(formatWind(undefined, "C"), "–");
});

test("units: switching units never changes the weather rules", () => {
  // Rules take °C and km/h only; the unit is a display choice.
  assert.deepEqual(whatToWear(day({ feelsMax: 5 })), whatToWear(day({ feelsMax: 5 })));
  assert.equal(weatherFor({ ...CLEAR, feelsMax: 28 }).cautions[0], "hot");
});

// --- What to wear ---

test("wear: temperature bands follow WEAR_LIMITS", () => {
  assert.deepEqual(whatToWear(day({ feelsMax: -5 })).wear, ["Heavy winter coat", "Hat, mittens and scarf", "Warm waterproof boots"]);
  assert.deepEqual(whatToWear(day({ feelsMax: 5 })).wear, ["Warm coat", "Hat and gloves"]);
  assert.deepEqual(whatToWear(day({ feelsMax: 12 })).wear, ["Light jacket or sweater"]);
  assert.deepEqual(whatToWear(day({ feelsMax: 20, feelsMin: 15 })).wear, ["T-shirt and light layers"]);
  assert.deepEqual(whatToWear(day({ feelsMax: 20, feelsMin: 8 })).wear, ["T-shirt and light layers", "An extra layer for the cool morning"]);
  const hot = whatToWear(day({ feelsMax: 29 }));
  assert.deepEqual(hot.wear, ["Light, loose clothes", "Sun hat"]);
  assert.ok(hot.bring.includes("Water bottle"));
});

test("wear: band edges", () => {
  assert.equal(whatToWear(day({ feelsMax: WEAR_LIMITS.freezing })).wear[0], "Warm coat");
  assert.equal(whatToWear(day({ feelsMax: WEAR_LIMITS.cool })).wear[0], "Light jacket or sweater");
  assert.equal(whatToWear(day({ feelsMax: WEAR_LIMITS.mild })).wear[0], "T-shirt and light layers");
  assert.equal(whatToWear(day({ feelsMax: WEAR_LIMITS.hot })).wear[0], "Light, loose clothes");
});

test("wear: rain, snow, wind and sun", () => {
  const rain = whatToWear(day({ code: 61 }));
  assert.ok(rain.wear.includes("Raincoat") && rain.wear.includes("Waterproof shoes"));
  assert.ok(rain.bring.includes("Spare socks"));
  assert.ok(whatToWear(day({ rainChance: 45 })).wear.includes("Raincoat"));
  assert.ok(!whatToWear(day({ rainChance: 30 })).wear.includes("Raincoat"));
  assert.ok(whatToWear(day({ code: 71, feelsMax: 1 })).wear.includes("Snow pants and waterproof boots"));
  assert.ok(whatToWear(day({ gusts: 45 })).wear.includes("A windproof layer"));
  assert.deepEqual(whatToWear(day({ uv: 4 })).bring, ["Sunscreen and a sun hat"]);
  assert.deepEqual(whatToWear(day({ uv: 7, feelsMax: 29 })).bring, ["Water bottle", "Sunscreen", "Shade at midday"]);
  // A warm hat is already listed, so no second hat.
  assert.deepEqual(whatToWear(day({ uv: 4, feelsMax: 5 })).bring, ["Sunscreen"]);
});

test("wear: hazard days start with staying indoors", () => {
  assert.equal(whatToWear(day({ code: 95 })).wear[0], "Plan to stay indoors today");
});

test("wear: missing values are left out, never guessed", () => {
  const noTemp = whatToWear(day({ feelsMax: null, feelsMin: null }));
  assert.deepEqual(noTemp.wear, []);
  assert.equal(noTemp.notes.length, 1);
  assert.ok(!JSON.stringify(whatToWear(day({ uv: null }))).includes("Sunscreen"));
  assert.ok(!whatToWear(day({ rainChance: null })).wear.includes("Raincoat"));
  assert.ok(!whatToWear(day({ gusts: null })).wear.includes("A windproof layer"));
});

// --- Why these activities? ---

function explain(values, { date = "2026-10-15", holidays = [], celebrations = [], label = "Clear", unit = "F", high = 12 } = {}) {
  const d = { ...day(values), high, season: seasonFor(date, 42), holidays: [...holidays, ...celebrations], celebrations };
  const ideas = pickIdeas(d, ACTIVITIES, {});
  return { ideas, text: explainDay(d, label, ideas, unit).join(" ") };
}

test("explain: clear day names the outdoor and indoor ideas and the temperature", () => {
  const { ideas, text } = explain({}, { high: 12 });
  assert.match(text, /^It's clear and 54°, so /);
  assert.ok(text.includes(ideas[0].activity.rootmap.title));
  assert.ok(text.includes("as an indoor option"));
  assert.ok(!text.includes("year-old"));
});

test("explain: uses the chosen unit", () => {
  assert.match(explain({}, { high: 12, unit: "C" }).text, /clear and 12°/);
});

test("explain: caution days say indoor ideas come first", () => {
  const { text } = explain({ code: 61 });
  assert.match(text, /^With rain in the forecast, .* come first, and .* can work outside if you dress for it\./);
});

test("explain: hazard days say why everything is indoors", () => {
  assert.match(explain({ code: 95 }).text, /^With thunderstorms in the forecast, outdoor play isn't a good idea today, so all three ideas are indoors\./);
  assert.match(explain({ feelsMax: 35 }).text, /^With extreme heat in the forecast/);
});

test("explain: public holiday vs celebration wording", () => {
  const thanksgiving = explain({}, { date: "2026-11-26", holidays: ["Thanksgiving Day"] }).text;
  assert.match(thanksgiving, /^It's Thanksgiving, so Mashing Potatoes comes first as a Thanksgiving-inspired idea\./);
  const halloween = explain({}, { date: "2026-10-31", celebrations: ["Halloween"] }).text;
  assert.match(halloween, /^If your family celebrates Halloween, Washing a Pumpkin is a Halloween-inspired idea for today\./);
  // The holiday idea isn't named a second time.
  assert.equal(halloween.split("Washing a Pumpkin").length - 1, 1);
});

test("explain: mentions the season for seasonal picks", () => {
  const { text } = explain({}, { date: "2026-10-15" });
  assert.match(text, /is a seasonal pick for autumn\./);
});

test("explain: is deterministic", () => {
  assert.equal(explain({ code: 61 }).text, explain({ code: 61 }).text);
});

// --- Activity details ---

test("details: every field comes from the RootMap record", () => {
  for (const a of ACTIVITIES) {
    const d = activityDetails(a);
    assert.equal(d.title, a.rootmap.title);
    assert.equal(d.ages, a.rootmap.age);
    assert.equal(d.duration, `About ${a.rootmap.minutes} minutes`);
    assert.equal(d.description, a.rootmap.description);
    assert.deepEqual(d.materials, a.rootmap.materials);
    assert.deepEqual(d.steps, a.rootmap.steps);
    assert.deepEqual(d.practices, a.rootmap.domains);
    assert.equal(d.safety, a.rootmap.safety || null);
    assert.ok(d.steps.length > 0, `${a.id} has no steps`);
  }
});

test("details: safety is null when RootMap has none", () => {
  const noSafety = ACTIVITIES.find((a) => !a.rootmap.safety);
  assert.equal(activityDetails(noSafety).safety, null);
  assert.ok(activityDetails(byId("washing-pumpkin")).safety.length > 0);
});

test("units: rain amounts in inches (°F) or millimetres (°C), missing stays missing", () => {
  assert.equal(formatRain(0, "F"), "0.00 in");
  assert.equal(formatRain(0.3, "F"), "0.01 in");
  assert.equal(formatRain(25.4, "F"), "1.00 in");
  assert.equal(formatRain(0.3, "C"), "0.3 mm");
  assert.equal(formatRain(null, "C"), "–");
});
