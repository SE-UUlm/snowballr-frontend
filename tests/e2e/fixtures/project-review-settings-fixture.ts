import { DevProjectReviewSettingsPage } from "$tests/e2e/pom/project-review-settings-model";
import { test as base } from "./general-fixture";

type ProjectReviewSettingsPage = {
    projectReviewSettingsPage: DevProjectReviewSettingsPage;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - project review settings page
 */
export const test = base.extend<ProjectReviewSettingsPage>({
    projectReviewSettingsPage: async ({ page }, use) => {
        await use(new DevProjectReviewSettingsPage(page));
    },
});
