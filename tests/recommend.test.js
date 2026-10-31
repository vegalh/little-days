// Run with: node --test tests/recommend.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { ACTIVITIES } = require("../activities.js");
const { weatherFor, seasonFor, pickIdeas, planWeek } = require("../recommend.js");

const CLEAR = { code: 0, feelsMax: 18, gusts: 20, rainChance: 0 };
const AGES = [2, 3, 4, 5, 6];

function day(weather, { date = "2026-10-15", latitude = 42, holidays = [] } = {}) {
  return { weather: weatherFor({ ...CLEAR, ...weather }), season: seasonFor(date, latitude), holidays };
}
const ids = (ideas) => ideas.map((i) => i.activity.id);

test("dataset: 37 activities with unique IDs and original fields", () => {
  assert.equal(ACTIVITIES.length, 37);
  assert.equal(new Set(ACTIVITIES.map((a) => a.id)).size, 37);
  for (const a of ACTIVITIES) {
    assert.equal(a.rootmap.id, a.id);
    for (const field of ["title", "age", "description", "materials", "steps", "domains", "minutes"]) {
      assert.ok(a.rootmap[field] !== undefined, `${a.id} is missing rootmap.${field}`);
    }
    assert.ok(a.rootmap.zh.title, `${a.id} is missing its Chinese title`);
    const [low, high] = a.rootmap.age.split(" ")[0].split("–").map(Number);
    assert.deepEqual([a.littleDays.minAge, a.littleDays.maxAge], [low, high]);
  }
});

test("dataset: every photo listed exists in both sizes", () => {
  for (const a of ACTIVITIES.filter((x) => x.littleDays.photo)) {
    for (const width of [480, 960]) {
      const file = path.join(__dirname, "..", "images", "activities", `${a.id}-${width}.webp`);
      assert.ok(fs.existsSync(file), `missing ${file}`);
    }
  }
});

test("dataset: only the two approved holiday tags", () => {
  const tagged = ACTIVITIES.filter((a) => a.littleDays.holidays.length > 0)
    .map((a) => [a.id, a.littleDays.holidays]);
  assert.deepEqual(tagged, [["washing-pumpkin", ["Halloween"]], ["mashing-potatoes", ["Thanksgiving"]]]);
});

test("age: every idea fits the child's age", () => {
  const weathers = [{}, { code: 61 }, { code: 95 }, { feelsMax: 2 }, { feelsMax: 29 }, { gusts: 55 }];
  for (const age of AGES) {
    for (const w of weathers) {
      for (const idea of pickIdeas(day(w), ACTIVITIES, age, {})) {
        const { minAge, maxAge } = idea.activity.littleDays;
        assert.ok(age >= minAge && age <= maxAge, `${idea.activity.id} offered to a ${age}-year-old`);
      }
    }
  }
});

test("age: 3–6 activities never go to 2-year-olds; 2–3 activities never to 4-year-olds", () => {
  const twoYear = planWeek(Array(7).fill(day({})), ACTIVITIES, 2).flat();
  assert.ok(twoYear.every((i) => i.activity.littleDays.minAge <= 2));
  const fourYear = planWeek(Array(7).fill(day({})), ACTIVITIES, 4).flat();
  assert.ok(fourYear.every((i) => i.activity.littleDays.maxAge >= 4));
});

