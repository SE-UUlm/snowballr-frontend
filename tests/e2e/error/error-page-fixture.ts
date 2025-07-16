import { test as base } from "../utils/fixtures/isolated-fixture";
import { HomePageModel } from "../homepage/home-page-model";
import { ErrorPageModel } from "./error-page-model";

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
