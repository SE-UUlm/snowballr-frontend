import { expect } from "@playwright/test";
import { test } from "$tests/visual/utils/visual-fixture";
import { SignInPageModel } from "$tests/e2e/auth/signin/signin-page-model";
import { gotoAndSettle } from "$tests/visual/utils/helper";
import { alice } from "$tests/e2e/utils/helper/users";

test.describe("Sign-in page", () => {
    test.use({ user: null });

    test("When the sign-in page is opened, then it matches the baseline", async ({ page }) => {
        const signInPage = new SignInPageModel(page);
        await gotoAndSettle(page, "/signin", signInPage.heading);

        await expect(page).toHaveScreenshot("signin.png", { fullPage: true });
    });

    test("When signing in with a wrong password, then the error alert matches the baseline", async ({
        page,
        apiClient,
    }) => {
        await apiClient.register(alice);
        const signInPage = new SignInPageModel(page);
        await gotoAndSettle(page, "/signin", signInPage.heading);

        await signInPage.emailInput.fill(alice.email);
        await signInPage.passwordInput.fill("wrong-password1A=");
        await signInPage.signInButton.click();
        await expect(signInPage.errorAlert).toBeVisible();

        await expect(page).toHaveScreenshot("signin-error.png", { fullPage: true });
    });
});
