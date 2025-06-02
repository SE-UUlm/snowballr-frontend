import { expect } from "@playwright/test";
import { test } from "./account-settings-fixture";
import { Nothing } from "$lib/model/api/base";
import { User } from "$lib/model/api/user";

test.describe("Changing username", () => {
    let originalUser: User;

    /** Save the original user before the tests. */
    test.beforeAll(async ({ apiClient }) => {
        originalUser = await apiClient.getCurrentUser(Nothing).response;
    });

    /** Restore the original user after the tests. */
    test.afterAll(async ({ apiClient }) => {
        await apiClient.updateUser({
            user: originalUser,
        }).response;
    });

    test("When the user enters a valid first and last name, the new name should be updated.", async ({
        page,
        accountSettingsPage,
    }) => {
        await accountSettingsPage.changeUsername("Zeta", "Zeta");

        await expect(page.getByRole("textbox", { name: "First Name" })).toHaveValue("Zeta");
        await expect(page.getByRole("textbox", { name: "Last Name" })).toHaveValue("Zeta");
        await expect(page.getByRole("button", { name: "ZZ", exact: true })).toBeVisible();
        await expect(page.getByText("Successfully updated your name.")).toBeVisible();
    });

    test("When the user enters an invalid first name, the new name should not be updated.", async ({
        page,
        accountSettingsPage,
    }) => {
        await expect(page.getByRole("button", { name: "ZZ", exact: true })).toBeVisible();

        await accountSettingsPage.changeUsername(" ", "Beta");
        await expect(
            page.getByText("First Name cannot start or end with whitespace"),
        ).toBeVisible();

        await expect(page.getByRole("button", { name: "ZZ", exact: true })).toBeVisible();
    });

    test("When the user enters an invalid last name, the new name should not be updated.", async ({
        page,
        accountSettingsPage,
    }) => {
        await expect(page.getByRole("button", { name: "ZZ", exact: true })).toBeVisible();

        await accountSettingsPage.changeUsername("Alpha", " ");
        await expect(page.getByText("Last Name cannot start or end with whitespace")).toBeVisible();

        await expect(page.getByRole("button", { name: "ZZ", exact: true })).toBeVisible();
    });

    test("When the user doesn't change the name but clicks the rename button, then the new name should not be updated.", async ({
        page,
        accountSettingsPage,
    }) => {
        await expect(page.getByRole("button", { name: "ZZ", exact: true })).toBeVisible();

        await accountSettingsPage.renameButton.click();
        await expect(
            page.getByRole("alert", {
                name: "To successfully change your name, you must provide a new one that is different from your current one.",
            }),
        ).toBeVisible();

        await expect(page.getByRole("button", { name: "ZZ", exact: true })).toBeVisible();
    });
});
