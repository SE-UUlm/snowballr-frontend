import { expect } from "@playwright/test";
import { reloadWait } from "$tests/e2e/utils/helper/helper";
import { test } from "./project-slr-settings-page-fixture";

const fetcherName = "Semantic Scholar";

test.describe("SLR Settings Fetcher Options", () => {
    test("When a project has a fetcher, then it is visible", async ({
        projectSLRSettingsPage: slrPage,
    }) => {
        await slrPage.addFetcher(fetcherName);
        await reloadWait(
            slrPage.page,
            slrPage.page.getByRole("heading", { name: fetcherName, exact: true }),
        );
        await slrPage.ensureFetcherAdded(fetcherName);
    });

    test("When the user adds a fetcher, then it is added and visible", async ({
        projectSLRSettingsPage: slrPage,
    }) => {
        await slrPage.addFetcher(fetcherName);
        await slrPage.ensureFetcherAdded(fetcherName);
    });

    test("When the user deletes a fetcher, then it is not visible anymore", async ({
        projectSLRSettingsPage: slrPage,
    }) => {
        await slrPage.addFetcher(fetcherName);
        await reloadWait(slrPage.page, slrPage.getFetcherTitle(fetcherName));
        await slrPage.deleteFetcher(fetcherName);
        await slrPage.ensureFetcherRemoved(fetcherName);
    });

    test("When the user edits a fetcher, then it is saved across reloads", async ({
        projectSLRSettingsPage: slrPage,
    }) => {
        await slrPage.addFetcher(fetcherName);
        await reloadWait(slrPage.page, slrPage.getFetcherTitle(fetcherName));
        await slrPage.openEditFetcherDialog(fetcherName);
        await slrPage.page.getByRole("textbox").nth(0).fill("foobar");
        await slrPage.page.getByTestId("alert-dialog-action").click();
        await reloadWait(slrPage.page, slrPage.getFetcherTitle(fetcherName));
        await slrPage.openEditFetcherDialog(fetcherName);
        await expect(slrPage.page.getByRole("textbox").nth(0)).toHaveValue("foobar");
    });

    test("When the user inputs a fetcher option value, then it can be reset", async ({
        projectSLRSettingsPage: slrPage,
    }) => {
        await slrPage.addFetcher(fetcherName);
        await reloadWait(slrPage.page, slrPage.getFetcherTitle(fetcherName));
        await slrPage.openEditFetcherDialog(fetcherName);

        // Fill option
        await slrPage.ensureResetButtonState(fetcherName, false);
        await slrPage.page.getByRole("textbox").first().fill("foobar");
        await slrPage.ensureResetButtonState(fetcherName, true);

        // Clear option
        await slrPage.page.getByRole("textbox").first().clear();
        await slrPage.ensureResetButtonState(fetcherName, false);
    });

    test("When the user clicks the set-default button, then the default value is inserted into the value textbox", async ({
        projectSLRSettingsPage: slrPage,
    }) => {
        await slrPage.addFetcher(fetcherName);
        await reloadWait(slrPage.page, slrPage.getFetcherTitle(fetcherName));
        await slrPage.openEditFetcherDialog(fetcherName);

        // Fill option
        await slrPage.ensureResetButtonState(fetcherName, false);
        await slrPage.page.getByRole("textbox").first().fill("foobar");
        await slrPage.ensureResetButtonState(fetcherName, true);

        // Clear option
        await slrPage.getResetButton(fetcherName).then((btn) => btn.click());
        await expect(slrPage.page.getByRole("textbox").first()).toHaveValue("");
        await slrPage.ensureResetButtonState(fetcherName, false);
    });
});
