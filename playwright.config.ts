import { defineConfig, devices, PlaywrightTestConfig } from "@playwright/test";
import type { TestOptions } from "./tests/e2e/fixtures/general-fixture";

const CHROMIUM_BACKEND_PORT = process.env.MOCK_BACKEND_PORT_CHROMIUM ?? "3002";
const CHROMIUM_FRONTEND_PORT = process.env.FRONTEND_PORT_CHROMIUM ?? "4187";

const FIREFOX_BACKEND_PORT = process.env.MOCK_BACKEND_PORT_FIREFOX ?? "3003";
const FIREFOX_FRONTEND_PORT = process.env.FRONTEND_PORT_FIREFOX ?? "4188";

const WEBKIT_BACKEND_PORT = process.env.MOCK_BACKEND_PORT_WEBKIT ?? "3004";
const WEBKIT_FRONTEND_PORT = process.env.FRONTEND_PORT_WEBKIT ?? "4189";

// Playwright doesn't export `TestConfigWebServer` type, so we need to define it ourselves.
type UnArray<T> = T extends (infer U)[] ? U : T;
type NoUndefined<T> = Exclude<T, undefined>;
type TestConfigWebServer = NoUndefined<UnArray<PlaywrightTestConfig["webServer"]>>;

/**
 * Creates a web server configuration for the Playwright test runner.
 *
 * @param frontendPort - The port for the frontend server.
 * @param backendPort - The port for the backend server.
 * @returns A configuration object for the web server.
 */
function createWebServerConfig(frontendPort: string, backendPort: string): TestConfigWebServer {
    const proxyPort = (parseInt(backendPort) + 1000).toString();
    return {
        env: {
            PORT: frontendPort,
            GRPC_PORT: proxyPort,
            GRPC_WEB_PORT: backendPort,
        },
        command: `echo 'Using server on port ${frontendPort}'`,
        url: `http://localhost:${frontendPort}`,
        reuseExistingServer: true,
    };
}

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
        screenshot: "on",
        trace: "retain-on-failure",
    },
    webServer: [
        createWebServerConfig(CHROMIUM_FRONTEND_PORT, CHROMIUM_BACKEND_PORT),
        createWebServerConfig(FIREFOX_FRONTEND_PORT, FIREFOX_BACKEND_PORT),
        createWebServerConfig(WEBKIT_FRONTEND_PORT, WEBKIT_BACKEND_PORT),
    ],
    projects: [
        // Setup projects
        {
            name: "chromium setup",
            testMatch: /.*\.setup\.ts/,
            use: {
                baseURL: `http://localhost:${CHROMIUM_FRONTEND_PORT}`,
            },
        },
        {
            name: "firefox setup",
            testMatch: /.*\.setup\.ts/,
            use: {
                baseURL: `http://localhost:${FIREFOX_FRONTEND_PORT}`,
            },
        },
        {
            name: "webkit setup",
            testMatch: /.*\.setup\.ts/,
            use: {
                baseURL: `http://localhost:${WEBKIT_FRONTEND_PORT}`,
            },
        },

        // Browser tests
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"],
                mockBackendUrl: `http://localhost:${CHROMIUM_BACKEND_PORT}`,
                baseURL: `http://localhost:${CHROMIUM_FRONTEND_PORT}`,
            },
            dependencies: ["chromium setup"],
        },
        {
            name: "firefox",
            use: {
                ...devices["Desktop Firefox"],
                mockBackendUrl: `http://localhost:${FIREFOX_BACKEND_PORT}`,
                baseURL: `http://localhost:${FIREFOX_FRONTEND_PORT}`,
            },
            dependencies: ["firefox setup"],
        },
        {
            name: "webkit",
            use: {
                ...devices["Desktop Safari"],
                mockBackendUrl: `http://localhost:${WEBKIT_BACKEND_PORT}`,
                baseURL: `http://localhost:${WEBKIT_FRONTEND_PORT}`,
            },
            dependencies: ["webkit setup"],
        },
    ],
});
