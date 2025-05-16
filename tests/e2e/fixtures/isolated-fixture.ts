import { test as base } from "@playwright/test";
import { AuthSnowballRClient, DockerMockBackend, type User } from "../mock-backend";
import { alice } from "../users";

/**
 * Extends the default test fixture and provides fundamental functionality
 * for mock-backend based end-to-end tests.
 *
 * This custom fixture should be imported using:
 * `import { test } from "./fixtures/isolated-fixture";`
 * instead of the default Playwright import:
 * `import { test } from "@playwright/test";`
 *
 * A new mock backend is started for each test, allowing for strict isolation.
 * See `shared-fixture.ts` for a variant in which each worker instead of each
 * test gets its own mock backend.
 * The test driver is properly authenticated and can directly make calls without
 * needing to sign in. No need to `page.goto("/signin")` or anything like that.
 * A `SnowballRClient` is also created and authenticated to allow for easy
 * test setup using direct api calls instead of going through the frontend.
 *
 * To start a mock backend without instantly authenticating, set the `user`
 * option of the fixture to `null`.
 *
 * Provided Services/Options:
 * - user: The user which should be newly registered and authenticated as.
 *         This may be changed based on your requirements. Set it to `undefined`
 *         to disable creation of and authentication as a new user.
 *         Defaults to `alice`.
 * - mockBackend: The newly started, dockerized mock backend. The port is
 *                choosen automatically. You most likely don't need to interact
 *                with this manually.
 * - apiClient: An authenticated instance of SnowballRClient connected to
 *              `mockBackend` . It is authenticated as `user`.
 * - page: API call redirection to the `mockBackend` is automatically setup and
 *         the correct authentication credenitals are automatically injected.
 *         This page will thus be logged in and make backend calls as `user`.
 */
export const test = base.extend<{
    mockBackend: DockerMockBackend;
    user: User | null;
    apiClient: AuthSnowballRClient;
}>({
    user: [alice, { scope: "test", option: true }],
    mockBackend: [
        // eslint-disable-next-line no-empty-pattern
        async ({}, use) => {
            const mockBackend = await DockerMockBackend.create();
            await use(mockBackend);
            mockBackend.dispose();
        },
        { scope: "test", auto: true, timeout: 45_000 },
    ],
    apiClient: [
        async ({ mockBackend, user }, use) => {
            const client = new AuthSnowballRClient(mockBackend);
            if (user !== null) await client.register(user);
            await use(client);
        },
        { scope: "test", auto: true },
    ],
    page: async ({ user, page, mockBackend, apiClient }, use) => {
        await mockBackend.setupRouting(page);
        if (user !== null) await apiClient.injectCredentials(page);
        await use(page);
    },
});
