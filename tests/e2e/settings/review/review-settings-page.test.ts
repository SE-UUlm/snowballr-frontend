import { test } from "./review-settings-page-fixture";
import { expect } from "@playwright/test";
import { reloadWait } from "$tests/e2e/utils/helper/helper";

test.describe("Review Settings Navigation", () => {
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

test.describe("Review Mode Tests", () => {
    test("When the user enables the review mode, then the review buttons in the project paper view are visible", async ({
        reviewSettingsPage,
        projectPaperViewPage,
        homePage,
        navigationBar,
    }) => {
        await reviewSettingsPage.setReviewMode(true);
        await navigationBar.goBackButton.click();
        await homePage.openProjectPaper(reviewSettingsPage.paperName);
        await expect(projectPaperViewPage.acceptButton).toBeVisible();
    });

    test("When the user disables the review mode, then the review buttons in the project paper view are not visible", async ({
        reviewSettingsPage,
        projectPaperViewPage,
        homePage,
        navigationBar,
    }) => {
        await reviewSettingsPage.setReviewMode(false);
        await navigationBar.goBackButton.click();
        await homePage.openProjectPaper(reviewSettingsPage.paperName);
        await expect(projectPaperViewPage.acceptButton).not.toBeVisible();
    });

    test("When the user reloads the page, then the shortcuts visibility is persisted", async ({
        page,
        reviewSettingsPage,
        homePage,
        projectPaperViewPage,
        navigationBar,
        settingsSideBar,
    }) => {
        await reviewSettingsPage.setReviewMode(true);
        await reloadWait(page, reviewSettingsPage.heading);

        await navigationBar.goBackButton.click();
        await homePage.openProjectPaper(reviewSettingsPage.paperName);
        await expect(projectPaperViewPage.acceptButton).toBeVisible();

        await navigationBar.getUserAvatarButton().click();
        await navigationBar.getSettingsLink().click();
        await settingsSideBar.review.click();

        await reviewSettingsPage.setReviewMode(false);
        await reloadWait(page, reviewSettingsPage.heading);

        await navigationBar.goBackButton.click();
        await homePage.openProjectPaper(reviewSettingsPage.paperName);
        await expect(projectPaperViewPage.acceptButton).not.toBeVisible();
    });
});
