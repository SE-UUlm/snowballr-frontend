import { test as base } from "@playwright/test";

export type TestOptions = {
    mockBackendUrl: string;
};

export const test = base.extend<{ forEachTest: void } & TestOptions>({
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
