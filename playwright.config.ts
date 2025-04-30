import { defineConfig, devices } from "@playwright/test";
import type { TestOptions } from "./tests/e2e/fixtures/general-fixture";

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
    },
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
                mockBackendUrl:
                    process.env.PUBLIC_MOCK_BACKEND_GRPC_WEB_PORT_CHROMIUM ??
                    "http://localhost:3002",
            },
        },
        {
            name: "firefox setup",
            testMatch: /.*\.setup\.ts/,
            use: {
                mockBackendUrl:
                    process.env.PUBLIC_MOCK_BACKEND_GRPC_WEB_PORT_FIREFOX ??
                    "http://localhost:3003",
            },
        },
        {
            name: "webkit setup",
            testMatch: /.*\.setup\.ts/,
            use: {
                mockBackendUrl:
                    process.env.PUBLIC_MOCK_BACKEND_GRPC_WEB_PORT_WEBKIT ?? "http://localhost:3004",
            },
        },

        // Browser tests
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"],
                mockBackendUrl:
                    process.env.PUBLIC_MOCK_BACKEND_GRPC_WEB_PORT_CHROMIUM ??
                    "http://localhost:3002",
            },
            dependencies: ["chromium setup"],
        },
        {
            name: "firefox",
            use: {
                ...devices["Desktop Firefox"],
                mockBackendUrl:
                    process.env.PUBLIC_MOCK_BACKEND_GRPC_WEB_PORT_FIREFOX ??
                    "http://localhost:3003",
            },
            dependencies: ["firefox setup"],
        },
        {
            name: "webkit",
            use: {
                ...devices["Desktop Safari"],
                mockBackendUrl:
                    process.env.PUBLIC_MOCK_BACKEND_GRPC_WEB_PORT_WEBKIT ?? "http://localhost:3004",
            },
            dependencies: ["webkit setup"],
        },
    ],
});
