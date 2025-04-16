import { expect } from "@playwright/test";
import { test } from "./fixtures/account-settings-fixture";

test.describe("Changing username", () => {
    test("When the user enters a valid first and last name, the new name should be updated.", async ({
        page,
        accountSettingsPage,
    }) => {
        accountSettingsPage.changeUsername("Zeta", "Zeta");

        await expect(page.getByRole("textbox", { name: "First Name" })).toHaveValue("Zeta");
        await expect(page.getByRole("textbox", { name: "Last Name" })).toHaveValue("Zeta");
        await expect(page.getByRole("button", { name: "ZZ", exact: true })).toBeVisible();
    });

    test("When the user enters an invalid first or last name, the new name should not be updated.", async ({
        page,
        accountSettingsPage,
    }) => {
        await expect(page.getByRole("button", { name: "ZZ", exact: true })).toBeVisible();

        accountSettingsPage.changeUsername(" ", "Beta");
        await expect(
            page.getByText("First Name must contain at least 1 non-whitespace character"),
        ).toBeVisible();
        await expect(page.getByRole("button", { name: "ZZ", exact: true })).toBeVisible();

        accountSettingsPage.changeUsername("Alpha", " ");
        await expect(
            page.getByText("Last Name must contain at least 1 non-whitespace character"),
        ).toBeVisible();
        await expect(page.getByRole("button", { name: "ZZ", exact: true })).toBeVisible();
    });
});
