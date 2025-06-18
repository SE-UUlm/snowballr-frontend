import { expect } from "@playwright/test";
import { AccountSettingsPageModel } from "./account-settings-page-model";
import { test as base } from "../../utils/fixtures/shared-fixture";
import { Nothing } from "$lib/model/api/base";
import { NavigationBarModel } from "$tests/e2e/navigation-bar-model";
import { SettingsSidebarModel } from "$tests/e2e/settings/settings-sidebar-model";
import { ShortcutsSettingsPageModel } from "$tests/e2e/settings/shortcuts/shortcuts-settings-page-model";

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
