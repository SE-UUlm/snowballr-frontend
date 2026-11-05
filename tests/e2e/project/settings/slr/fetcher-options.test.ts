import { expect, type Page } from "@playwright/test";
import { reloadWait } from "$tests/e2e/utils/helper/helper";
import { test } from "./project-slr-settings-page-fixture";
import type { ProjectSettingsSidebarModel } from "$tests/e2e/project/settings/project-settings-sidebar-model";

const fetcherName = "Semantic Scholar";
const SAVE_SUCCESS_MESSAGE = "Successfully updated project settings.";

/**
 * Navigates from the SLR settings to the general settings and back, without reloading the page.
 */
async function switchToGeneralTabAndBack(page: Page, sidebar: ProjectSettingsSidebarModel) {
    await sidebar.general.click();
    await expect(page).toHaveURL(/\/settings\/general$/);
    await sidebar.slr.click();
    await expect(page).toHaveURL(/\/settings\/slr$/);
}

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

    test("When the user adds a fetcher and navigates to another settings tab and back, then it is still added", async ({
        projectSLRSettingsPage: slrPage,
        projectSettingsSideBar,
    }) => {
        await slrPage.addFetcher(fetcherName);
        await expect(slrPage.page.getByText(SAVE_SUCCESS_MESSAGE)).toBeVisible();

        await switchToGeneralTabAndBack(slrPage.page, projectSettingsSideBar);

        await slrPage.ensureFetcherAdded(fetcherName);
    });

    test("When the user deletes a fetcher and navigates to another settings tab and back, then it is still removed", async ({
        projectSLRSettingsPage: slrPage,
        projectSettingsSideBar,
    }) => {
        await slrPage.addFetcher(fetcherName);
        await reloadWait(slrPage.page, slrPage.getFetcherTitle(fetcherName));
        await slrPage.deleteFetcher(fetcherName);
        await expect(slrPage.page.getByText(SAVE_SUCCESS_MESSAGE)).toBeVisible();

        await switchToGeneralTabAndBack(slrPage.page, projectSettingsSideBar);

        await slrPage.ensureFetcherRemoved(fetcherName);
    });

    test("When the user edits a fetcher and navigates to another settings tab and back, then the edit is still shown", async ({
        projectSLRSettingsPage: slrPage,
        projectSettingsSideBar,
    }) => {
        await slrPage.addFetcher(fetcherName);
        await reloadWait(slrPage.page, slrPage.getFetcherTitle(fetcherName));
        await slrPage.openEditFetcherDialog(fetcherName);
        await slrPage.page.getByRole("textbox").nth(0).fill("foobar");
        await slrPage.page.getByTestId("alert-dialog-action").click();
        await expect(slrPage.page.getByText(SAVE_SUCCESS_MESSAGE)).toBeVisible();

        await switchToGeneralTabAndBack(slrPage.page, projectSettingsSideBar);

        await slrPage.openEditFetcherDialog(fetcherName);
        await expect(slrPage.page.getByRole("textbox").nth(0)).toHaveValue("foobar");
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
