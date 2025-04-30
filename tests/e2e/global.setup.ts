import { expect } from "@playwright/test";
import { test as globalSetup } from "./fixtures/general-fixture";

globalSetup("Register user in the mock backend", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("First Name").fill("Alice");
    await page.getByLabel("Last Name").fill("Smith");
    await page.getByLabel("Email").fill("alice.smith@example.com");
    await page.getByLabel("Password", { exact: true }).fill("12abAB!?");
    await page.getByRole("button", { name: "Create an account" }).click();

    await expect(page.getByRole("alert")).not.toBeVisible();
});
