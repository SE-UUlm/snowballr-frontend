import { expect } from "@playwright/test";
import { test } from "../../../homepage/fixtures/home-page-fixture";

test.describe("Sign Out Functionality", () => {
    test("When the user clicks logout, then they are logged out and will thus be redirected to /signin", async ({
        page,
        homePage,
    }) => {
        await homePage.openLinkInUserMenuDialog("Sign Out", false);
        await page.waitForURL("/signin");
        await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
    });
});
