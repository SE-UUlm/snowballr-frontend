import { ProjectMemberSettingsPageModel } from "./models/project-member-settings-page-model";
import { test as base } from "../../../utils/fixtures/shared-fixture";
import { expect } from "@playwright/test";
import { HomePageModel } from "$tests/e2e/homepage/home-page-model";
import { ProjectSettingsSidebarModel } from "$tests/e2e/project/settings/project-settings-sidebar-model";
import { ProjectNavigationBarModel } from "$tests/e2e/project/project-navigation-bar-model";
import { PromoteMemberDialogModel } from "$tests/e2e/project/settings/members/models/promote-member-dialog-model";

type ProjectMembersSettingsPageFixtures = {
    projectMembersSettingsPage: ProjectMemberSettingsPageModel;
    homePage: HomePageModel;
    promoteMemberDialog: PromoteMemberDialogModel;
    projectNavigationBar: ProjectNavigationBarModel;
    projectSettingsSideBar: ProjectSettingsSidebarModel;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - project member settings page
 * - home page
 * - project navigation bar
 * - project settings sidebar
 */
export const test = base.extend<ProjectMembersSettingsPageFixtures>({
    projectMembersSettingsPage: async ({ page, apiClient, user }, use) => {
        const projectMembersSettingsPage = new ProjectMemberSettingsPageModel(page, user!);

        try {
            await apiClient
                .createProject({ name: projectMembersSettingsPage.projectName })
                .response.then((project) => (projectMembersSettingsPage.projectId = project.id));

            await page.goto(`/project/${projectMembersSettingsPage.projectId}/settings/members`);
            await expect(projectMembersSettingsPage.heading).toBeVisible();

            await use(projectMembersSettingsPage);
        } finally {
            await apiClient.softDeleteProject({ id: projectMembersSettingsPage.projectId })
                .response;
        }
    },

    homePage: async ({ page }, use) => {
        await use(new HomePageModel(page));
    },

    promoteMemberDialog: async ({ page }, use) => {
        await use(new PromoteMemberDialogModel(page, { email: "john.doe@example.com" }));
    },

    projectNavigationBar: async ({ page }, use) => {
        await use(new ProjectNavigationBarModel(page));
    },

    projectSettingsSideBar: async ({ page }, use) => {
        await use(new ProjectSettingsSidebarModel(page));
    },
});
