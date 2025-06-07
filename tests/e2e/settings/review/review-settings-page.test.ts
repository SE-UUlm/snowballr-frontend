import { test } from "./review-settings-page-fixture";
import { expect } from "@playwright/test";

test.describe("Review Settings Tests", () => {
    test("When navigating to the review settings, then the page is displayed", async ({
        page,
        reviewSettingsPage,
        navigationBar,
        settingsSideBar,
    }) => {
        // Directly navigate to the review settings
        await page.goto("/");

        await navigationBar.getUserAvatarButton().click();
        await navigationBar.getSettingsLink().click();
        await settingsSideBar.review.click();
        await expect(reviewSettingsPage.reviewModeSwitch).toBeVisible();
    });
});
