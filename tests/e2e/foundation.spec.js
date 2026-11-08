// The school, its weather, and the map setup states (PRD.md 10.2).
// All outside requests are mocked. These tests don't show that the real APIs work.
const { test, expect } = require("@playwright/test");
const { mockApis, showView, openFilters, FORECAST, GOOGLE_CONFIG } = require("./mock-apis.js");

const fahrenheit = (c) => `${Math.round(c * 9 / 5 + 32)}°`;
const savedSettings = (page) => page.evaluate(() => ({
  v1: localStorage.getItem("littleDays.settings.v1"),
  v2: JSON.parse(localStorage.getItem("littleDays.settings.v2")),
}));

test.afterEach(async ({}, testInfo) => {
  // No test may reach a real API.
  expect(testInfo.api?.unmocked ?? []).toEqual([]);
});

async function open(page, testInfo, options) {
  const api = await mockApis(page, options);
  testInfo.api = api;
  await page.goto("/");
  return api;
}

test("opening: the school's weather, the next six hours from now, and seven days", async ({ page }, testInfo) => {
  const api = await open(page, testInfo);
  await expect(page.locator("#location-line")).toHaveText("📍 Test School");
  const now = FORECAST.current;
  await expect(page.locator("#now-line")).toContainText(`${fahrenheit(now.temperature_2m)} · Fog forecast`);
  await expect(page.locator(".now-temp")).toHaveText(fahrenheit(now.temperature_2m));

  // current.time is 18:15 and hourly starts at midnight: the row starts at 18:00.
  const hours = page.locator(".hour-list li");
  await expect(hours).toHaveCount(6);
  await expect(page.locator(".hour-time")).toHaveText(["6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"]);
  const i18 = FORECAST.hourly.time.indexOf("2026-11-04T18:00");
  await expect(hours.first()).toContainText(fahrenheit(FORECAST.hourly.temperature_2m[i18]));

  await expect(page.locator("#week .day")).toHaveCount(7);
  await expect(page.locator("#wear")).toContainText("What to wear");
  await expect(page.locator("#warnings")).toContainText("These ideas use the daily forecast for the whole area.");

  // The forecast gets the school rounded to 2 decimals, and only one request is sent.
  const forecastUrls = api.requests.filter((url) => url.includes("/v1/forecast"));
  expect(forecastUrls).toHaveLength(1);
  const query = new URL(forecastUrls[0]).searchParams;
  expect([query.get("latitude"), query.get("longitude")]).toEqual(["42.35", "-71.21"]);
  expect(query.get("current")).toContain("apparent_temperature");
  expect(api.requests.some((url) => url.endsWith("/2026/US"))).toBe(true);
});

test("without a Google key: places and weather still show, with no map and no Google request", async ({ page }, testInfo) => {
  const api = await open(page, testInfo);
  await expect(page.locator(".place-card").first()).toBeVisible();
  await expect(page.locator("#place-map-box")).toBeHidden();
  await expect(page.locator(".now-temp")).toBeAttached();
  expect(api.requests.filter((url) => url.includes("googleapis"))).toEqual([]);
});

test("°F/°C changes the weather shown without a new request", async ({ page }, testInfo) => {
  const api = await open(page, testInfo);
  await expect(page.locator(".now-temp")).toHaveText(fahrenheit(FORECAST.current.temperature_2m));
  await openFilters(page);
  await page.locator("#filters-panel label", { hasText: "°C" }).click();
  await expect(page.locator(".now-temp")).toHaveText(`${Math.round(FORECAST.current.temperature_2m)}°`);
  expect(api.requests.filter((url) => url.includes("/v1/forecast"))).toHaveLength(1);
});

test("weather API failure: the error and Try again, with nothing made up", async ({ page }, testInfo) => {
  const api = await open(page, testInfo, { forecast: [500, "ok"] });
  await expect(page.locator("#weather-status")).toContainText("We couldn't load the weather right now.");
  await expect(page.locator("#now-line")).toHaveText("Weather unavailable right now.");
  await expect(page.locator("#week")).toBeHidden();
  await expect(page.locator(".now-temp")).toHaveCount(0);
  // Places don't wait for the weather.
  await expect(page.locator(".place-card").first()).toBeVisible();

  await showView(page, "weather");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.locator(".now-temp")).toHaveText(fahrenheit(FORECAST.current.temperature_2m));
  await expect(page.locator("#weather-status")).toBeEmpty();
  expect(api.requests.filter((url) => url.includes("/v1/forecast"))).toHaveLength(2);
});

test("weather offline: the same error", async ({ page }, testInfo) => {
  await open(page, testInfo, { forecast: "offline" });
  await expect(page.locator("#weather-status")).toContainText("We couldn't load the weather right now.");
  await showView(page, "weather");
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
});

