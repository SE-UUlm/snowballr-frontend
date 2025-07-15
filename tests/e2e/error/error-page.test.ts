import { expect } from "@playwright/test";
import { test } from "./error-page-fixture";

test.describe("Error Page Tests", () => {
    test("When navigating to a non-existent page, a 404 error is displayed", async ({
        page,
        errorPage,
    }) => {
        await page.goto("/this-page-does-not-exist");

        // Verify the content of the 404 error page using the new locators
        await expect(errorPage.headline).toHaveText("Page Not Found");
        await expect(errorPage.bodyText).toHaveText(
            "Sorry, the page you are looking for does not exist.",
        );
        await expect(errorPage.errorCodeText).toHaveText("(Error Code: 404)");
        await expect(errorPage.backToDashboardButton).toBeVisible();

        // Verify the browser tab's title remains correct
        await expect(page).toHaveTitle("404 | Not Found");
    });

    test("When clicking 'Back to Dashboard', the user is redirected to the home page", async ({
        page,
        errorPage,
        homePage,
    }) => {
        await page.goto("/another-non-existent-page");

        // Ensure we are on the error page before clicking by checking the new headline
        await expect(errorPage.headline).toBeVisible();

        // Click the button and assert navigation to the dashboard/homepage
        await errorPage.backToDashboardButton.click();

        // Verify that the user has been redirected to the homepage
        await expect(homePage.heading).toBeVisible();
        await expect(page).toHaveURL("/");
    });
});
