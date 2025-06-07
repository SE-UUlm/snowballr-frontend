import { test } from "./shortcuts-setting-page-fixture";
import { expect } from "@playwright/test";

test.describe("Shortcuts Settings Tests", () => {
    test("When navigating to the shortcuts settings, then the page is displayed", async ({
        page,
        shortcutsSettingsPage,
        navigationBar,
        settingsSideBar,
    }) => {
        // Directly navigate to the account settings
        await page.goto("/");

        await navigationBar.getUserAvatarButton().click();
        await navigationBar.getSettingsLink().click();
        await settingsSideBar.shortcuts.click();
        await expect(shortcutsSettingsPage.shortcutsVisibilitySwitch).toBeVisible();
    });
});