test("existing v1 settings: °C carries over and v1 is replaced", async ({ page }, testInfo) => {
  await open(page, testInfo, {
    storage: { "littleDays.settings.v1": JSON.stringify({ city: "Newton, Massachusetts, United States", unit: "C" }) },
  });
  await expect(page.locator(".now-temp")).toHaveText(`${Math.round(FORECAST.current.temperature_2m)}°`);
  await expect(page.locator("input[name=unit][value=C]")).toBeChecked();
  const settings = await savedSettings(page);
  expect(settings.v1).toBeNull();
  expect(settings.v2).toMatchObject({ unit: "C" });
});

test("saved v2 settings survive a reload", async ({ page }, testInfo) => {
  await open(page, testInfo);
  await openFilters(page);
  await page.locator("#filters-panel label", { hasText: "°C" }).click();
  await expect(page.locator(".now-temp")).toBeAttached();
  await page.reload();
  await expect(page.locator(".now-temp")).toHaveText(`${Math.round(FORECAST.current.temperature_2m)}°`);
});

test.describe("with a Google key (fake Maps library)", () => {
  test("the map is the only Google part: no Places or Routes call, and the key goes only to Google", async ({ page }, testInfo) => {
    const api = await open(page, testInfo, { config: GOOGLE_CONFIG });
    await expect(page.locator(".place-card").first()).toBeVisible();
    await expect(page.locator("#place-map-box")).toBeVisible();
    const calls = await page.evaluate(() => window.fakeGoogleCalls.map((c) => c.call));
    expect(calls.filter((c) => /search|fetchFields|Autocomplete|Matrix|computeRoutes/i.test(c))).toEqual([]);
    expect(api.requests.filter((url) => url.includes("fake-test-key")).every((url) => url.startsWith("https://maps.googleapis.com/"))).toBe(true);
  });

  test("Google refuses the key: the map goes, and the places stay", async ({ page }, testInfo) => {
    await open(page, testInfo, { config: GOOGLE_CONFIG, google: { authFailure: true } });
    await expect(page.locator(".place-card").first()).toBeVisible();
    await expect(page.locator("#place-map-box")).toBeHidden();
  });

  test("Google's script can't load: the same", async ({ page }, testInfo) => {
    const api = await mockApis(page, { config: GOOGLE_CONFIG });
    testInfo.api = api;
    await page.route("https://maps.googleapis.com/maps/api/js?**", (route) => route.abort("internetdisconnected"));
    await page.goto("/");
    await expect(page.locator(".place-card").first()).toBeVisible();
    await expect(page.locator("#place-map-box")).toBeHidden();
  });
});

test.describe("layout", () => {
  test("desktop: places beside the map, tabs in the top bar, and Now beside Next hours", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop layout");
    await open(page, testInfo, { config: GOOGLE_CONFIG });
    await expect(page.locator(".now-temp")).toBeAttached();
    await expect(page.locator("#place-map-box")).toBeVisible();
    const side = await page.locator(".explore-side").boundingBox();
    const map = await page.locator("#place-map-box").boundingBox();
    expect(map.x).toBeGreaterThan(side.x + side.width - 1);
    await expect(page.locator(".site-nav a[aria-current=page]")).toHaveText("Explore");
    // Only the chosen view shows.
    await expect(page.locator("#my-week")).toBeHidden();
    await showView(page, "weather");
    await expect(page.locator(".site-nav a[aria-current=page]")).toHaveText("Weather");
    await expect(page.locator("#explore")).toBeHidden();
    const card = await page.locator(".now-card").boundingBox();
    const hours = await page.locator(".hours").boundingBox();
    expect(hours.x).toBeGreaterThan(card.x + card.width - 1);
    await expect(page.locator(".site-nav")).toBeVisible();
    expect(await page.locator(".site-nav").evaluate((nav) => getComputedStyle(nav).position)).not.toBe("fixed");
  });

  test("phone: no sideways page scroll, a bottom bar, and 44px touch targets", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "phone", "phone layout");
    await open(page, testInfo);
    await expect(page.locator(".now-temp")).toBeAttached();

    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
    const nav = await page.locator(".site-nav").boundingBox();
    expect(nav.y + nav.height).toBeCloseTo(812, 0);
    for (const link of await page.locator(".site-nav a").all()) {
      expect((await link.boundingBox()).height).toBeGreaterThanOrEqual(44);
    }
    for (const button of await page.locator(".explore-page button:visible").all()) {
      const box = await button.boundingBox();
      expect(box.height, await button.innerText()).toBeGreaterThanOrEqual(44);
    }
    // The school's line and the compact weather stack.
    const location = await page.locator(".explore-side .base-line").boundingBox();
    const nowLine = await page.locator("#now-line").boundingBox();
    expect(nowLine.y).toBeGreaterThan(location.y + location.height - 1);
    await showView(page, "weather");
    for (const day of await page.locator("#week .day").all()) {
      expect((await day.boundingBox()).height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  });
});
