import { expect } from "@playwright/test";
import { reloadWait } from "$tests/e2e/utils/helper/helper";
import { test } from "./project-slr-settings-page-fixture";

test.describe("SLR Settings Navigation", () => {
    test("When navigating to the project slr settings, then the page is displayed", async ({
        page,
        projectSLRSettingsPage,
        homePage,
        projectNavigationBar,
        projectSettingsSideBar,
    }) => {
        // Directly navigate to the project slr settings
        await page.goto("/");

        await homePage.openProject(projectSLRSettingsPage.projectName);
        await projectNavigationBar.settingsTab.click();
        await projectSettingsSideBar.slr.click();
        await expect(projectSLRSettingsPage.maybeAsDecisionSwitch).toBeVisible();
    });
});

test.describe("SLR Settings Tests", () => {
    test("When the 'Maybe as Decision' option is turned on, then the option 'Maybe' should be visible", async ({
        projectSLRSettingsPage,
        projectPaperViewPage,
    }) => {
        await projectSLRSettingsPage.toggleMaybeAsDecisionSwitch(true);

        await projectPaperViewPage.openProjectPaperView(
            projectSLRSettingsPage.projectId,
            projectSLRSettingsPage.projectPaperId,
        );

        await expect(projectPaperViewPage.maybeButton).toBeVisible();
    });

    test("When the 'Maybe as Decision' option is turned off, then the option 'Maybe' should not be visible", async ({
        projectSLRSettingsPage,
        projectPaperViewPage,
    }) => {
        await projectSLRSettingsPage.toggleMaybeAsDecisionSwitch(false);

        await projectPaperViewPage.openProjectPaperView(
            projectSLRSettingsPage.projectId,
            projectSLRSettingsPage.projectPaperId,
        );

        await expect(projectPaperViewPage.maybeButton).not.toBeVisible();
    });

    test("When the user reloads the page, then the 'Maybe as Decision' setting is persisted", async ({
        page,
        projectSLRSettingsPage,
    }) => {
        await projectSLRSettingsPage.toggleMaybeAsDecisionSwitch(true);
        await reloadWait(page, projectSLRSettingsPage.heading);
        await expect(projectSLRSettingsPage.maybeAsDecisionSwitch).toBeChecked();

        await projectSLRSettingsPage.toggleMaybeAsDecisionSwitch(false);
        await reloadWait(page, projectSLRSettingsPage.heading);
        await expect(projectSLRSettingsPage.maybeAsDecisionSwitch).not.toBeChecked();
    });

    test.fixme(
        "When the project is set to 'ACTIVE_LOCKED', then a warning is shown, that the SLR settings cannot be changed",
        async () => {},
    );
    test.fixme(
        "When the project is set to 'ACTIVE_LOCKED', then the 'Maybe as Decision' setting cannot be changed",
        async () => {},
    );
    test.fixme(
        "When the current user is not a project admin, then the user gets redirected to the general settings tab",
        async () => {},
    );
});
