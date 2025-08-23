import { expect } from "@playwright/test";
import { test } from "./verifyemail-page-fixture";

test.use({ user: null });

test.describe("Email Verification Navigation", () => {
    test("When navigating to the verify email page, then the page is displayed", async ({
        page,
        verifyEmailPage,
    }) => {
        await page.goto("/verifyemail");
        await expect(verifyEmailPage.heading).toBeVisible();
    });
});

test.describe("Email Verification Tests", () => {
    test.fixme(
        "When the user is already signed in, then they are redirected to the home page",
        async () => {},
    );

    test("When navigating to the verify email page with no token, then the page is displayed and the correct message displayed", async ({
        page,
        verifyEmailPage,
    }) => {
        await page.goto("/verifyemail");
        await expect(verifyEmailPage.heading).toHaveText("Verification Failed");
        await expect(verifyEmailPage.body).toHaveText(
            "The verification link is missing a token. Please check the link provided in your email.",
        );
        await expect(verifyEmailPage.backToSignUpButton).toBeVisible();
    });

    test.fixme(
        "When providing an invalid token, then the corresponding error is displayed",
        async () => {},
    );

    test.fixme(
        "When providing a valid token, then the corresponding success message is displayed and redirected to the sign-in page",
        async () => {},
    );
});
