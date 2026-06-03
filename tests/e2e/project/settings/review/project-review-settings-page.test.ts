import { test } from "./project-review-settings-page-fixture";
import { expect } from "@playwright/test";
import { reloadWait } from "$tests/e2e/utils/helper/helper";

test.describe("Project Review Settings Navigation", () => {
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

test.describe("Keyword Settings Tests", () => {
    test("When the user creates a new tag and deletes this tag, then the tag is correctly added and deleted", async ({
        projectReviewSettingsPage,
    }) => {
        await projectReviewSettingsPage.addTag("New Tag");
        const newTag = await projectReviewSettingsPage.getTag("New Tag");
        await expect(newTag).toBeVisible();
        await projectReviewSettingsPage.deleteTag("New Tag");
        await expect(newTag).not.toBeVisible();
    });

    test("When the user navigates to another page and comes back to the review settings, then the previously defined keyword tags are still available", async ({
        page,
        projectReviewSettingsPage,
    }) => {
        await projectReviewSettingsPage.addTag("New Tag 1");
        await expect(await projectReviewSettingsPage.getTag("New Tag 1")).toBeVisible();
        await projectReviewSettingsPage.addTag("New Tag 2");
        await expect(await projectReviewSettingsPage.getTag("New Tag 2")).toBeVisible();

        await reloadWait(page, projectReviewSettingsPage.heading);

        await expect(await projectReviewSettingsPage.getTag("New Tag 1")).toBeVisible();
        await expect(await projectReviewSettingsPage.getTag("New Tag 2")).toBeVisible();
    });
});

test.describe("Number of Reviewers Settings Tests", () => {
    test("When navigating to the review settings as a project admin, then the number of reviewers section is visible", async ({
        projectReviewSettingsPage,
    }) => {
        await expect(projectReviewSettingsPage.numberOfReviewersHeading).toBeVisible();
        await expect(projectReviewSettingsPage.numberOfReviewersSlider).toBeVisible();
        await expect(projectReviewSettingsPage.numberOfReviewersSlider).toBeEnabled();
    });

    test("When the user changes the number of reviewers using the slider, then a success notification is shown", async ({
        projectReviewSettingsPage,
        page,
    }) => {
        await expect(projectReviewSettingsPage.getNumberOfReviewers()).resolves.toBe(1);

        // We only change the value by one, because we can only do one step at a time
        await projectReviewSettingsPage.setNumberOfReviewers(2);

        await expect(page.getByText("Successfully updated the project settings.")).toBeVisible();
    });

    test("When the user changes the number of reviewers and reloads the page, then the new value is persisted", async ({
        page,
        projectReviewSettingsPage,
    }) => {
        await expect(projectReviewSettingsPage.getNumberOfReviewers()).resolves.toBe(1);

        // We only change the value by one, because we can only do one step at a time
        await projectReviewSettingsPage.setNumberOfReviewers(2);

        await reloadWait(page, projectReviewSettingsPage.numberOfReviewersHeading);

        await expect(projectReviewSettingsPage.numberOfReviewersSlider).toHaveAttribute(
            "aria-valuenow",
            "2",
        );
    });

    test.fixme("When the project status is 'ACTIVE_LOCKED', then the number of reviewers slider is disabled", async () => {});
});
