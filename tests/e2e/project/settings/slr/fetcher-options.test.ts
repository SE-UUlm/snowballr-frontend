import { expect } from "@playwright/test";
import { reloadWait } from "$tests/e2e/utils/helper/helper";
import { test } from "./project-slr-settings-page-fixture";

test.describe("SLR Settings Fetcher Options", () => {
    test("When a project has a fetcher, then it is visible", async ({
        projectSLRSettingsPage: slrPage,
    }) => {
        await slrPage.addFetcher("test");
        await reloadWait(
            slrPage.page,
            slrPage.page.getByRole("heading", { name: "test", exact: true }),
        );
    });

    test("When the user adds a fetcher, then it is added and visible", async ({
        projectSLRSettingsPage: slrPage,
    }) => {
        await slrPage.addFetcher("test");
        await expect(slrPage.getFetcherTitle("test")).toBeVisible();
    });

    test("When the user deletes a fetcher, then it is not visible anymore", async ({
        projectSLRSettingsPage: slrPage,
    }) => {
        await slrPage.addFetcher("test");
        await reloadWait(slrPage.page, slrPage.getFetcherTitle("test"));
        await slrPage.deleteFetcher("test");
        await expect(slrPage.getFetcherRow("test")).not.toBeVisible();
    });

    test("When the user edits a fetcher, then it is saved across reloads", async ({
        projectSLRSettingsPage: slrPage,
    }) => {
        await slrPage.addFetcher("test");
        await reloadWait(slrPage.page, slrPage.getFetcherTitle("test"));
        await slrPage.openEditFetcherDialog("test");
        await slrPage.page.getByRole("textbox").nth(1).fill("foobar");
        await slrPage.page.getByTestId("alert-dialog-action").click();
        await reloadWait(slrPage.page, slrPage.getFetcherTitle("test"));
        await slrPage.openEditFetcherDialog("test");
        await expect(slrPage.page.getByRole("textbox").nth(1)).toHaveValue("foobar");
    });

    test("When the user inputs a fetcher option value, then it is marked as overridden", async ({
        projectSLRSettingsPage: slrPage,
    }) => {
        await slrPage.addFetcher("test");
        await reloadWait(slrPage.page, slrPage.getFetcherTitle("test"));
        await slrPage.openEditFetcherDialog("test");
        await expect(slrPage.page.getByRole("checkbox").first()).not.toBeChecked();
        await slrPage.page.getByRole("textbox").first().fill("foobar");
        await expect(slrPage.page.getByRole("checkbox").first()).toBeChecked();
        await slrPage.page.getByRole("textbox").first().clear();
        await expect(slrPage.page.getByRole("checkbox").first()).not.toBeChecked();
    });

    test("When the user clicks the set-default button, then the default value is inserted into the value textbox", async ({
        projectSLRSettingsPage: slrPage,
    }) => {
        await slrPage.addFetcher("test");
        await reloadWait(slrPage.page, slrPage.getFetcherTitle("test"));
        await slrPage.openEditFetcherDialog("test");
        await slrPage.page
            .getByRole("alertdialog", { name: "Edit Option Values" })
            .getByRole("button", { name: /^$/ })
            .first()
            .click();
        await expect(slrPage.page.getByRole("textbox").first()).toHaveValue("FOO_TEST");
        await expect(slrPage.page.getByRole("checkbox").first()).toBeChecked();
    });
});
