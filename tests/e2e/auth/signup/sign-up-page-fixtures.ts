import { test as base } from "../../utils/fixtures/isolated-fixture";
import { HomePageModel } from "$tests/e2e/homepage/home-page-model";
import { SignUpPageModel } from "$tests/e2e/auth/signup/signup-page.model";
import { expect } from "@playwright/test";
import { SignInPageModel } from "$tests/e2e/auth/signin/signin-page-model";

type SignUpPageFixtures = {
    signUpPage: SignUpPageModel;
    homePage: HomePageModel;
    signInPage: SignInPageModel;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - sign-up page
 * - home page
 * - sign-in page
 */
export const test = base.extend<SignUpPageFixtures>({
    signUpPage: async ({ page }, use) => {
        const signupPage = new SignUpPageModel(page);
        await page.goto("/signup");
        await expect(signupPage.heading).toBeVisible();

        await use(signupPage);
    },

    homePage: async ({ page }, use) => {
        await use(new HomePageModel(page));
    },

    signInPage: async ({ page }, use) => {
        await use(new SignInPageModel(page));
    },
});
