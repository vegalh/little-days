// The mobile-first Explore journey (PRD.md 7.1, 7.16; DESIGN.md 5): the search, the map and
// the place cards working together. Google is the fake and every other request is mocked,
// so these show the page's behavior, not that the real APIs work.
const { test, expect } = require("@playwright/test");
const { mockApis, showView, openFilters, closeFilters, chooseInterest, FORECAST, GOOGLE_CONFIG } = require("./mock-apis.js");

test.afterEach(async ({}, testInfo) => {
  expect(testInfo.api?.unmocked ?? []).toEqual([]);
});

async function open(page, testInfo, options = {}) {
  testInfo.api = await mockApis(page, { config: GOOGLE_CONFIG, ...options });
  await page.goto("/");
  await expect(page.locator("gmp-place-autocomplete")).toBeAttached();
}
async function pickAddress(page) {
  await page.evaluate(() => window.fakePickAddress());
  await expect(page.locator(".now-temp")).toBeAttached();
}
const explore = (page) => expect(page.locator(".place-card").first()).toBeVisible();
const calledTimes = (page, name) => page.evaluate((n) => window.fakeGoogleCalls.filter((c) => c.call === n).length, name);
const SAVED = { "littleDays.settings.v2": JSON.stringify({ location: { kind: "place", placeId: "ChIJfakeNewtonPlaceId" } }) };
const googleCalls = (page) => page.evaluate(() => window.fakeGoogleCalls.map((c) => c.call).filter((c) => c !== "importLibrary"));
const settings = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("littleDays.settings.v2")));
const noSideways = async (page) => {
  const { scroll, width } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, width: innerWidth }));
  expect(scroll).toBeLessThanOrEqual(width);
};
// A forecast whose first day has a thunderstorm, a hazard (PRD.md 7.4).
const stormy = () => {
  const data = structuredClone(FORECAST);
  data.daily.weather_code[0] = 95;
  return data;
};

for (const lang of ["en", "zh"]) {
  for (const [width, height] of [[360, 800], [390, 844], [430, 932]]) {
    test(`${lang} ${width}px: the first screen is short, and results never scroll sideways`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "phone", "phone widths");
      await page.setViewportSize({ width, height });
      await open(page, testInfo, { storage: { "littleDays.settings.v2": JSON.stringify({ lang }) } });

      // The one-time step fits on one screen, with nothing else competing with it.
      expect((await page.locator(".site-header").boundingBox()).height).toBeLessThanOrEqual(64);
      await expect(page.locator("#setup-heading")).toBeInViewport();
      await expect(page.locator(".setup-actions")).toBeInViewport();
      expect((await page.locator("gmp-place-autocomplete").boundingBox()).height).toBe(52);
      await expect(page.locator("#explore")).toBeHidden();
      await noSideways(page);

      await pickAddress(page);
      await expect(page.locator("#place-map-box")).toBeInViewport();
      await explore(page);
      await expect(page.locator(".place-card").first()).toBeVisible();
      const box = await page.locator("#explore-map").boundingBox();
      expect(box.height / height).toBeGreaterThanOrEqual(.25);
      expect(box.height / height).toBeLessThanOrEqual(.4);
      await expect(page.locator(".place-card").first()).toBeInViewport();
      await noSideways(page);
      await openFilters(page);
      await noSideways(page);
      await closeFilters(page);

      // Every control in the search and on the cards is a full touch target.
      for (const control of await page.locator(".explore-page button:visible, .explore-page .segmented span:visible, .explore-page .chip > span:visible").all()) {
        expect((await control.boundingBox()).height, await control.innerText()).toBeGreaterThanOrEqual(44);
      }
    });
  }
}

