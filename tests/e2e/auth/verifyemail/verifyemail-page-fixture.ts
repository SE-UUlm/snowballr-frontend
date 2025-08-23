import { test as base } from "../../utils/fixtures/isolated-fixture";
import { VerifyEmailPageModel } from "./verifyemail-page.model";
import { SignUpPageModel } from "$tests/e2e/auth/signup/signup-page.model";
import { SignInPageModel } from "$tests/e2e/auth/signin/signin-page-model";

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
