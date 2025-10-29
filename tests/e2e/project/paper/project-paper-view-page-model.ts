import { expect, type Locator, type Page } from "@playwright/test";
import { ReviewDecision } from "$lib/model/api/review";
import { SettingsSidebarModel } from "$tests/e2e/settings/settings-sidebar-model";
import { ReviewSettingsPageModel } from "$tests/e2e/settings/review/review-settings-page-model";
import { HomePageModel } from "$tests/e2e/homepage/home-page-model";
import { ProjectNavigationBarModel } from "$tests/e2e/project/project-navigation-bar-model";

export class ProjectPaperViewPageModel {
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
    readonly toggleEditModeButton: Locator;
    readonly savePaperChangesButton: Locator;

    readonly submittedReviewToast: Locator;
    readonly noMorePapersToReviewToast: Locator;
    readonly updatedPaperSuccessToast: Locator;
    readonly createdPaperSuccessToast: Locator;
    readonly yearValidationErrorToast: Locator;

    readonly projectName: string;

    projectId: string;
    localProjectPaperIds: string[];
    projectPaperNames: string[];

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
        this.toggleEditModeButton = page.getByTestId("toggle-edit-paper-mode-btn");
        this.savePaperChangesButton = page.getByTestId("save-paper-changes-btn");

        this.submittedReviewToast = page.getByText("Successfully submitted a review.");
        this.noMorePapersToReviewToast = page.getByText("No more papers to review.");
        this.updatedPaperSuccessToast = page.getByText("Successfully updated the paper.");
        this.createdPaperSuccessToast = page.getByText("Successfully created the paper");
        this.yearValidationErrorToast = page.getByText("The year has a non-numerical value.");

        this.projectName = "Project 1";

        this.projectId = "";
        this.localProjectPaperIds = [];
        this.projectPaperNames = [];
    }

    /**
     * Returns a heading element based on a specified paper title.
     *
     * @param paperTitle - The title of the paper to locate within the navigation role.
     */
    getHeading(paperTitle: string) {
        return this.page.getByRole("navigation").getByText(paperTitle, { exact: true });
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
     * Navigates to a create project paper view.
     *
     * @param projectId - The id of the project
     * @param paperId - The local project paper id
     */
    async openCreateProjectPaperView(projectId: string, stage: string) {
        await this.page.goto(`/project/${projectId}/paper/new?stage=${stage}`);
        await expect(this.savePaperChangesButton).toBeVisible();
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

    /**
     * Navigates to the next paper in the sequence by clicking the "Next Paper" button.
     * Ensures the button is enabled before triggering the click action.
     */
    async goToNextPaper() {
        await expect(this.nextPaperButton).toBeEnabled();
        await this.nextPaperButton.click();
    }

    /**
     * Navigates to the previous paper by clicking on the "previous paper" button.
     * It ensures the button is enabled before performing the click action.
     */
    async goToPreviousPaper() {
        await expect(this.previousPaperButton).toBeEnabled();
        await this.previousPaperButton.click();
    }

    /**
     * Returns the button to add/remove a paper to/from the reading list
     *
     * @param add - whether the button is the "add to" or "remove from" button
     */
    getReadingListButton(add: boolean) {
        return this.page.getByRole("button", {
            name: `${add ? "Add to" : "Remove from"} reading list`,
        });
    }

    /**
     * Changes the review mode and reopens the given project paper.
     *
     * @param reviewMode - the value of the review mode
     * @param paperName - the project paper id to open
     */
    async changeReviewMode(reviewMode: boolean, paperName: string) {
        const projectNavigationBar = new ProjectNavigationBarModel(this.page);
        await projectNavigationBar.openUserMenu();
        await projectNavigationBar.getSettingsLink().click();
        await new SettingsSidebarModel(this.page).review.click();
        await new ReviewSettingsPageModel(this.page).setReviewMode(reviewMode);

        await projectNavigationBar.goBackButton.click();
        await new HomePageModel(this.page).openProjectPaper(paperName);
    }

    /**
     * Returns the toggleable input for the given key.
     */
    getToggleableInput(key: string): Locator {
        return this.page.getByTestId(`toggleable-input-${key}`);
    }
}
