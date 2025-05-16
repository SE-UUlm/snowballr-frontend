import { DevProjectMemberSettingsPage } from "../pom/project-member-settings-page-model";
import { test as base } from "./general-fixture";
import { Project } from "$lib/model/api/project";
import { expect } from "@playwright/test";

type ProjectMembersSettingsPage = {
    projectMembersSettingsPage: DevProjectMemberSettingsPage;
};

export const test = base.extend<ProjectMembersSettingsPage>({
    projectMembersSettingsPage: async ({ page, mockBackendService }, use) => {
        const project = await mockBackendService.createProject(
            Project.create({ name: "Demo Project" }),
        ).response;
        await page.goto(`/project/${project.id}/dashboard`);
        await page.getByRole("tab", { name: "Settings" }).click();
        await page.getByRole("link", { name: "Members" }).click();
        await expect(page.getByRole("heading", { name: "Demo Project", level: 2 })).toBeVisible();
        const projectMembersSettingsPage = new DevProjectMemberSettingsPage(page);

        await use(projectMembersSettingsPage);

        await mockBackendService.softDeleteProject({ id: project.id });
    },
});
