import { test as base } from "@playwright/test";
import { AuthSnowballRClient, DockerBackend, type User } from "../helper/backend-setup";
import { alice } from "../helper/users";

/**
 * Extends the default test fixture and provides fundamental functionality
 * for backend-based end-to-end tests.
 *
 * This custom fixture should be imported using:
 * `import { test } from "./fixtures/isolated-fixture";`
 * instead of the default Playwright import:
 * `import { test } from "@playwright/test";`
 *
 * A new backend is started for each test, allowing for strict isolation.
 * See `shared-fixture.ts` for a variant in which each worker instead of each
 * test gets its own backend.
 * The test driver is properly authenticated and can directly make calls without
 * needing to sign in, i.e., no need to `page.goto("/signin")` or anything like that.
 * A `SnowballRClient` is also created and authenticated to allow for easy
 * test setup using direct api calls instead of going through the frontend.
 *
 * To start a backend without instantly authenticating, set the `user`
 * option of the fixture to `null`.
 *
 * Provided Services/Options:
 * - user: The user which should be newly registered and authenticated as.
 *         This may be changed based on your requirements. Set it to `undefined`
 *         to disable creation of and authentication as a new user.
 *         Defaults to `alice`.
 * - backend: The newly started, dockerized backend. The port is chosen automatically.
 *            You most likely don't need to interact with this manually.
 * - apiClient: An authenticated instance of `SnowballRClient` connected to `backend`.
 *              It is authenticated as `user`.
 * - page: API call redirection to the `backend` is automatically set up and
 *         the correct authentication credentials are automatically injected.
 *         This page will thus be logged in and make backend calls as `user`.
 */
export const test = base.extend<{
    backend: DockerBackend;
    user: User | null;
    apiClient: AuthSnowballRClient;
}>({
    user: [alice, { scope: "test", option: true }],
    backend: [
        async ({}, use) => {
            const backend = await DockerBackend.create();
            await use(backend);
            backend.dispose();
        },
        { scope: "test", auto: true, timeout: 45_000 },
    ],
    apiClient: [
        async ({ backend, user }, use) => {
            const client = new AuthSnowballRClient(backend);
            if (user !== null) await client.register(user);
            await use(client);
        },
        { scope: "test", auto: true },
    ],
    page: async ({ user, page, backend, apiClient }, use) => {
        await backend.setupRouting(page);
        if (user !== null) await apiClient.injectCredentials(page);
        await use(page);
    },
});
