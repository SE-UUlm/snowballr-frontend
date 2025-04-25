import { test } from "./fixtures/project-settings-fixture";
import { expect } from "@playwright/test";

export let projectId: string = "";
export const projectReviewSettingsProjectName = "Project 1";

test.describe("Renaming a project", () => {
    /**
     * Creates a new project before all tests in this test suite.
     */
    test.beforeAll(async ({ mockBackendService }) => {
        await mockBackendService
            .createProject({ name: projectReviewSettingsProjectName })
            .then((project) => (projectId = project.response.id));
    });

    test.afterAll(async ({ mockBackendService }) => {
        mockBackendService.softDeleteProject({ id: projectId });
    });

    test("When the user enters an invalid project name, then the name of the project remains unchanged.", async ({
        page,
        projectSettingsPage,
    }) => {
        await projectSettingsPage.changeProjectName("New Project");
        await projectSettingsPage.checkForErrors();
        const projectNameHeader = page.getByRole("heading", { name: "New Project" });
        await expect(projectNameHeader).toBeVisible();
        const toast = page.getByText("Please enter a new project name.");
        await expect(toast).toBeVisible();
    });

    test("When the user enters an empty project name, then the name of the project remains unchanged.", async ({
        page,
        projectSettingsPage,
    }) => {
        await projectSettingsPage.changeProjectName(" ");
        await projectSettingsPage.checkForErrors();
        const projectNameHeader = page.getByRole("heading", { name: "Project 1" });
        await expect(projectNameHeader).toBeVisible();
        // Here is no toast necessary, because it is handled by the input field.
    });

    test("When the user enters a valid project name, then the name of the project should be updated to this name.", async ({
        page,
        projectSettingsPage,
    }) => {
        await projectSettingsPage.changeProjectName("New Project");
        await projectSettingsPage.checkForErrors();
        const oldHeader = page.getByRole("heading", { name: "Project 1" });
        await expect(oldHeader).not.toBeVisible();
        const projectNameHeader = page.getByRole("heading", { name: "New Project" });
        await expect(projectNameHeader).toBeVisible();
        const toast = page.getByText("Successfully updated project name.");
        await expect(toast).toBeVisible();
    });
});
