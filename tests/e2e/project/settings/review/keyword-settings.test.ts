import { reloadWait } from "$tests/e2e/utils/helper/helper";
import { test } from "./project-review-settings-page-fixture";
import { expect } from "@playwright/test";

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
