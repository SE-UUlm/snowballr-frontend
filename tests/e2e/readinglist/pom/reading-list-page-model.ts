import { expect, type Locator, type Page } from "@playwright/test";

export const PREDICTABLE_PAPER_TITLE_PREFIX = "Test Paper";
export const NUM_PAPERS_DEFAULT = 11;
export const EXTRA_PAPER_TITLE = "Extra Paper Not Initially on List";

export class DevReadingListPage {
    readonly page: Page;
    readonly searchBarInput: Locator;
    readonly readingListEntries: Locator;

    constructor(page: Page) {
        this.page = page;
        this.readingListEntries = page.getByRole("listitem");
        this.searchBarInput = page.getByPlaceholder("Search");
    }

    /**
     * Opens the paper list entry in the reading list.
     *
     * @param index - the index (0 to 10) in the name of the paper in the reading list
     */
    async openPaperListEntry(index: number) {
        const entry = this.readingListEntries.filter({
            has: this.page.getByRole("heading", {
                name: `${PREDICTABLE_PAPER_TITLE_PREFIX} ${index}`,
                exact: true,
            }),
        });
        await entry.scrollIntoViewIfNeeded();
        await entry.click();
    }

    /**
     * Removes the paper from the reading list.
     *
     * @param index - the index (0 to 10) in the name of the paper in the reading list
     */
    async removePaperFromReadingList(index: number) {
        const entry = this.readingListEntries.filter({
            has: this.page.getByRole("heading", {
                name: `${PREDICTABLE_PAPER_TITLE_PREFIX} ${index}`,
                exact: true,
            }),
        });
        await entry.scrollIntoViewIfNeeded();
        await entry.getByRole("button", { name: "Remove from reading list" }).click();
    }

    async expectNumberOfEntries(numberOfEntries: number) {
        await expect(this.readingListEntries).toHaveCount(numberOfEntries);
    }
}
