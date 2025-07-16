import { expect } from "@playwright/test";
import { test } from "./sign-in-page-fixture";
import { alice } from "../../utils/helper/users";

test.use({ user: null });

test.describe("Sign In Tests", () => {
    test("When the user is unauthenticated, then they will be redirected to the sign-in page", async ({
        page,
        signInPage,
    }) => {
        await page.goto("/");
        await expect(signInPage.heading).toBeVisible();
        await expect(signInPage.emailInput).toBeVisible();
        await expect(signInPage.passwordInput).toBeVisible();
    });

    test("When the user enters invalid credentials, then an error is displayed", async ({
        signInPage,
    }) => {
        await signInPage.emailInput.fill(alice.email);
        await signInPage.passwordInput.fill(alice.password + "ThisIsWrong");
        await signInPage.signInButton.click();
        await expect(signInPage.errorAlert).toBeVisible();
    });

    test("When the user enters valid credentials, then they are logged in", async ({
        signInPage,
        homePage,
    }) => {
        await signInPage.emailInput.fill(alice.email);
        await signInPage.passwordInput.fill(alice.password);
        await signInPage.signInButton.click();
        await expect(homePage.heading).toBeVisible();
        await expect(homePage.openCreateProjectDialogButton).toBeEnabled();
    });

    test("When the user clicks 'Sign Up', then they are redirected to the sign-up page", async ({
        signInPage,
        signUpPage,
    }) => {
        await signInPage.signUpLink.click();
        await expect(signUpPage.heading).toBeVisible();
    });

    test.fixme(
        "When the user clicks 'Forgot Password?', then they are redirected to forgot password page",
        async ({ page, signInPage }) => {
            await signInPage.forgotPasswordLink.click();
            await page.waitForURL("/resetpassword");
        },
    );
});
