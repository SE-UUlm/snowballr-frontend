import { expect } from "@playwright/test";
import { test } from "./default-fetchers-project-creation-fixture";

const fetcherName = "Semantic Scholar";

test.describe("Default Fetcher Settings applied to new projects", () => {
    test("When the user adds a default fetcher and then creates a project, then the fetcher is automatically used by the new project", async ({
        user,
        projectSetupSettingsPage,
        homePage,
        createProjectDialog,
        projectNavigationBar,
        projectSettingsSideBar,
        projectSLRSettingsPage,
    }) => {
        // Add a default fetcher on the project setup settings page
        await projectSetupSettingsPage.addFetcher(fetcherName);
        await projectSetupSettingsPage.ensureFetcherAdded(fetcherName);

        // Create a new project
        await projectSetupSettingsPage.page.goto("/");
        await expect(homePage.heading).toBeVisible();

        await homePage.openCreateProjectDialog();
        await createProjectDialog.createProject("Default Fetchers Demo Project", user!);
        await createProjectDialog.checkForErrors();
        await createProjectDialog.closeCreatedProjectDialog("open");

        // Navigate to the new project's SLR settings
        await projectNavigationBar.settingsTab.click();
        await projectSettingsSideBar.slr.click();

        // The default fetcher was automatically added to the new project
        await expect(projectSLRSettingsPage.getFetcherTitle(fetcherName)).toBeVisible();
    });
});
