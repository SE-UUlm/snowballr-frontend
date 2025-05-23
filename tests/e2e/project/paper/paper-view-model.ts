import { expect, type Locator, type Page } from "@playwright/test";
import { ReviewDecision } from "$lib/model/api/review";

export class DevPaperViewPage {
    readonly page: Page;
    readonly allListEntries: Locator;
    readonly referenceListEntry0: Locator;
    readonly declineButton: Locator;
    readonly maybeButton: Locator;
    readonly acceptButton: Locator;
    readonly exampleInclusionCriterion: Locator;
    readonly exampleHardExclusionCriterion: Locator;
    readonly nextPaperButton: Locator;
    readonly previousPaperButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.allListEntries = page.getByRole("listitem");
        this.declineButton = page.getByRole("button", { name: "Decline", exact: false });
        this.maybeButton = page.getByRole("button", { name: "Maybe", exact: false });
        this.acceptButton = page.getByRole("button", { name: "Accept", exact: false });
        this.exampleInclusionCriterion = page.getByRole("listitem").filter({ hasText: /I/ });
        this.exampleHardExclusionCriterion = page.getByRole("listitem").filter({ hasText: /HE/ });
        this.referenceListEntry0 = this.getFirstListEntry("link")
            ? this.getFirstListEntry("link")
            : this.getFirstListEntry("button");
        this.nextPaperButton = page.locator("button[aria-label='Next Paper']");
        this.previousPaperButton = page.locator("button[aria-label='Previous Paper']");
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
     * Navigates to a certain project paper view and ensures the page is loaded.
     *
     * @param projectId - The id of the project
     * @param paperId - The local project paper id
     */
    async openProjectPaperView(projectId: string, paperId: string) {
        await this.page.goto(`/project/${projectId}/paper/${paperId}`);
        await expect(this.nextPaperButton).toBeVisible();
    }

    /**
     * Navigates to the first referenced paper and ensures the page is loaded.
     */
    async navigateToReferencedPaper() {
        await this.referenceListEntry0.click();
    }

    /**
     * Decides on a paper by clicking the corresponding button.
     *
     * @remarks If the paper is accepted, the inclusion criterion is selected too,
     * in case the paper is declined, the hard exclusion criterion is selected.
     *
     * @param decision - The decision that should be submitted for the paper
     */
    async decideOnPaper(decision: ReviewDecision) {
        switch (decision) {
            case ReviewDecision.ACCEPTED:
                await this.exampleInclusionCriterion.getByRole("checkbox").check();
                await this.acceptButton.click();
                break;
            case ReviewDecision.MAYBE:
                await this.maybeButton.click();
                break;
            case ReviewDecision.DECLINED:
                await this.exampleHardExclusionCriterion.getByRole("checkbox").check();
                await this.declineButton.click();
                break;
            default:
                console.error("Unknown decision", decision);
        }
    }

    /**
     * Depending upon the list entries are links or buttons,
     * this function returns the first list entry of the paper view.
     *
     * @param role - defines, if either "link" oder "button" entry is returned.
     * @returns The first list entry of the paper view.
     */
    getFirstListEntry(role: "link" | "button"): Locator {
        return this.allListEntries
            .getByRole(role, {
                name: "Paper 1 to be referenced",
            })
            .first();
    }

    async goToNextPaper() {
        await expect(this.nextPaperButton).toBeEnabled();
        await this.nextPaperButton.click();
    }

    async goToPreviousPaper() {
        await expect(this.previousPaperButton).toBeEnabled();
        await this.previousPaperButton.click();
    }
}
