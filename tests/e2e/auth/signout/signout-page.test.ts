import { expect } from "@playwright/test";
import { test } from "./signout-fixture";

test.describe("Sign Out Tests", () => {
    test("When the user clicks logout, then they are logged out and will thus be redirected to the sign-in page", async ({
        signInPage,
        navigationBarModel,
    }) => {
        await navigationBarModel.getUserAvatarButton().click();
        await navigationBarModel.getSignOutLink().click();
        await expect(signInPage.heading).toBeVisible();
    });
});
