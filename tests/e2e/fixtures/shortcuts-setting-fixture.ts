import { expect } from "@playwright/test";
import { DevHomePage } from "../pom/home-page-model";
import { DevShortcutsSettingsPage } from "../pom/shortcuts-settings-model";
import { test as base } from "./shared-fixture";

type ShortcutsSettingsPage = {
    shortcutsSettingsPage: DevShortcutsSettingsPage;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - shortcuts settings page
 */
export const test = base.extend<ShortcutsSettingsPage>({
    shortcutsSettingsPage: async ({ page }, use) => {
        await page.goto("/");
        await expect(page.getByRole("heading", { name: "SnowballR" })).toBeVisible();

        const homepage = new DevHomePage(page);
        await homepage.openUserSettingInSidebar("Shortcuts");
        await use(new DevShortcutsSettingsPage(page));
    },
});
