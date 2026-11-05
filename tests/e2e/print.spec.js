// Print My Week and Print Adventure Guide (PRD.md 7.9, 7.14, DESIGN.md 11). Printing only
// reads state already in memory, so these also check it makes no extra Google, weather or
// holiday request. Google is the fake and every other request is mocked, as in the other
// journeys; window.print is stubbed so the OS print dialog never actually opens.
const { test, expect } = require("@playwright/test");
const { mockApis, showView, GOOGLE_CONFIG, chooseInterest } = require("./mock-apis.js");

test.afterEach(async ({}, testInfo) => {
  expect(testInfo.api?.unmocked ?? []).toEqual([]);
});

// `pick: false` skips choosing an address (and so never fetches weather): used for the
// failed-Google-fetch case, where picking an address would itself hit the failing fetch.
async function start(page, testInfo, { pick = true, ...options } = {}) {
  testInfo.api = await mockApis(page, { config: GOOGLE_CONFIG, ...options });
  await page.addInitScript(() => {
    window.printCalls = 0;
    window.print = () => { window.printCalls += 1; };
  });
  await page.goto("/");
  if (pick) {
    await page.evaluate(() => window.fakePickAddress());
    await expect(page.locator(".now-temp")).toBeAttached();
  } else {
    await expect(page.getByRole("button", { name: /example address|示例地址/ })).toBeVisible();
  }
}

const printArea = (page) => page.locator("#print-area");
const dialog = (page) => page.locator("#place-dialog");

async function noExtraRequests(page, testInfo, action) {
  const requestsBefore = testInfo.api.requests.length;
  const googleCallsBefore = await page.evaluate(() => window.fakeGoogleCalls.length);
  await action();
  expect(testInfo.api.requests.length).toBe(requestsBefore);
  expect(await page.evaluate(() => window.fakeGoogleCalls.length)).toBe(googleCallsBefore);
}

test("Print My Week: activities and a place visit together, grouped by day, with weather and notes", async ({ page }, testInfo) => {
  await start(page, testInfo, {
    storage: {
      "littleDays.plan.v2": JSON.stringify({
        "2026-11-06": [
          "duck-walk",
          { kind: "place", entry: "v1", placeId: "fake-park-1", category: "nature", time: "10:00", theme: "Leaves and trees", notes: "Bring a bag and a water bottle." },
        ],
      }),
    },
  });
  await showView(page, "my-week");
  await expect(page.locator("#plan")).toContainText("Test Park"); // place info fetched for the section on screen

  await noExtraRequests(page, testInfo, () => page.locator("#print-week").click());
  expect(await page.evaluate(() => window.printCalls)).toBe(1);

  const area = printArea(page);
  await expect(area).toContainText("Little Days");
  await expect(area).toContainText("Our Little Adventures");
  // Only the day that's actually planned prints: no page per empty forecast day.
  await expect(area.locator(".print-day")).toHaveCount(1);
  const friday = area.locator(".print-day", { hasText: "Fri, Nov 6" });
  await expect(friday).toContainText("Duck Walk");
  await expect(friday).toContainText("from RootMap");
  await expect(friday).toContainText("Test Park");
  await expect(friday).toContainText("10:00 AM · Leaves and trees");
  await expect(friday).toContainText("Bring a bag and a water bottle.");
  await expect(friday).toContainText("Heavy showers · 66° / 61°"); // a real forecast for this in-range date
  await expect(area.locator(".google-attribution")).toHaveText("Google Maps");
  await expect(area).toContainText("What did we notice?");
  await expect(area.locator(".print-notes-box")).toHaveCount(1);
  // The private journal (observation/next) is never printed, even if one exists for this place.
  await expect(area).not.toContainText("observation");
});

test("Print My Week: several plans on one day print as separate items", async ({ page }, testInfo) => {
  await start(page, testInfo, {
    storage: {
      "littleDays.plan.v2": JSON.stringify({
        "2026-11-06": [
          "duck-walk",
          "bark-rubbing",
          { kind: "place", entry: "v1", placeId: "fake-park-1", category: "nature", time: "", theme: "", notes: "" },
          { kind: "place", entry: "v2", placeId: "fake-garden-1", category: "nature", time: "", theme: "", notes: "" },
        ],
      }),
    },
  });
  await showView(page, "my-week");
  await expect(page.locator("#plan")).toContainText("Test Garden");

  await page.locator("#print-week").click();
  const area = printArea(page);
  await expect(area.locator(".print-day")).toHaveCount(1); // only the planned day prints
  const day = area.locator(".print-day", { hasText: "Fri, Nov 6" });
  await expect(day.locator(".print-item")).toHaveCount(4);
  await expect(day).toContainText("Duck Walk");
  await expect(day).toContainText("Bark Rubbing");
  await expect(day).toContainText("Test Park");
  await expect(day).toContainText("Test Garden");
});

test("Print My Week: no forecast for a date past the window shows the required fallback text", async ({ page }, testInfo) => {
  await start(page, testInfo, {
    storage: { "littleDays.plan.v2": JSON.stringify({ "2026-11-20": ["duck-walk"] }) },
  });
  await showView(page, "my-week");
  await page.locator("#print-week").click();
  await expect(printArea(page)).toContainText("Weather forecast not available yet.");
});

