import { mergeTests, test as base } from "@playwright/test";
import { SnowballRClient } from "$lib/model/api/main.client";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";

export type TestOptions = {
    mockBackendUrl: string;
};

/**
 * Extends the default test fixture used in each end-to-end test.
 *
 * This custom fixture should be imported using:
 * `import { test } from "./fixtures/general-fixture";`
 * instead of the default Playwright import:
 * `import { test } from "@playwright/test";`
 *
 * It intercepts all requests matching the pattern '.../snowballr.SnowballR/...', i.e. requests to the mock backend and
 * rewrites the URL so that the request is redirected to a specific mock backend instance based on the browser in use.
 *
 * This redirection is necessary because certain tests rely on specific backend states (e.g. an empty list of projects)
 * and expect that only the test itself modifies the state. To avoid interference between tests, each browser is assigned
 * separate backend instance.
 */
export const defaultTest = base.extend<{ forEachTest: void } & TestOptions>({
    mockBackendUrl: ["http://localhost:3001", { option: true }],
    forEachTest: [
        async ({ page, mockBackendUrl }, use) => {
            await page.route("**/snowballr.SnowballR/**", (route, request) => {
                route.continue({
                    url: `${mockBackendUrl}/${request.url().substring(request.url().indexOf("snowballr.SnowballR"))}`,
                });
            });

            await use();
        },
        { auto: true },
    ],
});

/**
 * Extends the default test fixture with an additional gRPC client instance,
 * unique for each browser.
 *
 * This gRPC client allows to directly send requests to the corresponding
 * mock backend before / after (or during) the end-to-end test.
 */
export const mockBackendServiceTest = base.extend<
    { mockBackendService: SnowballRClient } & TestOptions
>({
    mockBackendUrl: ["http://localhost:3001", { option: true }],
    mockBackendService: async ({ mockBackendUrl }, use) => {
        const transport = new GrpcWebFetchTransport({
            baseUrl: mockBackendUrl,
        });
        const mockBackendService = new SnowballRClient(transport);
        await use(mockBackendService);
    },
});

export const test = mergeTests(defaultTest, mockBackendServiceTest);
