import { expect } from "@playwright/test";
import { test } from "../fixtures/reading-list-page-fixture";
import type { Paper } from "$lib/model/api/paper";
import { createPaper } from "$tests/model-builder";
import type { Project } from "$lib/model/api/project";
import {
    EXTRA_PAPER_TITLE,
    NUM_PAPERS_DEFAULT,
    PREDICTABLE_PAPER_TITLE_PREFIX,
} from "../pom/reading-list-page-model";

export let defaultPaperIds: string[] = [];

test.describe("Reading List Functionality", () => {
    let projectId: string = "";
    let extraPaperId: string = "";

    /**
     * Create a project and papers for the reading list.
     * Do not add papers to the reading list, since they are provided by the reading list page fixture.
     */
    test.beforeAll(async ({ apiClient }) => {
        const project: Project = await apiClient.createProject({
            name: "Reading-List Project",
        }).response;
        projectId = project.id;

        const paperPromises: Promise<Paper>[] = [];
        for (let i = 0; i < NUM_PAPERS_DEFAULT; i++) {
            paperPromises.push(
                apiClient.createPaper(
                    createPaper({ title: `${PREDICTABLE_PAPER_TITLE_PREFIX} ${i}` }),
                ).response,
            );
        }
        paperPromises.push(
            apiClient.createPaper(createPaper({ title: EXTRA_PAPER_TITLE })).response,
        );

        const createdPapers = await Promise.all(paperPromises);

        defaultPaperIds = createdPapers.slice(0, NUM_PAPERS_DEFAULT).map((p) => p.id);
        extraPaperId = createdPapers[NUM_PAPERS_DEFAULT].id;
    });

    /**
     * Clean up the project and papers after all tests.
     */
    test.afterAll(async ({ apiClient }) => {
        for (const paperId of defaultPaperIds) {
            await apiClient.removePaperFromReadingList({ id: paperId });
        }
        await apiClient.removePaperFromReadingList({ id: extraPaperId });

        await apiClient.softDeleteProject({ id: projectId });
    });

    test("When the user opens the reading list, then all papers of the user's reading list are shown.", async ({
        page,
        readingListPageAndHomepagePage,
    }) => {
        const { readingListPage } = readingListPageAndHomepagePage;
        await readingListPage.expectNumberOfEntries(NUM_PAPERS_DEFAULT);

        // Check for specific papers added before the test
        for (let i = 0; i < NUM_PAPERS_DEFAULT; i++) {
            await expect(
                page.getByText(`${PREDICTABLE_PAPER_TITLE_PREFIX} ${i}`, { exact: true }),
            ).toBeVisible();
        }

        // Check that the extra paper (not added before the test) is NOT visible
        await expect(page.getByText(EXTRA_PAPER_TITLE, { exact: true })).toBeHidden();
    });

    test("When the user searches in the reading list, then only papers matching the search input are shown.", async ({
        page,
        readingListPageAndHomepagePage,
    }) => {
        const { readingListPage } = readingListPageAndHomepagePage;
        await readingListPage.expectNumberOfEntries(NUM_PAPERS_DEFAULT);

        // Search for a specific paper (assuming NUM_PAPERS_DEFAULT == 11)
        const searchSpecific = `${PREDICTABLE_PAPER_TITLE_PREFIX} 1`;
        await readingListPage.searchBarInput.fill(searchSpecific);
        await readingListPage.expectNumberOfEntries(2); // should be 2 because it matches "1" and "10"
        await expect(page.getByText(searchSpecific, { exact: true })).toBeVisible();

        // Search for the common prefix
        await readingListPage.searchBarInput.fill(PREDICTABLE_PAPER_TITLE_PREFIX);
        await readingListPage.expectNumberOfEntries(NUM_PAPERS_DEFAULT);

        // Search for something not present
        await readingListPage.searchBarInput.fill("NonExistentSearchTerm");
        await readingListPage.expectNumberOfEntries(0);
        await expect(page.getByText("Your reading list is empty.")).toBeVisible();

        // Clear search
        await readingListPage.searchBarInput.press("Escape");
        await readingListPage.expectNumberOfEntries(NUM_PAPERS_DEFAULT);
    });

    test("When the user clicks on an entry in the reading list, then the corresponding paper will be opened.", async ({
        page,
        readingListPageAndHomepagePage,
    }) => {
        const { readingListPage } = readingListPageAndHomepagePage;
        const paperIndexToClick = 0;
        const expectedTitle = `${PREDICTABLE_PAPER_TITLE_PREFIX} ${paperIndexToClick}`;

        await readingListPage.openPaperListEntry(paperIndexToClick);

        // Check content on the paper page
        await expect(
            page.getByRole("navigation").getByText(expectedTitle, { exact: false }),
        ).toBeVisible();
    });

    test("When the user removes a paper from the reading list, then this paper will not be displayed anymore.", async ({
        page,
        readingListPageAndHomepagePage,
    }) => {
        const { readingListPage } = readingListPageAndHomepagePage;
        const paperIndexToRemove = 1;
        const titleToRemove = `${PREDICTABLE_PAPER_TITLE_PREFIX} ${paperIndexToRemove}`;

        await readingListPage.expectNumberOfEntries(NUM_PAPERS_DEFAULT);

        // Remove the paper
        await readingListPage.removePaperFromReadingList(paperIndexToRemove);

        // Check that the paper is gone and count decreased
        await readingListPage.expectNumberOfEntries(NUM_PAPERS_DEFAULT - 1);
        await expect(page.getByText(titleToRemove, { exact: true })).toBeHidden();

        // Check that others remain
        await expect(
            page.getByText(`${PREDICTABLE_PAPER_TITLE_PREFIX} 0`, { exact: true }),
        ).toBeVisible();
    });

    test("When the user removes a paper from the reading list in the paper view, then it will not be displayed on the reading list page anymore.", async ({
        page,
        readingListPageAndHomepagePage,
    }) => {
        const { readingListPage, homepage } = readingListPageAndHomepagePage;

        const paperIndexToRemove = 2;
        const paperIdToRemove = defaultPaperIds[paperIndexToRemove];
        const titleToRemove = `${PREDICTABLE_PAPER_TITLE_PREFIX} ${paperIndexToRemove}`;

        await readingListPage.expectNumberOfEntries(NUM_PAPERS_DEFAULT);

        // Go to the paper's page
        await page.goto(`/paper/${paperIdToRemove}`);
        await expect(
            page.getByRole("navigation").getByText(titleToRemove, { exact: false }),
        ).toBeVisible();

        // Remove it from the paper view
        await page.getByRole("button", { name: "Remove from reading list" }).click();
        await expect(page.getByRole("button", { name: "Add to reading list" })).toBeVisible(); // Verify button change

        // Go back to the reading list
        await homepage.openLinkInUserMenuDialog("Reading List");

        // Verify it's gone from the list
        await readingListPage.expectNumberOfEntries(NUM_PAPERS_DEFAULT - 1);
        await expect(page.getByText(titleToRemove, { exact: true })).toBeHidden();
    });

    test("When the user adds a paper to the reading list in the paper view, then it will be displayed on the reading list page.", async ({
        page,
        readingListPageAndHomepagePage,
    }) => {
        const { readingListPage, homepage } = readingListPageAndHomepagePage;

        // This test starts with the default papers on the list
        await readingListPage.expectNumberOfEntries(NUM_PAPERS_DEFAULT);
        await expect(page.getByText(EXTRA_PAPER_TITLE, { exact: true })).toBeHidden();

        // Go to the extra paper's page (which is NOT on the list yet)
        await page.goto(`/paper/${extraPaperId}`);
        await expect(
            page.getByRole("navigation").getByText(EXTRA_PAPER_TITLE, { exact: false }),
        ).toBeVisible();

        // Add it from the paper view
        await page.getByRole("button", { name: "Add to reading list" }).click();
        await expect(page.getByRole("button", { name: "Remove from reading list" })).toBeVisible(); // Verify button change

        // Go back to the reading list
        await homepage.openLinkInUserMenuDialog("Reading List");

        // Verify it's now present on the list
        await readingListPage.expectNumberOfEntries(NUM_PAPERS_DEFAULT + 1);
        await expect(page.getByText(EXTRA_PAPER_TITLE, { exact: true })).toBeVisible();
    });
});
