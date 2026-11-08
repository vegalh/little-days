// The mobile-first Explore journey (PRD.md 7.1, 7.16; DESIGN.md 5): the school, the map and the
// place cards working together. Places come from the test copy of places.js, the map is the
// fake and every other request is mocked: these show the page's behavior, not the real APIs.
const { test, expect } = require("@playwright/test");
const { mockApis, showView, openFilters, closeFilters, chooseInterest, FORECAST, GOOGLE_CONFIG } = require("./mock-apis.js");

test.afterEach(async ({}, testInfo) => {
  expect(testInfo.api?.unmocked ?? []).toEqual([]);
});

async function open(page, testInfo, options = {}) {
  testInfo.api = await mockApis(page, { config: GOOGLE_CONFIG, ...options });
  await page.goto("/");
  await expect(page.locator(".now-temp")).toBeAttached();
}
const explore = (page) => expect(page.locator(".place-card").first()).toBeVisible();
const paidCalls = (page) => page.evaluate(() => window.fakeGoogleCalls.map((c) => c.call).filter((c) => /search|fetchFields|Autocomplete|Matrix|computeRoutes/i.test(c)));
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

      expect((await page.locator(".site-header").boundingBox()).height).toBeLessThanOrEqual(64);
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

test("desktop 1280px: the school and places on the left, a map that stays in view on the right", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop layout");
  await open(page, testInfo);
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

test("changing filters sends nothing to Google", async ({ page }, testInfo) => {
  await open(page, testInfo);
  await explore(page);
  const before = await googleCalls(page);

  await openFilters(page);
  await page.locator("#filters-panel label", { hasText: "Classroom" }).click();
  await page.locator("#ages").selectOption("4-6");
  await page.locator("#interest").selectOption({ label: "Nature" });
  await page.locator("#setting-filter").selectOption("indoors");
  await page.locator("#filters-panel label", { hasText: "°C" }).click();
  await page.locator("#explore-day").selectOption("1");
  await closeFilters(page);
  expect(await googleCalls(page)).toEqual(before);
});

test("a visit asks no paid Google service: one map, and moving around or reloading changes nothing", async ({ page }, testInfo) => {
  await open(page, testInfo);
  await explore(page);
  await expect(page.locator(".place-card")).toHaveCount(6);
  await expect.poll(() => page.evaluate(() => window.fakeMapCount)).toBe(1);
  await showView(page, "weather");
  await showView(page, "my-week");
  await showView(page, "explore");
  await chooseInterest(page, "Nature");
  await expect(page.locator(".place-card")).toHaveCount(2);
  await chooseInterest(page, "All");
  await expect(page.locator(".place-card")).toHaveCount(6);
  expect(await page.evaluate(() => window.fakeMapCount)).toBe(1);
  await page.reload();
  await explore(page);
  expect(await paidCalls(page)).toEqual([]);
});

test("opening straight on another page makes no map; Explore makes it when it's opened", async ({ page }, testInfo) => {
  testInfo.api = await mockApis(page, { config: GOOGLE_CONFIG });
  await page.goto("/#my-week");
  await expect(page.locator(".now-temp")).toBeAttached();
  expect(await page.evaluate(() => window.fakeMapCount || 0)).toBe(0);
  await showView(page, "explore");
  await explore(page);
  await expect.poll(() => page.evaluate(() => window.fakeMapCount)).toBe(1);
  expect((await page.locator("#explore-map").boundingBox()).height).toBeGreaterThan(200);
});

test("each page speaks to whoever is exploring", async ({ page }, testInfo) => {
  await open(page, testInfo);
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

test("filters: every row fits on a phone screen, and Booking narrows the places with no new search", async ({ page }, testInfo) => {
  await open(page, testInfo);
  await explore(page);
  await page.locator("#filters-toggle").click();
  for (const id of ["ages", "minutes", "interest", "explore-day", "setting-filter", "booking-filter", "explored-filter"]) {
    await expect(page.locator(`#${id}`)).toBeInViewport({ ratio: 1 });
  }
  await expect(page.locator("#filters-panel input[name=unit][value=C] + span")).toBeInViewport({ ratio: 1 });

  const before = (await googleCalls(page)).length;
  const all = await page.locator(".place-card").count();
  await page.locator("#booking-filter").selectOption("book");
  await expect.poll(() => page.locator(".place-card").count()).toBeLessThan(all);
  await expect(page.locator("#filters-active")).toContainText("Book or call first");
  expect((await googleCalls(page)).length).toBe(before);
});

test("a place with no photo shows its category icon", async ({ page }, testInfo) => {
  await open(page, testInfo);
  await explore(page);
  await expect(page.locator(".place-card")).toHaveCount(6);
  await expect(page.locator(".place-card .place-icon svg")).toHaveCount(6);
  await expect(page.locator(".place-card img")).toHaveCount(0);
});

test("My Places tabs stay on one line at 375px and 360px", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "phone", "phone widths");
  for (const lang of ["en", "zh"]) {
    await open(page, testInfo, { storage: { "littleDays.settings.v2": JSON.stringify({ lang }),
      "littleDays.places.v2": JSON.stringify({ "fake-park-1": { status: "want", category: "nature", saved: "2026-11-01", visits: [] } }) } });
    await showView(page, "my-places");
    for (const width of [375, 360]) {
      await page.setViewportSize({ width, height: 800 });
      for (const tab of await page.locator(".places-tabs .segmented span:not(.count)").all()) {
        expect((await tab.boundingBox()).height, `${lang} ${width}`).toBeLessThanOrEqual(46);
      }
      await noSideways(page);
    }
  }
});

test("the map appears with the results, and an earlier search's map doesn't outlive them", async ({ page }, testInfo) => {
  await open(page, testInfo);
  await explore(page);
  await expect(page.locator("#explore-map")).toBeVisible();
  const size = await page.locator("#explore-map").boundingBox();
  expect(size.height).toBeGreaterThan(200);
  await expect.poll(() => page.evaluate(() => window.fakeMarkers.filter((m) => m.map).length)).toBe(7);

  // A new walking time starts over: the map goes until Filters closes.
  await openFilters(page);
  await page.locator("#minutes").selectOption("20");
  await expect(page.locator("#explore-map")).toBeHidden();
  await expect(page.locator(".place-card")).toHaveCount(0);
  await closeFilters(page);
  await explore(page);
  await expect(page.locator("#explore-map")).toBeVisible();
  expect(await page.evaluate(() => window.fakeMapCount)).toBe(1);
});

test("a marker selects its card and shows a preview; a card selects its marker", async ({ page }, testInfo) => {
  await open(page, testInfo);
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
  await expect(dialog).toContainText("Little Days estimate");
  await expect(dialog).toContainText("Access not verified.");
  await expect(dialog).toContainText("(estimate)");
  await expect(dialog).toContainText("They're a starting point, not a safety check.");
  await expect(dialog.getByRole("button", { name: "Add to my week" })).toBeVisible();
});

test("filters: a summary of what changed, and Reset puts back the defaults", async ({ page }, testInfo) => {
  await open(page, testInfo);
  await expect(page.locator("#filters-summary")).toBeHidden();
  await openFilters(page);
  await expect(page.locator("#filters-toggle")).toHaveAttribute("aria-expanded", "true");
  await page.locator("#ages").selectOption("2-3");
  await page.locator("#minutes").selectOption("10");
  await page.locator("#interest").selectOption({ label: "Nature" });
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
  await openFilters(page);
  await page.locator("#filters-panel label", { hasText: "Classroom" }).click();
  await page.locator("#minutes").selectOption("10");
  await expect(page.locator("#filters-active")).toHaveText("10 min walk");
  await closeFilters(page);

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.locator("#filters-summary")).toBeHidden();
  expect((await settings(page)).mode).toBe("classroom");

  await page.reload();
  await expect(page.locator(".now-temp")).toBeAttached();
  await expect(page.locator("#filters-summary")).toBeHidden();
  await explore(page);
  await expect(page.locator(".place-card").first()).toBeVisible();
  await expect(page.locator("#explore-notes")).toContainText("Check crossings and the route before visiting.");
  await expect(page.locator(".place-card").first()).toContainText("Access not verified. Contact before a classroom visit.");
  await expect(page.locator(".place-card", { hasText: "min walk" }).first()).toContainText("Round trip by this estimate");
  await page.locator(".place-card").first().getByRole("button", { name: /View details/ }).click();
  await expect(page.locator("#route-reminder")).toContainText("Walk the route yourself before taking a group.");
  await expect(page.locator("#route-reminder")).toContainText("plan enough adults to supervise");
});

