import { type Locator, type Page } from "@playwright/test";

export class ArchivedProjectsPageModel {
    readonly page: Page;
    readonly heading: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.getByRole("heading", { name: "Archived Projects", exact: true });
    }
}
