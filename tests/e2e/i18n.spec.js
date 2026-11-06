// Chinese (PRD.md 7.19). Mocked APIs and the fake Google library, as in the other journeys.
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
  await expect(page.locator("#setup-heading")).toHaveText("找找带孩子探索的好地方。");
  await expect(page.locator("#address-label")).toHaveText("你家在哪里？");
  expect(await page.evaluate(() => window.fakeGoogleLanguage)).toBe("zh-CN");
  expect(JSON.parse(await page.evaluate(() => localStorage.getItem("littleDays.settings.v2"))).lang).toBe("zh");

  await page.evaluate(() => window.fakePickAddress());
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

test("a new visitor opens in Chinese on the example address, which is never saved", async ({ page }, testInfo) => {
  testInfo.api = await mockApis(page, { config: { ...GOOGLE_CONFIG, startAtExample: true }, realDefaults: true });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator(".place-card").first()).toBeVisible();
  await expect(page.locator("#setup")).toBeHidden();
  await expect(page.locator("#location-line")).toContainText("示例地址");
  await expect(page.locator(".now-temp")).toBeAttached();
  const calls = await page.evaluate(() => window.fakeGoogleCalls.map((c) => c.call));
  expect(calls.filter((call) => call === "searchByText")).toHaveLength(1);
  expect(calls.filter((call) => call === "searchNearby")).toHaveLength(6);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("littleDays.settings.v2") || "{}"));
  expect(saved.location || null).toBeNull();

  // A real choice takes over for good.
  await page.locator("#location-line").locator("xpath=..").getByRole("button", { name: "更改" }).click();
  await page.evaluate(() => window.fakePickAddress());
  await page.reload();
  await expect(page.locator("#location-line")).not.toContainText("示例地址");
  await expect(page.locator("#location-line")).toContainText("Newton");
});

test("someone who chose English stays in English", async ({ page }, testInfo) => {
  testInfo.api = await mockApis(page, { config: GOOGLE_CONFIG, realDefaults: true, storage: { "littleDays.settings.v2": JSON.stringify({ lang: "en" }) } });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
