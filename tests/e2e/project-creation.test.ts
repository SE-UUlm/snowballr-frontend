import { expect } from "@playwright/test";
import { test } from "./fixtures/general-fixture";
import { DevHomePage } from "./pom/home-page-model";
import { DevCreateProjectDialog } from "./pom/create-project-dialog-model";

test.describe("Creating a new project", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test.afterAll(async ({ mockBackendService }) => {
        mockBackendService.softDeleteProject({ id: "0" });
        mockBackendService.softDeleteProject({ id: "1" });
        mockBackendService.softDeleteProject({ id: "2" });
    });

    test("When clicking on the 'Create Project' button on the homepage, then a dialog for creating the project is opened.", async ({
        page,
    }) => {
        const homepage = new DevHomePage(page);
        await homepage.openCreateProjectDialog();

        await expect(homepage.createProjectDialog).toBeVisible();
    });

    test("When the dialog is opened, then the user can input the project name and possible members.", async ({
        page,
    }) => {
        const homepage = new DevHomePage(page);
        await homepage.openCreateProjectDialog();
        const dialog = new DevCreateProjectDialog(page);

        await dialog.projectNameInput.fill("Demo project 0");
        await dialog.projectMemberInput.fill("john@doe.com");

        await dialog.checkForErrors();
    });

    test("When the process is cancelled, then the dialog is closed, no project is created and all inputs are reset", async ({
        page,
    }) => {
        const homepage = new DevHomePage(page);
        await homepage.openCreateProjectDialog();
        const dialog = new DevCreateProjectDialog(page);

        await dialog.projectNameInput.fill("Demo project 1");
        await dialog.projectMemberInput.fill("john@doe.com");

        await dialog.closeCreateProjectDialog();
        await dialog.checkForErrors();

        // dialog is closed
        await expect(homepage.createProjectDialog).not.toBeVisible();

        // no new project was created
        await expect(page.getByText("Demo project 1")).not.toBeVisible();

        // all inputs are reset
        await homepage.openCreateProjectDialog();
        await expect(dialog.projectNameInput).toContainText("");
        await expect(dialog.projectMemberInput).toContainText("");
    });

    test("When the project was successfully created, but the user doesn't want to open it, then the user stays on the homepage.", async ({
        page,
    }) => {
        const homepage = new DevHomePage(page);
        await homepage.openCreateProjectDialog();
        const dialog = new DevCreateProjectDialog(page);

        await dialog.createProject("Demo project 2");
        await dialog.checkForErrors();
        await page.getByRole("button", { name: "Back" }).click();

        // the user stays on the project and the project is shown in the list of active projects
        await expect(page.getByRole("heading", { name: "SnowballR" })).toBeVisible();
        await expect(page.getByRole("link", { name: "Demo project 2" })).toBeVisible();
    });

    test("When the project was successfully created and the user navigates to the project dashboard, then it shows an empty project.", async ({
        page,
    }) => {
        const homepage = new DevHomePage(page);
        await homepage.openCreateProjectDialog();
        const dialog = new DevCreateProjectDialog(page);

        await dialog.createProject("Demo project 3");
        await dialog.checkForErrors();
        await page.getByRole("button", { name: "Open" }).click();

        // the user is not on the homepage but the project dashboard
        await expect(page.getByText("SnowballR")).not.toBeVisible();
        await expect(page.locator("nav", { has: page.getByText("Demo project 3") })).toBeVisible();
        await expect(page.getByRole("link", { name: "Demo project 3" })).not.toBeVisible();

        await expect(page.getByText("stage 0")).toBeVisible();
        await expect(page.getByText("reviewed 0 / 0")).toBeVisible();
        await expect(page.getByText("No open reviews")).toBeVisible();
        await expect(page.getByText("estimated remaining time")).not.toBeVisible();
    });

    /* TODO: add E2E tests here for checking, that the user creating this project is project admin, the other members
       were invited and the settings are the same as the default settings for new project from the user */
});
