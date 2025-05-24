import { type Locator, type Page } from "@playwright/test";

export class DevShortcutsSettingsPage {
    readonly page: Page;
    readonly shortcutsVisibilitySwitch: Locator;

    constructor(page: Page) {
        this.page = page;
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
    }
}
