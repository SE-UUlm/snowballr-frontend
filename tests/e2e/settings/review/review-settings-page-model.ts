import { expect, type Locator, type Page } from "@playwright/test";

export class ReviewSettingsPageModel {
    readonly page: Page;
    readonly reviewModeSwitch: Locator;
    readonly heading;

    readonly paperName;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.getByRole("heading", { name: "Settings" });
        this.reviewModeSwitch = page.getByLabel('Activate the "Review" mode');

        this.paperName = "Paper 1";
    }

    /**
     * Sets the review mode.
     *
     * @param reviewMode - whether the review mode should be enabled or not
     */
    async setReviewMode(reviewMode: boolean) {
        const isChecked = await this.reviewModeSwitch.isChecked();
        if (isChecked !== reviewMode) {
            await this.reviewModeSwitch.click();
        }
        if (reviewMode) {
            await expect(this.reviewModeSwitch).toBeChecked();
        } else {
            await expect(this.reviewModeSwitch).not.toBeChecked();
        }
    }
}
