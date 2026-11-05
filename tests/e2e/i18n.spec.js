// Chinese (PRD.md 7.19). Mocked APIs and the fake Google library, as in the other journeys.
const { test, expect } = require("@playwright/test");
const { mockApis, showView, GOOGLE_CONFIG } = require("./mock-apis.js");

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
  await expect(page.locator(".hero h1")).toHaveText("家门口，处处都是小小的发现。");
  await expect(page.getByRole("button", { name: "寻找小小冒险" })).toBeVisible();
  expect(await page.evaluate(() => window.fakeGoogleLanguage)).toBe("zh-CN");
  expect(JSON.parse(await page.evaluate(() => localStorage.getItem("littleDays.settings.v2"))).lang).toBe("zh");

  await page.evaluate(() => window.fakePickAddress());
  await expect(page.locator("#now-line")).toContainText("现在");
  await page.locator("#interest-chips label", { hasText: "自然" }).click();
  await page.getByRole("button", { name: "寻找小小冒险" }).click();
  await expect(page.locator(".place-card").first()).toContainText("步行");
  await expect(page.locator(".place-card").first()).toContainText("是否对外开放尚未核实");
  await page.getByRole("button", { name: "Test Park的详情" }).click();
  await expect(page.locator("#place-dialog")).toContainText("孩子们可能会注意到");
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
