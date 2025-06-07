import { expect } from "@playwright/test";
import { test } from "./shortcuts-setting-page-fixture";
import { reloadWait } from "../../utils/helper/helper";

test.describe("Shortcuts Visibility Tests", () => {
    test("When the user enables the shortcuts visibility, then the shortcuts are visible", async ({
        shortcutsSettingsPage,
        navigationBar,
    }) => {
        await shortcutsSettingsPage.setShortcutsVisibility(true);

        await navigationBar.getUserAvatarButton().click();
        await expect(navigationBar.getReadingListLink(true)).toBeVisible();
        await expect(navigationBar.getReadingListLink(false)).not.toBeVisible();
    });

    test("When the user disables the shortcuts visibility, then the shortcuts are not visible", async ({
        shortcutsSettingsPage,
        navigationBar,
    }) => {
        await shortcutsSettingsPage.setShortcutsVisibility(false);

        await navigationBar.getUserAvatarButton().click();
        await expect(navigationBar.getReadingListLink(true)).not.toBeVisible();
        await expect(navigationBar.getReadingListLink(false)).toBeVisible();
    });

    test("When the user reloads the page, then the shortcuts visibility is persisted", async ({
        page,
        shortcutsSettingsPage,
        navigationBar,
    }) => {
        await shortcutsSettingsPage.setShortcutsVisibility(true);
        await reloadWait(page, shortcutsSettingsPage.heading);

        await navigationBar.getUserAvatarButton().click();
        await expect(navigationBar.getReadingListLink(true)).toBeVisible();
        await expect(navigationBar.getReadingListLink(false)).not.toBeVisible();
        await page.locator("html").click(); // Close the popup

        await shortcutsSettingsPage.setShortcutsVisibility(false);
        await reloadWait(page, shortcutsSettingsPage.heading);

        await navigationBar.getUserAvatarButton().click();
        await expect(navigationBar.getReadingListLink(true)).not.toBeVisible();
        await expect(navigationBar.getReadingListLink(false)).toBeVisible();
    });
});
