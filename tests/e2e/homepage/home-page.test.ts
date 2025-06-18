import { expect } from "@playwright/test";
import { test } from "./home-page-fixture";

test.describe("Project Creation Tests", () => {
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
        homePage,
        createProjectDialog,
    }) => {
        await homePage.openCreateProjectDialog();

        await createProjectDialog.projectNameInput.fill("Demo project 1");
        await createProjectDialog.projectMemberInput.fill("john@doe.com");

        await createProjectDialog.checkForErrors();
        await createProjectDialog.closeCreateProjectDialog();

        // dialog is closed
        await expect(homePage.createProjectDialog).toBeHidden();

        // no new project was created
        await expect(homePage.getListElementLink("Demo project 1")).toBeHidden();

        // all inputs are reset
        await homePage.openCreateProjectDialog();
        await expect(createProjectDialog.projectNameInput).toContainText("");
        await expect(createProjectDialog.projectMemberInput).toContainText("");
    });

    test("When the project was successfully created, but the user doesn't want to open it, then the user stays on the homepage.", async ({
        homePage,
        createProjectDialog,
        user,
    }) => {
        await homePage.openCreateProjectDialog();

        await createProjectDialog.createProject("Demo project 2", user!);
        await createProjectDialog.checkForErrors();
        await createProjectDialog.closeCreatedProjectDialog("cancel");

        // the user stays on the project and the project is shown in the list of active projects
        await expect(homePage.heading).toBeVisible();
        await expect(homePage.getListElementLink("Demo project 2")).toBeVisible();
    });

    test("When the project was successfully created and the user navigates to the project dashboard, then it shows an empty project.", async ({
        page,
        homePage,
        projectDashboardPage,
        createProjectDialog,
        user,
    }) => {
        await homePage.openCreateProjectDialog();

        await createProjectDialog.createProject("Demo project 3", user!);
        await createProjectDialog.checkForErrors();
        await createProjectDialog.closeCreatedProjectDialog("open");

        // the user is not on the homepage but the project dashboard
        await expect(homePage.heading).toBeHidden();
        await expect(projectDashboardPage.getHeading("Demo Project 3")).toBeVisible();
        await expect(homePage.getListElementLink("Demo project 3")).toBeHidden();

        await expect(page.getByText("stage 0")).toBeVisible();
        await expect(page.getByText("reviewed 0 / 0")).toBeVisible();
        await expect(page.getByText("No open reviews")).toBeVisible();
        await expect(page.getByText("estimated remaining time")).toBeHidden();
    });

    test("When the project was successfully created, then the project has a stage 0 with no papers.", async ({
        page,
        homePage,
        createProjectDialog,
        projectPapersPage,
        projectNavigationBar,
        user,
    }) => {
        await homePage.openCreateProjectDialog();

        await createProjectDialog.createProject("Demo project 4", user!);
        await createProjectDialog.checkForErrors();
        await createProjectDialog.closeCreatedProjectDialog("open");

        // the user is on the project dashboard
        await expect(homePage.heading).toBeHidden();

        // navigate to papers tab
        await projectNavigationBar.papersTab.click();
        await expect(projectPapersPage.showFiltersButton).toBeVisible();

        // the project has a stage 0 with no papers
        await expect(projectPapersPage.getStageButton(0)).toBeVisible();
        await expect(page.getByText("(0 papers)")).toBeVisible();
    });

    test.fixme(
        "When the user creates a project, then the project is created with the default settings",
        async () => {},
    );
});
