import { test as base } from "../../utils/fixtures/isolated-fixture";
import { AcceptProjectInvitationPageModel } from "./acceptprojectinvitation-page.model";
import { SignUpPageModel } from "$tests/e2e/auth/signup/signup-page.model";
import { SignInPageModel } from "$tests/e2e/auth/signin/signin-page-model";

type AcceptProjectInvitationPageFixture = {
    acceptProjectInvitationPage: AcceptProjectInvitationPageModel;
    signUpPage: SignUpPageModel;
    signInPage: SignInPageModel;
};

export const test = base.extend<AcceptProjectInvitationPageFixture>({
    acceptProjectInvitationPage: async ({ page }, use) => {
        const acceptProjectInvitationPage = new AcceptProjectInvitationPageModel(page);
        // Note: Navigation is handled within each test to allow for different token scenarios.
        await use(acceptProjectInvitationPage);
    },

    signUpPage: async ({ page }, use) => {
        await use(new SignUpPageModel(page));
    },

    signInPage: async ({ page }, use) => {
        await use(new SignInPageModel(page));
    },
});
