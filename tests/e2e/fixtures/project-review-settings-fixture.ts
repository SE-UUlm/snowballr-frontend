import { DevProjectReviewSettingsPage } from "$tests/e2e/pom/project-review-settings-model";
import { test as base } from "./general-fixture";
import { DevHomePage } from "$tests/e2e/pom/home-page-model";
import { expect } from "@playwright/test";

type ProjectReviewSettingsPage = {
    projectReviewSettingsPage: DevProjectReviewSettingsPage;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - project review settings page
 */
export const test = base.extend<ProjectReviewSettingsPage>({
    projectReviewSettingsPage: async ({ page }, use) => {
        /*   const homepage = new DevHomePage(page);
        await homepage.openProjectSettings();
        const reviewSettingsLink = page.getByTestId("settings-tab-review");
        await reviewSettingsLink.click();*/
        await use(new DevProjectReviewSettingsPage(page));
    },
});
