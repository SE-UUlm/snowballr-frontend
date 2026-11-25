import { expect } from "@playwright/test";
import { test } from "#tests/e2e/auth/signup/sign-up-page-fixture.js";

test.use({ user: null });

test.describe("Sign Up Navigation", () => {
    test("When navigating to the sign up page, then the page is displayed", async ({
        page,
        signUpPage,
        signInPage,
    }) => {
        await page.goto("/");
        await expect(signInPage.heading).toBeVisible();
        await signInPage.signUpLink.click();
        await expect(signUpPage.heading).toBeVisible();
    });
});

test.describe("Sign Up Tests", () => {
    test("When the user enters an invalid password (not satisfying all criteria), then the alert for input validation is displayed", async ({
        signUpPage,
    }) => {
        await signUpPage.firstNameInput.fill("John");
        await signUpPage.lastNameInput.fill("Doe");
        await signUpPage.emailInput.fill("john.doe@example.com");
        await signUpPage.passwordInput.fill("invalidPassword");

        await signUpPage.signUpButton.click();
        await expect(signUpPage.errorAlert).toBeVisible();
    });

    test.fixme("When the user enters a valid password (satisfying all criteria), then a info toast is displayed and the user is redirected to the sign-in page", async ({
        signUpPage,
        signInPage,
    }) => {
        await signUpPage.firstNameInput.fill("John");
        await signUpPage.lastNameInput.fill("Doe");
        await signUpPage.emailInput.fill("john.doe@example.com");
        await signUpPage.passwordInput.fill("Valid_Password12!");

        await signUpPage.signUpButton.click();
        await expect(signInPage.heading).toBeVisible();
    });

    test("When the user clicks 'Sign In' then they are redirected to the sign-in page", async ({
        signUpPage,
        signInPage,
    }) => {
        await signUpPage.signInLink.click();
        await expect(signInPage.heading).toBeVisible();
    });

    test("When the redirect parameter points to another site, then the user stays on this site after signing up", async ({
        page,
        baseURL,
        signUpPage,
    }) => {
        await page.goto(`/signup?redirect=${encodeURIComponent("https://example.com")}`);
        await expect(signUpPage.heading).toBeVisible();

        await signUpPage.firstNameInput.fill("John");
        await signUpPage.lastNameInput.fill("Doe");
        await signUpPage.emailInput.fill("john.doe@example.com");
        await signUpPage.passwordInput.fill("Valid_Password12!");
        await signUpPage.signUpButton.click();

        // The mock backend signs the user in on registration, so the sign-in page forwards to the home page
        await page.waitForURL((url) => url.pathname !== "/signup");
        expect(new URL(page.url()).origin).toBe(new URL(baseURL!).origin);
    });
});
