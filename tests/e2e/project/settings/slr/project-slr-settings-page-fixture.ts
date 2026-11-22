import { test as base } from "#tests/e2e/utils/fixtures/shared-fixture.js";
import { expect } from "@playwright/test";
import { createPaper } from "#tests/model-builder.js";
import { ProjectSLRSettingsPageModel } from "#tests/e2e/project/settings/slr/project-slr-settings-page-model.js";
import { ProjectPaperViewPageModel } from "#tests/e2e/project/paper/project-paper-view-page-model.js";
import { HomePageModel } from "#tests/e2e/homepage/home-page-model.js";
import { ProjectSettingsSidebarModel } from "#tests/e2e/project/settings/project-settings-sidebar-model.js";
import { ProjectNavigationBarModel } from "#tests/e2e/project/project-navigation-bar-model.js";

type ProjectSlrSettingsPageFixtures = {
    projectSLRSettingsPage: ProjectSLRSettingsPageModel;
    homePage: HomePageModel;
    projectPaperViewPage: ProjectPaperViewPageModel;
    projectNavigationBar: ProjectNavigationBarModel;
    projectSettingsSideBar: ProjectSettingsSidebarModel;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - project slr settings page
 * - home page
 * - project paper view page
 * - project navigation bar
 * - project settings sidebar
 */
export const test = base.extend<ProjectSlrSettingsPageFixtures>({
    projectSLRSettingsPage: async ({ page, apiClient }, use) => {
        const projectSLRSettingsPage = new ProjectSLRSettingsPageModel(page, apiClient);

        try {
            await apiClient
                .createProject({ name: projectSLRSettingsPage.projectName })
                .response.then((project) => (projectSLRSettingsPage.projectId = project.id));

            const paper = await apiClient.createPaper(
                createPaper({ title: "Maybe as Decision Setting Test Paper" }),
            ).response;

            await apiClient
                .addPaperToProject({
                    projectId: projectSLRSettingsPage.projectId,
                    stage: 0n,
                    paperId: paper.id,
                })
                .response.then((projectPaper) => {
                    projectSLRSettingsPage.projectPaperId = projectPaper.localId;
                });

            await page.goto(`project/${projectSLRSettingsPage.projectId}/settings/slr`);
            await expect(projectSLRSettingsPage.heading).toBeVisible();

            await use(projectSLRSettingsPage);
        } finally {
            apiClient.removePaperFromProject({ id: projectSLRSettingsPage.projectPaperId });
            apiClient.softDeleteProject({ id: projectSLRSettingsPage.projectId });
        }
    },

    homePage: async ({ page }, use) => {
        await use(new HomePageModel(page));
    },

    projectPaperViewPage: async ({ page }, use) => {
        await use(new ProjectPaperViewPageModel(page));
    },

    projectNavigationBar: async ({ page }, use) => {
        await use(new ProjectNavigationBarModel(page));
    },

    projectSettingsSideBar: async ({ page }, use) => {
        await use(new ProjectSettingsSidebarModel(page));
    },
});