test("desktop 1280px: search and places on the left, a map that stays in view on the right", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop layout");
  await open(page, testInfo);
  await pickAddress(page);
  await explore(page);
  await expect(page.locator(".place-card").first()).toBeVisible();
  const search = await page.locator(".explore-side").boundingBox();
  const list = await page.locator("#place-list").boundingBox();
  const map = await page.locator("#place-map-box").boundingBox();
  expect(list.x).toBe(search.x);
  expect(list.y).toBeGreaterThan(search.y);
  expect(map.x).toBeGreaterThan(search.x + search.width);
  await page.evaluate(() => window.scrollTo(0, 400));
  await expect(page.locator("#place-map-box")).toBeInViewport();
  await noSideways(page);
});

test("nothing is sent to Google before there's an address, and settings that don't need a search send nothing", async ({ page }, testInfo) => {
  await open(page, testInfo);
  expect(await googleCalls(page)).toEqual([]);
  await pickAddress(page);
  await explore(page);
  await expect.poll(() => calledTimes(page, "computeRouteMatrix")).toBe(1);
  const before = await googleCalls(page);

  await openFilters(page);
  await page.locator("#filters-panel label", { hasText: "Classroom" }).click();
  await page.locator("#ages-button").click();
  await page.locator("#ages-listbox [data-value='4-6']").click();
  await page.locator("#interest-chips label", { hasText: "Nature" }).click();
  await page.locator("#filters-panel label", { hasText: /^Indoors$/ }).click();
  await page.locator("#filters-panel label", { hasText: "°C" }).click();
  await page.locator("[data-explore-day='1']").click();
  await closeFilters(page);
  expect(await googleCalls(page)).toEqual(before);
});

test("a visit searches once: 6 searches, 1 route matrix and 1 map, and a return visit does the same", async ({ page }, testInfo) => {
  await open(page, testInfo);
  await pickAddress(page);
  await explore(page);
  await expect(page.locator(".place-card")).toHaveCount(6);
  await expect(page.locator(".place-card", { hasText: "min walk" }).first()).toBeVisible();
  const expected = ["fetchFields", ...Array(6).fill("searchNearby"), "computeRouteMatrix"];
  expect(await googleCalls(page)).toEqual(expected);
  expect(await page.evaluate(() => window.fakeMapCount)).toBe(1);

  // Moving around the app and between interests sends nothing.
  await showView(page, "weather");
  await showView(page, "my-week");
  await showView(page, "explore");
  await page.locator("#explore-chips label", { hasText: "Nature" }).click();
  await expect(page.locator(".place-card")).toHaveCount(2);
  await page.locator("#explore-chips label", { hasText: "All" }).click();
  await expect(page.locator(".place-card")).toHaveCount(6);
  expect(await googleCalls(page)).toEqual(expected);

  await page.reload();
  await explore(page);
  await expect.poll(() => calledTimes(page, "computeRouteMatrix")).toBe(1);
  expect(await googleCalls(page)).toEqual(expected);
});

test("opening straight on another page never searches; Explore searches when it's opened", async ({ page }, testInfo) => {
  testInfo.api = await mockApis(page, { config: GOOGLE_CONFIG, storage: SAVED });
  await page.goto("/#my-week");
  await expect(page.locator("#plan-weather, .plan-weather").first()).toBeAttached();
  expect(await calledTimes(page, "searchNearby")).toBe(0);
  expect(await page.evaluate(() => window.fakeMapCount)).toBe(0);
  await showView(page, "weather");
  await expect(page.locator(".now-temp")).toBeVisible();
  expect(await calledTimes(page, "searchNearby")).toBe(0);

  await showView(page, "explore");
  await explore(page);
  expect(await calledTimes(page, "searchNearby")).toBe(6);
  await expect.poll(() => page.evaluate(() => window.fakeMapCount)).toBe(1);
  expect((await page.locator("#explore-map").boundingBox()).height).toBeGreaterThan(200);
});

