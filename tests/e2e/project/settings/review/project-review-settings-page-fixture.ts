import { ProjectReviewSettingsPageModel } from "$tests/e2e/project/settings/review/project-review-settings-page-model";
import { expect } from "@playwright/test";
import { test as base } from "../../../utils/fixtures/shared-fixture";
import { HomePageModel } from "$tests/e2e/homepage/home-page-model";
import { ProjectSettingsSidebarModel } from "$tests/e2e/project/settings/project-settings-sidebar-model";
import { ProjectNavigationBarModel } from "$tests/e2e/project/project-navigation-bar-model";

type ProjectReviewSettingsPageFixtures = {
    projectReviewSettingsPage: ProjectReviewSettingsPageModel;
    homePage: HomePageModel;
    projectNavigationBar: ProjectNavigationBarModel;
    projectSettingsSideBar: ProjectSettingsSidebarModel;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - project review settings page
 * - home page
 * - project navigation bar
 * - project settings sidebar
 */
export const test = base.extend<ProjectReviewSettingsPageFixtures>({
    projectReviewSettingsPage: async ({ page, apiClient }, use) => {
        const projectReviewSettingsPage = new ProjectReviewSettingsPageModel(page);

        try {
            await apiClient
                .createProject({ name: projectReviewSettingsPage.projectName })
                .response.then((project) => (projectReviewSettingsPage.projectId = project.id));

            await page.goto(`/project/${projectReviewSettingsPage.projectId}/settings/review`);
            await expect(projectReviewSettingsPage.heading).toBeVisible();

            await use(projectReviewSettingsPage);
        } finally {
            await apiClient.softDeleteProject({ id: projectReviewSettingsPage.projectId }).response;
        }
    },

    homePage: async ({ page }, use) => {
        await use(new HomePageModel(page));
    },

    projectNavigationBar: async ({ page }, use) => {
        await use(new ProjectNavigationBarModel(page));
    },

    projectSettingsSideBar: async ({ page }, use) => {
        await use(new ProjectSettingsSidebarModel(page));
    },
});
