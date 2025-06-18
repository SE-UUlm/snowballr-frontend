import { test as base } from "../utils/fixtures/shared-fixture";
import {
    EXTRA_PAPER_TITLE,
    NUM_PAPERS_DEFAULT,
    PREDICTABLE_PAPER_TITLE_PREFIX,
    ReadingListPageModel,
} from "$tests/e2e/readinglist/reading-list-page-model";
import { HomePageModel } from "../homepage/home-page-model";
import { expect } from "@playwright/test";
import { Nothing } from "$lib/model/api/base";
import type { Project } from "$lib/model/api/project";
import type { Paper } from "$lib/model/api/paper";
import { createPaper } from "$tests/model-builder";
import { ProjectPaperViewPageModel } from "$tests/e2e/project/paper/project-paper-view-page-model";
import { NavigationBarModel } from "$tests/e2e/navigation-bar-model";

type ReadingListPageFixtures = {
    readingListPage: ReadingListPageModel;
    homePage: HomePageModel;
    projectPaperView: ProjectPaperViewPageModel;
    navigationBar: NavigationBarModel;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - reading list page and
 * - home page
 * - project paper view page
 * - navigation bar
 *
 * It navigates to the reading list before each test, clears the current version of the
 * reading list and adds default papers to keep a consistent
 * starting state for each test
 */
export const test = base.extend<ReadingListPageFixtures>({
    readingListPage: async ({ page, apiClient }, use) => {
        const readingListPage = new ReadingListPageModel(page);
        let extraPaper: Paper | undefined = undefined;
        try {
            const project: Project = await apiClient.createProject({
                name: "Project 1",
            }).response;
            readingListPage.projectId = project.id;

            const paperPromises: Promise<Paper>[] = [];
            for (let i = 0; i < NUM_PAPERS_DEFAULT; i++) {
                paperPromises.push(
                    apiClient.createPaper(
                        createPaper({ title: `${PREDICTABLE_PAPER_TITLE_PREFIX} ${i}` }),
                    ).response,
                );
            }
            const extraPaperPromise = apiClient.createPaper(
                createPaper({ title: EXTRA_PAPER_TITLE }),
            ).response;
            paperPromises.push(extraPaperPromise);

            const createdPapers = await Promise.all(paperPromises);

            extraPaper = await extraPaperPromise;
            await apiClient.addPaperToProject({
                projectId: readingListPage.projectId,
                paperId: extraPaper.id,
                stage: 0n,
            }).response;

            readingListPage.defaultPaperIds = createdPapers
                .slice(0, NUM_PAPERS_DEFAULT)
                .map((p) => p.id);
            readingListPage.extraPaperId = createdPapers[NUM_PAPERS_DEFAULT].id;

            const currentList = await apiClient.getReadingList(Nothing).response;
            if (currentList?.papers) {
                await Promise.all(
                    currentList.papers.map((paper) =>
                        apiClient.removePaperFromReadingList({ id: paper.id }),
                    ),
                );
            }
            await Promise.all(
                readingListPage.defaultPaperIds.map((id) =>
                    apiClient.addPaperToReadingList({ id }),
                ),
            );

            await page.goto("/readinglist");
            await expect(readingListPage.heading).toBeVisible();
            await use(readingListPage);
        } finally {
            const readingList = await apiClient.getReadingList(Nothing).response;
            for (const paper of readingList.papers) {
                await apiClient.removePaperFromReadingList({ id: paper.id });
            }
            if (extraPaper) apiClient.removePaperFromProject({ id: readingListPage.extraPaperId });
            await apiClient.softDeleteProject({ id: readingListPage.projectId });
        }
    },
    homePage: async ({ page }, use) => {
        await use(new HomePageModel(page));
    },

    projectPaperView: async ({ page }, use) => {
        await use(new ProjectPaperViewPageModel(page));
    },

    navigationBar: async ({ page }, use) => {
        await use(new NavigationBarModel(page));
    },
});
