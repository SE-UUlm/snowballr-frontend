import { test as globalSetup } from "./fixtures/general-fixture";

globalSetup("Register user in the mock backend", async ({ page, user }) => {
    await page.goto("/signup");
    await page.getByLabel("First Name").fill(user.firstName);
    await page.getByLabel("Last Name").fill(user.lastName);
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password", { exact: true }).fill(user.password);
    await page.getByRole("button", { name: "Create an account" }).click();
});
