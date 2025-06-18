import { test as base } from "../../utils/fixtures/isolated-fixture";
import { HomePageModel } from "$tests/e2e/homepage/home-page-model";
import { expect } from "@playwright/test";
import { NavigationBarModel } from "$tests/e2e/navigation-bar-model";
import { SignInPageModel } from "$tests/e2e/auth/signin/signin-page-model";

type SignOutPageFixtures = {
    signInPage: SignInPageModel;
    navigationBarModel: NavigationBarModel;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - sign-in page
 * - navigation bar
 */
export const test = base.extend<SignOutPageFixtures>({
    signInPage: async ({ page }, use) => {
        await page.goto("/");
        await expect(new HomePageModel(page).heading).toBeVisible();
        await use(new SignInPageModel(page));
    },

    navigationBarModel: async ({ page }, use) => {
        await use(new NavigationBarModel(page));
    },
});
