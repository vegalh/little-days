// Temporary, not part of the suite: screenshots for a manual visual check of the redesign.
const { test } = require("@playwright/test");
const { mockApis, GOOGLE_CONFIG } = require("./mock-apis.js");

async function start(page, testInfo) {
  testInfo.api = await mockApis(page, { config: GOOGLE_CONFIG });
  await page.goto("/");
  await page.evaluate(() => window.fakePickAddress());
}

test("screenshots: results list, EN and ZH, phone and desktop", async ({ page }, testInfo) => {
  const p = (name) => `test-results/_visual-${testInfo.project.name}-${name}.png`;
  await start(page, testInfo);
  await page.locator("#interest-chips label", { hasText: "Nature" }).click();
  await page.getByRole("button", { name: "Find Little Adventures" }).click();
  await page.waitForSelector(".place-card");
  await page.waitForTimeout(300);
  await page.screenshot({ path: p("results-en"), fullPage: true });
  await page.screenshot({ path: p("results-en-viewport") });

  await page.locator(".place-title").first().click({ timeout: 5000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: p("details-en-viewport") });
  await page.keyboard.press("Escape");

  await page.locator("#lang-switch").click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: p("results-zh"), fullPage: true });
  await page.screenshot({ path: p("results-zh-viewport") });
});
