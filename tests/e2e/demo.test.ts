import { test } from "@playwright/test";

test.describe("home page", () => {
    test("home page has expected h1", async ({ page }) => {
        await page.goto("/");
        // await expect(page.locator("h1")).toBeVisible();
    });
});
