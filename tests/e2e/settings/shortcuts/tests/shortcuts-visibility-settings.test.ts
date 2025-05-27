import { expect } from "@playwright/test";
import { test } from "../fixtures/shortcuts-setting-fixture";
import { reloadWait } from "../../../utils/helper/helper";

test.describe("Shortcuts visibility", () => {
    test("When the user enables the shortcuts visibility, then the shortcuts are visible", async ({
        page,
        shortcutsSettingsPage,
    }) => {
        await shortcutsSettingsPage.setShortcutsVisibility(true);

        await page.getByRole("button", { name: /^[A-Z]{2}$/ }).click();
        await expect(page.getByRole("link", { name: /Reading List.+/ })).toBeVisible();
        await expect(
            page.getByRole("link", { name: "Reading List", exact: true }),
        ).not.toBeVisible();
    });

    test("When the user disables the shortcuts visibility, then the shortcuts are not visible", async ({
        page,
        shortcutsSettingsPage,
    }) => {
        await shortcutsSettingsPage.setShortcutsVisibility(false);

        await page.getByRole("button", { name: /^[A-Z]{2}$/ }).click();
        await expect(page.getByRole("link", { name: /Reading List.+/ })).not.toBeVisible();
        await expect(page.getByRole("link", { name: "Reading List", exact: true })).toBeVisible();
    });

    test("When the user reloads the page, then the shortcuts visibility is persisted", async ({
        page,
        shortcutsSettingsPage,
    }) => {
        await shortcutsSettingsPage.setShortcutsVisibility(true);
        await reloadWait(page, page.getByRole("heading", { name: "Settings" }));

        await page.getByRole("button", { name: /^[A-Z]{2}$/ }).click();
        await expect(page.getByRole("link", { name: /Reading List.+/ })).toBeVisible();
        await expect(
            page.getByRole("link", { name: "Reading List", exact: true }),
        ).not.toBeVisible();
        await page.locator("html").click(); // Close the popup

        await shortcutsSettingsPage.setShortcutsVisibility(false);
        await reloadWait(page, page.getByRole("heading", { name: "Settings" }));

        await page.getByRole("button", { name: /^[A-Z]{2}$/ }).click();
        await expect(page.getByRole("link", { name: /Reading List.+/ })).not.toBeVisible();
        await expect(page.getByRole("link", { name: "Reading List", exact: true })).toBeVisible();
    });
});
