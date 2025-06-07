import { expect, type Locator, type Page } from "@playwright/test";

export class ShortcutsSettingsPageModel {
    readonly page: Page;
    readonly shortcutsVisibilitySwitch: Locator;
    readonly heading;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.getByRole("heading", { name: "Settings" });
        this.shortcutsVisibilitySwitch = page.getByLabel("Display Shortcuts");
    }

    /**
     * Sets the visibility of the shortcuts.
     *
     * @param isVisible - whether the shortcuts should be visible or not
     */
    async setShortcutsVisibility(isVisible: boolean) {
        const isChecked = await this.shortcutsVisibilitySwitch.isChecked();
        if (isChecked !== isVisible) {
            await this.shortcutsVisibilitySwitch.click();
        }
        if (isVisible) {
            await expect(this.shortcutsVisibilitySwitch).toBeChecked();
        } else {
            await expect(this.shortcutsVisibilitySwitch).not.toBeChecked();
        }
    }
}
