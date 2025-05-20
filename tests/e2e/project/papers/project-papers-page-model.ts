import { expect, type Locator, type Page } from "@playwright/test";

export const NUM_PAPERS_PER_STAGE = 5;
export const getUniqueSequence = (index: number) => String.fromCharCode(65 + index).repeat(5);

export class DevProjectPapersPage {
    readonly page: Page;
    readonly paperDetailsCard: Locator;
    readonly searchBarInput: Locator;
    readonly clearFiltersButton: Locator;

    constructor(page: Page) {
        this.page = page;

        this.paperDetailsCard = page.locator('aside[data-testid="paper-details-card"]');
        this.searchBarInput = page.getByPlaceholder("Search paper");
        this.clearFiltersButton = page.getByRole("button", { name: "Clear" });
    }

    /** Helper to get stage trigger locator */
    getStageTrigger(stageIndex: number): Locator {
        return this.page.getByRole("button", { name: `Stage ${stageIndex}` });
    }

    /** Helper to get paper locator by its stage and index within that stage */
    getPaper(stageIndex: number, paperIndexInStage: number): Locator {
        const totalPaperIndex = stageIndex * NUM_PAPERS_PER_STAGE + paperIndexInStage;
        const title = `Paper ${stageIndex}/${paperIndexInStage} (${getUniqueSequence(totalPaperIndex)})`;
        return this.getPaperByTitle(title);
    }

    /** Helper to get paper locator by full title */
    getPaperByTitle(title: string): Locator {
        return this.page.getByRole("button", { name: title });
    }

    /** Helper to get the text indicating no search results within an open stage */
    getNoSearchResultsText(): Locator {
        return this.page.getByText("No papers match your search or filter criteria in this stage.");
    }

    /** Helper to check stage counts in the trigger */
    async expectStageCounts(stageIndex: number, expectedText: string | RegExp) {
        await expect(this.getStageTrigger(stageIndex)).toContainText(expectedText);
    }

    /** Opens the specified stage if not already open */
    async openStage(stageIndex: number) {
        const trigger = this.getStageTrigger(stageIndex);

        const paperInStageLocator = this.getPaperByTitle(`Paper ${stageIndex}/0`);
        if (!(await paperInStageLocator.isVisible())) {
            await trigger.click();
        }
        // Wait for animation or content to be fully visible
        await expect(paperInStageLocator.or(this.getNoSearchResultsText())).toBeVisible();
    }

    /** Closes the specified stage if not already closed */
    async closeStage(stageIndex: number) {
        const trigger = this.getStageTrigger(stageIndex);
        const paperInStageLocator = this.getPaperByTitle(`Paper ${stageIndex}/0`);
        if (await paperInStageLocator.isVisible()) {
            await trigger.click();
        }
        // Wait for animation or content to hide
        await expect(paperInStageLocator).toBeHidden();
    }

    /** Clicks a paper to open its preview card */
    async openPaperPreview(stageIndex: number, paperIndexInStage: number) {
        await this.openStage(stageIndex);
        const paperLocator = this.getPaper(stageIndex, paperIndexInStage);
        await paperLocator.click();
        await expect(this.paperDetailsCard).toBeVisible();
    }

    /** Double-clicks a paper to open its full view */
    async openPaperView(stageIndex: number, paperIndexInStage: number) {
        await this.openStage(stageIndex);
        const paperLocator = this.getPaper(stageIndex, paperIndexInStage);
        await paperLocator.dblclick();
    }

    /** Performs a search */
    async search(text: string) {
        await this.searchBarInput.fill(text);
    }

    /** Clears the search using the Escape key */
    async clearSearchViaEscape() {
        await this.searchBarInput.focus();
        await this.page.keyboard.press("Escape");
    }
}
