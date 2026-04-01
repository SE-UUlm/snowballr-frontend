import { test as base } from "../../utils/fixtures/isolated-fixture";
import { createPaper } from "$tests/model-builder";
import { expect } from "@playwright/test";
import { ProjectDashboardPageModel } from "$tests/e2e/project/dashboard/project-dashboard-page-model";
import type { Project } from "$api/project";
import type { Paper } from "$api/paper";
import { HomePageModel } from "$tests/e2e/homepage/home-page-model";
import { ProjectPaperViewPageModel } from "$tests/e2e/project/paper/project-paper-view-page-model";
import { ProjectNavigationBarModel } from "$tests/e2e/project/project-navigation-bar-model";

type ProjectDashboardPageFixtures = {
    projectDashboardPage: ProjectDashboardPageModel;
    homePage: HomePageModel;
    projectPaperViewPage: ProjectPaperViewPageModel;
    projectNavigationBar: ProjectNavigationBarModel;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - project dashboard page
 * - home page
 * - project paper view page
 * - project navigation bar
 */
export const test = base.extend<ProjectDashboardPageFixtures>({
    projectDashboardPage: async ({ page, apiClient }, use) => {
        const projectDashboardPage = new ProjectDashboardPageModel(page);
        let project: Project | undefined = undefined;
        let paper: Paper | undefined = undefined;

        try {
            project = await apiClient.createProject({
                name: projectDashboardPage.projectName,
            }).response;

            paper = await apiClient.createPaper(
                createPaper({ title: projectDashboardPage.paperName }),
            ).response;

            await apiClient.addPaperToProject({
                projectId: project.id,
                paperId: paper.id,
                stage: 0n,
            }).response;

            await page.goto(`/project/${project.id}/dashboard`);
            await expect(
                projectDashboardPage.getHeading(projectDashboardPage.projectName),
            ).toBeVisible();
            await use(projectDashboardPage);
        } finally {
            if (paper) apiClient.removePaperFromProject({ id: paper.id });
            if (project) await apiClient.softDeleteProject({ id: project.id });
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
});
