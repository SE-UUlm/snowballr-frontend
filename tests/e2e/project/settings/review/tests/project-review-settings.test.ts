import { test } from "../fixtures/project-review-settings-fixture";
import { expect } from "@playwright/test";

export let projectId: string = "";
export const projectReviewSettingsProjectName = "Project 1";

test.describe("Project - Review settings", () => {
    /**
     * Creates a new project before all tests in this test suite.
     */
    test.beforeAll(async ({ apiClient }) => {
        await apiClient
            .createProject({ name: projectReviewSettingsProjectName })
            .then((project) => (projectId = project.response.id));
    });

    /**
     * Deletes the project after all tests in this test suite.
     */
    test.afterAll(async ({ apiClient }) => {
        apiClient.softDeleteProject({ id: projectId });
    });

    test("When the user creates a new tag and deletes this tag, then the tag is correctly added and deleted", async ({
        page,
        projectReviewSettingsPage,
    }) => {
        await projectReviewSettingsPage.addTag("New Tag");
        const newTag = page.getByText("New Tag");
        await expect(newTag).toBeVisible();
        await projectReviewSettingsPage.deleteTag("New Tag");
        await expect(newTag).not.toBeVisible();
    });

    test("When the user navigates to another page and comes back to the review settings, then the previously defined keyword tags are still available", async ({
        page,
        projectReviewSettingsPage,
    }) => {
        await projectReviewSettingsPage.addTag("New Tag 1");
        await expect(page.getByText("New Tag 1")).toBeVisible();
        await projectReviewSettingsPage.addTag("New Tag 2");
        await expect(page.getByText("New Tag 2")).toBeVisible();

        await page.getByText("General").click();
        await page.getByRole("link", { name: "Review" }).click();

        await expect(page.getByText("New Tag 1")).toBeVisible();
        await expect(page.getByText("New Tag 2")).toBeVisible();
    });
});
