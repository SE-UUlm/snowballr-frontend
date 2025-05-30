import { test as base } from "../utils/fixtures/isolated-fixture";
import { DevHomePage } from "$tests/e2e/homepage/home-page-model";
import { DevCreateProjectDialog } from "$tests/e2e/homepage/create-project-dialog-model";
import { expect } from "@playwright/test";
import { SignInPage } from "$tests/e2e/auth/signin/signin-page-model";

type HomePageFixtures = {
    homePage: DevHomePage;
    signInPage: SignInPage;
    createProjectDialog: DevCreateProjectDialog;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - home page
 * - the dialog for creating a new project
 */
export const test = base.extend<HomePageFixtures>({
    homePage: async ({ page }, use) => {
        await page.goto("/");
        await expect(page.getByRole("heading", { name: "SnowballR" })).toBeVisible();

        await use(new DevHomePage(page));
    },

    signInPage: async ({ page }, use) => {
        await use(new SignInPage(page));
    },

    createProjectDialog: async ({ page }, use) => {
        await use(new DevCreateProjectDialog(page));
    },
});
