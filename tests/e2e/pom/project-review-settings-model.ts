import { type Locator, type Page } from "@playwright/test";

export class DevProjectReviewSettingsPage {
    readonly page: Page;
    readonly tagInputField: Locator;

    constructor(page: Page) {
        this.page = page;
        this.tagInputField = page.getByLabel(
            "Define keywords that are highlighted in the abstract of a paper in the review mode.",
        );
    }

    /**
     * Adds a tag with the given name.
     *
     * @param tagName - the new tag name
     */
    async addTag(tagName: string) {
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
        await tag.hover();
        const deleteTagButton = this.page.getByRole("button", { name: "\u2715" });
        // This is a not clean way of clicking the button, but it is a workarount, because the hover
        // method does not work in firefox, so the button does not apear in the e2e test. Therefor
        // the click has to be force on the not visible element until firefox changes this.
        await deleteTagButton.evaluate((btn: HTMLElement) => btn.click());
    }
}