test("Print My Week: a saved place whose details failed to load still prints its notes", async ({ page }, testInfo) => {
  await start(page, testInfo, {
    pick: false,
    google: { failFetch: true },
    storage: {
      "littleDays.plan.v2": JSON.stringify({
        "2026-11-06": [{ kind: "place", entry: "v1", placeId: "fake-park-1", category: "nature", time: "", theme: "", notes: "Check opening hours first." }],
      }),
    },
  });
  await showView(page, "my-week");
  await expect(page.locator("#plan")).toContainText("details unavailable right now");

  await page.locator("#print-week").click();
  const area = printArea(page);
  await expect(area).toContainText("Saved place (details unavailable right now)");
  await expect(area).toContainText("Check opening hours first.");
});

test("Print My Week: an empty week still produces a printable, labelled empty page", async ({ page }, testInfo) => {
  await start(page, testInfo);
  await showView(page, "my-week");
  await page.locator("#print-week").click();
  await expect(printArea(page)).toContainText("Your week is empty.");
});

test("Print My Week: a long preparation note prints in full", async ({ page }, testInfo) => {
  const longNote = "Remember water, snacks, sun hats and a change of clothes. ".repeat(6).trim();
  await start(page, testInfo, {
    storage: {
      "littleDays.plan.v2": JSON.stringify({
        "2026-11-06": [{ kind: "place", entry: "v1", placeId: "fake-park-1", category: "nature", time: "", theme: "", notes: longNote }],
      }),
    },
  });
  await showView(page, "my-week");
  await expect(page.locator("#plan")).toContainText("Test Park");
  await page.locator("#print-week").click();
  await expect(printArea(page)).toContainText(longNote);
});

test("Print Adventure Guide: place, weather for the selected day, and the chosen perspective", async ({ page }, testInfo) => {
  await start(page, testInfo);
  await chooseInterest(page, "Nature");
  await page.getByRole("button", { name: "Explore nearby" }).click();
  await page.getByRole("button", { name: "Details for Test Park" }).click();
  await dialog(page).getByRole("button", { name: "Second visit" }).click();

  await noExtraRequests(page, testInfo, () => dialog(page).getByRole("button", { name: "Print Adventure Guide" }).click());
  expect(await page.evaluate(() => window.printCalls)).toBe(1);

  const area = printArea(page);
  await expect(area).toContainText("Little Days");
  await expect(area).toContainText("Test Park");
  await expect(area).toContainText("1 Test Rd, Newton, MA");
  await expect(area).toContainText("Fog · 77° / 54°");
  await expect(area).toContainText("Second visit");
  await expect(area).toContainText("Why explore this place?");
  await expect(area).toContainText("Exploration focus");
  await expect(area).toContainText("What children might notice");
  await expect(area).toContainText("During the visit");
  await expect(area).toContainText("After the visit");
  await expect(area).toContainText("Practical life extension");
  await expect(area.locator(".google-attribution")).toHaveText("Google Maps");
  await expect(area).toContainText("What did we notice?");
  await expect(area.locator(".print-notes-box")).toHaveCount(1);
  await expect(area).toContainText("Draw what you noticed");
  await expect(area.locator(".print-drawing-box")).toHaveCount(1);
});

test("Print Adventure Guide: no forecast loaded shows the required fallback text, not today's weather", async ({ page }, testInfo) => {
  testInfo.api = await mockApis(page, { config: GOOGLE_CONFIG, forecast: 500 });
  await page.addInitScript(() => {
    window.printCalls = 0;
    window.print = () => { window.printCalls += 1; };
  });
  await page.goto("/");
  await page.evaluate(() => window.fakePickAddress());
  await expect(page.locator("#weather-status")).toContainText("We couldn't load the weather right now.");

  await chooseInterest(page, "Nature");
  await page.getByRole("button", { name: "Explore nearby" }).click();
  await page.getByRole("button", { name: "Details for Test Park" }).click();
  await dialog(page).getByRole("button", { name: "Print Adventure Guide" }).click();
  await expect(printArea(page)).toContainText("Weather forecast not available yet.");
  await expect(printArea(page).locator(".print-section").first()).toContainText("Weather");
});

test("中文: Print My Week and Print Adventure Guide show the Chinese interface", async ({ page }, testInfo) => {
  await start(page, testInfo, {
    storage: {
      "littleDays.plan.v2": JSON.stringify({ "2026-11-06": ["duck-walk"] }),
      "littleDays.settings.v2": JSON.stringify({ lang: "zh" }),
    },
  });
  await showView(page, "my-week");
  await expect(page.locator("#print-week")).toContainText("打印我的一周");
  await page.locator("#print-week").click();
  await expect(printArea(page)).toContainText("我们的小小冒险");
  await expect(printArea(page)).toContainText("来自 RootMap"); // translated "from RootMap" label

  await showView(page, "explore");
  await chooseInterest(page, "自然");
  await page.getByRole("button", { name: "探索附近" }).click();
  await page.getByRole("button", { name: "Test Park的详情" }).click();
  await dialog(page).getByRole("button", { name: "打印探索指南" }).click();
  await expect(printArea(page)).toContainText("为什么来这里探索");
  await expect(printArea(page)).toContainText("探索重点");
  await expect(printArea(page)).toContainText("孩子们可能会注意到");
  await expect(printArea(page)).toContainText("日常生活延伸");
  await expect(printArea(page)).toContainText("我们注意到了什么");
  await expect(printArea(page)).toContainText("画下你们的发现");
});
