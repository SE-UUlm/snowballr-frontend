import { expect } from "@playwright/test";
import { test } from "./acceptprojectinvitation-page-fixture";

test.use({ user: null });

test.describe("Accept Project Invitation Verification Navigation", () => {
    test("When navigating to the accept project invitation page, then the page is displayed", async ({
        page,
        acceptProjectInvitationPage,
    }) => {
        await page.goto("/acceptprojectinvitation");
        await expect(acceptProjectInvitationPage.heading).toBeVisible();
    });
});

test.describe("Accept Project Invitation Tests", () => {
    test("When navigating to the accept project invitation page with no token, then the page is displayed and the correct message displayed", async ({
        page,
        acceptProjectInvitationPage,
    }) => {
        await page.goto("/acceptprojectinvitation");
        await expect(acceptProjectInvitationPage.heading).toHaveText("Accepting Failed");
        await expect(acceptProjectInvitationPage.body).toHaveText(
            "The acceptance link is missing a token. Please check the link provided in your email.",
        );
        await expect(acceptProjectInvitationPage.backToSignUpButton).toBeVisible();
    });

    test.fixme(
        "When providing an invalid token, then the corresponding error is displayed",
        async () => {},
    );

    test.fixme(
        "When providing a valid token, but the user is not yet registered, then the corresponding error is displayed",
        async () => {},
    );

    test.fixme(
        "When providing a valid token, then the corresponding success message is displayed and redirected to the sign-in page",
        async () => {},
    );
});
