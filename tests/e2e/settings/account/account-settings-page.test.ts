import { test } from "./account-settings-page-fixture";
import { expect } from "@playwright/test";

test.describe("Account Settings Navigation", () => {
    test("When navigating to the account settings, then the page is displayed", async ({
        page,
        accountSettingsPage,
        shortcutsSettingsPage,
        navigationBar,
        settingsSideBar,
    }) => {
        // Directly navigate to the account settings
        await page.goto("/");

        await navigationBar.openUserMenu();
        await navigationBar.getSettingsLink().click();
        await expect(accountSettingsPage.firstNameInput).toBeVisible();

        // Navigate to the account settings page via the shortcuts settings page
        await page.goto("/");

        await navigationBar.openUserMenu();
        await navigationBar.getSettingsLink().click();
        await settingsSideBar.shortcuts.click();
        await expect(shortcutsSettingsPage.shortcutsVisibilitySwitch).toBeVisible();

        await settingsSideBar.account.click();
        await expect(accountSettingsPage.firstNameInput).toBeVisible();
    });
});

test.describe("Changing username", () => {
    test("When the user enters an invalid first name, the new name should not be updated.", async ({
        accountSettingsPage,
        navigationBar,
    }) => {
        await expect(navigationBar.getUserAvatarButton()).toBeVisible();

        await accountSettingsPage.changeUsername(" ", "Beta");
        await expect(accountSettingsPage.emptyFirstNameAlert).toBeVisible();

        await expect(navigationBar.getUserAvatarButton()).toBeVisible();
    });

    test("When the user enters an invalid last name, the new name should not be updated.", async ({
        accountSettingsPage,
        navigationBar,
    }) => {
        await expect(navigationBar.getUserAvatarButton()).toBeVisible();

        await accountSettingsPage.changeUsername("Alpha", " ");
        await expect(accountSettingsPage.emptyLastNameAlert).toBeVisible();

        await expect(navigationBar.getUserAvatarButton()).toBeVisible();
    });

    test("When the user doesn't change the name but clicks the rename button, then the new name should not be updated.", async ({
        accountSettingsPage,
        navigationBar,
    }) => {
        await expect(navigationBar.getUserAvatarButton()).toBeVisible();

        await accountSettingsPage.renameButton.click();
        await expect(accountSettingsPage.noChangesDetectedAlert).toBeVisible();
        await expect(navigationBar.getUserAvatarButton()).toBeVisible();
    });

    test("When the user enters a valid first and last name, the new name should be updated.", async ({
        accountSettingsPage,
        navigationBar,
    }) => {
        await accountSettingsPage.changeUsername("Zeta", "Zeta");

        await expect(accountSettingsPage.firstNameInput).toHaveValue("Zeta");
        await expect(accountSettingsPage.lastNameInput).toHaveValue("Zeta");
        await expect(navigationBar.getUserAvatarButton("ZZ")).toBeVisible();
        await expect(accountSettingsPage.userNameUpdatedToast).toBeVisible();
    });
});
