import { expect } from "@playwright/test";
import { reloadWait } from "#tests/e2e/utils/helper/helper.js";
import { test } from "#tests/e2e/settings/projectsetup/project-setup-settings-page-fixture.js";
import { SettingsSidebarModel } from "#tests/e2e/settings/settings-sidebar-model.js";

const fetcherName = "Semantic Scholar";

test.describe("Default Fetcher Settings", () => {
    test("When navigating to the project setup settings, then the page is displayed", async ({
        page,
        projectSetupSettingsPage,
    }) => {
        await page.goto("/");

        const settingsSideBar = new SettingsSidebarModel(page);
        await page.goto("/settings/account");
        await settingsSideBar.projectSetup.click();

        await expect(projectSetupSettingsPage.heading).toBeVisible();
    });

    test("When the user adds a default fetcher, then it is added and visible after a reload", async ({
        projectSetupSettingsPage,
    }) => {
        await projectSetupSettingsPage.addFetcher(fetcherName);
        await reloadWait(
            projectSetupSettingsPage.page,
            projectSetupSettingsPage.page.getByRole("heading", { name: fetcherName, exact: true }),
        );
        await projectSetupSettingsPage.ensureFetcherAdded(fetcherName);
    });

    test("When the user removes a default fetcher, then it is not visible anymore after a reload", async ({
        projectSetupSettingsPage,
    }) => {
        await projectSetupSettingsPage.addFetcher(fetcherName);
        await reloadWait(
            projectSetupSettingsPage.page,
            projectSetupSettingsPage.page.getByRole("heading", { name: fetcherName, exact: true }),
        );
        await projectSetupSettingsPage.deleteFetcher(fetcherName);
        await reloadWait(projectSetupSettingsPage.page, projectSetupSettingsPage.heading);
        await projectSetupSettingsPage.ensureFetcherRemoved(fetcherName);
    });
});
