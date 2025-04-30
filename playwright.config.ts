import { defineConfig, devices } from "@playwright/test";
import type { TestOptions } from "./tests/e2e/fixtures/general-fixture";

const CHROMIUM_BACKEND_PORT = process.env.MOCK_BACKEND_PORT_CHROMIUM ?? "3002";
const FIREFOX_BACKEND_PORT = process.env.MOCK_BACKEND_PORT_FIREFOX ?? "3003";
const WEBKIT_BACKEND_PORT = process.env.MOCK_BACKEND_PORT_WEBKIT ?? "3004";

export default defineConfig<TestOptions>({
    testDir: "tests/e2e",
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 3,
    failOnFlakyTests: !!process.env.CI,
    // Opt out of parallel tests in CI.
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        [process.env.GITHUB_ACTIONS ? "github" : "list"],
        ["html", { outputFolder: "e2e-report" }],
    ],
    timeout: 10_000,
    expect: {
        timeout: 3_000,
        toHaveScreenshot: {
            maxDiffPixels: 0,
        },
    },
    // set snapshot path to 'tests/e2e/snapshots/...'
    snapshotPathTemplate: "{testDir}/snapshots/{testFilePath}/{arg}-{projectName}-{platform}{ext}",
    use: {
        baseURL: "http://localhost:4173",
        screenshot: "on",
        trace: "retain-on-failure",
    },
    webServer: {
        command: "npm run build && npm run preview",
        port: 4173,
        reuseExistingServer: !process.env.CI,
    },
    projects: [
        // Setup projects
        {
            name: "chromium setup",
            testMatch: /.*\.setup\.ts/,
            use: {
                mockBackendUrl: `http://localhost:${CHROMIUM_BACKEND_PORT}`,
            },
        },
        {
            name: "firefox setup",
            testMatch: /.*\.setup\.ts/,
            use: {
                mockBackendUrl: `http://localhost:${FIREFOX_BACKEND_PORT}`,
            },
        },
        {
            name: "webkit setup",
            testMatch: /.*\.setup\.ts/,
            use: {
                mockBackendUrl: `http://localhost:${WEBKIT_BACKEND_PORT}`,
            },
        },

        // Browser tests
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"],
                mockBackendUrl: `http://localhost:${CHROMIUM_BACKEND_PORT}`,
            },
            dependencies: ["chromium setup"],
        },
        {
            name: "firefox",
            use: {
                ...devices["Desktop Firefox"],
                mockBackendUrl: `http://localhost:${FIREFOX_BACKEND_PORT}`,
            },
            dependencies: ["firefox setup"],
        },
        {
            name: "webkit",
            use: {
                ...devices["Desktop Safari"],
                mockBackendUrl: `http://localhost:${WEBKIT_BACKEND_PORT}`,
            },
            dependencies: ["webkit setup"],
        },
    ],
});
