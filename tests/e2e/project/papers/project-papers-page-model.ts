import { expect, type Locator, type Page } from "@playwright/test";
import type { SortOptionLabel } from "$lib/model/sort-criteria";

export const NUM_PAPERS_PER_STAGE = 5;
export const getUniqueSequence = (index: number) => String.fromCharCode(65 + index).repeat(5);

export class ProjectPapersPageModel {
    readonly page: Page;
    readonly paperDetailsCard: Locator;
    readonly searchBarInput: Locator;
    readonly showFiltersButton: Locator;
    readonly clearFiltersButton: Locator;
    readonly stageFilterButton: Locator;
    readonly reviewerFilterButton: Locator;
    readonly publisherFilterButton: Locator;
    readonly yearFilterButton: Locator;
    readonly decisionFilterButton: Locator;
    readonly criteriaFilterButton: Locator;
    readonly allFilterButtons: Locator[];
    readonly sortOptionSelect: Locator;

    readonly projectName: string;
    readonly projectPaperNames: string[];

    projectId: string;
    projectPaperIds: string[];

    constructor(page: Page) {
        this.page = page;

        this.paperDetailsCard = page.locator('aside[data-testid="paper-details-card"]');
        this.searchBarInput = page.getByPlaceholder("Search paper");
        this.clearFiltersButton = page.getByRole("button", { name: "Reset" });
        this.showFiltersButton = page.getByRole("button", { name: "Filter", exact: false });
        this.stageFilterButton = page.getByRole("button", { name: "Stages", exact: false });
        this.reviewerFilterButton = page.getByRole("button", { name: "All Reviewers" });
        this.publisherFilterButton = page.getByRole("button", { name: "All Publishers" });
        this.yearFilterButton = page.getByRole("button", { name: "Years", exact: false });
        this.decisionFilterButton = page.getByRole("button", { name: "All Decisions" });
        this.criteriaFilterButton = page.getByRole("button", { name: "All Criteria" });
        this.allFilterButtons = [
            this.stageFilterButton,
            this.reviewerFilterButton,
            this.publisherFilterButton,
            this.yearFilterButton,
            this.decisionFilterButton,
            this.criteriaFilterButton,
        ];
        this.sortOptionSelect = page.getByRole("button", { name: "Sort by: ", exact: false });

        this.projectName = "Project 1";
        this.projectPaperNames = [];

        this.projectId = "";
        this.projectPaperIds = [];
    }

    /** Helper to get stage trigger locator */
    getStageTrigger(stageIndex: number): Locator {
        return this.page.getByRole("button", { name: new RegExp(`^Stage ${stageIndex}`) });
    }

    /** Helper tp get the first paper in the first stage */
    getFirstPaperInFirstStage(): Locator {
        return this.page.getByRole("button", { name: "Paper" }).nth(1);
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

    /** Helper to get stage button locator by its name */
    getStageButton(stageIndex: number): Locator {
        return this.page.getByRole("button", { name: `Stage ${stageIndex}` });
    }

    /** Helper to get the text indicating no search results within an open stage */
    getNoSearchResultsText(): Locator {
        return this.page.getByText("No papers in this stage match your search or filter.");
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
        await expect(paperInStageLocator.or(this.getNoSearchResultsText()).first()).toBeVisible();
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

    /**
     * Applies given filters by selecting the corresponding values in the
     * `Select` components for stages, years and decisions.
     *
     * @remarks
     * This method does not check, whether the given stage, year or decision can be selected!
     * In case they do not exist, an error is thrown.
     *
     * @param stage - The stage the paper should be in
     * @param year - The year the nested paper of the project paper was published
     */
    async applyFilter(stage?: number, year?: number) {
        if (!(await this.stageFilterButton.isVisible())) {
            await this.showFiltersButton.click();
            await expect(this.stageFilterButton).toBeVisible();
        }

        if (stage !== undefined) {
            await this.stageFilterButton.click();
            await this.page.getByRole("option", { name: `Stage ${stage}` }).click();
            await this.stageFilterButton.click();
        }

        if (year !== undefined) {
            await this.yearFilterButton.click();
            await this.page.getByRole("option", { name: `${year}` }).click();
            await this.yearFilterButton.click();
        }
    }

    /**
     * Selects a certain sort option.
     *
     * @param sortOption - The option to select
     */
    async selectSortOption(sortOption: SortOptionLabel) {
        await this.sortOptionSelect.click();
        await this.page.getByRole("option", { name: sortOption }).click();
    }
}
