// Phase 3 smoke checks: place discovery, walking times, details (PRD.md 7.10–7.16).
// Google is the fake in fake-google-maps.js and every other request is mocked, so these
// show the page handles responses. They don't show that the real APIs work.
const { test, expect } = require("@playwright/test");
const { mockApis, GOOGLE_CONFIG } = require("./mock-apis.js");

test.afterEach(async ({}, testInfo) => {
  expect(testInfo.api?.unmocked ?? []).toEqual([]);
});

// Opens the page with the fake Google and picks the demo address.
async function start(page, testInfo, google = {}, storage = {}) {
  testInfo.api = await mockApis(page, { config: GOOGLE_CONFIG, google, storage });
  await page.goto("/");
  await page.evaluate(() => window.fakePickAddress());
  await expect(page.locator(".now-temp")).toBeVisible();
}
const calls = (page, name) => page.evaluate((n) => window.fakeGoogleCalls.filter((c) => c.call === n), name);
const interest = (page, label) => page.locator("#interest-chips label", { hasText: label }).click();

test("nothing is searched until Find Little Adventures, and an interest is required", async ({ page }, testInfo) => {
  await start(page, testInfo);
  expect(await calls(page, "searchNearby")).toHaveLength(0);
  await page.getByRole("button", { name: "Find Little Adventures" }).click();
  await expect(page.locator("#interest-message")).toHaveText("⚠︎ Choose what you'd like to explore.");
  expect(await calls(page, "searchNearby")).toHaveLength(0);
});

test("one interest: one search, a list with map markers, and at most 5 walking times", async ({ page }, testInfo) => {
  await start(page, testInfo);
  await interest(page, "Nature");
  await page.getByRole("button", { name: "Find Little Adventures" }).click();

  const cards = page.locator(".place-card");
  await expect(cards).toHaveCount(2);
  await expect(page.locator("#place-list")).toContainText("Test Park");
  const search = await calls(page, "searchNearby");
  expect(search).toHaveLength(1);
  expect(search[0].request.includedPrimaryTypes).toEqual(["park", "botanical_garden", "garden", "hiking_area"]);
  expect(search[0].request.locationRestriction.radius).toBe(1200);
  expect(search[0].request.fields).toEqual(["id", "displayName", "formattedAddress", "location", "primaryType", "types"]);

  // Google's walking time, or "unavailable" when there's no route. Never a guess.
  await expect(cards.filter({ hasText: "Test Park" })).toContainText("min walk");
  await expect(cards.filter({ hasText: "Test Park" })).toContainText("Google walking estimate");
  await expect(cards.filter({ hasText: "Test Garden" })).toContainText("Walking time unavailable");
  const matrix = await calls(page, "computeRouteMatrix");
  expect(matrix).toHaveLength(1);
  expect(matrix[0].destinations).toBeLessThanOrEqual(5);
  expect(matrix[0].request.travelMode).toBe("WALKING");

  // Markers: the start plus one per place, numbered like the list.
  expect(await page.evaluate(() => window.fakeMarkers.filter((m) => m.map).map((m) => m.title))).toEqual(["Start", "Test Park", "Test Garden"]);
  // Little Days notes are labelled apart from Google's data.
  await expect(cards.first().locator(".notes-label")).toHaveText("Little Days notes");
  await expect(cards.first()).toContainText("Access not verified.");
});

test("All: the first 5 get walking times; the rest can be checked one at a time", async ({ page }, testInfo) => {
  await start(page, testInfo);
  await interest(page, "All");
  await expect(page.locator(".all-note")).toBeVisible();
  await page.getByRole("button", { name: "Find Little Adventures" }).click();
  await expect(page.locator(".place-card")).toHaveCount(6);
  expect(await calls(page, "searchNearby")).toHaveLength(6);
  expect((await calls(page, "computeRouteMatrix"))[0].destinations).toBe(5);

  const unchecked = page.locator(".place-card", { hasText: "Walking time not checked yet" });
  await expect(unchecked).toHaveCount(1);
  await unchecked.getByRole("button", { name: "Check walking time" }).click();
  await expect(page.locator(".place-card", { hasText: "Walking time not checked yet" })).toHaveCount(0);
  const matrix = await calls(page, "computeRouteMatrix");
  expect(matrix).toHaveLength(2);
  expect(matrix[1].destinations).toBe(1);

  // Switching to an interest already loaded shows it from memory: no new request.
  await page.locator("#explore-chips label", { hasText: "Everyday Life" }).click();
  await expect(page.locator(".place-card")).toHaveCount(1);
  expect(await calls(page, "searchNearby")).toHaveLength(6);
});

