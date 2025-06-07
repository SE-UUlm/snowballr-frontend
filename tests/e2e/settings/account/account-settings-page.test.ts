import { test } from "./account-settings-page-fixture";
import { expect } from "@playwright/test";

test.describe("Account Settings Tests", () => {
    test("When navigating to the account settings, then the page is displayed", async ({
        page,
        accountSettingsPage,
        shortcutsSettingsPage,
        navigationBar,
        settingsSideBar,
    }) => {
        // Directly navigate to the account settings
        await page.goto("/");

        await navigationBar.getUserAvatarButton().click();
        await navigationBar.getSettingsLink().click();
        await expect(accountSettingsPage.firstNameInput).toBeVisible();

        // Navigate to the account settings page via the shortcuts settings page
        await page.goto("/");

        await navigationBar.getUserAvatarButton().click();
        await navigationBar.getSettingsLink().click();
        await settingsSideBar.shortcuts.click();
        await expect(shortcutsSettingsPage.shortcutsVisibilitySwitch).toBeVisible();

        await settingsSideBar.account.click();
        await expect(accountSettingsPage.firstNameInput).toBeVisible();
    });
});
