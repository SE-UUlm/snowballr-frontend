import { expect, type Locator, type Page } from "@playwright/test";

export const PREDICTABLE_PAPER_TITLE_PREFIX = "Test Paper";
export const NUM_PAPERS_DEFAULT = 11;
export const EXTRA_PAPER_TITLE = "Extra Paper Not Initially on List";

export class ReadingListPageModel {
    readonly page: Page;
    readonly heading: Locator;
    readonly searchBarInput: Locator;
    readonly readingListEntries: Locator;
    readonly emptyReadingListWarning: Locator;

    projectId: string;
    extraPaperId: string;
    defaultPaperIds: string[];

    constructor(page: Page) {
        this.page = page;
        this.heading = page.getByRole("heading", { name: "Reading List" });
        this.readingListEntries = page.getByRole("listitem");
        this.searchBarInput = page.getByPlaceholder("Search");
        this.emptyReadingListWarning = this.page.getByText(
            "No papers on the reading list match your search.",
        );

        this.projectId = "";
        this.extraPaperId = "";
        this.defaultPaperIds = [];
    }

    /**
     * Returns the button to remove the given reading list entry
     *
     * @param entry - the reading list entry to locate the remove button in
     */
    getEntryRemoveButton(entry: Locator) {
        return entry.getByRole("button", { name: "Remove from reading list" });
    }

    /**
     * Verifies that the specified entry, determined by its index, is visible on the screen.
     * It ensures the entry is scrolled into view if necessary and checks its visibility.
     *
     * @param index - The index of the entry to check for visibility.
     */
    async checkEntryVisible(index: number) {
        const entry = this.getEntryByIndex(index);
        await entry.scrollIntoViewIfNeeded();
        await expect(entry).toBeVisible();
    }

    /**
     * Returns the reading list entry with the given index.
     *
     * @remarks
     * To use this method, the paper must already be part of the reading list.
     *
     * @param index - index of the reading list entry
     */
    getEntryByIndex(index: number) {
        return this.readingListEntries.filter({
            has: this.page.getByRole("heading", {
                name: `${PREDICTABLE_PAPER_TITLE_PREFIX} ${index}`,
                exact: true,
            }),
        });
    }

    /**
     * Returns a paper locator. This paper does not have to be a part of the reading list.
     *
     * @param title - the title of the paper to search for
     */
    getPaperByTitle(title: string) {
        return this.page.getByText(title, { exact: true });
    }

    /**
     * Opens the paper list entry in the reading list.
     *
     * @param index - the index (0 to 10) in the name of the paper in the reading list
     * @param expectedTitle - the expected title on the shown paper view
     */
    async openPaperListEntry(index: number, expectedTitle: string) {
        const entry = this.readingListEntries.filter({
            has: this.page.getByRole("heading", {
                name: `${PREDICTABLE_PAPER_TITLE_PREFIX} ${index}`,
                exact: true,
            }),
        });
        await entry.scrollIntoViewIfNeeded();
        await entry.click();
        await expect(
            this.page.getByRole("navigation").getByText(expectedTitle, { exact: false }),
        ).toBeVisible();
    }

    /**
     * Removes the paper from the reading list.
     *
     * @param index - the index (0 to 10) in the name of the paper in the reading list
     */
    async removePaperFromReadingList(index: number) {
        const entry = this.getEntryByIndex(index);
        await entry.scrollIntoViewIfNeeded();
        await this.getEntryRemoveButton(entry).click();
    }

    async expectNumberOfEntries(numberOfEntries: number) {
        await expect(this.readingListEntries).toHaveCount(numberOfEntries);
    }
}
