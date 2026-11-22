import { test as base } from "#tests/e2e/utils/fixtures/isolated-fixture.js";
import { AcceptProjectInvitationPageModel } from "#tests/e2e/auth/acceptprojectinvitation/acceptprojectinvitation-page.model.js";
import { SignUpPageModel } from "#tests/e2e/auth/signup/signup-page.model.js";
import { SignInPageModel } from "#tests/e2e/auth/signin/signin-page-model.js";

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
