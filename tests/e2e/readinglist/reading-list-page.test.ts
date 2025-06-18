import { expect } from "@playwright/test";
import { test } from "./reading-list-page-fixture";
import {
    EXTRA_PAPER_TITLE,
    NUM_PAPERS_DEFAULT,
    PREDICTABLE_PAPER_TITLE_PREFIX,
} from "./reading-list-page-model";

test.describe("Reading List Navigation", () => {
    test("When navigating to the reading list, then the page is displayed", async ({
        page,
        readingListPage,
        navigationBar,
    }) => {
        // Directly navigate to the reading list
        await page.goto("/");

        await navigationBar.getUserAvatarButton().click();
        await navigationBar.getReadingListLink().click();
        await expect(readingListPage.heading).toBeVisible();
    });
});

test.describe("Reading List Tests", () => {
    test("When the user opens the reading list, then all papers of the user's reading list are shown.", async ({
        readingListPage,
    }) => {
        await readingListPage.expectNumberOfEntries(NUM_PAPERS_DEFAULT);

        // Check for specific papers added before the test
        for (let i = 0; i < NUM_PAPERS_DEFAULT; i++) {
            await readingListPage.checkEntryVisible(i);
        }

        // Check that the extra paper (not added before the test) is NOT visible
        await expect(readingListPage.getPaperByTitle(EXTRA_PAPER_TITLE)).not.toBeVisible();
    });

    test("When the user searches in the reading list, then only papers matching the search input are shown.", async ({
        readingListPage,
    }) => {
        await readingListPage.expectNumberOfEntries(NUM_PAPERS_DEFAULT);

        // Search for a specific paper (assuming NUM_PAPERS_DEFAULT == 11)
        const searchSpecific = `${PREDICTABLE_PAPER_TITLE_PREFIX} 1`;
        await readingListPage.searchBarInput.fill(searchSpecific);
        await readingListPage.expectNumberOfEntries(2); // should be 2 because it matches "1" and "10"
        await expect(readingListPage.getPaperByTitle(searchSpecific)).toBeVisible();

        // Search for the common prefix
        await readingListPage.searchBarInput.fill(PREDICTABLE_PAPER_TITLE_PREFIX);
        await readingListPage.expectNumberOfEntries(NUM_PAPERS_DEFAULT);

        // Search for something not present
        await readingListPage.searchBarInput.fill("NonExistentSearchTerm");
        await readingListPage.expectNumberOfEntries(0);
        await expect(readingListPage.emptyReadingListWarning).toBeVisible();

        // Clear search
        await readingListPage.searchBarInput.press("Escape");
        await readingListPage.expectNumberOfEntries(NUM_PAPERS_DEFAULT);
    });

    test("When the user clicks on an entry in the reading list, then the corresponding paper will be opened.", async ({
        readingListPage,
    }) => {
        const paperIndexToClick = 0;
        const expectedTitle = `${PREDICTABLE_PAPER_TITLE_PREFIX} ${paperIndexToClick}`;

        await readingListPage.openPaperListEntry(paperIndexToClick, expectedTitle);
    });

    test("When the user removes a paper from the reading list, then this paper will not be displayed anymore.", async ({
        readingListPage,
    }) => {
        const paperIndexToRemove = 1;
        const titleToRemove = `${PREDICTABLE_PAPER_TITLE_PREFIX} ${paperIndexToRemove}`;

        await readingListPage.expectNumberOfEntries(NUM_PAPERS_DEFAULT);

        // Remove the paper
        await readingListPage.removePaperFromReadingList(paperIndexToRemove);

        // Check that the paper is gone and count decreased
        await readingListPage.expectNumberOfEntries(NUM_PAPERS_DEFAULT - 1);
        await expect(readingListPage.getPaperByTitle(titleToRemove)).toBeHidden();

        // Check that others remain
        for (const [index] of readingListPage.defaultPaperIds.entries()) {
            if (index != paperIndexToRemove)
                await expect(readingListPage.getEntryByIndex(index)).toBeVisible();
        }
    });

    test("When the user removes a paper from the reading list in the paper view, then it will not be displayed on the reading list page anymore.", async ({
        readingListPage,
        projectPaperView,
        navigationBar,
    }) => {
        const paperIndexToRemove = 2;
        const titleToRemove = `${PREDICTABLE_PAPER_TITLE_PREFIX} ${paperIndexToRemove}`;

        await readingListPage.expectNumberOfEntries(NUM_PAPERS_DEFAULT);

        await readingListPage.openPaperListEntry(paperIndexToRemove, titleToRemove);

        await projectPaperView.getReadingListButton(false).click();
        await expect(projectPaperView.getReadingListButton(true)).toBeVisible(); // Verify button change

        await navigationBar.getUserAvatarButton().click();
        await navigationBar.getReadingListLink().click();

        // Verify it's gone from the list
        await readingListPage.expectNumberOfEntries(NUM_PAPERS_DEFAULT - 1);
        await expect(readingListPage.getPaperByTitle(titleToRemove)).toBeHidden();
    });

    test("When the user adds a paper to the reading list in the paper view, then it will be displayed on the reading list page.", async ({
        readingListPage,
        projectPaperView,
        homePage,
        navigationBar,
    }) => {
        // This test starts with the default papers on the list
        await readingListPage.expectNumberOfEntries(NUM_PAPERS_DEFAULT);
        await expect(readingListPage.getPaperByTitle(EXTRA_PAPER_TITLE)).toBeHidden();

        await navigationBar.goBackButton.click();
        await homePage.openProjectPaper(EXTRA_PAPER_TITLE);

        // Add it from the paper view
        await projectPaperView.getReadingListButton(true).click();
        await expect(projectPaperView.getReadingListButton(false)).toBeVisible(); // Verify button change

        await navigationBar.getUserAvatarButton().click();
        await navigationBar.getReadingListLink().click();

        // Verify it's now present on the list
        await readingListPage.expectNumberOfEntries(NUM_PAPERS_DEFAULT + 1);
        await expect(readingListPage.getPaperByTitle(EXTRA_PAPER_TITLE)).toBeVisible();
    });
});
