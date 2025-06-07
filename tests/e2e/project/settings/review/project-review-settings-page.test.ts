import { test } from "./project-review-settings-page-fixture";
import { expect } from "@playwright/test";

test.describe("Project Review Settings Tests", () => {
    test("When navigating to the project review settings, then the page is displayed", async ({
        page,
        projectReviewSettingsPage,
        homePage,
        projectNavigationBar,
        projectSettingsSideBar,
    }) => {
        // Directly navigate to the project review settings
        await page.goto("/");

        await homePage.openProject(projectReviewSettingsPage.projectName);
        await projectNavigationBar.settingsTab.click();
        await projectSettingsSideBar.review.click();
        await expect(projectReviewSettingsPage.tagInputField).toBeVisible();
    });
});
