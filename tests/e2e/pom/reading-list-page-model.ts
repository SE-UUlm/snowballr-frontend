import { type Locator, type Page } from "@playwright/test";

export class DevReadingListPage {
    readonly page: Page;
    readonly searchBarInput: Locator;
    readonly readingList: Locator;
    readonly readingListEntry0: Locator;

    constructor(page: Page) {
        this.page = page;
        this.readingList = page.getByRole("list");
        this.searchBarInput = page.getByPlaceholder("Search");
        this.readingListEntry0 = page.getByRole("listitem").filter({
            has: page.getByRole("heading", { name: "Paper 0 on reading list", exact: true }),
        });
    }

    /**
     * Opens the paper view for the paper "Paper 0 on reading list" from the reading list.
     */
    async openPaperListEntry() {
        await this.readingListEntry0.scrollIntoViewIfNeeded();
        await this.readingListEntry0.click();
    }
}
