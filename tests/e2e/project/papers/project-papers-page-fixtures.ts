import { test as base } from "../../utils/fixtures/isolated-fixture";
import {
    getUniqueSequence,
    NUM_PAPERS_PER_STAGE,
    ProjectPapersPageModel,
} from "$tests/e2e/project/papers/project-papers-page-model";
import { expect } from "@playwright/test";
import { Author, type Paper } from "$lib/model/api/paper";
import { createPaper } from "$tests/model-builder";
import type { Project_Paper } from "$lib/model/api/project";
import { HomePageModel } from "$tests/e2e/homepage/home-page-model";
import { ProjectDashboardPageModel } from "$tests/e2e/project/dashboard/project-dashboard-page-model";
import { ProjectNavigationBarModel } from "$tests/e2e/project/project-navigation-bar-model";

type ProjectPapersPageFixtures = {
    projectPapersPage: ProjectPapersPageModel;
    homePage: HomePageModel;
    projectDashboardPage: ProjectDashboardPageModel;
    projectNavigationBar: ProjectNavigationBarModel;
};

const TOTAL_PAPERS = NUM_PAPERS_PER_STAGE * 2;

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - project papers page
 * - home page
 * - project dashboard page
 * - project navigation bar
 */
export const test = base.extend<ProjectPapersPageFixtures>({
    /**
     * Create a project with 2 stages and `NUM_PAPERS_PER_STAGE` papers in each stage.
     * The papers are created with unique titles and authors.
     * The papers are added to the project in the order they are created.
     * The project paper ids are stored in `projectPaperIds` for later use.
     */
    projectPapersPage: async ({ page, apiClient }, use) => {
        const projectPapersPage = new ProjectPapersPageModel(page);

        try {
            apiClient
                .createProject({ name: projectPapersPage.projectName })
                .then((project) => (projectPapersPage.projectId = project.response.id));

            const papers: Promise<Paper>[] = [];
            for (let i = 0; i < TOTAL_PAPERS; i++) {
                const stageIndex = Math.floor(i / NUM_PAPERS_PER_STAGE);
                const paperIndex = i % NUM_PAPERS_PER_STAGE;
                const uniqueSequence = getUniqueSequence(i);
                const title = `Paper ${stageIndex}/${paperIndex} (${uniqueSequence})`;
                const year = 1990 + i;

                const authors: Author[] = [
                    {
                        firstName: stageIndex === 0 ? `Alpha${paperIndex}` : `Beta${paperIndex}`,
                        lastName: "Author",
                        orcid: "",
                    },
                ];

                papers.push(apiClient.createPaper(createPaper({ title, authors, year })).response);
                projectPapersPage.projectPaperNames.push(title);
            }
            const createdPapers = await Promise.all(papers);

            const projectPaperPromises: Promise<Project_Paper>[] = createdPapers.map((paper, i) => {
                const stageIndex = Math.floor(i / NUM_PAPERS_PER_STAGE) === 0 ? 0n : 1n;
                return apiClient.addPaperToProject({
                    projectId: projectPapersPage.projectId,
                    stage: stageIndex,
                    paperId: paper.id,
                }).response;
            });
            projectPapersPage.projectPaperIds = (await Promise.all(projectPaperPromises)).map(
                (pp) => pp.id,
            );

            await page.goto(`project/${projectPapersPage.projectId}/papers`);
            await expect(projectPapersPage.showFiltersButton).toBeVisible();

            await use(projectPapersPage);
        } finally {
            // Remove the project papers and soft delete the project after all tests.
            // TODO: Delete all papers from the mock backend (Currently not supported).
            projectPapersPage.projectPaperIds.forEach((id) =>
                apiClient.removePaperFromProject({ id: id }),
            );
            apiClient.softDeleteProject({ id: projectPapersPage.projectId });
        }
    },

    homePage: async ({ page }, use) => {
        await use(new HomePageModel(page));
    },

    projectDashboardPage: async ({ page }, use) => {
        await use(new ProjectDashboardPageModel(page));
    },

    projectNavigationBar: async ({ page }, use) => {
        await use(new ProjectNavigationBarModel(page));
    },
});
