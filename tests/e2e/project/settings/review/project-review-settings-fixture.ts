import { ProjectReviewSettingsPageModel } from "$tests/e2e/project/settings/review/project-review-settings-model";
import { expect } from "@playwright/test";
import { test as base } from "../../../utils/fixtures/shared-fixture";
import { HomePageModel } from "$tests/e2e/homepage/home-page-model";
import { NavigationBarModel } from "$tests/e2e/navigation-bar-model";
import { ProjectSettingsSidebarModel } from "$tests/e2e/project/settings/project-settings-sidebar-model";

type ProjectReviewSettingsPageFixtures = {
    projectReviewSettingsPage: ProjectReviewSettingsPageModel;
    homePage: HomePageModel;
    navigationBar: NavigationBarModel;
    projectSettingsSideBar: ProjectSettingsSidebarModel;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - project review settings page
 */
export const test = base.extend<ProjectReviewSettingsPageFixtures>({
    projectReviewSettingsPage: async ({ page, apiClient }, use) => {
        const projectReviewSettingsPage = new ProjectReviewSettingsPageModel(page);

        try {
            await apiClient
                .createProject({ name: projectReviewSettingsPage.projectName })
                .response.then((project) => (projectReviewSettingsPage.projectId = project.id));

            await page.goto(`/project/${projectReviewSettingsPage.projectId}/settings/review`);
            await expect(projectReviewSettingsPage.header).toBeVisible();

            await use(projectReviewSettingsPage);
        } finally {
            await apiClient.softDeleteProject({ id: projectReviewSettingsPage.projectId }).response;
        }
    },

    homePage: async ({ page }, use) => {
        await use(new HomePageModel(page));
    },

    navigationBar: async ({ page }, use) => {
        await use(new NavigationBarModel(page));
    },

    projectSettingsSideBar: async ({ page }, use) => {
        await use(new ProjectSettingsSidebarModel(page));
    },
});
