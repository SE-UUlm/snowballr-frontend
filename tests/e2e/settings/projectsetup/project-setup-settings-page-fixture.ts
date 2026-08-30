import { expect } from "@playwright/test";
import { ProjectSetupSettingsPageModel } from "./project-setup-settings-page-model";
import { test as base } from "../../utils/fixtures/shared-fixture";
import { Nothing } from "$api/base";
import { Project_Settings } from "$api/project";
import { UserSettings } from "$api/user_settings";

type ProjectSetupSettingsPageFixtures = {
    projectSetupSettingsPage: ProjectSetupSettingsPageModel;
};

/**
 * Extends the default **custom** fixture by providing the page object model for the
 * project setup settings page (the user's default fetcher settings).
 */
export const test = base.extend<ProjectSetupSettingsPageFixtures>({
    projectSetupSettingsPage: async ({ page, apiClient }, use) => {
        const projectSetupSettingsPage = new ProjectSetupSettingsPageModel(page);
        const originalFetchers = await apiClient
            .getUserSettings(Nothing)
            .response.then((it) => it.defaultProjectSettings?.fetchers ?? {});

        try {
            await page.goto("/settings/projectsetup");
            await expect(projectSetupSettingsPage.heading).toBeVisible();
            await use(projectSetupSettingsPage);
        } finally {
            await apiClient.updateUserSettings({
                userSettings: UserSettings.create({
                    defaultProjectSettings: Project_Settings.create({
                        fetchers: originalFetchers,
                    }),
                }),
                // Manually set the path list because the generated field mask does not detect
                // that the map for the fetchers is set.
                mask: { paths: ["user_settings.default_project_settings.fetchers"] },
            }).response;
        }
    },
});
