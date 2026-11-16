import { defineConfig } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: ".",
  testMatch: "**/*.spec.ts",
  timeout: isCI ? 30_000 : 15_000,
  expect: { timeout: isCI ? 10_000 : 5_000 },
  use: {
    baseURL: "http://localhost:4173",
    headless: true,
    // Lets a sandbox without Playwright's own browser point at an installed Chromium.
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
  webServer: {
    command: "npm run dev",
    port: 4173,
    reuseExistingServer: !isCI,
  },
});
