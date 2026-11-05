// Phase 4 journeys: map reuse, My Places, the journal, revisits, My week places, and
// deleting saved data (PRD.md 7.9, 7.16–7.18). Google is the fake and every other
// request is mocked: these show the page's behavior, not that the real APIs work.
const { test, expect } = require("@playwright/test");
const { mockApis, showView, GOOGLE_CONFIG } = require("./mock-apis.js");

test.afterEach(async ({}, testInfo) => {
  expect(testInfo.api?.unmocked ?? []).toEqual([]);
});

async function start(page, testInfo, storage = {}) {
  testInfo.api = await mockApis(page, { config: GOOGLE_CONFIG, storage });
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto("/");
  await page.evaluate(() => window.fakePickAddress());
  await expect(page.locator(".now-temp")).toBeAttached();
}
async function search(page, label) {
  await page.locator("#interest-chips label", { hasText: label }).click();
  await page.getByRole("button", { name: "Find Little Adventures" }).click();
  await expect(page.locator(".place-card").first()).toBeVisible();
}
const count = (page, name) => page.evaluate((n) => window.fakeGoogleCalls.filter((c) => c.call === n).length, name);
const dialog = (page) => page.locator("#place-dialog");
const close = (page) => dialog(page).locator("[data-place-close]").first().click();

test("one detail map is reused; routes and markers aren't redone for small changes", async ({ page }, testInfo) => {
  await start(page, testInfo);
  await search(page, "Nature");
  const markersAfterSearch = await page.evaluate(() => window.fakeMarkers.length);

  await page.getByRole("button", { name: "Details for Test Park" }).click();
  await expect(dialog(page).locator("#place-route")).toContainText("min walk");
  await close(page);
  await page.getByRole("button", { name: "Details for Test Garden" }).click();
  await expect(dialog(page).locator("#place-title")).toHaveText("Test Garden");
  await expect(dialog(page).locator("#place-route")).toContainText("min walk");
  // The results map plus one detail map, however many places are opened.
  expect(await page.evaluate(() => window.fakeMapCount)).toBe(2);
  // The previous route line was cleared; only the current one is on the map.
  expect(await page.evaluate(() => window.fakePolylines.filter((l) => l.map).length)).toBe(1);
  await close(page);

  // Opening a place again reuses its route instead of asking Google again.
  const routesBefore = await count(page, "computeRoutes");
  await page.getByRole("button", { name: "Details for Test Park" }).click();
  await expect(dialog(page).locator("#place-route")).toContainText("min walk");
  expect(await count(page, "computeRoutes")).toBe(routesBefore);
  await close(page);

  // Changing units or the day updates the list without rebuilding the markers.
  const markersBefore = await page.evaluate(() => window.fakeMarkers.length);
  await page.locator("label", { hasText: "°C" }).click();
  await showView(page, "weather");
  await page.locator("#week .day").nth(1).click();
  await showView(page, "explore");
  await expect(page.locator(".place-card").first()).toContainText("km");
  expect(await page.evaluate(() => window.fakeMarkers.length)).toBe(markersBefore);
  expect(markersBefore).toBeGreaterThanOrEqual(markersAfterSearch);
});

