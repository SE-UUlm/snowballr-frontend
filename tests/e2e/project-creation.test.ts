import { expect } from "@playwright/test";
import { test } from "./fixtures/home-page-fixture";

test.describe("Creating a new project", () => {
    const projectIds = ["0", "1", "2", "3"];

    /**
     * Delete all projects created in this test after all tests are done.
     */
    test.afterAll(async ({ mockBackendService }) => {
        // delete all projects created in this test
        projectIds.forEach((projectId) => {
            mockBackendService.softDeleteProject({ id: projectId });
        });
    });

    test("When clicking on the 'Create Project' button on the homepage, then a dialog for creating the project is opened.", async ({
        homePage,
    }) => {
        await homePage.openCreateProjectDialog();

        await expect(homePage.createProjectDialog).toBeVisible();
    });

    test("When the dialog is opened, then the user can input the project name and possible members.", async ({
        homePage,
        createProjectDialog,
    }) => {
        await homePage.openCreateProjectDialog();

        await createProjectDialog.projectNameInput.fill("Demo project 0");
        await createProjectDialog.projectMemberInput.fill("john@doe.com");

        await createProjectDialog.checkForErrors();
    });

    test("When the process is cancelled, then the dialog is closed, no project is created and all inputs are reset", async ({
        page,
        homePage,
        createProjectDialog,
    }) => {
        await homePage.openCreateProjectDialog();

        await createProjectDialog.projectNameInput.fill("Demo project 1");
        await createProjectDialog.projectMemberInput.fill("john@doe.com");

        await createProjectDialog.closeCreateProjectDialog();
        await createProjectDialog.checkForErrors();

        // dialog is closed
        await expect(homePage.createProjectDialog).toBeHidden();

        // no new project was created
        await expect(page.getByText("Demo project 1")).toBeHidden();

        // all inputs are reset
        await homePage.openCreateProjectDialog();
        await expect(createProjectDialog.projectNameInput).toContainText("");
        await expect(createProjectDialog.projectMemberInput).toContainText("");
    });

    test("When the project was successfully created, but the user doesn't want to open it, then the user stays on the homepage.", async ({
        page,
        homePage,
        createProjectDialog,
    }) => {
        await homePage.openCreateProjectDialog();

        await createProjectDialog.createProject("Demo project 2");
        await createProjectDialog.checkForErrors();
        await page.getByRole("button", { name: "Back" }).click();

        // the user stays on the project and the project is shown in the list of active projects
        await expect(page.getByRole("heading", { name: "SnowballR" })).toBeVisible();
        await expect(page.getByRole("link", { name: "Demo project 2" })).toBeVisible();
    });

    test("When the project was successfully created and the user navigates to the project dashboard, then it shows an empty project.", async ({
        page,
        homePage,
        createProjectDialog,
    }) => {
        await homePage.openCreateProjectDialog();

        await createProjectDialog.createProject("Demo project 3");
        await createProjectDialog.checkForErrors();
        await page.getByRole("button", { name: "Open" }).click();

        // the user is not on the homepage but the project dashboard
        await expect(page.getByText("SnowballR")).toBeHidden();
        await expect(page.getByRole("navigation").getByText("Demo project 3")).toBeVisible();
        await expect(page.getByRole("link", { name: "Demo project 3" })).toBeHidden();

        await expect(page.getByText("stage 0")).toBeVisible();
        await expect(page.getByText("reviewed 0 / 0")).toBeVisible();
        await expect(page.getByText("No open reviews")).toBeVisible();
        await expect(page.getByText("estimated remaining time")).toBeHidden();
    });

    /* TODO: add E2E tests here for checking, that the user creating this project is project admin, the other members
       were invited and the settings are the same as the default settings for new project from the user */
});
