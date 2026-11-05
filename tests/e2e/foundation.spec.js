// Phase 2 journeys: location, weather and Google setup states (PRD.md 10.2).
// All outside requests are mocked. These tests don't show that the real APIs work.
const { test, expect } = require("@playwright/test");
const { mockApis, showView, openFilters, FORECAST, GOOGLE_CONFIG } = require("./mock-apis.js");

const fahrenheit = (c) => `${Math.round(c * 9 / 5 + 32)}°`;
const NEWTON_MA = "Newton, Massachusetts, United States";
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

test("missing Google configuration: weather by city only, and Explore says maps aren't set up", async ({ page }, testInfo) => {
  const api = await open(page, testInfo);
  await expect(page.locator("#explore-status")).toHaveText("Maps and places aren't set up on this copy of Little Days yet.");
  await expect(page.getByLabel("City (for weather)")).toBeVisible();
  await expect(page.getByRole("button", { name: "Try an example" })).toBeHidden();
  await expect(page.locator("#location-status")).toHaveText("Enter your city or use your location to see the weather.");
  await expect(page.locator("#weather")).toBeHidden();
  expect(api.requests.filter((url) => url.includes("googleapis"))).toEqual([]);
});

test("manual city entry: current weather, the next six hours from now, and seven days", async ({ page }, testInfo) => {
  const api = await open(page, testInfo);
  const city = page.getByLabel("City (for weather)");
  await city.fill("Newton");
  // The suggestions arrive after the pause in typing.
  await expect(page.locator(`#city-options option[value="${NEWTON_MA}"]`)).toHaveCount(1);
  await city.fill(NEWTON_MA);
  await page.getByRole("button", { name: "Show weather" }).click();

  await expect(page.locator("#location-line")).toHaveText(`📍 ${NEWTON_MA}`);
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

  // The forecast gets the location rounded to 2 decimals, and only one request is sent.
  const forecastUrls = api.requests.filter((url) => url.includes("/v1/forecast"));
  expect(forecastUrls).toHaveLength(1);
  const query = new URL(forecastUrls[0]).searchParams;
  expect(query.get("latitude")).toBe("42.34");
  expect(query.get("longitude")).toBe("-71.21");
  expect(query.get("current")).toContain("apparent_temperature");

  expect((await savedSettings(page)).v2.location).toEqual({ kind: "city", name: NEWTON_MA });
});

test("°F/°C changes the weather shown without a new request", async ({ page }, testInfo) => {
  const api = await open(page, testInfo);
  await page.getByLabel("City (for weather)").fill(NEWTON_MA);
  await page.getByRole("button", { name: "Show weather" }).click();
  await expect(page.locator(".now-temp")).toHaveText(fahrenheit(FORECAST.current.temperature_2m));
  await openFilters(page);
  await page.locator("#filters-panel label", { hasText: "°C" }).click();
  await expect(page.locator(".now-temp")).toHaveText(`${Math.round(FORECAST.current.temperature_2m)}°`);
  expect(api.requests.filter((url) => url.includes("/v1/forecast"))).toHaveLength(1);
});

test("invalid and unknown city input", async ({ page }, testInfo) => {
  const api = await open(page, testInfo);
  await page.getByRole("button", { name: "Show weather" }).click();
  await expect(page.locator("#location-message")).toHaveText("⚠︎ Type a city name first.");
  await expect(page.getByLabel("City (for weather)")).toHaveAttribute("aria-invalid", "true");
  await page.getByLabel("City (for weather)").fill("Z");
  await page.getByRole("button", { name: "Show weather" }).click();
  await expect(page.locator("#location-message")).toHaveText("⚠︎ Type at least 2 letters.");
  expect(api.requests).toEqual([]);

  await page.getByLabel("City (for weather)").fill("Zzqxv");
  await page.getByRole("button", { name: "Show weather" }).click();
  await expect(page.locator("#location-status")).toContainText(`We couldn't find "Zzqxv".`);
  await expect(page.locator("#weather")).toBeHidden();
});

