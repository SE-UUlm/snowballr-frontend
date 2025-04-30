import { type Locator, type Page } from "@playwright/test";

export class DevProjectReviewSettingsPage {
    readonly page: Page;
    readonly tagInputField: Locator;

    constructor(page: Page) {
        this.page = page;
        this.tagInputField = page.getByLabel(
            "Define keywords that are highlighted in the abstract of a paper when the review mode is activated.",
        );
    }

    /**
     * Adds a tag with the given name.
     *
     * @param tagName - the new tag name
     */
    async addTag(tagName: string) {
        await this.tagInputField.waitFor({ state: "visible" });
        await this.tagInputField.click();
        await this.tagInputField.fill(tagName);
        await this.page.keyboard.press("Enter");
    }

    /**
     * Deletes the tag with the given name.
     *
     * @param tagName - tag name
     */
    async deleteTag(tagName: string) {
        const tag = this.page.getByText(tagName);
        const deleteTagButton = tag.getByRole("button", { name: "×" });
        await deleteTagButton.click();
    }
}
