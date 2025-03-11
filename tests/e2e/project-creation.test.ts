import { test, expect } from "@playwright/test";
import { DevHomePage } from "./pom/home-page-model";

test.describe("Creating a new project", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("When clicking on the 'Create Project' button on the homepage, then a dialog for creating the project is opened.", async ({
        page,
    }) => {
        const homepage = new DevHomePage(page);
        await homepage.openCreateProjectDialog();

        await expect(homepage.projectCreateDialog).toBeVisible();
    });

    test("When the dialog is opened, then the user can input the project name and possible members.", async ({
        page,
    }) => {
        const homepage = new DevHomePage(page);
        await homepage.openCreateProjectDialog();

        await page.getByLabel("Name").fill("Demo project 1");
        await page.getByLabel("Members").fill("max@mustermann.de");
    });

    test("When the process is cancelled, then the dialog is closed, no project is created and all inputs are reset", async ({
        page,
    }) => {
        const homepage = new DevHomePage(page);
        await homepage.openCreateProjectDialog();

        await page.getByLabel("Name").fill("Demo project 1");
        await page.getByLabel("Members").fill("max@mustermann.de");

        await homepage.closeCreateProjectDialog();

        // dialog is closed
        await expect(homepage.projectCreateDialog).not.toBeVisible();

        // no new project was created
        await expect(page.getByText("Demo project 1")).not.toBeVisible();

        // all inputs are reset
        await homepage.openCreateProjectDialog();
        await expect(page.getByLabel("Name")).toContainText("");
        await expect(page.getByLabel("Members")).toContainText("");
    });

    test("When the project was successfully created and the user navigates to the project dashboard, then it shows an empty project.", async ({
        page,
    }) => {
        const homepage = new DevHomePage(page);
        await homepage.createProject();

        /// TODO: add expects as soon as mock backend doesnt respond with error (invitation process is not implemented yet)
    });

    test("When the project was successfully created, then the user can navigate to the project dashboard of the new project.", async ({
        page,
    }) => {
        const homepage = new DevHomePage(page);
        await homepage.createProject();

        /// TODO: add expects as soon as mock backend doesnt respond with error (invitation process is not implemented yet)
    });

    test("When the project was successfully created, but the user dont want to open it, then the user stays on the homepage.", async ({
        page,
    }) => {
        const homepage = new DevHomePage(page);
        await homepage.createProject();

        /// TODO: add expects as soon as mock backend doesnt respond with error (invitation process is not implemented yet)
    });

    /// TODO: add E2E tests here for checking, that the user creating this project is project admin, the other members
    /// were invited and the settings are the same as the default settings for new project from the user
});