test("geolocation success: weather for the device location, no holidays, and the position isn't saved", async ({ page, context }, testInfo) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 42.351234, longitude: -71.208765 });
  const api = await open(page, testInfo);
  await page.getByRole("button", { name: "Use my location" }).click();

  await expect(page.locator("#location-line")).toHaveText("📍 Your current location");
  await expect(page.locator(".now-temp")).toBeAttached();
  await expect(page.locator("#holiday-note")).toHaveText("Holidays show when you search an address or city.");
  const query = new URL(api.requests.find((url) => url.includes("/v1/forecast"))).searchParams;
  expect([query.get("latitude"), query.get("longitude")]).toEqual(["42.35", "-71.21"]);
  expect(api.requests.some((url) => url.includes("nager"))).toBe(false);
  const { v2 } = await savedSettings(page);
  expect(v2.location).toBeNull();
  expect(JSON.stringify(v2)).not.toContain("42.35");
});

test("geolocation denied: a calm message, and the city field gets focus", async ({ page }, testInfo) => {
  const api = await open(page, testInfo, { geolocation: "denied" });
  await page.getByRole("button", { name: "Use my location" }).click();
  await expect(page.locator("#location-status")).toHaveText("Location access is off, so type a city instead.");
  await expect(page.getByLabel("City (for weather)")).toBeFocused();
  await expect(page.getByRole("button", { name: "Use my location" })).toBeEnabled();
  expect(api.requests).toEqual([]);
});

test("weather API failure: the error and Try again, with nothing made up", async ({ page }, testInfo) => {
  const api = await open(page, testInfo, { forecast: [500, "ok"] });
  await page.getByLabel("City (for weather)").fill(NEWTON_MA);
  await page.getByRole("button", { name: "Show weather" }).click();

  await expect(page.locator("#weather-status")).toContainText("We couldn't load the weather right now.");
  await expect(page.locator("#now-line")).toHaveText("Weather unavailable right now.");
  await expect(page.locator("#week")).toBeHidden();
  await expect(page.locator(".now-temp")).toHaveCount(0);
  // A weather problem can't lose the starting point (PRD.md 7.18).
  expect((await savedSettings(page)).v2.location).toEqual({ kind: "city", name: NEWTON_MA });

  await showView(page, "weather");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.locator(".now-temp")).toHaveText(fahrenheit(FORECAST.current.temperature_2m));
  await expect(page.locator("#weather-status")).toBeEmpty();
  expect(api.requests.filter((url) => url.includes("/v1/forecast"))).toHaveLength(2);
});

test("weather offline: the same error", async ({ page }, testInfo) => {
  await open(page, testInfo, { forecast: "offline" });
  await page.getByLabel("City (for weather)").fill(NEWTON_MA);
  await page.getByRole("button", { name: "Show weather" }).click();
  await expect(page.locator("#weather-status")).toContainText("We couldn't load the weather right now.");
  await showView(page, "weather");
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
});

test("existing v1 settings: city and °C carry over, the weather refreshes, and v1 is replaced", async ({ page }, testInfo) => {
  const api = await open(page, testInfo, {
    storage: { "littleDays.settings.v1": JSON.stringify({ city: NEWTON_MA, unit: "C" }) },
  });
  await expect(page.locator(".now-temp")).toHaveText(`${Math.round(FORECAST.current.temperature_2m)}°`);
  await expect(page.locator("#location-line")).toHaveText(`📍 ${NEWTON_MA}`);
  await expect(page.locator("input[name=unit][value=C]")).toBeChecked();
  const settings = await savedSettings(page);
  expect(settings.v1).toBeNull();
  expect(settings.v2).toMatchObject({ unit: "C", location: { kind: "city", name: NEWTON_MA } });
  expect(api.requests.filter((url) => url.includes("googleapis"))).toEqual([]);
});

test("saved v2 settings survive a reload", async ({ page }, testInfo) => {
  await open(page, testInfo);
  await page.getByLabel("City (for weather)").fill(NEWTON_MA);
  await page.getByRole("button", { name: "Show weather" }).click();
  await openFilters(page);
  await page.locator("#filters-panel label", { hasText: "°C" }).click();
  await expect(page.locator(".now-temp")).toBeAttached();
  await page.reload();
  await expect(page.locator("#location-line")).toHaveText(`📍 ${NEWTON_MA}`);
  await expect(page.locator(".now-temp")).toHaveText(`${Math.round(FORECAST.current.temperature_2m)}°`);
});

