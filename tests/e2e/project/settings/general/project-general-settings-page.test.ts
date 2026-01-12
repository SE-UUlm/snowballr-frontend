import { test } from "./project-general-settings-page-fixture";
import { expect } from "@playwright/test";

test.describe("Project Name Settings Navigation", () => {
    test("When navigating to the general project settings, then the page is displayed", async ({
        page,
        projectSettingsPage,
        homePage,
        projectMemberSettingsPage,
        projectNavigationBar,
        projectSettingsSideBar,
    }) => {
        // Directly navigate to the general project settings
        await page.goto("/");

        await homePage.openProject(projectSettingsPage.projectName);
        await projectNavigationBar.settingsTab.click();
        await expect(projectSettingsPage.renameButton).toBeVisible();
        await expect(projectSettingsPage.heading).toBeVisible();

        // Navigate to the general project settings page via the project member settings page
        await page.goto("/");

        await homePage.openProject(projectSettingsPage.projectName);
        await projectNavigationBar.settingsTab.click();
        await projectSettingsSideBar.members.click();
        await expect(projectMemberSettingsPage.openInviteUsersDialogButton).toBeVisible();

        await projectSettingsSideBar.general.click();
        await expect(projectSettingsPage.renameButton).toBeVisible();
        await expect(projectSettingsPage.archiveButton).toBeVisible();
        await expect(projectSettingsPage.heading).toBeVisible();
    });
});

test.describe("Project Name Settings Test", () => {
    test("When the user enters the same project name, then a warning alert is shown", async ({
        page,
        projectSettingsPage,
    }) => {
        await projectSettingsPage.changeProjectName("Project 1");

        await expect(projectSettingsPage.heading).toBeVisible();
        await expect(
            page.getByRole("alert", {
                name: "No Changes Detected",
            }),
        ).toBeVisible();
        await expect(
            page.getByText(
                "To successfully change the project's name, you must provide a new one that is different from the current one.",
            ),
        ).toBeVisible();
    });

    test("When the user enters a blank project name, then the project name remains unchanged and an error is shown", async ({
        page,
        projectSettingsPage,
    }) => {
        await projectSettingsPage.changeProjectName(" ");

        await expect(projectSettingsPage.heading).toBeVisible();
        await expect(
            page.getByText("The project name cannot start or end with whitespace"),
        ).toBeVisible();
    });

    test.fixme(
        "When the user enters a valid project name, then the name of the project should be updated to this name.",
        async ({ page, projectSettingsPage }) => {
            await projectSettingsPage.changeProjectName("New Project");

            await expect(projectSettingsPage.errorAlert).not.toBeVisible();
            await expect(page.getByRole("heading", { name: "Project 1" })).not.toBeVisible();
            await expect(page.getByRole("heading", { name: "New Project" })).toBeVisible();
            await expect(page.getByText("Successfully updated project name.")).toBeVisible();
        },
    );
});

test.describe.fixme("Project Export Test", () => {
    // TODO: Add project export tests when real backend is used for e2e tests
});

test.describe("Archive Project Tests", () => {
    test(
        "When the user archives an active project, then a 'Archived' badge is shown and " +
            "all interactive elements except the 'Activate Project' button are disabled",
        async ({ projectSettingsPage }) => {
            await expect(projectSettingsPage.archivedBadge).not.toBeVisible();
            await expect(projectSettingsPage.renameButton).toBeEnabled();

            await projectSettingsPage.archiveButton.click();

            await expect(projectSettingsPage.archivedBadge).toBeVisible();
            await expect(projectSettingsPage.renameButton).toBeDisabled();
            await expect(projectSettingsPage.archiveButton).toBeHidden();
            await expect(projectSettingsPage.reactivateButton).toBeVisible();
        },
    );

    test(
        "When the user reactivates an archived project, then the 'Archived' badge is removed and " +
            "all interactive elements are enabled again",
        async ({ projectSettingsPage }) => {
            await projectSettingsPage.archiveButton.click();
            await expect(projectSettingsPage.archivedBadge).toBeVisible();

            await projectSettingsPage.reactivateButton.click();

            await expect(projectSettingsPage.archivedBadge).toBeHidden();
            await expect(projectSettingsPage.renameButton).toBeEnabled();
            await expect(projectSettingsPage.archiveButton).toBeVisible();
            await expect(projectSettingsPage.reactivateButton).toBeHidden();
        },
    );
});

test.describe("Delete Project Tests", () => {
    test("When the user deletes a project, then they are redirected to the home page and the project is removed from the project list", async ({
        projectSettingsPage,
        homePage,
    }) => {
        await projectSettingsPage.deleteProject();

        await expect(
            projectSettingsPage.page.getByText(
                `Successfully deleted '${projectSettingsPage.projectName}'.`,
            ),
        ).toBeVisible();
        await expect(homePage.heading).toBeVisible();
        await expect(
            projectSettingsPage.page.getByRole("link", { name: projectSettingsPage.projectName }),
        ).not.toBeVisible();
    });
});