test("weather: classifies hazards and cautions from Open-Meteo values", () => {
  const w = (values) => weatherFor({ ...CLEAR, ...values });
  assert.deepEqual(w({}), { hazards: [], cautions: [], notes: [] });
  assert.deepEqual(w({ code: 95 }).hazards, ["storm"]);
  assert.deepEqual(w({ code: 65 }).hazards, ["heavyRain"]);
  assert.deepEqual(w({ code: 66 }).hazards, ["freezingRain"]);
  assert.deepEqual(w({ code: 75 }).hazards, ["heavySnow"]);
  assert.deepEqual(w({ feelsMax: 33 }).hazards, ["extremeHeat"]);
  assert.deepEqual(w({ feelsMax: -12 }).hazards, ["extremeCold"]);
  assert.deepEqual(w({ gusts: 75 }).hazards, ["dangerousWind"]);

  assert.deepEqual(w({ code: 61 }), { hazards: [], cautions: ["rain"], notes: [] });
  assert.deepEqual(w({ rainChance: 60 }).cautions, ["rain"]);
  assert.deepEqual(w({ code: 71, rainChance: 80 }).cautions, ["snow"]); // snow, not rain
  assert.deepEqual(w({ feelsMax: 28 }).cautions, ["hot"]);
  assert.deepEqual(w({ feelsMax: 3 }).cautions, ["cold"]);
  assert.deepEqual(w({ gusts: 55 }).cautions, ["wind"]);
  assert.deepEqual(w({ gusts: 45 }).cautions, []); // an ordinary breezy day
  assert.deepEqual(w({ code: 45 }).notes, ["fog"]);
});

test("safety: no outdoor ideas on any hazard day, at any age", () => {
  const hazards = [{ code: 95 }, { code: 65 }, { code: 67 }, { code: 75 }, { feelsMax: 35 }, { feelsMax: -15 }, { gusts: 80 }];
  for (const age of AGES) {
    for (const w of hazards) {
      const ideas = pickIdeas(day(w), ACTIVITIES, age, {});
      assert.equal(ideas.length, 3);
      for (const idea of ideas) {
        assert.notEqual(idea.activity.littleDays.place, "outdoor", `${idea.activity.id} on ${JSON.stringify(w)}`);
        assert.equal(idea.outside, false);
      }
    }
  }
});

test("safety: on caution days outdoor ideas suit the weather, with indoor alternatives", () => {
  const cautions = { rain: { code: 61 }, snow: { code: 71 }, cold: { feelsMax: 2 }, hot: { feelsMax: 29 }, wind: { gusts: 55 } };
  for (const age of AGES) {
    for (const [caution, w] of Object.entries(cautions)) {
      const ideas = pickIdeas(day(w), ACTIVITIES, age, {});
      assert.equal(ideas.length, 3);
      assert.ok(ideas.filter((i) => i.outside).length <= 1, `too many outdoor ideas for ${caution}`);
      assert.ok(ideas.filter((i) => !i.outside).length >= 2, `not enough indoor ideas for ${caution}`);
      for (const idea of ideas.filter((i) => i.outside)) {
        assert.ok(idea.activity.littleDays.weather.includes(caution), `${idea.activity.id} outside in ${caution}`);
      }
      assert.equal(ideas[0].outside, false, "an indoor idea should lead on a caution day");
    }
  }
});

test("safety: mild rain still allows a suitable outdoor idea", () => {
  const ideas = pickIdeas(day({ code: 61 }), ACTIVITIES, 3, {});
  assert.equal(ideas.filter((i) => i.outside).length, 1);
  assert.ok(!ids(ideas).includes("bark-rubbing")); // paper and wet bark don't mix
});

test("clear day: two outdoor ideas lead, plus one indoor", () => {
  for (const age of AGES) {
    const ideas = pickIdeas(day({}), ACTIVITIES, age, {});
    assert.deepEqual(ideas.map((i) => i.outside), [true, true, false]);
  }
});

test("season: autumn-only activities only in autumn; hemispheres are swapped", () => {
  assert.equal(seasonFor("2026-10-31", 42.36), "autumn");
  assert.equal(seasonFor("2026-10-31", -33.87), "spring");
  assert.equal(seasonFor("2026-01-10", -33.87), "summer");
  const spring = planWeek(Array(7).fill(day({}, { date: "2026-04-15" })), ACTIVITIES, 2).flat();
  for (const idea of spring) {
    const seasons = idea.activity.littleDays.seasons;
    assert.ok(!seasons || seasons.includes("spring"), `${idea.activity.id} offered in spring`);
  }
});