test("the starting point is asked for once, and then saved until it's changed", async ({ page }, testInfo) => {
  await open(page, testInfo);
  await expect(page.locator("#setup")).toBeVisible();
  await expect(page.locator("#address-label")).toHaveText("Where's home?");
  await page.locator("#location-form label", { hasText: "Classroom" }).click();
  await expect(page.locator("#address-label")).toHaveText("Where's your school?");
  await pickAddress(page);
  await explore(page);
  await expect(page.locator("#setup")).toBeHidden();
  await expect(page.locator("gmp-place-autocomplete")).toBeHidden();
  expect(await settings(page)).toMatchObject({ mode: "classroom", location: { kind: "place", placeId: "ChIJfakeNewtonPlaceId" } });

  await page.reload();
  await explore(page);
  await expect(page.locator("#setup")).toBeHidden();
  await expect(page.locator("#location-line")).toContainText("221 Washington St");

  // Keeping the address changes nothing and sends nothing.
  const before = await googleCalls(page);
  await page.locator(".explore-side [data-change-base]").click();
  await expect(page.locator("#setup")).toBeVisible();
  await expect(page.locator(".setup-photos")).toBeHidden();
  await expect(page.locator("#setup-current")).toContainText("221 Washington St");
  await page.getByRole("button", { name: "Keep this address" }).click();
  await expect(page.locator("#setup")).toBeHidden();
  await expect(page.locator(".place-card").first()).toBeVisible();
  await expect(page.locator(".explore-side [data-change-base]")).toBeFocused();
  expect(await googleCalls(page)).toEqual(before);

  // Picking another one searches from there.
  await page.locator(".explore-side [data-change-base]").click();
  await page.evaluate(() => window.fakePickAddress());
  await expect(page.locator("#setup")).toBeHidden();
  await explore(page);
  expect(await calledTimes(page, "searchNearby")).toBe(12);
});

test("Change works from the Weather page, and the example and device position are for this visit only", async ({ page, context }, testInfo) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 42.35, longitude: -71.21 });
  await open(page, testInfo, { storage: SAVED });
  await explore(page);
  await showView(page, "weather");
  await page.locator("#weather [data-change-base]").click();
  await expect(page.locator("#setup")).toBeVisible();
  await expect(page.locator('.view[data-view="explore"]')).toBeVisible();

  await page.getByRole("button", { name: "Use my location this time" }).click();
  await expect(page.locator("#location-line")).toHaveText("📍 Your current location");
  await explore(page);
  await page.reload();
  await expect(page.locator("#location-line")).toContainText("221 Washington St");

  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Try an example" }).click();
  await explore(page);
  await page.reload();
  await expect(page.locator("#setup")).toBeVisible();
});

test("each page speaks to whoever is exploring", async ({ page }, testInfo) => {
  await open(page, testInfo, { storage: SAVED });
  await explore(page);
  await showView(page, "weather");
  await expect(page.locator("#weather-subtitle")).toHaveText("What to expect before you head out.");
  await showView(page, "my-places");
  await expect(page.locator("#places-subtitle")).toHaveText("Places to explore together.");
  await expect(page.locator("#places-list")).toContainText("to plan your next walk.");
  await showView(page, "my-week");
  await expect(page.locator("#plan-subtitle")).toHaveText("The week ahead.");

  await showView(page, "explore");
  await openFilters(page);
  await page.locator("#filters-panel label", { hasText: "Classroom" }).click();
  await closeFilters(page);
  await showView(page, "weather");
  await expect(page.locator("#weather-subtitle")).toHaveText("What to expect before taking the class out.");
  await showView(page, "my-places");
  await expect(page.locator("#places-subtitle")).toHaveText("Places for class walks.");
  await expect(page.locator("#places-list")).toContainText("to plan your next class walk.");
  await page.locator("#places-list").getByRole("link", { name: "Find places" }).click();
  await expect(page.locator(".place-card").first()).toBeVisible();
  await showView(page, "my-week");
  await expect(page.locator("#plan-subtitle")).toHaveText("School days in the week ahead.");
});

