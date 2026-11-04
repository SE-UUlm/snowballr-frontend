import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the visual regression tests in `tests/visual/`.
 *
 * Kept separate from `playwright.config.ts` so that the functional E2E runs
 * (including shard counting via `playwright test --list`) never pick these up.
 *
 * Screenshots only match if they are always rendered by the same browser build
 * with the same fonts. Therefore, the browser does not run on the host but in
 * the official Playwright Docker image, started by `scripts/run-visual-tests.js`,
 * which passes the WebSocket endpoint via `PW_VISUAL_WS_ENDPOINT`.
 * `exposeNetwork: "<loopback>"` lets the containerized browser reach the
 * frontend preview and the mock backends on the host's `localhost`.
 */
const wsEndpoint = process.env.PW_VISUAL_WS_ENDPOINT;
if (!wsEndpoint) {
    throw new Error(
        "PW_VISUAL_WS_ENDPOINT is not set. Run the visual tests via `npm run test:visual`.",
    );
}

export default defineConfig({
    testDir: "tests/visual",
    testMatch: "**/*.visual.ts",
    // The default template contains the host platform, but the browser always runs in the
    // same Linux container, so the same baselines are valid on every host.
    snapshotPathTemplate: "{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}",
    forbidOnly: Boolean(process.env.CI),
    // Each test has its own mock backend, so tests are independent; this also balances CI shards.
    fullyParallel: true,
    // A visual diff is deterministic; retrying would only waste time.
    retries: 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        [process.env.GITHUB_ACTIONS ? "github" : "list"],
        ["html", { outputFolder: "visual-report", open: "never" }],
    ],
    expect: {
        timeout: 7_500,
        toHaveScreenshot: {
            animations: "disabled",
            caret: "hide",
            // Default per-pixel color threshold, but no differing pixels allowed.
            maxDiffPixels: 0,
        },
    },
    timeout: 30_000,
    use: {
        baseURL: "http://localhost:4173",
        // Pinned explicitly; otherwise they would come from the browser container.
        locale: "en-US",
        timezoneId: "UTC",
        trace: "retain-on-failure",
        connectOptions: {
            wsEndpoint,
            exposeNetwork: "<loopback>",
        },
    },
    webServer: {
        command: "npm run build && npm run preview",
        port: 4173,
        env: {
            PUBLIC_API_BASE_URL: "http://localhost:3001",
            PUBLIC_CREDENTIAL_POLICY: "include",
            // Overrides a local `.env`, so dev-only UI (e.g. the breakpoint badge) never shows up in tests.
            PUBLIC_IS_DEV_MODE: "false",
        },
        reuseExistingServer: !process.env.CI,
    },
    projects: [
        {
            name: "visual",
            use: {
                ...devices["Desktop Firefox"],
            },
        },
    ],
});
