import { expect, type Locator, type Page } from "@playwright/test";

export class ProjectReviewSettingsPageModel {
    readonly page: Page;
    readonly heading: Locator;
    readonly tagInputField: Locator;
    readonly numberOfReviewersSlider: Locator;
    readonly numberOfReviewersHeading: Locator;

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

        this.projectId = "";
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