test("Weather with no starting point offers a way to set one", async ({ page }, testInfo) => {
  await open(page, testInfo);
  await showView(page, "weather");
  await page.locator("#weather-empty").getByRole("link", { name: "Set your starting point" }).click();
  await expect(page.locator("#setup")).toBeVisible();
});

test("the map appears with the results, and an earlier search's map doesn't outlive them", async ({ page }, testInfo) => {
  await open(page, testInfo);
  await expect(page.locator("#setup").getByRole("button", { name: "Try an example" })).toBeVisible();
  await pickAddress(page);
  await explore(page);
  await expect(page.locator("#explore-map")).toBeVisible();
  await expect(page.locator("#map-empty")).toBeHidden();
  const size = await page.locator("#explore-map").boundingBox();
  expect(size.height).toBeGreaterThan(200);
  await expect.poll(() => page.evaluate(() => window.fakeMarkers.filter((m) => m.map).length)).toBe(7);

  // A new walking time starts over: the map goes until that search is back.
  await openFilters(page);
  await page.locator("#filters-panel label", { hasText: /^20$/ }).click();
  await expect(page.locator("#explore-map")).toBeHidden();
  await expect(page.locator(".place-card")).toHaveCount(0);
  await closeFilters(page);
  await explore(page);
  await expect(page.locator("#explore-map")).toBeVisible();
  expect(await page.evaluate(() => window.fakeMapCount)).toBe(1);
});

test("a marker selects its card and shows a preview; a card selects its marker", async ({ page }, testInfo) => {
  await open(page, testInfo);
  await pickAddress(page);
  await explore(page);
  const marker = (name) => page.evaluate((title) => window.fakeMarkers.find((m) => m.title === title && m.map).zIndex, name);
  await page.evaluate(() => window.fakeMarkers.find((m) => m.title === "Test Library" && m.map).listeners["gmp-click"]());
  await expect(page.locator("#map-peek")).toContainText("Test Library");
  await expect(page.locator(".place-card.is-selected")).toContainText("Test Library");
  expect(await marker("Test Library")).toBe(10);

  await page.locator(".place-card", { hasText: "Test Bakery" }).locator(".place-idea").click();
  await expect(page.locator(".place-card.is-selected")).toContainText("Test Bakery");
  await expect(page.locator("#map-peek")).toContainText("Test Bakery");
  expect(await marker("Test Bakery")).toBe(10);
  expect(await marker("Test Library")).toBeNull();
});

test("a card is short: name, walk, category, one idea, and two actions", async ({ page }, testInfo) => {
  await open(page, testInfo);
  await pickAddress(page);
  await chooseInterest(page, "Nature");
  await explore(page);
  const card = page.locator(".place-card", { hasText: "Test Park" });
  await expect(card.locator(".place-title")).toContainText("Test Park");
  await expect(card.locator(".place-walk")).toContainText("min walk");
  await expect(card.locator(".tag")).toHaveText("Nature");
  await expect(card.locator(".idea-label")).toHaveText("Little Days idea:");
  await expect(card.getByRole("button", { name: "View details for Test Park" })).toBeVisible();
  await expect(card.getByRole("button", { name: "Save Test Park" })).toBeVisible();
  await expect(card).not.toContainText("1 Test Rd");
  await expect(card).not.toContainText("Access not verified");

  await card.getByRole("button", { name: "Save Test Park" }).click();
  await expect(card.locator(".tag-saved")).toHaveText("Want to explore");
  expect(JSON.parse(await page.evaluate(() => localStorage.getItem("littleDays.places.v2")))["fake-park-1"].status).toBe("want");

  // What left the card is all in the details, with the distinction between sources.
  await card.getByRole("button", { name: "View details for Test Park" }).click();
  const dialog = page.locator("#place-dialog");
  await expect(dialog).toContainText("1 Test Rd");
  await expect(dialog).toContainText("Google walking estimate");
  await expect(dialog).toContainText("Access not verified.");
  await expect(dialog).toContainText("(estimate)");
  await expect(dialog).toContainText("They're a starting point, not a safety check.");
  await expect(dialog.getByRole("button", { name: "Add to my week" })).toBeVisible();
});