test("journal: each visit is kept, the card shows Explored, and the next perspective comes first", async ({ page }, testInfo) => {
  await start(page, testInfo);
  await search(page, "Everyday Life");
  await page.getByRole("button", { name: "Details for Test Bakery" }).click();
  await expect(dialog(page).locator(".perspective[aria-pressed=true]")).toHaveText("First visit");

  const form = dialog(page).locator(".visit-form");
  await form.getByLabel("What did you notice?").fill("The children noticed round and braided loaves.");
  await form.getByLabel("An idea for next time").fill("Smell the bread.");
  await form.getByRole("button", { name: "Mark as explored" }).click();
  await expect(dialog(page).locator(".journal li")).toHaveCount(1);
  await expect(dialog(page).locator(".perspective[aria-pressed=true]")).toHaveText("Second visit");
  await expect(dialog(page).locator(".perspective-focus")).toHaveText("Focus: Smells and ingredients");

  await dialog(page).locator(".visit-form").getByLabel("What did you notice?").fill("They smelled cinnamon.");
  await dialog(page).locator(".visit-form").getByRole("button", { name: "Mark as explored" }).click();
  await expect(dialog(page).locator(".journal li")).toHaveCount(2);
  await expect(dialog(page).locator(".perspective-focus")).toHaveText("Focus: People and their jobs");
  // The first observation is still there, unchanged.
  await expect(dialog(page).locator(".journal")).toContainText("The children noticed round and braided loaves.");
  await expect(dialog(page).locator(".journal")).toContainText("Next time: Smell the bread.");
  await close(page);

  const card = page.locator(".place-card", { hasText: "Test Bakery" });
  await expect(card).toContainText("Explored · 2 visits");
  await expect(card).toContainText("Next visit:");
  const saved = JSON.parse(await page.evaluate(() => localStorage.getItem("littleDays.places.v2")));
  expect(saved["fake-bakery-1"].visits.map((v) => v.observation)).toEqual(["The children noticed round and braided loaves.", "They smelled cinnamon."]);
  expect(JSON.stringify(saved)).not.toContain("Test Bakery");

  // Explored places stay in results, and the Explored filter finds them.
  await page.locator("label", { hasText: "Not explored yet" }).click();
  await expect(page.locator(".place-card")).toHaveCount(0);
  await page.locator(".explore-tools label", { hasText: /^Explored$/ }).click();
  await expect(page.locator(".place-card")).toHaveCount(1);
});

test("a future visit date is refused", async ({ page }, testInfo) => {
  await start(page, testInfo);
  await search(page, "Nature");
  await page.getByRole("button", { name: "Details for Test Park" }).click();
  const form = dialog(page).locator(".visit-form");
  await form.getByLabel("Date").fill("2026-12-25");
  await form.getByRole("button", { name: "Mark as explored" }).click();
  await expect(form.locator("[data-form-message]")).toHaveText("⚠︎ Choose today or an earlier date.");
  expect(await page.evaluate(() => localStorage.getItem("littleDays.places.v2"))).toBe("{}");
});

test("My Places: tabs with counts, history, visit again, and remove", async ({ page }, testInfo) => {
  await start(page, testInfo);
  await search(page, "Nature");
  await page.getByRole("button", { name: "Save Test Garden" }).click();
  await page.getByRole("button", { name: "Details for Test Park" }).click();
  await dialog(page).locator(".visit-form").getByLabel("What did you notice?").fill("Different leaf shapes.");
  await dialog(page).locator(".visit-form").getByRole("button", { name: "Mark as explored" }).click();
  await close(page);

  const places = page.locator("#my-places");
  await showView(page, "my-places");
  await expect(places.locator("[data-count=want]")).toHaveText("(1)");
  await expect(places.locator("[data-count=explored]")).toHaveText("(1)");
  await expect(places.locator(".saved-place")).toHaveCount(1);
  await expect(places.locator(".saved-place")).toContainText("Test Garden");
  await expect(places.locator(".google-attribution")).toHaveText("Google Maps");

  await places.locator("label", { hasText: "Explored" }).click();
  await expect(places.locator(".saved-place")).toContainText("Last explored Wed, Nov 4 · 1 visit");
  await places.locator("summary", { hasText: "Exploration history" }).click();
  await expect(places.locator(".journal")).toContainText("Different leaf shapes.");

  // Visit again moves it to Revisit and keeps the journal.
  await places.getByRole("button", { name: "Open Test Park" }).click();
  await dialog(page).getByRole("button", { name: "Visit again" }).click();
  await expect(dialog(page).getByRole("button", { name: "Visit again" })).toHaveAttribute("aria-pressed", "true");
  await close(page);
  await expect(places.locator("[data-count=revisit]")).toHaveText("(1)");
  await places.locator("label", { hasText: "Revisit" }).click();
  await expect(places.locator(".saved-place")).toContainText("1 visit");

  await places.getByRole("button", { name: "Remove" }).click();
  await expect(places.locator("[data-count=revisit]")).toHaveText("(0)");
  const saved = JSON.parse(await page.evaluate(() => localStorage.getItem("littleDays.places.v2")));
  expect(Object.keys(saved)).toEqual(["fake-garden-1"]);
});

