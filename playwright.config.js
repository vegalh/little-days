// Browser tests (PRD.md 10.2): desktop and phone, against the static files served as is.
// Every outside request is mocked inside the tests (tests/e2e/mock-apis.js).
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "tests/e2e",
  use: {
    baseURL: "http://localhost:8471",
    browserName: "chromium",
    // The weather fixture is for Newton, MA, so the browser runs on its local time.
    timezoneId: "America/New_York",
    locale: "en-US",
  },
  webServer: {
    command: "python3 -m http.server 8471",
    url: "http://localhost:8471",
    reuseExistingServer: false,
    stderr: "ignore",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 800 } } },
    { name: "phone", use: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true } },
  ],
});
