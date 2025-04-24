import { expect } from "@playwright/test";
import { DevAccountSettingsPage } from "../pom/account-settings-model";
import { DevHomePage } from "../pom/home-page-model";
import { test as base } from "./general-fixture";

type AccountSettingsPage = {
    accountSettingsPage: DevAccountSettingsPage;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - account settings page
 */
export const test = base.extend<AccountSettingsPage>({
    accountSettingsPage: async ({ page }, use) => {
        await page.goto("/");
        await expect(page.getByRole("heading", { name: "SnowballR" })).toBeVisible(); // TODO: Remove after user context is added
        const homepage = new DevHomePage(page);
        await homepage.openAccountSettings();
        await use(new DevAccountSettingsPage(page));
    },
});