test("place details: route, weather, guide perspectives, at-home idea, and Save stores only the ID", async ({ page }, testInfo) => {
  await start(page, testInfo);
  await interest(page, "Everyday Life");
  await page.getByRole("button", { name: "Find Little Adventures" }).click();
  await page.getByRole("button", { name: "Details for Test Bakery" }).click();

  const dialog = page.locator("#place-dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("#place-title")).toHaveText("Test Bakery");
  await expect(dialog.locator("#place-route")).toContainText("7 min walk");
  await expect(dialog.locator("#place-route")).toContainText("From Google: Fake warning from the test double.");
  await expect(dialog).toContainText("A Google walking route isn't a check that the way suits young children.");
  await expect(dialog).toContainText("Business (Little Days estimate)");
  await expect(dialog).toContainText("Contact before a classroom visit.");
  await expect(dialog.locator(".perspective-focus")).toHaveText("Focus: Shapes and colors");
  await dialog.getByRole("button", { name: "Second visit" }).click();
  await expect(dialog.locator(".perspective-focus")).toHaveText("Focus: Smells and ingredients");
  await expect(dialog.locator("#place-map")).toHaveAttribute("data-fake-map", "1");
  await expect(dialog.getByRole("link", { name: /Check hours and details on Google Maps/ })).toHaveAttribute("href", /query_place_id=fake-bakery-1/);
  await expect(dialog).toContainText("At home afterwards");

  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(dialog).toContainText("Want to explore ✓");
  const saved = await page.evaluate(() => localStorage.getItem("littleDays.places.v1"));
  expect(JSON.parse(saved)).toEqual({ "fake-bakery-1": { status: "want", visits: [], note: "" } });
  expect(saved).not.toContain("Test Bakery");

  await dialog.getByRole("button", { name: "Close" }).first().click();
  await expect(dialog).toBeHidden();
  expect(await calls(page, "computeRoutes")).toHaveLength(1);
});

test("errors: places failure, no places, and walking times failure", async ({ page }, testInfo) => {
  await start(page, testInfo, { failNearby: true });
  await interest(page, "Nature");
  await page.getByRole("button", { name: "Find Little Adventures" }).click();
  await expect(page.locator("#explore-status")).toContainText("We couldn't load nearby places right now.");
  await expect(page.locator("#explore-status").getByRole("button", { name: "Try again" })).toBeVisible();
  await expect(page.locator(".place-card")).toHaveCount(0);
});

test("no places found shows the empty state", async ({ page }, testInfo) => {
  await start(page, testInfo, { emptyNearby: true });
  await interest(page, "Movement");
  await page.getByRole("button", { name: "Find Little Adventures" }).click();
  await expect(page.locator("#explore-status")).toHaveText("We didn't find movement places within about a 15-minute walk. Try a longer walk or another interest.");
});

test("walking times failing shows unavailable, never a time", async ({ page }, testInfo) => {
  await start(page, testInfo, { failRoutes: true });
  await interest(page, "Nature");
  await page.getByRole("button", { name: "Find Little Adventures" }).click();
  await expect(page.locator(".place-card", { hasText: "Walking time unavailable" })).toHaveCount(2);
  await expect(page.locator("#explore-notes")).toContainText("Walking times couldn't be checked right now");
  await expect(page.locator("#place-list")).not.toContainText("min walk");
});

test("classroom mode shows the walking-estimate note and the contact line on every place", async ({ page }, testInfo) => {
  await start(page, testInfo);
  await page.locator("label", { hasText: "Classroom" }).click();
  await expect(page.locator(".controls .classroom-note")).toHaveText("Google walking estimates may not reflect the time needed when accompanying young children. Check crossings and the route before visiting.");
  await interest(page, "Nature");
  await page.getByRole("button", { name: "Find Little Adventures" }).click();
  await expect(page.locator("#explore-notes")).toContainText("Google walking estimates may not reflect the time needed");
  await expect(page.locator(".place-card", { hasText: "Contact before a classroom visit." })).toHaveCount(2);
  await expect(page.locator("#place-list")).not.toContainText(/\bsafe\b/i);
});

test("phone: list first, a List/Map switch, the Google attribution on the list, and a marker preview", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "phone", "phone layout");
  await start(page, testInfo);
  await interest(page, "Nature");
  await page.getByRole("button", { name: "Find Little Adventures" }).click();
  await expect(page.locator(".place-card").first()).toBeVisible();
  await expect(page.locator("#place-map-box")).toBeHidden();
  await expect(page.locator(".google-attribution")).toHaveText("Google Maps");
  await expect(page.locator(".google-attribution")).toHaveAttribute("translate", "no");

  await page.locator(".view-switch label", { hasText: "Map" }).click();
  await expect(page.locator("#place-map-box")).toBeVisible();
  await expect(page.locator("#place-list-box")).toBeHidden();
  await page.evaluate(() => window.fakeMarkers.find((m) => m.title === "Test Park").listeners["gmp-click"]());
  await expect(page.locator("#map-peek")).toContainText("Test Park");
  await page.locator("#map-peek").getByRole("button", { name: "Details" }).click();
  await expect(page.locator("#place-dialog")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test("desktop: list and map side by side, and a card highlights its marker", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop layout");
  await start(page, testInfo);
  await interest(page, "Nature");
  await page.getByRole("button", { name: "Find Little Adventures" }).click();
  await expect(page.locator(".place-card").first()).toBeVisible();
  const list = await page.locator("#place-list-box").boundingBox();
  const map = await page.locator("#place-map-box").boundingBox();
  expect(map.x).toBeGreaterThan(list.x + list.width - 1);
  await page.locator(".place-card").first().hover();
  expect(await page.evaluate(() => window.fakeMarkers.find((m) => m.title === "Test Park" && m.map).zIndex)).toBe(10);
});