test("filters: a summary of what changed, and Reset puts back the defaults", async ({ page }, testInfo) => {
  await open(page, testInfo);
  await pickAddress(page);
  await expect(page.locator("#filters-summary")).toBeHidden();
  await openFilters(page);
  await expect(page.locator("#filters-toggle")).toHaveAttribute("aria-expanded", "true");
  await page.locator("#ages-button").click();
  await page.locator("#ages-listbox [data-value='2-3']").click();
  await page.locator("#filters-panel label", { hasText: /^10$/ }).click();
  await page.locator("#interest-chips label", { hasText: "Nature" }).click();
  await expect(page.locator("#filters-active")).toHaveText("2–3 · 10 min walk · Nature");
  await expect(page.locator("#filters-count")).toHaveText("3");
  await closeFilters(page);
  await explore(page);

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.locator("#filters-summary")).toBeHidden();
  await expect(page.locator("#filters-count")).toBeHidden();
  expect(await settings(page)).toMatchObject({ ages: "2-6", minutes: 15, interest: "all" });
  await explore(page);
});

test("Classroom: remembered across a reload, kept by Reset, with its reminders in place", async ({ page }, testInfo) => {
  await open(page, testInfo);
  await pickAddress(page);
  await openFilters(page);
  await page.locator("#filters-panel label", { hasText: "Classroom" }).click();
  await page.locator("#filters-panel label", { hasText: /^10$/ }).click();
  await expect(page.locator("#filters-active")).toHaveText("Classroom · 10 min walk");
  await closeFilters(page);

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.locator("#filters-active")).toHaveText("Classroom");
  await expect(page.getByRole("button", { name: "Reset" })).toBeHidden();
  expect((await settings(page)).mode).toBe("classroom");

  await page.reload();
  await expect(page.locator(".now-temp")).toBeAttached();
  await expect(page.locator("#filters-active")).toHaveText("Classroom");
  await explore(page);
  await expect(page.locator(".place-card").first()).toBeVisible();
  await expect(page.locator("#explore-notes")).toContainText("Check crossings and the route before visiting.");
  await expect(page.locator(".place-card").first()).toContainText("Access not verified. Contact before a classroom visit.");
  await expect(page.locator(".place-card", { hasText: "min walk" }).first()).toContainText("Round trip at Google's pace");
  await page.locator(".place-card").first().getByRole("button", { name: /View details/ }).click();
  await expect(page.locator("#route-reminder")).toContainText("Walk the route yourself before taking a group.");
  await expect(page.locator("#route-reminder")).toContainText("plan enough adults to supervise");
});

test("weather line: the friendly words only on a day with nothing to warn about", async ({ page }, testInfo) => {
  const clear = structuredClone(FORECAST);
  Object.assign(clear.daily, { weather_code: clear.daily.weather_code.map(() => 0), precipitation_probability_max: clear.daily.precipitation_probability_max.map(() => 0) });
  await open(page, testInfo, { forecastData: clear });
  await pickAddress(page);
  await expect(page.locator("#now-line")).toContainText(`${Math.round(FORECAST.current.temperature_2m * 9 / 5 + 32)}° · Nice for exploring`);
  await expect(page.locator("#now-line")).not.toHaveClass(/now-hazard/);
  await expect(page.locator("#now-line").getByRole("link", { name: "More weather" })).toHaveAttribute("href", "#weather");
});

