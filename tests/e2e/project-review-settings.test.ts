import { test } from "./fixtures/project-review-settings-fixture";
import { expect } from "@playwright/test";

test.describe("Project - Review settings", () => {
    let projectId: string = "";
    test.beforeAll(async ({ mockBackendService }) => {
        const project = await mockBackendService.createProject({ name: "Project 1" });
        projectId = project.response.id;
    });

    test.beforeEach(async ({ page }) => {
        await page.goto(`/project/${projectId}/settings/review`);
    });

    test.afterAll(async ({ mockBackendService }) => {
        mockBackendService.softDeleteProject({ id: projectId });
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
