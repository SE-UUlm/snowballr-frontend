import { type Locator, type Page } from "@playwright/test";

export class ProjectReviewSettingsPageModel {
    readonly page: Page;
    readonly heading: Locator;
    readonly tagInputField: Locator;

    readonly projectName: string;

    projectId: string;

    constructor(page: Page) {
        this.page = page;
        this.projectName = "Project 1";

        this.heading = page.getByRole("heading", { name: this.projectName });
        this.tagInputField = page.getByLabel(
            "Define keywords that are highlighted in the abstract of a paper when the review mode is activated.",
        );

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
        const tageDeleteButton = this.getTag(tagName).then((tag) =>
            tag.getByRole("button", { name: "×" }),
        );
        await tageDeleteButton.then((button) => button.click());
    }
}
