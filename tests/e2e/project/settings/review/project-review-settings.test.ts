import { test } from "./project-review-settings-fixture";
import { expect } from "@playwright/test";

test.describe("Project Review Settings", () => {
    test("Tests the navigation to the project review settings", async ({
        page,
        projectReviewSettingsPage,
        homePage,
        navigationBar,
        projectSettingsSideBar,
    }) => {
        // Directly navigate to the project review settings
        await page.goto("/");

        await homePage.openProject(projectReviewSettingsPage.projectName);
        await navigationBar.settingsTab.click();
        await projectSettingsSideBar.review.click();
        await expect(projectReviewSettingsPage.tagInputField).toBeVisible();
    });
});
