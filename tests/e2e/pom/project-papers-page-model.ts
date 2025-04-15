import { expect, type Locator, type Page } from "@playwright/test";

export class DevProjectPapersPage {
    readonly page: Page;
    readonly stage0: Locator;
    readonly stage1: Locator;
    readonly paper0FromStage0: Locator;
    readonly paper0FromStage1: Locator;
    readonly paperDetailsCard: Locator;

    constructor(page: Page) {
        this.page = page;
        this.stage0 = page.getByRole("button", { name: "Stage 0" });
        this.stage1 = page.getByRole("button", { name: "Stage 1" });
        this.paper0FromStage0 = page.getByRole("button", { name: "Paper 0/0" });
        this.paper0FromStage1 = page.getByRole("button", { name: "Paper 1/0" });
        this.paperDetailsCard = page.locator('aside[data-testid="paper-details-card"]');
    }

    /**
     * Opens the first stage.
     */
    async openStage0() {
        await expect(this.paper0FromStage0).not.toBeVisible();
        await this.stage0.click();
    }

    /**
     * Opens the first paper from stage 0 (exemplary for any other paper).
     *
     * @param showOnlyPreview - Whether to single or double-click the paper and only open
     * a preview of the paper details or navigate to the paper view page
     */
    async openPaper0FromStage0(showOnlyPreview: boolean = false) {
        if (!(await this.paper0FromStage0.isVisible())) {
            await this.openStage0();
        }
        if (showOnlyPreview) {
            await this.paper0FromStage0.click();
        } else {
            await this.paper0FromStage0.dblclick();
        }
    }
}