test("holiday: Halloween features washing-pumpkin for ages 2–3 in autumn", () => {
  for (const age of [2, 3]) {
    const ideas = pickIdeas(day({}, { date: "2026-10-31", holidays: ["Halloween"] }), ACTIVITIES, age, {});
    assert.equal(ideas[0].activity.id, "washing-pumpkin");
    assert.equal(ideas[0].holiday, true);
  }
});

test("holiday: Thanksgiving Day features mashing-potatoes", () => {
  for (const age of AGES) {
    const ideas = pickIdeas(day({}, { date: "2026-11-26", holidays: ["Thanksgiving Day"] }), ACTIVITIES, age, {});
    assert.equal(ideas[0].activity.id, "mashing-potatoes");
  }
});

test("holiday: never overrides age, season or safety", () => {
  // Age: washing-pumpkin is for 2–3.
  const fourYear = pickIdeas(day({}, { date: "2026-10-31", holidays: ["Halloween"] }), ACTIVITIES, 4, {});
  assert.ok(!ids(fourYear).includes("washing-pumpkin"));
  // Season: Halloween is spring in Sydney, and washing-pumpkin is autumn-only.
  const sydney = pickIdeas(day({}, { date: "2026-10-31", latitude: -33.87, holidays: ["Halloween"] }), ACTIVITIES, 3, {});
  assert.ok(!ids(sydney).includes("washing-pumpkin"));
  // Safety: a holiday on a storm day still gets no outdoor ideas.
  const storm = pickIdeas(day({ code: 95 }, { date: "2026-11-26", holidays: ["Thanksgiving Day"] }), ACTIVITIES, 3, {});
  assert.equal(storm[0].activity.id, "mashing-potatoes");
  assert.ok(storm.every((i) => !i.outside));
});

test("holiday: unrelated holidays change nothing", () => {
  const plain = ids(pickIdeas(day({}, { date: "2026-11-11" }), ACTIVITIES, 3, {}));
  const veterans = pickIdeas(day({}, { date: "2026-11-11", holidays: ["Veterans Day"] }), ACTIVITIES, 3, {});
  assert.deepEqual(ids(veterans), plain);
  assert.ok(veterans.every((i) => !i.holiday));
});

test("variety: a week of the same weather features a different activity each day", () => {
  const weathers = [{}, { code: 61 }, { code: 95 }, { feelsMax: 2 }, { feelsMax: 29 }];
  for (const age of AGES) {
    for (const w of weathers) {
      const featured = planWeek(Array(7).fill(day(w)), ACTIVITIES, age).map((ideas) => ideas[0].activity.id);
      assert.equal(new Set(featured).size, 7, `age ${age}, ${JSON.stringify(w)}: ${featured}`);
    }
  }
});

test("variety: no idea repeats on back-to-back days in an ordinary week", () => {
  for (const age of AGES) {
    const week = planWeek(Array(7).fill(day({})), ACTIVITIES, age).map(ids);
    for (let i = 1; i < week.length; i++) {
      const repeated = week[i].filter((id) => week[i - 1].includes(id));
      assert.deepEqual(repeated, [], `age ${age}, day ${i}`);
    }
  }
});

test("every day has three ideas for every age and weather", () => {
  const weathers = [{}, { code: 61 }, { code: 71 }, { code: 95 }, { feelsMax: 2 }, { feelsMax: 29 }, { gusts: 55 }, { code: 45 }];
  const dates = ["2026-01-15", "2026-04-15", "2026-07-15", "2026-10-15"];
  for (const age of AGES) {
    for (const w of weathers) {
      for (const date of dates) {
        assert.equal(pickIdeas(day(w, { date }), ACTIVITIES, age, {}).length, 3, `age ${age} ${date} ${JSON.stringify(w)}`);
      }
    }
  }
});

