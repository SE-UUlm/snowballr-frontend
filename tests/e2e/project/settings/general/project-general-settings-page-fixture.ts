import { ProjectGeneralSettingsPageModel } from "$tests/e2e/project/settings/general/project-general-settings-page-model";
import { test as base } from "../../../utils/fixtures/shared-fixture";
import { expect } from "@playwright/test";
import { HomePageModel } from "$tests/e2e/homepage/home-page-model";
import { ProjectSettingsSidebarModel } from "$tests/e2e/project/settings/project-settings-sidebar-model";
import { ProjectMemberSettingsPageModel } from "$tests/e2e/project/settings/members/models/project-member-settings-page-model";
import { ProjectNavigationBarModel } from "$tests/e2e/project/project-navigation-bar-model";

type ProjectGeneralSettingsPageFixtures = {
    projectSettingsPage: ProjectGeneralSettingsPageModel;
    homePage: HomePageModel;
    projectMemberSettingsPage: ProjectMemberSettingsPageModel;
    projectNavigationBar: ProjectNavigationBarModel;
    projectSettingsSideBar: ProjectSettingsSidebarModel;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - project settings page
 * - home page
 * - project member settings page
 * - project navigation bar
 * - project settings sidebar
 */
export const test = base.extend<ProjectGeneralSettingsPageFixtures>({
    projectSettingsPage: async ({ page, apiClient }, use) => {
        const projectGeneralSettingsPage = new ProjectGeneralSettingsPageModel(page);

        try {
            await apiClient
                .createProject({ name: projectGeneralSettingsPage.projectName })
                .response.then((project) => (projectGeneralSettingsPage.projectId = project.id));

            await page.goto(`/project/${projectGeneralSettingsPage.projectId}/settings/general`);
            await expect(projectGeneralSettingsPage.heading).toBeVisible();

            await use(projectGeneralSettingsPage);
        } finally {
            await apiClient.softDeleteProject({ id: projectGeneralSettingsPage.projectId })
                .response;
        }
    },

    homePage: async ({ page }, use) => {
        await use(new HomePageModel(page));
    },

    projectMemberSettingsPage: async ({ page, user }, use) => {
        await use(new ProjectMemberSettingsPageModel(page, user!));
    },

    projectNavigationBar: async ({ page }, use) => {
        await use(new ProjectNavigationBarModel(page));
    },

    projectSettingsSideBar: async ({ page }, use) => {
        await use(new ProjectSettingsSidebarModel(page));
    },
});
