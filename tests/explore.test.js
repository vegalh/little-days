// Run with: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { ACTIVITIES } = require("../activities.js");
const {
  CATEGORIES, CATEGORY_KEYS, categoriesToSearch, shortlist, nearbyPlaces, estimateWalk, byWalkingTime,
  walkingMinutes, accessFor, settingFor, filterBySetting, ageNotes, bookingFor, filterByBooking,
} = require("../explore.js");
const { GUIDES, CATEGORY_GUIDES, GUIDE_FOR_TYPE, guideFor, perspectiveFor, forGroup } = require("../guides.js");

test("forGroup: no guide line still speaks to one child", () => {
  assert.equal(forGroup("If your child is curious, look closer."), "If the children are curious, look closer.");
  assert.equal(forGroup("Let your child choose."), "Let the children choose.");
  assert.equal(forGroup("Follow your child's lead."), "Follow the children's lead.");
  const guides = [...Object.values(GUIDES), ...Object.values(CATEGORY_GUIDES).filter((g) => typeof g !== "string")];
  const lines = guides.flatMap((g) => [g.why, ...g.sets.flatMap((s) => [...s.notice, ...s.before, ...s.during, ...s.after, s.practical])]);
  for (const line of lines) {
    assert.doesNotMatch(forGroup(line), /your child/i, line);
    assert.doesNotMatch(forGroup(line), /the children (is|does|has|was|wants|knows|likes|loves|enjoys|notices)\b/i, line);
  }
});
const { rainSoon, orderForWeather, weatherFor, hourForecast } = require("../recommend.js");

test("hourForecast: finds the visit's hour, and returns null outside the forecast", () => {
  const hourly = { time: ["2026-11-07T09:00", "2026-11-07T10:00"], temperature_2m: [8, null], precipitation_probability: [20, 30] };
  assert.deepEqual(hourForecast(hourly, "2026-11-07", "09:30"), { temperature: 8, rainChance: 20 });
  assert.equal(hourForecast(hourly, "2026-11-07", "10:00"), null);
  assert.equal(hourForecast(hourly, "2026-11-20", "09:00"), null);
});
const { formatDistance } = require("../advice.js");

const ORIGIN = { lat: 42.35, lng: -71.21 };
// A place about `meters` north of the origin.
const at = (id, meters, primaryType = "park") => ({ id, name: id, primaryType, types: [primaryType], location: { lat: ORIGIN.lat + meters / 111195, lng: ORIGIN.lng } });

test("categories: six, each with Google types, matching the saved-settings choices", () => {
  assert.deepEqual(CATEGORY_KEYS, ["nature", "everyday-life", "community-helpers", "art-culture", "animals-wildlife", "movement"]);
  const { SETTING_CHOICES } = require("../plan.js");
  for (const key of CATEGORY_KEYS) {
    assert.ok(CATEGORIES[key].types.length > 0);
    assert.ok(SETTING_CHOICES.interest.includes(key));
  }
});

test("nearby: the walking estimate decides what's within reach, and All works out only what isn't loaded", () => {
  const near = at("near", 300, "park");
  const far = at("far", 1000, "park");
  const shop = at("shop", 100, "bakery");
  // 300 m of straight line is about 390 m of streets: 5 minutes at 80 m a minute.
  assert.equal(walkingMinutes(estimateWalk(ORIGIN, near).durationMillis), 5);
  assert.deepEqual(nearbyPlaces([near, far, shop], ORIGIN, 5, ["park"]).map((p) => p.id), ["near"]);
  assert.deepEqual(nearbyPlaces([near, far, shop], ORIGIN, 20, ["park"]).map((p) => p.id), ["near", "far"]);
  assert.deepEqual(categoriesToSearch("nature", {}), ["nature"]);
  assert.deepEqual(categoriesToSearch("nature", { nature: [] }), []);
  assert.deepEqual(categoriesToSearch("all", { nature: [], movement: [] }), ["everyday-life", "community-helpers", "art-culture", "animals-wildlife"]);
});

test("shortlist: a type Google returned but wasn't asked for is left out", () => {
  const winery = { ...at("wine", 100), primaryType: "winery" };
  const shop = { ...at("pets", 200), primaryType: "pet_store" };
  assert.deepEqual(shortlist({ "animals-wildlife": [winery, shop] }, "animals-wildlife", ORIGIN).map((p) => p.id), ["pets"]);
  assert.deepEqual(shortlist({ "animals-wildlife": [winery, shop] }, "all", ORIGIN).map((p) => p.id), ["pets"]);
});

test("booking is an estimate from the kind of place, and the filter uses it", () => {
  const cafe = { ...at("cafe", 100), primaryType: "coffee_shop" };
  const yoga = { ...at("yoga", 200), primaryType: "yoga_studio" };
  assert.equal(bookingFor(cafe), "walk-in");
  assert.equal(bookingFor(yoga), "book");
  assert.deepEqual(filterByBooking([cafe, yoga], "book").map((p) => p.id), ["yoga"]);
  assert.equal(filterByBooking([cafe, yoga], "all").length, 2);
  assert.equal(accessFor(yoga).note, "Ask whether there are children's or family classes.");
});

