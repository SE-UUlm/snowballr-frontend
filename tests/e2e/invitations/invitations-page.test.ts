import { test } from "./invitations-page-fixture";
import { expect } from "@playwright/test";

test.describe("Invitation Navigation", () => {
    test("When navigating to the invitations, then the page is displayed", async ({
        page,
        invitationsPage,
        navigationBar,
    }) => {
        // Directly navigate to the invitations
        await page.goto("/");

        await navigationBar.getUserAvatarButton().click();
        await navigationBar.getInvitationsLink().click();
        await expect(invitationsPage.heading).toBeVisible();
    });
});
