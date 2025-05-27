import { expect } from "@playwright/test";
import { test } from "../../../utils/fixtures/isolated-fixture";
import { alice } from "../../../utils/helper/users";

test.use({ user: null });

test.describe("Sign In Functionality", () => {
    test.beforeEach(async ({ apiClient, page }) => {
        await apiClient.register(alice);
        await page.goto("/signin");
    });

    test("When the user is unauthenticated, then they will be redirected to /signin", async ({
        page,
    }) => {
        await page.goto("/");
        await page.waitForURL("/signin");
        await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
        await expect(page.getByLabel("Email")).toBeVisible();
        await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    });

    test("When the user enters invalid credentials, then an error is displayed", async ({
        page,
    }) => {
        await page.getByLabel("Email").fill(alice.email);
        await page.getByLabel("Password", { exact: true }).fill(alice.password + "ThisIsWrong");
        await page.getByRole("button", { name: "Sign In" }).click();
        await expect(page.getByRole("alert")).toBeVisible();
    });

    test("When the user enters valid credentials, then they are logged in", async ({ page }) => {
        await page.getByLabel("Email").fill(alice.email);
        await page.getByLabel("Password", { exact: true }).fill(alice.password);
        await page.getByRole("button", { name: "Sign In" }).click();
        await page.waitForURL("/");
        await expect(page.getByRole("heading", { name: "SnowballR" })).toBeVisible();
        await expect(page.getByText("Create Project", { exact: true })).toBeVisible();
    });

    test("When the user clicks 'Sign Up', then they are redirected to /signup", async ({
        page,
    }) => {
        await page.getByRole("link", { name: "Sign Up" }).click();
        await page.waitForURL("/signup");
    });

    test("When the user clicks 'Forgot Password?', then they are redirected to /forgotpassword", async ({
        page,
    }) => {
        await page.getByRole("link", { name: "Forgot Password?" }).click();
        await page.waitForURL("/resetpassword");
    });
});