test("shortlist: one category is closest first; All keeps two per category, up to 12", () => {
  const loaded = { nature: [at("far", 900), at("near", 100), { id: "nowhere", location: null }] };
  assert.deepEqual(shortlist(loaded, "nature", ORIGIN).map((p) => p.id), ["near", "far"]);

  const all = {};
  CATEGORY_KEYS.forEach((key, k) => {
    all[key] = [0, 1, 2, 3].map((n) => at(`${key}-${n}`, 100 + n * 100 + k * 1000, CATEGORIES[key].types[0]));
  });
  const list = shortlist(all, "all", ORIGIN);
  assert.equal(list.length, 12);
  for (const key of CATEGORY_KEYS) assert.equal(list.filter((p) => p.category === key).length, 2);
  // A place found by two searches counts once, in the first category.
  const twice = shortlist({ nature: [at("same", 100)], movement: [at("same", 100)] }, "all", ORIGIN);
  assert.deepEqual(twice.map((p) => [p.id, p.category]), [["same", "nature"]]);
});

test("walking: places without a time are never hidden", () => {
  const places = [1, 2, 3, 4].map((n) => at(`p${n}`, n * 100));
  const routes = { p1: { status: "ok", durationMillis: 600000 }, p2: { status: "ok", durationMillis: 1200000 }, p3: { status: "none" } };
  const split = byWalkingTime(places.slice(0, 4), routes, 15);
  assert.deepEqual(split.within.map((p) => p.id), ["p1"]);
  assert.deepEqual(split.unknown.map((p) => p.id), ["p3", "p4"]);
  assert.equal(split.over, 1);
  assert.equal(walkingMinutes(61000), 2);
  assert.equal(formatDistance(1609.344, "F"), "1.0 mi");
  assert.equal(formatDistance(560, "C"), "0.6 km");
});

test("access: estimates are never verified, and businesses say to contact first", () => {
  assert.deepEqual(accessFor(at("b", 1, "bakery")), { verified: false, estimate: "Business", note: null, contact: true });
  assert.deepEqual(accessFor(at("p", 1, "park")), { verified: false, estimate: "Park or outdoor space", note: "Check posted rules.", contact: false });
  assert.deepEqual(accessFor(at("f", 1, "fire_station")).contact, true);
  assert.deepEqual(accessFor(at("z", 1, "zoo")), { verified: false, estimate: null, note: null, contact: false });
  assert.equal(settingFor(at("g", 1, "garden")), "outdoors");
  assert.equal(settingFor(at("l", 1, "library")), "indoors");
  assert.deepEqual(filterBySetting([at("g", 1, "garden"), at("l", 1, "library")], "indoors").map((p) => p.id), ["l"]);
  assert.equal(ageNotes("2-6").length, 2);
});

test("weather: rain soon at 50%+, and indoor places first on a hazard day", () => {
  assert.equal(rainSoon([{ rainChance: 10 }, { rainChance: 60 }, { rainChance: 20 }, { rainChance: 90 }]), 60);
  assert.equal(rainSoon([{ rainChance: 10 }, { rainChance: null }]), null);
  assert.equal(rainSoon([]), null);
  const places = [at("park", 1, "park"), at("library", 2, "library")];
  const storm = weatherFor({ code: 95, feelsMax: 20, gusts: 10, rainChance: 90 });
  assert.deepEqual(orderForWeather(places, storm, settingFor).map((p) => p.id), ["library", "park"]);
  const clear = weatherFor({ code: 0, feelsMax: 20, gusts: 10, rainChance: 0 });
  assert.deepEqual(orderForWeather(places, clear, settingFor).map((p) => p.id), ["park", "library"]);
});

test("guides: every category and mapped type has a guide with three complete perspectives", () => {
  const ids = ACTIVITIES.map((a) => a.id);
  const guides = [...Object.values(GUIDES), ...Object.values(CATEGORY_GUIDES).filter((g) => typeof g !== "string")];
  for (const key of CATEGORY_KEYS) assert.ok(guideFor(null, key), key);
  for (const type of Object.keys(GUIDE_FOR_TYPE)) assert.ok(guideFor(type, "nature"), type);
  for (const guide of guides) {
    assert.equal(guide.sets.length, 3);
    for (const activity of guide.activities) assert.ok(ids.includes(activity), activity);
    for (const set of guide.sets) {
      for (const field of ["focus", "notice", "before", "during", "after", "practical"]) assert.ok(set[field] && set[field].length, field);
    }
    // The page never calls a place or activity "safe".
    assert.doesNotMatch(JSON.stringify(guide), /\bsafe\b/i);
  }
  assert.equal(guideFor("bakery", "everyday-life").sets[1].focus, "Smells and ingredients");
  assert.equal(guideFor("park", "nature").sets[2].focus, "Seasonal changes");
  assert.equal(perspectiveFor(GUIDES.park, 4), 1);
});
