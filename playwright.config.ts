import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "tests/e2e",
    forbidOnly: !!process.env.CI,
    retries: 2,
    failOnFlakyTests: !!process.env.CI,
    // Opt out of parallel tests on CI.
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        [process.env.GITHUB_ACTIONS ? "github" : "list"],
        ["html", { outputFolder: "e2e-report" }],
    ],
    expect: {
        timeout: 2_500,
    },
    timeout: 15_000,
    use: {
        baseURL: "http://localhost:4173",
        screenshot: "on",
        trace: "on",
    },
    webServer: {
        command: "npm run build && npm run preview",
        port: 4173,
        env: {
            PUBLIC_API_BASE_URL: "http://localhost:3001",
            PUBLIC_CREDENTIAL_POLICY: "include",
        },
        reuseExistingServer: !process.env.CI,
    },
    projects: [
        // Browser tests
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"],
            },
        },
        {
            name: "firefox",
            use: {
                ...devices["Desktop Firefox"],
            },
        },
        {
            name: "webkit",
            use: {
                ...devices["Desktop Safari"],
            },
        },
    ],
});