test("a saved place not in the results is fetched from Google once its section is on screen", async ({ page }, testInfo) => {
  await start(page, testInfo, {
    "littleDays.places.v2": JSON.stringify({ "fake-library-1": { status: "want", category: "art-culture", saved: "2026-11-01", visits: [] } }),
  });
  expect(await count(page, "fetchFields")).toBe(1); // the picked address only
  await showView(page, "my-places");
  await expect(page.locator("#my-places .saved-place")).toContainText("Test Library");
  expect(await count(page, "fetchFields")).toBe(2);
  // Opening it works without a search, with a route from the chosen address.
  await page.getByRole("button", { name: "Open Test Library" }).click();
  await expect(dialog(page).locator("#place-title")).toHaveText("Test Library");
  await expect(dialog(page).locator("#place-route")).toContainText("min walk");
});

test("My week: add a place with time, theme and notes, see its weather, edit it, remove it", async ({ page }, testInfo) => {
  await start(page, testInfo, { "littleDays.plan.v1": JSON.stringify({ "2026-11-06": ["duck-walk"] }) });
  await search(page, "Nature");
  await page.getByRole("button", { name: "Details for Test Park" }).click();
  const form = dialog(page).locator(".plan-form");
  await form.getByLabel("Date").fill("2026-11-06");
  await form.getByLabel("Time").fill("10:00");
  await form.getByLabel("Exploration theme").fill("Leaves and trees");
  await form.getByLabel("Preparation notes").fill("Bring a bag");
  await form.getByRole("button", { name: "Add to my week" }).click();
  await expect(form.locator("[data-form-done]")).toHaveText("Added to Fri, Nov 6 ✓");
  // The same place twice on one date is refused.
  await form.getByRole("button", { name: "Add to my week" }).click();
  await expect(form.locator("[data-form-message]")).toHaveText("⚠︎ This place is already in your week for Fri, Nov 6.");
  await close(page);

  await showView(page, "my-week");
  const day = page.locator("#plan .plan > li", { hasText: "Fri, Nov 6" });
  await expect(day).toContainText("Duck Walk"); // the migrated v1 activity is still there
  await expect(day).toContainText("Test Park");
  await expect(day).toContainText("10:00 · Leaves and trees");
  await expect(day).toContainText("Bring a bag");
  await expect(day.locator(".plan-weather")).toContainText("Rain");
  // Planning doesn't mark the place explored.
  expect(await page.evaluate(() => localStorage.getItem("littleDays.places.v2"))).toBe("{}");

  await day.getByRole("button", { name: /Edit the visit to Test Park/ }).click();
  const edit = page.locator("[data-edit-form]");
  await edit.getByLabel("Date").fill("2026-11-20");
  await edit.getByLabel("Exploration theme").fill("Sounds and birds");
  await edit.getByRole("button", { name: "Save changes" }).click();
  const later = page.locator("#plan .plan > li", { hasText: "Fri, Nov 20" });
  await expect(later).toContainText("Sounds and birds");
  await expect(later.locator(".plan-weather")).toHaveText("Forecast not available yet for this date.");
  await expect(day).not.toContainText("Test Park");

  const stored = JSON.parse(await page.evaluate(() => localStorage.getItem("littleDays.plan.v2")));
  expect(stored["2026-11-06"]).toEqual(["duck-walk"]);
  expect(stored["2026-11-20"][0]).toMatchObject({ kind: "place", placeId: "fake-park-1", time: "10:00", theme: "Sounds and birds", notes: "Bring a bag" });
  expect(await page.evaluate(() => localStorage.getItem("littleDays.plan.v1"))).toBeNull();

  await later.getByRole("button", { name: /Remove the visit to Test Park/ }).click();
  await expect(page.locator("#plan")).not.toContainText("Test Park");
});

