import { test as base } from "./project-setup-settings-page-fixture";
import { HomePageModel } from "$tests/e2e/homepage/home-page-model";
import { CreateProjectDialogModel } from "$tests/e2e/homepage/create-project-dialog-model";
import { ProjectNavigationBarModel } from "$tests/e2e/project/project-navigation-bar-model";
import { ProjectSettingsSidebarModel } from "$tests/e2e/project/settings/project-settings-sidebar-model";
import { ProjectSLRSettingsPageModel } from "$tests/e2e/project/settings/slr/project-slr-settings-page-model";

type DefaultFetchersProjectCreationFixtures = {
    homePage: HomePageModel;
    createProjectDialog: CreateProjectDialogModel;
    projectNavigationBar: ProjectNavigationBarModel;
    projectSettingsSideBar: ProjectSettingsSidebarModel;
    projectSLRSettingsPage: ProjectSLRSettingsPageModel;
};

/**
 * Extends the project setup settings page fixture (which already resets the user's default
 * fetcher settings after each test) by additionally providing the page object models needed to
 * create a new project through the UI and inspect its SLR fetcher settings.
 *
 * Any project created while using this fixture is soft-deleted afterward, based on the project
 * id found in the page's URL at the end of the test.
 */
export const test = base.extend<DefaultFetchersProjectCreationFixtures>({
    homePage: async ({ page }, use) => {
        await use(new HomePageModel(page));
    },

    createProjectDialog: async ({ page, apiClient }, use) => {
        await use(new CreateProjectDialogModel(page));

        const projectId = page.url().match(/\/project\/([^/]+)/)?.[1];
        if (projectId !== undefined) {
            await apiClient.softDeleteProject({ id: projectId }).response;
        }
    },

    projectNavigationBar: async ({ page }, use) => {
        await use(new ProjectNavigationBarModel(page));
    },

    projectSettingsSideBar: async ({ page }, use) => {
        await use(new ProjectSettingsSidebarModel(page));
    },

    projectSLRSettingsPage: async ({ page, apiClient }, use) => {
        await use(new ProjectSLRSettingsPageModel(page, apiClient));
    },
});
