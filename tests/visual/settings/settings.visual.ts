import { expect } from "@playwright/test";
import { test } from "$tests/visual/utils/visual-fixture";
import { expandViewportToFitScrollAreas, gotoAndSettle } from "$tests/visual/utils/helper";
import { AccountSettingsPageModel } from "$tests/e2e/settings/account/account-settings-page-model";
import { ProjectSetupSettingsPageModel } from "$tests/e2e/settings/projectsetup/project-setup-settings-page-model";
import { ReviewSettingsPageModel } from "$tests/e2e/settings/review/review-settings-page-model";
import { ShortcutsSettingsPageModel } from "$tests/e2e/settings/shortcuts/shortcuts-settings-page-model";

test.describe("User settings", () => {
    test("When the account settings are opened, then all sections match the baseline", async ({
        page,
    }) => {
        const accountPage = new AccountSettingsPageModel(page);
        await gotoAndSettle(page, "/settings/account", accountPage.firstNameInput);

        await expandViewportToFitScrollAreas(page);

        await expect(page).toHaveScreenshot("account.png", { fullPage: true });
    });

    test("When the project setup settings are opened, then all sections match the baseline", async ({
        page,
    }) => {
        const projectSetupPage = new ProjectSetupSettingsPageModel(page);
        await gotoAndSettle(page, "/settings/projectsetup", projectSetupPage.heading);

        await expandViewportToFitScrollAreas(page);

        await expect(page).toHaveScreenshot("projectsetup.png", { fullPage: true });
    });

    test("When the review settings are opened, then all sections match the baseline", async ({
        page,
    }) => {
        const reviewPage = new ReviewSettingsPageModel(page);
        await gotoAndSettle(page, "/settings/review", reviewPage.reviewModeSwitch);

        await expandViewportToFitScrollAreas(page);

        await expect(page).toHaveScreenshot("review.png", { fullPage: true });
    });

    test("When the shortcut settings are opened, then all sections match the baseline", async ({
        page,
    }) => {
        const shortcutsPage = new ShortcutsSettingsPageModel(page);
        await gotoAndSettle(page, "/settings/shortcuts", shortcutsPage.shortcutsVisibilitySwitch);

        await expandViewportToFitScrollAreas(page);

        await expect(page).toHaveScreenshot("shortcuts.png", { fullPage: true });
    });
});
