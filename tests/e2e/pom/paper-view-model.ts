import { expect, type Locator, type Page } from "@playwright/test";

export class DevPaperViewPage {
    readonly page: Page;
    readonly allListEntries: Locator;
    readonly referenceListEntry0: Locator;

    constructor(page: Page) {
        this.page = page;
        this.allListEntries = page.getByRole("listitem");
        this.referenceListEntry0 = this.allListEntries
            .getByRole("button", {
                name: "Paper 1 to be referenced",
            })
            .first();
    }

    /**
     * Navigates to a certain paper view and ensures the page is loaded.
     *
     * @param paperId - The local project paper id
     */
    async openPaperView(paperId: string) {
        await this.page.goto(`/paper/${paperId}`);
        await expect(this.referenceListEntry0).toBeVisible();
    }

    /**
     * Navigates to the first referenced paper and ensures the page is loaded.
     */
    async navigateToReferencedPaper() {
        await this.referenceListEntry0.click();
    }
}
