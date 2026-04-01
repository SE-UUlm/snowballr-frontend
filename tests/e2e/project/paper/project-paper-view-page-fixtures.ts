import { test as base } from "../../utils/fixtures/isolated-fixture";
import { ProjectPaperViewPageModel } from "$tests/e2e/project/paper/project-paper-view-page-model";
import { Project, SnowballingType } from "$api/project";
import { Criteria, Reviews } from "$tests/example-data";
import type { Paper } from "$api/paper";
import { createPaper } from "$tests/model-builder";
import { SettingsSidebarModel } from "$tests/e2e/settings/settings-sidebar-model";
import { ReviewSettingsPageModel } from "$tests/e2e/settings/review/review-settings-page-model";
import { HomePageModel } from "$tests/e2e/homepage/home-page-model";
import { expect } from "@playwright/test";
import { ProjectDashboardPageModel } from "$tests/e2e/project/dashboard/project-dashboard-page-model";
import { ProjectPapersPageModel } from "$tests/e2e/project/papers/project-papers-page-model";
import { ProjectNavigationBarModel } from "$tests/e2e/project/project-navigation-bar-model";
import { buildFieldMask } from "$lib/utils/fieldmask-helper";

type ProjectPaperViewPageFixtures = {
    projectPaperViewPage: ProjectPaperViewPageModel;
    decideOnPaper: ProjectPaperViewPageModel;
    paperNavigation: ProjectPaperViewPageModel;
    homePage: HomePageModel;
    projectDashboardPage: ProjectDashboardPageModel;
    reviewSettingsPage: ReviewSettingsPageModel;
    projectPapersPage: ProjectPapersPageModel;
    projectNavigationBar: ProjectNavigationBarModel;
    settingsSideBar: SettingsSidebarModel;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - project paper view page
 * - home page
 * - project dashboard page
 * - review settings page
 * - project papers page
 * - project navigation bar
 * - settings sidebar
 *
 * Additionally, it provides a setup for the use cases:
 * - decide on paper
 * - paper navigation
 */
export const test = base.extend<ProjectPaperViewPageFixtures>({
    projectPaperViewPage: async ({ page, apiClient }, use) => {
        const projectPaperViewPage = new ProjectPaperViewPageModel(page);
        let project: Project | undefined = undefined;
        let paper: Paper | undefined = undefined;

        try {
            project = await apiClient.createProject({
                name: projectPaperViewPage.projectName,
            }).response;

            paper = await apiClient.createPaper(createPaper({ title: "Paper 1" })).response;

            const projectPaper = await apiClient.addPaperToProject({
                projectId: project.id,
                paperId: paper.id,
                stage: 0n,
            }).response;

            projectPaperViewPage.projectPaperNames.push(paper.title);

            projectPaperViewPage.projectId = project.id;
            projectPaperViewPage.localProjectPaperIds.push(projectPaper.localId);

            await page.goto(`/project/${project.id}/dashboard`);
            await expect(
                projectPaperViewPage.getHeading(projectPaperViewPage.projectName),
            ).toBeVisible();
            await use(projectPaperViewPage);
        } finally {
            if (paper) await apiClient.removePaperFromProject({ id: paper.id });
            if (project) await apiClient.softDeleteProject({ id: project.id });
        }
    },

    decideOnPaper: async ({ page, apiClient }, use) => {
        const projectPaperViewPage = new ProjectPaperViewPageModel(page);

        const projectPaperIds: string[] = [];
        try {
            const project: Project = await apiClient.createProject({
                name: projectPaperViewPage.projectName,
            }).response;
            projectPaperViewPage.projectId = project.id;

            const projectSettings: Partial<Project> = {
                id: project.id,
                settings: {
                    reviewMaybeAllowed: true,
                    similarityThreshold: 0,
                    fetchers: {},
                    snowballingType: SnowballingType.UNSPECIFIED,
                },
            };
            await apiClient.updateProject({
                project: Project.create(projectSettings),
                mask: buildFieldMask(projectSettings, "project"),
            }).response;

            await Promise.all([
                apiClient.createCriterion({
                    ...Criteria.demoCriterion1,
                    projectId: projectPaperViewPage.projectId,
                }),
                apiClient.createCriterion({
                    ...Criteria.demoCriterion2,
                    projectId: projectPaperViewPage.projectId,
                }),
                apiClient.createCriterion({
                    ...Criteria.demoCriterion3,
                    projectId: projectPaperViewPage.projectId,
                }),
            ]);

            const papers: Paper[] = await Promise.all(
                Array.from(
                    { length: 4 },
                    (_, i) =>
                        apiClient.createPaper(createPaper({ title: `Paper ${i} to decide on` }))
                            .response,
                ),
            );

            for (const paper of papers) {
                const projectPaper = await apiClient.addPaperToProject({
                    projectId: projectPaperViewPage.projectId,
                    paperId: paper.id,
                    stage: 0n,
                }).response;
                projectPaperIds.push(projectPaper.id);
                projectPaperViewPage.localProjectPaperIds.push(projectPaper.localId);
                projectPaperViewPage.projectPaperNames.push(projectPaper.paper!.title);
            }

            await page.goto("/");
            await expect(new HomePageModel(page).heading).toBeVisible();
            await use(projectPaperViewPage);
        } finally {
            for (const paperId of projectPaperIds) {
                await apiClient.removePaperFromProject({ id: paperId });
            }
            await apiClient.softDeleteProject({ id: projectPaperViewPage.projectId });
        }
    },

    paperNavigation: async ({ page, apiClient }, use) => {
        const projectPaperViewPage = new ProjectPaperViewPageModel(page);

        const projectPaperIds: string[] = [];
        try {
            const project: Project = await apiClient.createProject({
                name: projectPaperViewPage.projectName,
            }).response;
            projectPaperViewPage.projectId = project.id;
            const papers: Paper[] = await Promise.all(
                Array.from(
                    { length: 3 },
                    (_, i) =>
                        apiClient.createPaper(
                            createPaper({ title: `Paper ${i} to navigate`, id: i.toString() }),
                        ).response,
                ),
            );
            for (const paper of papers) {
                const projectPaper = await apiClient.addPaperToProject({
                    projectId: projectPaperViewPage.projectId,
                    paperId: paper.id,
                    stage: 0n,
                }).response;
                projectPaperIds.push(projectPaper.id);
                projectPaperViewPage.localProjectPaperIds.push(projectPaper.localId);
                projectPaperViewPage.projectPaperNames.push(projectPaper.paper!.title);
                if (parseInt(projectPaper.localId, 10) % 2 !== 0) {
                    await apiClient.createReview({
                        projectPaperId: projectPaper.id,
                        ...Reviews.demoReview1,
                    });
                }
            }

            await page.goto("/");
            await expect(new HomePageModel(page).heading).toBeVisible();
            await use(projectPaperViewPage);
        } finally {
            for (const paperId of projectPaperIds) {
                await apiClient.removePaperFromProject({ id: paperId });
            }
            await apiClient.softDeleteProject({ id: projectPaperViewPage.projectId });
        }
    },

    homePage: async ({ page }, use) => {
        await use(new HomePageModel(page));
    },

    projectDashboardPage: async ({ page }, use) => {
        await use(new ProjectDashboardPageModel(page));
    },

    reviewSettingsPage: async ({ page }, use) => {
        await use(new ReviewSettingsPageModel(page));
    },

    projectPapersPage: async ({ page }, use) => {
        await use(new ProjectPapersPageModel(page));
    },

    projectNavigationBar: async ({ page }, use) => {
        await use(new ProjectNavigationBarModel(page));
    },

    settingsSideBar: async ({ page }, use) => {
        await use(new SettingsSidebarModel(page));
    },
});
