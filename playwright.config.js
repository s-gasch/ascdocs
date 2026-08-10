import { defineConfig, devices } from "@playwright/test";

/**
 * Konfiguracja E2E/cross-browser/a11y (TASK-007, REQ-011/REQ-014).
 * Macierz przeglądarek: Chromium/WebKit/Firefox jako odpowiedniki desktop Chrome/Edge/Safari/
 * Firefox z macierzy REQ-011 (evergreen, log decyzji #2 w plan/index.md).
 */
export default defineConfig({
  testDir: "./test/e2e",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4173",
  },
  webServer: {
    command: "node scripts/dev-server.js",
    url: "http://127.0.0.1:4173/content/sample-app/en/privacy-policy.html",
    reuseExistingServer: !process.env.CI,
    env: { PORT: "4173" },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],
});
