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

test.describe("SLR Settings Tests - Maybe as Decision", () => {
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
});

test.describe("SLR Settings Tests - Snowballing Type", () => {
    test("When a different snowballing type is selected, then the project is updated and the selection changes", async ({
        page,
        projectSLRSettingsPage,
    }) => {
        await projectSLRSettingsPage.selectSnowballingType("Both");
        await expect(projectSLRSettingsPage.snowballingTypeBothRadio).toBeChecked();

        // Wait until the success toast disappears
        await expect(
            page.getByText("Successfully updated the project settings."),
        ).not.toBeVisible();

        await projectSLRSettingsPage.selectSnowballingType("Forward");
        await expect(projectSLRSettingsPage.snowballingTypeForwardRadio).toBeChecked();

        // Wait until the success toast disappears
        await expect(
            page.getByText("Successfully updated the project settings."),
        ).not.toBeVisible();

        await projectSLRSettingsPage.selectSnowballingType("Backward");
        await expect(projectSLRSettingsPage.snowballingTypeBackwardRadio).toBeChecked();
    });
});
