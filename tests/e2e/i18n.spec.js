// Chinese (PRD.md 7.19). Mocked APIs and the fake map library, as in the other journeys.
const { test, expect } = require("@playwright/test");
const { mockApis, showView, chooseInterest, GOOGLE_CONFIG } = require("./mock-apis.js");

test.afterEach(async ({}, testInfo) => {
  expect(testInfo.api?.unmocked ?? []).toEqual([]);
});

test("中文: the switch saves the choice, and the whole page comes back in Chinese", async ({ page }, testInfo) => {
  testInfo.api = await mockApis(page, { config: GOOGLE_CONFIG });
  await page.goto("/");
  await expect(page.locator("#lang-switch")).toHaveText("中文");
  await page.locator("#lang-switch").click();
  await page.waitForLoadState("load");

  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator("#lang-switch")).toHaveText("EN");
  await expect(page.locator(".site-nav")).toContainText("探索");
  expect(await page.evaluate(() => window.fakeGoogleLanguage)).toBe("zh-CN");
  expect(JSON.parse(await page.evaluate(() => localStorage.getItem("littleDays.settings.v2"))).lang).toBe("zh");

  await expect(page.locator("#now-line")).toContainText("预报有雾");
  await chooseInterest(page, "自然");
  await expect(page.locator(".place-card").first()).toContainText("步行");
  await page.getByRole("button", { name: "Test Park的详情" }).click();
  await expect(page.locator("#place-dialog")).toContainText("孩子们可能会注意到");
  await expect(page.locator("#place-dialog")).toContainText("是否对外开放尚未核实");
  await expect(page.locator("#place-dialog .perspective-focus")).toHaveText("重点：叶子和树");
  await page.locator("#place-dialog [data-place-close]").first().click();

  await showView(page, "weather");
  await expect(page.locator("#wear")).toContainText("穿什么");
  await expect(page.locator("#why")).toContainText("“");
  // RootMap's own Chinese for the activities.
  await expect(page.locator("#idea-list .idea").first()).toContainText("分钟");

  // And back to English.
  await page.locator("#lang-switch").click();
  await page.waitForLoadState("load");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#lang-switch")).toHaveText("中文");
  await expect(page.locator(".site-nav")).toContainText("Explore");
  await expect(page.locator("#wear")).toContainText("What to wear");
});

test("a new visitor opens in Chinese for a class, on the school's places, with no search", async ({ page }, testInfo) => {
  testInfo.api = await mockApis(page, { config: GOOGLE_CONFIG, realDefaults: true });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator("#location-line")).toHaveText("📍 Test School");
  await expect(page.locator(".place-card").first()).toBeVisible();
  await expect(page.locator("#filters-count")).toBeHidden();
  const calls = await page.evaluate(() => window.fakeGoogleCalls.map((c) => c.call).filter((c) => /search|Matrix|fetchFields|computeRoutes/i.test(c)));
  expect(calls).toEqual([]);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("littleDays.settings.v2")));
  expect(saved.mode).toBe("classroom");
});

test("someone who chose English stays in English", async ({ page }, testInfo) => {
  testInfo.api = await mockApis(page, { config: GOOGLE_CONFIG, realDefaults: true, storage: { "littleDays.settings.v2": JSON.stringify({ lang: "en" }) } });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
