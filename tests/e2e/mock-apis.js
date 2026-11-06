// Mocks every outside request for the browser tests (PRD.md 10.2). Nothing here reaches
// a real API: anything not mocked is aborted and recorded in api.unmocked.
const fs = require("node:fs");
const path = require("node:path");

const fixture = (name) => fs.readFileSync(path.join(__dirname, "fixtures", name), "utf8");
const FORECAST = JSON.parse(fixture("forecast.json"));
const NEWTON = JSON.parse(fixture("geocode-newton.json"));

// The forecast fixture was saved at 18:15 in Newton, MA (America/New_York).
const FIXTURE_NOW = new Date("2026-11-04T18:15:00-05:00");

// options:
//   config      what config.js says: null (missing, 404) or { googleMapsKey, googleMapId }
//   forecast    "ok" (default), a status code, or "offline", or a list used one per request
//   forecastData a changed copy of FORECAST to answer with instead
//   geolocation "denied" to make getCurrentPosition fail with code 1
//   storage     { key: value } put in localStorage before the page loads
//   realDefaults  true: no English setting is added, to test how the page really opens
//   google      options for the fake Google script (authFailure, failFetch)
async function mockApis(page, options = {}) {
  const api = { requests: [], unmocked: [] };
  const forecastAnswers = [].concat(options.forecast || "ok");

  await page.clock.setFixedTime(FIXTURE_NOW);

  // Registered first, so every more specific route below wins over it.
  await page.route((url) => url.origin !== "http://localhost:8471", (route) => {
    api.unmocked.push(route.request().url());
    return route.abort();
  });

  await page.route("**/config.js", (route) => options.config
    ? route.fulfill({ contentType: "text/javascript", body: `window.LITTLE_DAYS_CONFIG = ${JSON.stringify(options.config)};` })
    : route.fulfill({ status: 404, body: "" }));

  await page.route("https://api.open-meteo.com/v1/forecast?**", (route) => {
    api.requests.push(route.request().url());
    const answer = forecastAnswers.length > 1 ? forecastAnswers.shift() : forecastAnswers[0];
    if (answer === "offline") return route.abort("internetdisconnected");
    if (answer !== "ok") return route.fulfill({ status: answer, json: { error: true, reason: "Mocked failure" } });
    return route.fulfill({ json: options.forecastData || FORECAST });
  });

  await page.route("https://geocoding-api.open-meteo.com/v1/search?**", (route) => {
    const url = new URL(route.request().url());
    api.requests.push(url.href);
    const name = url.searchParams.get("name");
    if (url.searchParams.get("count") === "5") return route.fulfill({ json: name.startsWith("Newton") ? NEWTON : {} });
    // A full "Newton, Massachusetts, …" name finds Newton, MA; anything else isn't found.
    const found = NEWTON.results.find((r) => name.startsWith(`${r.name}, ${r.admin1}`));
    return route.fulfill({ json: found ? { results: [found] } : JSON.parse(fixture("geocode-none.json")) });
  });

  await page.route("https://date.nager.at/api/v3/PublicHolidays/**", (route) => {
    api.requests.push(route.request().url());
    return route.fulfill({ contentType: "application/json", body: fixture("holidays-us-2026.json") });
  });

  await page.route("https://maps.googleapis.com/maps/api/js?**", (route) => {
    api.requests.push(route.request().url());
    return route.fulfill({ contentType: "text/javascript", body: fixture("../fake-google-maps.js") });
  });

  await page.addInitScript(({ storage, google, geolocation, realDefaults }) => {
    if (!sessionStorage.getItem("mocked")) {
      // Only on the first load, so a reload sees what the page saved itself.
      sessionStorage.setItem("mocked", "1");
      for (const [key, value] of Object.entries(storage)) localStorage.setItem(key, value);
      // The page opens in Chinese; these tests read it in English unless they say otherwise.
      const settings = JSON.parse(localStorage.getItem("littleDays.settings.v2") || "{}");
      if (!realDefaults && !settings.lang && !localStorage.getItem("littleDays.settings.v1")) {
        localStorage.setItem("littleDays.settings.v2", JSON.stringify({ ...settings, lang: "en" }));
      }
    }
    window.FAKE_GOOGLE = google;
    if (geolocation === "denied") {
      navigator.geolocation.getCurrentPosition = (success, error) => setTimeout(() => error({ code: 1, message: "User denied Geolocation" }), 10);
    }
  }, { storage: options.storage || {}, google: options.google || {}, geolocation: options.geolocation || null, realDefaults: Boolean(options.realDefaults) });

  return api;
}

const GOOGLE_CONFIG = { googleMapsKey: "fake-test-key", googleMapId: "DEMO_MAP_ID", startAtExample: false };

// Switches to one of the four views (Explore, Weather, My Places, My week) the way the nav does.
async function showView(page, name) {
  await page.evaluate((view) => { location.hash = view; }, name);
  await page.locator(`.view[data-view="${name}"]`).waitFor();
}

// The settings in the Filters panel are out of sight until it's opened.
async function openFilters(page) {
  const toggle = page.locator("#filters-toggle");
  if (await toggle.getAttribute("aria-expanded") === "false") await toggle.click();
}

async function closeFilters(page) {
  await page.locator("#filters-done").click();
  // The dialog's close event comes a moment later, and that's what updates this.
  await page.locator('#filters-toggle[aria-expanded="false"]').waitFor({ state: "attached" });
}

async function chooseInterest(page, label) {
  await openFilters(page);
  await page.locator("#interest").selectOption({ label });
  await closeFilters(page);
}

module.exports = { mockApis, showView, openFilters, closeFilters, chooseInterest, FORECAST, NEWTON, GOOGLE_CONFIG };