test("a hazard day: the short warning, outdoor cards say so, and the full warning stays in Weather", async ({ page }, testInfo) => {
  await open(page, testInfo, { forecastData: stormy() });
  await pickAddress(page);
  await expect(page.locator("#now-line")).toHaveClass(/now-hazard/);
  await expect(page.locator("#now-line")).toContainText("Thunderstorms forecast");
  await expect(page.locator("#now-line")).not.toContainText("Nice for exploring");
  await explore(page);
  await expect(page.locator(".place-card", { hasText: "Test Park" })).toContainText("Outdoor places are better left for another day.");
  await expect(page.locator(".place-card", { hasText: "Test Library" })).not.toContainText("better left");
  // Indoor places come first (PRD.md 7.15).
  const names = await page.locator(".place-title").allInnerTexts();
  expect(names.findIndex((n) => n.includes("Test Library"))).toBeLessThan(names.findIndex((n) => n.includes("Test Park")));
  await showView(page, "weather");
  await expect(page.locator("#warnings")).toContainText("Stay indoors while there is thunder or lightning.");
  await expect(page.locator("#wear")).toContainText("What to wear");
});

test("a refresh keeps every saved setting and opens on places", async ({ page }, testInfo) => {
  await open(page, testInfo);
  await pickAddress(page);
  await openFilters(page);
  await page.locator("#filters-panel label", { hasText: /^20$/ }).click();
  await page.locator("#interest-chips label", { hasText: "Movement" }).click();
  await page.locator("#filters-panel label", { hasText: "°C" }).click();
  await page.reload();
  await expect(page.locator(".now-temp")).toBeAttached();
  await expect(page.locator("#location-line")).toContainText("221 Washington St");
  await expect(page.locator("#filters-active")).toHaveText("20 min walk · Movement");
  await expect(page.locator("input[name=unit][value=C]")).toBeChecked();
  await explore(page);
  expect(await calledTimes(page, "searchNearby")).toBe(1);
});

test("an old setting with no interest gets the new default, and the rest is kept", async ({ page }, testInfo) => {
  await open(page, testInfo, {
    storage: { "littleDays.settings.v2": JSON.stringify({ unit: "C", mode: "classroom", interest: null }) },
  });
  expect(await settings(page)).toMatchObject({ unit: "C", mode: "classroom", interest: "all" });
});

test("keyboard: Filters, its controls and the places all work without a pointer", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "keyboard");
  await open(page, testInfo);
  await pickAddress(page);
  await explore(page);
  await page.locator(".explore-side [data-change-base]").focus();
  await page.keyboard.press("Tab");
  await expect(page.locator(".now-line a")).toBeFocused();
  await page.locator("#filters-toggle").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#filters-panel")).toBeVisible();
  await expect(page.locator("#filters-toggle")).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  await expect(page.locator("#filters-close")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator("#filters-panel input[name=mode]:checked")).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#filters-panel input[name=mode][value=classroom]")).toBeChecked();
  const outline = await page.locator("#filters-panel input[name=mode]:checked + span").evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).toBe("solid");
  await page.keyboard.press("Escape");
  await expect(page.locator("#filters-panel")).toBeHidden();
  await expect(page.locator("#filters-toggle")).toBeFocused();
  // Walking times arriving redraw the list, so this waits for them.
  await expect(page.locator(".place-card", { hasText: "min walk" }).first()).toBeVisible();
  await page.locator(".place-card .place-title").first().focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#place-dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#place-dialog")).toBeHidden();
  await expect(page.locator(".place-card .place-title").first()).toBeFocused();
});

test("use my location: a button with a real name, that says when it's working", async ({ page, context }, testInfo) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 42.35, longitude: -71.21 });
  await open(page, testInfo);
  await page.getByRole("button", { name: "Use my location this time" }).click();
  await expect(page.locator("#location-line")).toHaveText("📍 Your current location");
  await expect(page.locator("#location-status")).toBeEmpty();
});

test("a long address is cut short in its line, not wrapped or pushed off the page", async ({ page }, testInfo) => {
  await open(page, testInfo);
  await pickAddress(page);
  await page.evaluate(() => {
    document.querySelector(".location-label").textContent = `📍 ${"A very long street name in a very long town, ".repeat(6)}`;
  });
  const line = await page.locator("#location-line").boundingBox();
  expect(line.height).toBeLessThan(30);
  await noSideways(page);
});
