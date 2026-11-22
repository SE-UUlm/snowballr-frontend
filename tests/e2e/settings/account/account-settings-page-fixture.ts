import { expect } from "@playwright/test";
import { AccountSettingsPageModel } from "#tests/e2e/settings/account/account-settings-page-model.js";
import { test as base } from "#tests/e2e/utils/fixtures/shared-fixture.js";
import { Nothing } from "snowballr-api/base";
import { NavigationBarModel } from "#tests/e2e/navigation-bar-model.js";
import { SettingsSidebarModel } from "#tests/e2e/settings/settings-sidebar-model.js";
import { ShortcutsSettingsPageModel } from "#tests/e2e/settings/shortcuts/shortcuts-settings-page-model.js";

type AccountSettingsPageFixtures = {
    accountSettingsPage: AccountSettingsPageModel;
    navigationBar: NavigationBarModel;
    settingsSideBar: SettingsSidebarModel;
    shortcutsSettingsPage: ShortcutsSettingsPageModel;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - account settings page
 * - navigation bar
 * - settings sidebar
 * - shortcuts settings page
 */
export const test = base.extend<AccountSettingsPageFixtures>({
    accountSettingsPage: async ({ page, apiClient }, use) => {
        const accountSettingsPage = new AccountSettingsPageModel(page);
        const originalUser = await apiClient.getCurrentUser(Nothing).response;
        try {
            await page.goto("/settings/account");
            await expect(accountSettingsPage.firstNameInput).toBeVisible();
            await use(accountSettingsPage);
        } finally {
            await apiClient.updateUser({
                user: originalUser,
            }).response;
        }
    },

    shortcutsSettingsPage: async ({ page }, use) => {
        await use(new ShortcutsSettingsPageModel(page));
    },

    navigationBar: async ({ page }, use) => {
        await use(new NavigationBarModel(page));
    },

    settingsSideBar: async ({ page }, use) => {
        await use(new SettingsSidebarModel(page));
    },
});