test("Delete my saved data removes everything Little Days stored", async ({ page }, testInfo) => {
  await start(page, testInfo, {
    "littleDays.places.v2": JSON.stringify({ "fake-park-1": { status: "explored", visits: [{ date: "2026-11-01", observation: "Leaves" }] } }),
    "littleDays.plan.v2": JSON.stringify({ "2026-11-06": ["duck-walk"] }),
  });
  await expect(page.locator("#delete-data")).toBeVisible();
  await expect(page.locator(".your-data")).toContainText("never stores your device's position");
  await page.locator("#delete-data").click();
  await page.waitForLoadState("load");
  await expect(page.locator("#location-status")).toContainText("Enter an address or use your location");
  const keys = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("littleDays.")));
  // After the reload only defaults may be written again: no places, journal, plan or location.
  expect(keys.filter((k) => !/settings|plan|places/.test(k))).toEqual([]);
  expect(await page.evaluate(() => localStorage.getItem("littleDays.places.v2"))).toBe("{}");
  expect(await page.evaluate(() => localStorage.getItem("littleDays.plan.v2"))).toBe("{}");
  expect(JSON.parse(await page.evaluate(() => localStorage.getItem("littleDays.settings.v2"))).location).toBeNull();
});

test("one results map for the whole visit, and the example address is looked up once", async ({ page }, testInfo) => {
  await start(page, testInfo);
  await search(page, "Nature");
  // A new walking time starts a new search, but the map stays the same one.
  await page.locator("label", { hasText: /^20$/ }).click();
  await page.getByRole("button", { name: "Find Little Adventures" }).click();
  await expect(page.locator(".place-card").first()).toBeVisible();
  expect(await page.evaluate(() => window.fakeMapCount)).toBe(1);
  await page.getByRole("button", { name: "Try an example address" }).click();
  await expect(page.locator("#location-line")).toContainText("Example address");
  await page.getByRole("button", { name: "Try an example address" }).click();
  await expect(page.locator(".now-temp")).toBeAttached();
  expect(await count(page, "searchByText")).toBe(1);
});

test("Export my data downloads a backup; Import my data replaces only after confirming", async ({ page }, testInfo) => {
  const places = { "fake-park-1": { status: "explored", category: "nature", saved: "2026-11-01", visits: [{ date: "2026-11-02", observation: "Leaves", next: "" }] } };
  await start(page, testInfo, { "littleDays.places.v2": JSON.stringify(places) });
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Export my data" }).click()]);
  expect(download.suggestedFilename()).toBe("little-days-data-2026-11-04.json");
  const exported = JSON.parse(await (await download.createReadStream()).toArray().then((c) => Buffer.concat(c).toString()));
  expect(exported).toMatchObject({ format: "little-days-data", version: 1, places });
  expect(JSON.stringify(exported)).not.toMatch(/fake-test-key|Test Park|221 Washington/);

  // A broken file is refused and nothing changes.
  await page.locator("#import-file").setInputFiles({ name: "x.json", mimeType: "application/json", buffer: Buffer.from("{oops") });
  await expect(page.locator("#data-status")).toHaveText("That file isn't a Little Days backup (it isn't valid JSON). Your saved data hasn't changed.");

  // A valid backup replaces what's saved (the dialog is accepted in start()).
  const backup = { ...exported, places: { "fake-library-1": { status: "want", category: "art-culture", saved: "2026-10-01", visits: [] } } };
  await page.locator("#import-file").setInputFiles({ name: "b.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(backup)) });
  await page.waitForLoadState("load");
  await expect.poll(() => page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("littleDays.places.v2") || "{}")))).toEqual(["fake-library-1"]);
});

test("Import is cancelled when the replace isn't confirmed", async ({ page }, testInfo) => {
  testInfo.api = await mockApis(page, { config: GOOGLE_CONFIG, storage: { "littleDays.places.v2": JSON.stringify({ keep: { status: "want", visits: [] } }) } });
  page.on("dialog", (dialog) => dialog.dismiss());
  await page.goto("/");
  const backup = { format: "little-days-data", version: 1, settings: {}, places: {}, plan: {} };
  await page.locator("#import-file").setInputFiles({ name: "b.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(backup)) });
  await expect(page.locator("#data-status")).toHaveText("Import cancelled. Your saved data hasn't changed.");
  expect(await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("littleDays.places.v2"))))).toEqual(["keep"]);
});