test("weather line: the friendly words only on a day with nothing to warn about", async ({ page }, testInfo) => {
  const clear = structuredClone(FORECAST);
  Object.assign(clear.daily, { weather_code: clear.daily.weather_code.map(() => 0), precipitation_probability_max: clear.daily.precipitation_probability_max.map(() => 0) });
  await open(page, testInfo, { forecastData: clear });
  await expect(page.locator("#now-line")).toContainText(`${Math.round(FORECAST.current.temperature_2m * 9 / 5 + 32)}° · Nice for exploring`);
  await expect(page.locator("#now-line")).not.toHaveClass(/now-hazard/);
  await expect(page.locator("#now-line").getByRole("link", { name: "More weather" })).toHaveAttribute("href", "#weather");
});

test("a hazard day: the short warning, outdoor cards say so, and the full warning stays in Weather", async ({ page }, testInfo) => {
  await open(page, testInfo, { forecastData: stormy() });
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
  await openFilters(page);
  await page.locator("#minutes").selectOption("20");
  await page.locator("#interest").selectOption({ label: "Movement" });
  await page.locator("#filters-panel label", { hasText: "°C" }).click();
  await page.reload();
  await expect(page.locator(".now-temp")).toBeAttached();
  await expect(page.locator("#filters-active")).toHaveText("20 min walk · Movement");
  await expect(page.locator("input[name=unit][value=C]")).toBeChecked();
  await explore(page);
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
  await explore(page);
  await page.locator(".now-line a").focus();
  await page.keyboard.press("Tab");
  await expect(page.locator("#filters-toggle")).toBeFocused();
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
  await expect(page.locator(".place-card", { hasText: "min walk" }).first()).toBeVisible();
  await page.locator(".place-card .place-title").first().focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#place-dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#place-dialog")).toBeHidden();
  await expect(page.locator(".place-card .place-title").first()).toBeFocused();
});

test("a long address is cut short in its line, not wrapped or pushed off the page", async ({ page }, testInfo) => {
  await open(page, testInfo);
  await page.evaluate(() => {
    document.querySelector(".location-label").textContent = `📍 ${"A very long street name in a very long town, ".repeat(6)}`;
  });
  const line = await page.locator("#location-line").boundingBox();
  expect(line.height).toBeLessThan(30);
  await noSideways(page);
});
