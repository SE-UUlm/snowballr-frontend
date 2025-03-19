import { defineConfig, devices } from "@playwright/test";
import type { TestOptions } from "./tests/e2e/fixtures/general-fixture";

export default defineConfig<TestOptions>({
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
        screenshot: "on",
        trace: "on-first-retry",
    },
    webServer: {
        command: "npm run build && npm run preview",
        port: 4173,
        reuseExistingServer: !process.env.CI,
    },
    projects: [
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"],
                mockBackendUrl:
                    process.env.PUBLIC_MOCK_BACKEND_GRPC_WEB_PORT_CHROMIUM ??
                    "http://localhost:3002",
            },
        },

        {
            name: "firefox",
            use: {
                ...devices["Desktop Firefox"],
                mockBackendUrl:
                    process.env.PUBLIC_MOCK_BACKEND_GRPC_WEB_PORT_FIREFOX ??
                    "http://localhost:3003",
            },
        },

        {
            name: "webkit",
            use: {
                ...devices["Desktop Safari"],
                mockBackendUrl:
                    process.env.PUBLIC_MOCK_BACKEND_GRPC_WEB_PORT_WEBKIT ?? "http://localhost:3004",
            },
        },
    ],
});
