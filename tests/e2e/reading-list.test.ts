import { expect } from "@playwright/test";
import { test } from "./fixtures/reading-list-page";
import type { Paper } from "$lib/model/api/paper";
import { createPaper } from "$tests/model-builder";
import type { Project } from "$lib/model/api/project";

test.describe("Add, view or remove papers to / from the reading list", () => {
    let projectId: string = "";
    const paperIds: string[] = [];

    const NUMBER_OF_PAPERS = 11;

    test.beforeAll(async ({ mockBackendService }) => {
        const project: Project = await mockBackendService.createProject({
            name: "Project reading list",
        }).response;
        projectId = project.id;

        const createdPapers: Paper[] = await Promise.all(
            Array.from(
                { length: NUMBER_OF_PAPERS + 1 },
                (_, i) =>
                    mockBackendService.createPaper(
                        createPaper({ title: `Paper ${i} on reading list` }),
                    ).response,
            ),
        );
        for (const paper of createdPapers.slice(0, NUMBER_OF_PAPERS)) {
            await mockBackendService.addPaperToReadingList({ id: paper.id });
            paperIds.push(paper.id);
        }
    });

    test.afterAll(async ({ mockBackendService }) => {
        for (const paperId of paperIds) {
            await mockBackendService.removePaperFromReadingList({ id: paperId });
        }
        mockBackendService.softDeleteProject({ id: projectId });
    });

    test.beforeEach(async ({ page }) => {
        await page.goto("/readinglist");
    });

    test("When the user opens the reading list, then all papers of the user's reading list are shown.", async ({
        page,
        readingListPage,
    }) => {
        await readingListPage.expectNumberOfEntries(NUMBER_OF_PAPERS);

        await expect(page.getByText(`Paper 0 on reading list`)).toBeVisible();
        await expect(page.getByText(`Paper ${NUMBER_OF_PAPERS} on reading list`)).toBeHidden();
    });

    test("When the user searches in the reading list, then only papers matching the search input are shown.", async ({
        page,
        readingListPage,
    }) => {
        await readingListPage.expectNumberOfEntries(NUMBER_OF_PAPERS);

        // search for all paper with a "1" in the title, so "Paper 1 on reading list" and "Paper 10 on reading list"
        await readingListPage.searchBarInput.fill("Paper 1");
        await readingListPage.expectNumberOfEntries(2);

        // search for paper with "1234" in the title, so no paper should be found
        await readingListPage.searchBarInput.fill("Paper 1234");
        await readingListPage.expectNumberOfEntries(0);
        await expect(page.getByText("Your reading list is empty.")).toBeVisible();

        // clear search
        await readingListPage.searchBarInput.press("Escape");
        await readingListPage.expectNumberOfEntries(NUMBER_OF_PAPERS);
    });

    test("When the user clicks on an entry in the reading list, then the corresponding paper will be opened.", async ({
        page,
        readingListPage,
    }) => {
        // reading list is opened
        await expect(page.getByRole("navigation").getByText("Reading list")).toBeVisible();
        await expect(readingListPage.readingListEntry0).toBeVisible();

        await readingListPage.openPaperListEntry();

        // paper view was opened
        await expect(
            page.getByRole("navigation").getByText("Paper 0 on reading list", { exact: false }),
        ).toBeVisible();
    });

    test.fixme(
        "When the user adds a paper to reading list in the paper view, " +
            "then it will be displayed on the reading list page.",
        async () => {},
    );

    test.fixme(
        "When the user removes a paper from the reading list in the paper view, " +
            "then it will not be displayed on the reading list page anymore.",
        async () => {},
    );

    test.fixme(
        "When the user removes a paper from the reading list on the reading list page, " +
            "then this paper will not be displayed anymore.",
        async () => {},
    );
});
