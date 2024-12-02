import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "tests/e2e",
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    // Opt out of parallel tests on CI.
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        [process.env.GITHUB_ACTIONS ? "github" : "list"],
        ["html", { outputFolder: "e2e-report" }],
    ],
    use: {
        baseURL: "http://localhost:4173",
        screenshot: "only-on-failure",
        trace: "on-first-retry",
    },
    webServer: {
        command: "npm run build && npm run preview",
        port: 4173,
    },
});
