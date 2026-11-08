// Place discovery, walking estimates and details (PRD.md 7.10–7.16). Places come from the
// test copy of places.js, the map from fake-google-maps.js, and every other request is
// mocked, so these show the page handles them. They don't show that the real APIs work.
const { test, expect } = require("@playwright/test");
const { mockApis, chooseInterest, openFilters, closeFilters, GOOGLE_CONFIG } = require("./mock-apis.js");

test.afterEach(async ({}, testInfo) => {
  expect(testInfo.api?.unmocked ?? []).toEqual([]);
});

async function start(page, testInfo, storage = {}) {
  testInfo.api = await mockApis(page, { config: GOOGLE_CONFIG, storage });
  await page.goto("/");
  await expect(page.locator(".now-temp")).toBeAttached();
}
const googleCalls = (page) => page.evaluate(() => window.fakeGoogleCalls.map((c) => c.call));

test("opening shows the school's places right away, with no search and no setting to choose first", async ({ page }, testInfo) => {
  await start(page, testInfo);
  await expect(page.locator(".place-card")).toHaveCount(6);
  expect((await googleCalls(page)).filter((c) => /search|Matrix|computeRoutes|fetchFields/i.test(c))).toEqual([]);
});

test("one interest: its places, estimated walking times, and map markers numbered like the list", async ({ page }, testInfo) => {
  await start(page, testInfo, { "littleDays.settings.v2": JSON.stringify({ interest: "nature" }) });
  const cards = page.locator(".place-card");
  await expect(cards).toHaveCount(2);
  await expect(cards.filter({ hasText: "Test Park" })).toContainText(/About \d+ min walk/);
  await expect(page.locator("#explore-notes")).toContainText("walking times estimated from distance, ideas from Little Days");
  await expect(page.locator("#explore-results .data-credit")).toHaveText("© OpenStreetMap contributors");
  expect(await page.evaluate(() => window.fakeMarkers.filter((m) => m.map).map((m) => m.title))).toEqual(["Start", "Test Park", "Test Garden"]);
  await expect(cards.first().locator(".idea-label")).toHaveText("Little Days idea:");
});

test("walking time: a shorter limit shows fewer places, and switching interests is instant", async ({ page }, testInfo) => {
  await start(page, testInfo);
  await openFilters(page);
  await page.locator("#minutes").selectOption("5");
  await closeFilters(page);
  await expect(page.locator(".place-card")).toHaveCount(2);
  await chooseInterest(page, "Everyday Life");
  await expect(page.locator(".place-card")).toHaveCount(1);
});

test("place details: the walk, weather, guide perspectives, links, and Save stores only the ID", async ({ page }, testInfo) => {
  await start(page, testInfo);
  await chooseInterest(page, "Everyday Life");
  await page.getByRole("button", { name: "Details for Test Bakery" }).click();

  const dialog = page.locator("#place-dialog");
  await expect(dialog.locator("#place-title")).toHaveText("Test Bakery");
  await expect(dialog.locator("#place-route")).toContainText(/About \d+ min walk/);
  await expect(dialog.locator("#place-route")).toContainText("Little Days estimate");
  await expect(dialog.getByRole("link", { name: /See the walking route on Google Maps/ })).toHaveAttribute("href", /google\.com\/maps\/dir\/\?api=1&origin=42\.3496,-71\.2111&destination=42\.35,-71\.21&travelmode=walking/);
  await expect(dialog.getByRole("link", { name: /Check hours and details on Google Maps/ })).toHaveAttribute("href", /google\.com\/maps\/search\/\?api=1&query=Test%20Bakery/);
  await expect(dialog).toContainText("This walking time is estimated from distance, not a checked route");
  await expect(dialog).toContainText("Business (Little Days estimate)");
  await expect(dialog.locator(".perspective-focus")).toHaveText("Focus: Shapes and colors");
  await dialog.getByRole("button", { name: "Second visit" }).click();
  await expect(dialog.locator(".perspective-focus")).toHaveText("Focus: Smells and ingredients");
  await expect(dialog).toContainText("At home afterwards");

  await dialog.getByRole("button", { name: "Want to explore" }).click();
  const saved = await page.evaluate(() => localStorage.getItem("littleDays.places.v2"));
  expect(JSON.parse(saved)).toEqual({ "fake-bakery-1": { status: "want", category: "everyday-life", saved: "2026-11-04", visits: [], note: "" } });
  expect(saved).not.toContain("Test Bakery");
  await dialog.getByRole("button", { name: "Close" }).first().click();
  await expect(dialog).toBeHidden();
});

test("no places in an interest shows the empty state", async ({ page }, testInfo) => {
  await start(page, testInfo);
  await chooseInterest(page, "Animals & Wildlife");
  await expect(page.locator("#explore-status")).toHaveText("We didn't find animals & wildlife places within about a 15-minute walk. Try a longer walk or another interest.");
  await expect(page.locator(".place-card")).toHaveCount(0);
});

test("classroom mode shows the walking-estimate note and the contact line on every place", async ({ page }, testInfo) => {
  await start(page, testInfo);
  await openFilters(page);
  await page.locator("#filters-panel label", { hasText: "Classroom" }).click();
  await expect(page.locator("#filters-panel .classroom-note")).toHaveText("These walking times are estimated from distance and may not reflect the time needed with young children. Check crossings and the route before visiting.");
  await chooseInterest(page, "Nature");
  await expect(page.locator("#explore-notes")).toContainText("These walking times are estimated from distance");
  await expect(page.locator(".place-card", { hasText: "Contact before a classroom visit." })).toHaveCount(2);
  await expect(page.locator("#place-list")).not.toContainText(/\bsafe\b/i);
});

test("phone: the map and the cards together, and a marker preview", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "phone", "phone layout");
  await start(page, testInfo);
  await chooseInterest(page, "Nature");
  await expect(page.locator("#explore-map")).toBeVisible();
  await page.evaluate(() => window.fakeMarkers.find((m) => m.title === "Test Park" && m.map).listeners["gmp-click"]());
  await expect(page.locator("#map-peek")).toContainText("Test Park");
  await expect(page.locator(".place-card", { hasText: "Test Park" })).toHaveClass(/is-selected/);
  await page.locator("#map-peek").getByRole("button", { name: "View details" }).click();
  await expect(page.locator("#place-dialog")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test("desktop: list and map side by side, and a card highlights its marker", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop layout");
  await start(page, testInfo);
  await chooseInterest(page, "Nature");
  const list = await page.locator("#place-list").boundingBox();
  const map = await page.locator("#place-map-box").boundingBox();
  expect(map.x).toBeGreaterThan(list.x + list.width - 1);
  await page.locator(".place-card").first().hover();
  expect(await page.evaluate(() => window.fakeMarkers.find((m) => m.title === "Test Park" && m.map).zIndex)).toBe(10);
});
