import { test as base } from "../utils/fixtures/isolated-fixture";
import { HomePageModel } from "$tests/e2e/homepage/home-page-model";
import { CreateProjectDialogModel } from "$tests/e2e/homepage/create-project-dialog-model";
import { expect } from "@playwright/test";
import { ProjectPaperViewPageModel } from "$tests/e2e/project/paper/project-paper-view-page-model";
import { ProjectDashboardPageModel } from "$tests/e2e/project/dashboard/project-dashboard-page-model";
import { ProjectPapersPageModel } from "$tests/e2e/project/papers/project-papers-page-model";
import { ProjectNavigationBarModel } from "$tests/e2e/project/project-navigation-bar-model";

type HomePageFixtures = {
    homePage: HomePageModel;
    projectPaperViewPage: ProjectPaperViewPageModel;
    projectDashboardPage: ProjectDashboardPageModel;
    projectPapersPage: ProjectPapersPageModel;
    createProjectDialog: CreateProjectDialogModel;
    projectNavigationBar: ProjectNavigationBarModel;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - home page
 * - project paper view page
 * - project dashboard page
 * - project papers page
 * - project creation dialog
 * - navigation bar
 */
export const test = base.extend<HomePageFixtures>({
    homePage: async ({ page, apiClient }, use) => {
        const homePage = new HomePageModel(page);
        await page.goto("/");
        await expect(homePage.heading).toBeVisible();

        await use(homePage);

        const projectIds = ["0", "1", "2", "3"];
        projectIds.forEach((projectId) => {
            apiClient.softDeleteProject({ id: projectId });
        });
    },

    projectPaperViewPage: async ({ page }, use) => {
        await use(new ProjectPaperViewPageModel(page));
    },

    projectDashboardPage: async ({ page }, use) => {
        await use(new ProjectDashboardPageModel(page));
    },

    projectPapersPage: async ({ page }, use) => {
        await use(new ProjectPapersPageModel(page));
    },

    createProjectDialog: async ({ page }, use) => {
        await use(new CreateProjectDialogModel(page));
    },

    projectNavigationBar: async ({ page }, use) => {
        await use(new ProjectNavigationBarModel(page));
    },
});
