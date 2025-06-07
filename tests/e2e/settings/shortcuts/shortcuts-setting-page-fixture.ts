import { expect } from "@playwright/test";
import { ShortcutsSettingsPageModel } from "./shortcuts-settings-page-model";
import { test as base } from "../../utils/fixtures/shared-fixture";
import { NavigationBarModel } from "$tests/e2e/navigation-bar-model";
import { SettingsSidebarModel } from "$tests/e2e/settings/settings-sidebar-model";

type ShortcutsSettingsPageFixtures = {
    shortcutsSettingsPage: ShortcutsSettingsPageModel;
    navigationBar: NavigationBarModel;
    settingsSideBar: SettingsSidebarModel;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - shortcuts settings page
 * - navigation bar
 * - settings sidebar
 */
export const test = base.extend<ShortcutsSettingsPageFixtures>({
    shortcutsSettingsPage: async ({ page }, use) => {
        const shortcutsSettingsPage = new ShortcutsSettingsPageModel(page);
        await page.goto("/settings/shortcuts");
        await expect(shortcutsSettingsPage.shortcutsVisibilitySwitch).toBeVisible();
        await use(shortcutsSettingsPage);
    },

    navigationBar: async ({ page }, use) => {
        await use(new NavigationBarModel(page));
    },

    settingsSideBar: async ({ page }, use) => {
        await use(new SettingsSidebarModel(page));
    },
});
