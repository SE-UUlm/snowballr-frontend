import { expect } from "@playwright/test";
import { test } from "$tests/visual/utils/visual-fixture";
import { HomePageModel } from "$tests/e2e/homepage/home-page-model";

test.describe("Homepage", () => {
    test("When the homepage is opened without any data, then it shows the empty state", async ({
        page,
    }) => {
        const homePage = new HomePageModel(page);
        await page.goto("/");
        await expect(homePage.heading).toBeVisible();

        await expect(page).toHaveScreenshot("homepage-empty.png", { fullPage: true });
    });

    test("When the create-project dialog is opened, then it matches the baseline", async ({
        page,
    }) => {
        const homePage = new HomePageModel(page);
        await page.goto("/");
        await homePage.openCreateProjectDialog();
        await expect(homePage.createProjectDialog).toBeVisible();

        await expect(homePage.createProjectDialog).toHaveScreenshot("create-project-dialog.png");
    });
});
