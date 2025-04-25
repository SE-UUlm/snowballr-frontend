import { DevProjectSettingsPage } from "$tests/e2e/pom/project-settings-model";
import { test as base } from "./general-fixture";

type ProjectSettingsPage = {
    projectSettingsPage: DevProjectSettingsPage;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - project settings page
 */
export const test = base.extend<ProjectSettingsPage>({
    projectSettingsPage: async ({ page }, use) => {
        await use(new DevProjectSettingsPage(page));
    },
});
