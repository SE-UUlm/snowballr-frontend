import { expect } from "@playwright/test";
import { test } from "./account-settings-page-fixture";

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
