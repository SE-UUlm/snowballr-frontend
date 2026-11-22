import { test as base } from "#tests/e2e/utils/fixtures/isolated-fixture.js";
import { HomePageModel } from "#tests/e2e/homepage/home-page-model.js";
import { ErrorPageModel } from "#tests/e2e/error/error-page-model.js";

type ErrorPageFixtures = {
    errorPage: ErrorPageModel;
    homePage: HomePageModel;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - error page
 * - home page
 */
export const test = base.extend<ErrorPageFixtures>({
    errorPage: async ({ page }, use) => {
        await use(new ErrorPageModel(page));
    },

    homePage: async ({ page }, use) => {
        await use(new HomePageModel(page));
    },
});
