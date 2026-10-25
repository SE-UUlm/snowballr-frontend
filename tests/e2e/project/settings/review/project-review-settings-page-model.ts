import { expect, type Locator, type Page } from "@playwright/test";

export class ProjectReviewSettingsPageModel {
    readonly page: Page;
    readonly heading: Locator;
    readonly tagInputField: Locator;
    readonly numberOfReviewersSlider: Locator;
    readonly numberOfReviewersHeading: Locator;
    readonly criteriaHeading: Locator;
    readonly criteriaSection: Locator;
    readonly criterionRows: Locator;
    readonly saveCriteriaButton: Locator;
    readonly discardCriteriaChangesButton: Locator;
    readonly confirmDialog: Locator;

    readonly projectName: string;

    projectId: string;

    constructor(page: Page) {
        this.page = page;
        this.projectName = "Project 1";

        this.heading = page.getByRole("heading", { name: this.projectName });
        this.tagInputField = page.getByLabel(
            "Define keywords that are highlighted in the abstract of a paper when the review mode is activated.",
        );
        this.numberOfReviewersSlider = page.getByRole("slider");
        this.numberOfReviewersHeading = page.getByRole("heading", {
            name: "Number of Required Reviewers",
        });

        this.criteriaHeading = page.getByRole("heading", { name: "Review Criteria" });
        this.criteriaSection = page.getByTestId("settings-section-review-criteria");
        this.criterionRows = this.criteriaSection.getByTestId("criterion-settings-row");
        this.saveCriteriaButton = this.criteriaSection.getByRole("button", {
            name: "Save criteria",
        });
        this.discardCriteriaChangesButton = this.criteriaSection.getByRole("button", {
            name: "Discard changes",
        });
        this.confirmDialog = page.getByRole("alertdialog");

        this.projectId = "";
    }

    /**
     * Returns the row of the criterion with the given tag.
     *
     * @param tag - The tag of the criterion
     */
    getCriterionRow(tag: string): Locator {
        return this.criterionRows.filter({
            has: this.page.getByText(tag, { exact: true }),
        });
    }

    /**
     * Adds a criterion to the given category and applies it to the draft, without saving.
     *
     * @param category - The title of the category, e.g. "Inclusion"
     * @param name - The name of the new criterion
     * @param description - The optional description of the new criterion
     */
    async addCriterion(
        category: "Hard Exclusion" | "Soft Exclusion" | "Inclusion",
        name: string,
        description = "",
    ) {
        await this.criteriaSection
            .getByRole("button", { name: `Add criterion to ${category}` })
            .click();
        const form = this.criteriaSection.getByRole("form");
        await form.getByLabel("Name").fill(name);
        if (description) {
            await form.getByLabel("Description").fill(description);
        }
        await form.getByRole("button", { name: "Done" }).click();
    }

    /**
     * Renames the criterion with the given tag and applies it to the draft, without saving.
     *
     * @param tag - The tag of the criterion
     * @param name - The new name of the criterion
     */
    async renameCriterion(tag: string, name: string) {
        await this.criteriaSection
            .getByRole("button", { name: `Edit criterion ${tag}`, exact: true })
            .click();
        const form = this.criteriaSection.getByRole("form");
        await form.getByLabel("Name").fill(name);
        await form.getByRole("button", { name: "Done" }).click();
    }

    /**
     * Marks the criterion with the given tag as removed, without saving.
     *
     * @param tag - The tag of the criterion
     */
    async removeCriterion(tag: string) {
        await this.criteriaSection
            .getByRole("button", { name: `Remove criterion ${tag}`, exact: true })
            .click();
    }

    /**
     * Adds a tag with the given name.
     *
     * @param tagName - the new tag name
     */
    async addTag(tagName: string) {
        await this.tagInputField.click();
        await this.tagInputField.pressSequentially(tagName);
        await this.page.keyboard.press("Enter");
    }

    /**
     * Returns a tag element based on the provided tag name.
     *
     * @param tagName - The name of the tag to search for.
     */
    async getTag(tagName: string) {
        return this.page.getByText(tagName);
    }

    /**
     * Deletes the tag with the given name.
     *
     * @param tagName - tag name
     */
    async deleteTag(tagName: string) {
        const tagDeleteButton = this.getTag(tagName).then((tag) =>
            tag.getByRole("button", { name: "×" }),
        );
        await tagDeleteButton.then((button) => button.click());
    }

    /**
     * Returns the current value of the number of reviewers slider.
     */
    async getNumberOfReviewers(): Promise<number> {
        await expect(this.numberOfReviewersSlider).toHaveAttribute("aria-valuenow");
        const value = await this.numberOfReviewersSlider.getAttribute("aria-valuenow");
        return parseInt(value ?? "-1");
    }

    /**
     * Moves the number of reviewers slider to the given target value using keyboard navigation.
     *
     * @param targetValue - The desired number of reviewers (1–10)
     */
    async setNumberOfReviewers(targetValue: number) {
        await expect(this.numberOfReviewersSlider).toBeEnabled();
        const currentValue = await this.getNumberOfReviewers();
        const diff = targetValue - currentValue;
        if (diff === 0) return;

        const key = diff > 0 ? "ArrowRight" : "ArrowLeft";
        for (let i = 0; i < Math.abs(diff); i++) {
            await this.numberOfReviewersSlider.focus();
            await this.page.keyboard.press(key);
        }
        await expect(this.numberOfReviewersSlider).toHaveAttribute(
            "aria-valuenow",
            String(targetValue),
        );
    }
}
