import { test as base } from "../utils/fixtures/isolated-fixture";
import { expect } from "@playwright/test";
import { NavigationBarModel } from "$tests/e2e/navigation-bar-model";
import { InvitationsPageModel } from "$tests/e2e/invitations/invitations-page-model";

type InvitationsPageFixtures = {
    invitationsPage: InvitationsPageModel;
    navigationBar: NavigationBarModel;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - invitations page
 * - navigation bar
 */
export const test = base.extend<InvitationsPageFixtures>({
    invitationsPage: async ({ page }, use) => {
        const invitationsPage = new InvitationsPageModel(page);
        await page.goto("/invitations");
        await expect(invitationsPage.heading).toBeVisible();

        await use(invitationsPage);
    },

    navigationBar: async ({ page }, use) => {
        await use(new NavigationBarModel(page));
    },
});
