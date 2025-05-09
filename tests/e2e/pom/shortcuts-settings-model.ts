import { type Locator, type Page } from "@playwright/test";

export class DevShortcutsSettingsPage {
    readonly page: Page;
    readonly shortcutsVisibilityCheckbox: Locator;

    constructor(page: Page) {
        this.page = page;
        this.shortcutsVisibilityCheckbox = page.getByLabel("Display Shortcuts");
    }

    /**
     * Sets the visibility of the shortcuts.
     *
     * @param isVisible - whether the shortcuts should be visible or not
     */
    async setShortcutsVisibility(isVisible: boolean) {
        const isChecked = await this.shortcutsVisibilityCheckbox.isChecked();
        if (isChecked !== isVisible) {
            await this.shortcutsVisibilityCheckbox.click();
        }
    }
}
