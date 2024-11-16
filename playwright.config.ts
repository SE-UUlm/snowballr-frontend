import { defineConfig } from "@playwright/test";

export default defineConfig({
    webServer: {
        command: "npm run build && npm run preview",
        port: 4173,
    },
    testDir: "test/e2e",
    // Opt out of parallel tests on CI.
    workers: process.env.CI ? 1 : undefined,
    outputDir: "test-results",
});
