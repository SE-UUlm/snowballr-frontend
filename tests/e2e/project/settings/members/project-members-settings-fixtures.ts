import { DevProjectMemberSettingsPage } from "./project-member-settings-page-model";
import { test as base } from "../../../utils/fixtures/shared-fixture";
import { Project } from "$lib/model/api/project";
import { expect } from "@playwright/test";

type ProjectMembersSettingsPage = {
    projectMembersSettingsPage: DevProjectMemberSettingsPage;
};

export const test = base.extend<ProjectMembersSettingsPage>({
    projectMembersSettingsPage: async ({ page, apiClient }, use) => {
        const project = await apiClient.createProject(Project.create({ name: "Demo Project" }))
            .response;
        await page.goto(`/project/${project.id}/dashboard`);
        await page.getByRole("tab", { name: "Settings" }).click();
        await page.getByRole("link", { name: "Members" }).click();
        await expect(page.getByRole("heading", { name: "Demo Project", level: 2 })).toBeVisible();
        const projectMembersSettingsPage = new DevProjectMemberSettingsPage(page);

        await use(projectMembersSettingsPage);

        await apiClient.softDeleteProject({ id: project.id });
    },
});
