import { test as base } from "../../utils/fixtures/isolated-fixture";
import { SignInPageModel } from "$tests/e2e/auth/signin/signin-page-model";
import { alice } from "$tests/e2e/utils/helper/users";
import { HomePageModel } from "$tests/e2e/homepage/home-page-model";
import { expect } from "@playwright/test";
import { SignUpPageModel } from "$tests/e2e/auth/signup/signup-page.model";

type SignInPageFixtures = {
    signInPage: SignInPageModel;
    homePage: HomePageModel;
    signUpPage: SignUpPageModel;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - sign-in page
 * - home page
 * - sign-up page
 */
export const test = base.extend<SignInPageFixtures>({
    signInPage: async ({ page, apiClient }, use) => {
        const signInPage = new SignInPageModel(page);
        await apiClient.register(alice);
        await page.goto("/signin");
        await expect(signInPage.heading).toBeVisible();

        await use(new SignInPageModel(page));
    },

    homePage: async ({ page }, use) => {
        await use(new HomePageModel(page));
    },

    signUpPage: async ({ page }, use) => {
        await use(new SignUpPageModel(page));
    },
});
