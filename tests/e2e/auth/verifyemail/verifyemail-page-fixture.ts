import { test as base } from "#tests/e2e/utils/fixtures/isolated-fixture.js";
import { VerifyEmailPageModel } from "#tests/e2e/auth/verifyemail/verifyemail-page.model.js";
import { SignUpPageModel } from "#tests/e2e/auth/signup/signup-page.model.js";
import { SignInPageModel } from "#tests/e2e/auth/signin/signin-page-model.js";

type VerifyEmailPageFixtures = {
    verifyEmailPage: VerifyEmailPageModel;
    signUpPage: SignUpPageModel;
    signInPage: SignInPageModel;
};

export const test = base.extend<VerifyEmailPageFixtures>({
    verifyEmailPage: async ({ page }, use) => {
        const verifyEmailPage = new VerifyEmailPageModel(page);
        // Note: Navigation is handled within each test to allow for different token scenarios.
        await use(verifyEmailPage);
    },

    signUpPage: async ({ page }, use) => {
        await use(new SignUpPageModel(page));
    },

    signInPage: async ({ page }, use) => {
        await use(new SignInPageModel(page));
    },
});