test.describe("with Google configured (fake Maps library)", () => {
  test("picking an address loads its weather and saves only the place ID", async ({ page }, testInfo) => {
    const api = await open(page, testInfo, { config: GOOGLE_CONFIG });
    await expect(page.getByLabel("City (for weather)")).toBeHidden();
    await expect(page.locator("#address-label")).toHaveText("Where's home?");
    await page.evaluate(() => window.fakePickAddress());

    await expect(page.locator("#location-line")).toHaveText("📍 221 Washington St, Newton, MA 02458, USA");
    await expect(page.locator(".now-temp")).toBeAttached();
    // Holidays use the country from the address.
    expect(api.requests.some((url) => url.endsWith("/2026/US"))).toBe(true);
    expect((await savedSettings(page)).v2.location).toEqual({ kind: "place", placeId: "ChIJfakeNewtonPlaceId" });
    const calls = await page.evaluate(() => window.fakeGoogleCalls.map((c) => c.call));
    expect(calls.filter((c) => c === "fetchFields")).toHaveLength(1);
    // The key goes only to Google's script URL.
    expect(api.requests.filter((url) => url.includes("fake-test-key")).every((url) => url.startsWith("https://maps.googleapis.com/"))).toBe(true);
  });

  test("the example address is labelled, loads weather, and is never saved", async ({ page }, testInfo) => {
    await open(page, testInfo, { config: GOOGLE_CONFIG });
    await page.getByRole("button", { name: "Try an example" }).click();
    await expect(page.locator("#location-line")).toHaveText("📍 221 Washington St, Newton, MA 02458, USA · Example address");
    await expect(page.locator(".now-temp")).toBeAttached();
    expect((await savedSettings(page)).v2.location).toBeNull();
  });

  test("returning with a saved address: the weather refreshes and places load by themselves", async ({ page }, testInfo) => {
    await open(page, testInfo, {
      config: GOOGLE_CONFIG,
      storage: { "littleDays.settings.v2": JSON.stringify({ unit: "F", location: { kind: "place", placeId: "ChIJfakeNewtonPlaceId" } }) },
    });
    await expect(page.locator(".now-temp")).toBeAttached();
    await expect(page.locator("#location-line")).toHaveText("📍 221 Washington St, Newton, MA 02458, USA");
    await expect(page.locator(".place-card").first()).toBeVisible();
    await expect(page.locator("#setup")).toBeHidden();
    const calls = await page.evaluate(() => window.fakeGoogleCalls.map((c) => c.call));
    expect(calls.filter((c) => c === "searchNearby")).toHaveLength(6);
  });

  test("a saved address that can't be loaded asks to enter it again", async ({ page }, testInfo) => {
    await open(page, testInfo, {
      config: GOOGLE_CONFIG,
      google: { failFetch: true },
      storage: { "littleDays.settings.v2": JSON.stringify({ location: { kind: "place", placeId: "ChIJgone" } }) },
    });
    await expect(page.locator("#location-status")).toHaveText("We couldn't load your saved address. Enter it again.");
    expect((await savedSettings(page)).v2.location).toEqual({ kind: "place", placeId: "ChIJgone" });
  });

  test("Google refuses the key: the city fallback appears and Explore says maps aren't available", async ({ page }, testInfo) => {
    await open(page, testInfo, { config: GOOGLE_CONFIG, google: { authFailure: true } });
    await expect(page.locator("#explore-status")).toHaveText("Google Maps isn't available right now, so places and walking times can't be shown.");
    await expect(page.getByLabel("City (for weather)")).toBeVisible();
    await expect(page.getByRole("button", { name: "Try an example" })).toBeHidden();
  });

  test("Google's script can't load: the same fallback", async ({ page }, testInfo) => {
    const api = await mockApis(page, { config: GOOGLE_CONFIG });
    testInfo.api = api;
    await page.route("https://maps.googleapis.com/maps/api/js?**", (route) => route.abort("internetdisconnected"));
    await page.goto("/");
    await expect(page.locator("#explore-status")).toHaveText("Google Maps isn't available right now, so places and walking times can't be shown.");
    await expect(page.getByLabel("City (for weather)")).toBeVisible();
  });
});

test.describe("layout", () => {
  test("desktop: search beside the map, tabs in the top bar, and Now beside Next hours", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop layout");
    await open(page, testInfo);
    await page.getByLabel("City (for weather)").fill(NEWTON_MA);
    await page.getByRole("button", { name: "Show weather" }).click();
    await expect(page.locator(".now-temp")).toBeAttached();
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
    await page.getByLabel("City (for weather)").fill(NEWTON_MA);
    await page.getByRole("button", { name: "Show weather" }).click();
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
    // The location and the compact weather stack.
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
