import { expect } from "@playwright/test";
import { test } from "$tests/visual/utils/visual-fixture";
import { SignUpPageModel } from "$tests/e2e/auth/signup/signup-page.model";
import { VerifyEmailPageModel } from "$tests/e2e/auth/verifyemail/verifyemail-page.model";
import { AcceptProjectInvitationPageModel } from "$tests/e2e/auth/acceptprojectinvitation/acceptprojectinvitation-page.model";
import { gotoAndSettle } from "$tests/visual/utils/helper";

test.describe("Authentication pages", () => {
    test.use({ user: null });

    test("When the sign-up page is opened, then it matches the baseline", async ({ page }) => {
        const signUpPage = new SignUpPageModel(page);
        await gotoAndSettle(page, "/signup", signUpPage.heading);

        await expect(page).toHaveScreenshot("signup.png", { fullPage: true });
    });

    test("When the email verification fails due to a missing token, then it matches the baseline", async ({
        page,
    }) => {
        const verifyEmailPage = new VerifyEmailPageModel(page);
        await page.goto("/verifyemail");
        await expect(verifyEmailPage.heading).toHaveText("Email Verification Failed");
        await page.waitForLoadState("networkidle");

        await expect(page).toHaveScreenshot("verifyemail-failed.png", { fullPage: true });
    });

    test("When accepting a project invitation fails due to a missing token, then it matches the baseline", async ({
        page,
    }) => {
        const acceptPage = new AcceptProjectInvitationPageModel(page);
        await page.goto("/acceptprojectinvitation");
        await expect(acceptPage.backToSignUpButton).toBeVisible();
        await page.waitForLoadState("networkidle");

        await expect(page).toHaveScreenshot("acceptprojectinvitation-failed.png", {
            fullPage: true,
        });
    });
});
