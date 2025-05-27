import { DevProjectSettingsPage } from "$tests/e2e/project/settings/general/pom/project-general-settings-model";
import { test as base } from "../../../../utils/fixtures/shared-fixture";
import { expect } from "@playwright/test";
import { projectId } from "../tests/project-name-settings.test";

type ProjectSettingsPage = {
    projectSettingsPage: DevProjectSettingsPage;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - project settings page
 */
export const test = base.extend<ProjectSettingsPage>({
    projectSettingsPage: async ({ page }, use) => {
        await page.goto(`/project/${projectId}/settings/general`);
        await expect(page.getByRole("heading", { name: "Project 1" })).toBeVisible();
        await use(new DevProjectSettingsPage(page));
    },
});
