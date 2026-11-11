import { expect } from "@playwright/test";
import { test } from "$tests/visual/utils/visual-fixture";
import { ErrorPageModel } from "$tests/e2e/error/error-page-model";

test.describe("Error page", () => {
    test("When a non-existent page is opened, then the 404 page matches the baseline", async ({
        page,
    }) => {
        const errorPage = new ErrorPageModel(page);
        await page.goto("/this-page-does-not-exist");
        await expect(errorPage.errorCodeText).toBeVisible();
        await page.waitForLoadState("networkidle");

        await expect(page).toHaveScreenshot("not-found.png", { fullPage: true });
    });
});
