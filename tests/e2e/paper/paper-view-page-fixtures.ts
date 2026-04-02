import { test as base } from "../utils/fixtures/isolated-fixture";
import { PaperViewPageModel } from "$tests/e2e/paper/paper-view-page-model";
import { createPaper } from "$tests/model-builder";
import { expect } from "@playwright/test";
import { HomePageModel } from "$tests/e2e/homepage/home-page-model";
import { ProjectPaperViewPageModel } from "$tests/e2e/project/paper/project-paper-view-page-model";
import { NavigationBarModel } from "$tests/e2e/navigation-bar-model";
import { ReadingListPageModel } from "$tests/e2e/readinglist/reading-list-page-model";
import type { Project } from "$api/project";
import type { Paper } from "$api/paper";

type PaperViewPageFixtures = {
    paperViewPage: PaperViewPageModel;
    homePage: HomePageModel;
    projectPaperViewPage: ProjectPaperViewPageModel;
    readingListPage: ReadingListPageModel;
    navigationBar: NavigationBarModel;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - paper view page
 * - home page
 * - project paper view page
 * - reading list page
 * - navigation bar
 */
export const test = base.extend<PaperViewPageFixtures>({
    paperViewPage: async ({ page, apiClient }, use) => {
        const paperViewPage = new PaperViewPageModel(page);
        let project: Project | undefined = undefined;
        let papers: Paper[] | undefined = undefined;

        try {
            project = await apiClient.createProject({
                name: paperViewPage.projectName,
            }).response;

            papers = await Promise.all(
                Array.from(
                    { length: 2 },
                    (_, i) =>
                        apiClient.createPaper(createPaper({ title: paperViewPage.paperNames[i] }))
                            .response,
                ),
            );

            for (const paper of papers) {
                await apiClient.addPaperToProject({
                    projectId: project.id,
                    paperId: paper.id,
                    stage: 0n,
                }).response;
            }
            // Go to paper 1 instead of 0 so the navigation test doesn't have to scroll in the list entries
            await page.goto(`/paper/${papers[1].id}`);

            await expect(paperViewPage.getReferencesListEntry(0)).toBeVisible({ timeout: 20_000 });
            await use(paperViewPage);
        } finally {
            if (papers) {
                papers.forEach((paper) => {
                    apiClient.removePaperFromProject({ id: paper.id });
                });
            }
            if (project) await apiClient.softDeleteProject({ id: project.id });
        }
    },

    homePage: async ({ page }, use) => {
        await use(new HomePageModel(page));
    },

    projectPaperViewPage: async ({ page }, use) => {
        await use(new ProjectPaperViewPageModel(page));
    },

    readingListPage: async ({ page }, use) => {
        await use(new ReadingListPageModel(page));
    },

    navigationBar: async ({ page }, use) => {
        await use(new NavigationBarModel(page));
    },
});
