// Run with: node --test
// Every English text the page shows must have a Chinese entry, with the same {placeholders}.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { ZH, translate, deviceLanguage } = require("../i18n.js");
const { GUIDES, CATEGORY_GUIDES, GUIDE_NOTE } = require("../guides.js");
const { CATEGORIES, ACCESS_TEXT, ageNotes } = require("../explore.js");
const { whatToWear } = require("../advice.js");
const { weatherFor } = require("../recommend.js");
const { readImport } = require("../plan.js");

const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
const missing = (texts) => [...new Set(texts)].filter((text) => ZH[text] === undefined);

test("translate: Chinese from the dictionary, English unchanged, values filled in", () => {
  assert.equal(translate("zh", "Explore nearby"), "探索附近");
  assert.equal(translate("en", "Explore nearby"), "Explore nearby");
  assert.equal(translate("zh", "{minutes} min walk", { minutes: 7 }), "步行 7 分钟");
  assert.equal(translate("en", "{minutes} min walk", { minutes: 7 }), "7 min walk");
  assert.equal(translate("zh", "Not in the dictionary"), "Not in the dictionary");
  assert.equal(deviceLanguage(["zh-CN", "en"]), "zh");
  assert.equal(deviceLanguage(["zh-TW"]), "zh");
  assert.equal(deviceLanguage(["en-US", "fr"]), "en");
  assert.equal(deviceLanguage([]), "en");
});

test("every Chinese entry keeps the English entry's {placeholders}", () => {
  for (const [english, chinese] of Object.entries(ZH)) {
    const names = (text) => (text.match(/\{\w+\}/g) || []).sort().join();
    assert.equal(names(chinese), names(english), english);
  }
});

test("every tr(\"…\") text in app.js and google.js has Chinese", () => {
  const texts = [];
  for (const file of ["app.js", "google.js"]) {
    for (const match of read(file).matchAll(/\btr\(\s*"((?:[^"\\]|\\.)*)"/g)) texts.push(JSON.parse(`"${match[1]}"`));
    // tr(x ? "a" : "b") and tr(["a", "b"][i]) choose between texts
    for (const match of read(file).matchAll(/\btr\(\s*(?:\w+ === 1 \?|\w+ \?|\[)\s*"((?:[^"\\]|\\.)*)"\s*[:,]\s*"((?:[^"\\]|\\.)*)"/g)) {
      texts.push(JSON.parse(`"${match[1]}"`), JSON.parse(`"${match[2]}"`));
    }
  }
  assert.ok(texts.length > 150, `found ${texts.length} texts`);
  assert.deepEqual(missing(texts), []);
});

test("every visible text and label in index.html has Chinese, apart from names and numbers", () => {
  const html = read("index.html").replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, "");
  const texts = [...html.matchAll(/>([^<>]+)</g)].map((m) => m[1].replace(/\s+/g, " ").trim()).filter(Boolean)
    .concat([...html.matchAll(/(?:placeholder|aria-label)="([^"]+)"/g)].map((m) => m[1]));
  const allowed = /^(Little Days|Google Maps|中文|°F|°C|\d+|[🌱📍])$/u;
  assert.deepEqual(missing(texts.filter((text) => !allowed.test(text))), []);
});

test("guides, categories, access labels, age notes, clothing and import errors have Chinese", () => {
  const guides = [...Object.values(GUIDES), ...Object.values(CATEGORY_GUIDES).filter((g) => typeof g !== "string")];
  const guideTexts = [GUIDE_NOTE];
  for (const guide of guides) {
    guideTexts.push(guide.why);
    for (const set of guide.sets) guideTexts.push(set.focus, ...set.notice, ...set.before, ...set.during, ...set.after, set.practical);
  }
  assert.deepEqual(missing(guideTexts), []);
  assert.deepEqual(missing(Object.values(CATEGORIES).map((c) => c.label)), []);
  assert.deepEqual(missing(ACCESS_TEXT), []);
  assert.deepEqual(missing(["2-6", "under-2", "2-3", "4-6"].flatMap(ageNotes)), []);

  // Every clothing line whatToWear can produce.
  const clothing = [];
  const day = (values) => ({ code: 0, feelsMax: 20, feelsMin: 15, rainChance: 0, gusts: 10, uv: 0, ...values });
  for (const values of [{ feelsMax: null }, { feelsMax: -5 }, { feelsMax: 5 }, { feelsMax: 14 }, { feelsMax: 20, feelsMin: 5 },
    { feelsMax: 30, uv: 7 }, { feelsMax: 30, uv: 4 }, { feelsMax: 14, uv: 4 }, { code: 61, rainChance: 80 }, { code: 73 }, { gusts: 45 }, { code: 95 }]) {
    const d = day(values);
    const wear = whatToWear({ ...d, weather: weatherFor(d) });
    clothing.push(...wear.wear, ...wear.bring, ...wear.notes);
  }
  assert.deepEqual(missing(clothing), []);

  const errors = ["x".repeat(1000001), "{", "[]", JSON.stringify({ format: "little-days-data", version: 2 }),
    JSON.stringify({ format: "little-days-data", version: 1 })].map((file) => readImport(file, "2026-11-04", []).error);
  assert.deepEqual(missing(errors), []);
});
