import { test as base } from "../../../utils/fixtures/shared-fixture";
import { expect } from "@playwright/test";
import { createPaper } from "$tests/model-builder";
import { ProjectSLRSettingsPageModel } from "$tests/e2e/project/settings/slr/project-slr-settings-model";
import { ProjectPaperViewPageModel } from "$tests/e2e/project/paper/project-paper-view-model";
import { HomePageModel } from "$tests/e2e/homepage/home-page-model";
import { NavigationBarModel } from "$tests/e2e/navigation-bar-model";
import { ProjectSettingsSidebarModel } from "$tests/e2e/project/settings/project-settings-sidebar-model";

type ProjectSlrSettingsFixtures = {
    projectSLRSettingsPage: ProjectSLRSettingsPageModel;
    homePage: HomePageModel;
    projectPaperViewPage: ProjectPaperViewPageModel;
    navigationBar: NavigationBarModel;
    projectSettingsSideBar: ProjectSettingsSidebarModel;
};

export const test = base.extend<ProjectSlrSettingsFixtures>({
    projectSLRSettingsPage: async ({ page, apiClient }, use) => {
        const projectSLRSettingsPage = new ProjectSLRSettingsPageModel(page);

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
            await expect(projectSLRSettingsPage.header).toBeVisible();

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

    navigationBar: async ({ page }, use) => {
        await use(new NavigationBarModel(page));
    },

    projectSettingsSideBar: async ({ page }, use) => {
        await use(new ProjectSettingsSidebarModel(page));
    },
});
