import { expect, test } from "@playwright/test";
import { test as mockBackendtest } from "./utils/fixtures/shared-fixture";

test.describe("Backend Unreachable", () => {
    test("When the backend is unreachable, then an alert dialog is displayed", async ({ page }) => {
        await page.goto("/");
        await expect(page.getByRole("alertdialog", { name: "An Error Occurred!" })).toBeVisible();
    });
});

mockBackendtest.use({ user: null });
mockBackendtest.describe("Backend Reachable", () => {
    mockBackendtest(
        "When the backend is reachable, then no alert dialog is displayed",
        async ({ page }) => {
            await page.goto("/");
            await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
            await expect(
                page.getByRole("alertdialog", { name: "An Error Occurred!" }),
            ).not.toBeVisible();
        },
    );
});
