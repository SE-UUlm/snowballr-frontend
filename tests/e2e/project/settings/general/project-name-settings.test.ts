import { test } from "./project-general-settings-fixture";
import { expect } from "@playwright/test";

export let projectId: string = "";
const projectName = "Project 1";

test.describe("Renaming a project", () => {
    /**
     * Creates a new project before all tests in this test suite.
     */
    test.beforeAll(async ({ apiClient }) => {
        await apiClient
            .createProject({ name: projectName })
            .response.then((project) => (projectId = project.id));
    });

    test.afterAll(async ({ apiClient }) => {
        await apiClient.softDeleteProject({ id: projectId }).response;
    });

    test("When the user enters the same project name, then a warning alert is shown", async ({
        page,
        projectSettingsPage,
    }) => {
        await projectSettingsPage.changeProjectName("Project 1");

        await expect(page.getByRole("heading", { name: "Project 1" })).toBeVisible();
        await expect(
            page.getByRole("alert", {
                name: "No Changes Detected",
            }),
        ).toBeVisible();
        await expect(
            page.getByText(
                "To successfully change the project's name, you must provide a new one that is different from the current one.",
            ),
        ).toBeVisible();
    });

    test("When the user enters a blank project name, then the project name remains unchanged and an error is shown", async ({
        page,
        projectSettingsPage,
    }) => {
        await projectSettingsPage.changeProjectName(" ");

        await expect(page.getByRole("heading", { name: "Project 1" })).toBeVisible();
        await expect(
            page.getByText("The project name cannot start or end with whitespace"),
        ).toBeVisible();
    });

    test("When the user enters a valid project name, then the name of the project should be updated to this name.", async ({
        page,
        projectSettingsPage,
    }) => {
        await projectSettingsPage.changeProjectName("New Project");

        await projectSettingsPage.checkForErrors();
        await expect(page.getByRole("heading", { name: "Project 1" })).not.toBeVisible();
        await expect(page.getByRole("heading", { name: "New Project" })).toBeVisible();
        await expect(page.getByText("Successfully updated project name.")).toBeVisible();
    });
});
