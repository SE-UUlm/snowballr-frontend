import { DevProjectReviewSettingsPage } from "$tests/e2e/pom/project-review-settings-model";
import { expect } from "@playwright/test";
import { projectId, projectReviewSettingsProjectName } from "../project-review-settings.test";
import { test as base } from "./shared-fixture";

type ProjectReviewSettingsPage = {
    projectReviewSettingsPage: DevProjectReviewSettingsPage;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - project review settings page
 */
export const test = base.extend<ProjectReviewSettingsPage>({
    projectReviewSettingsPage: async ({ page }, use) => {
        await page.goto(`project/${projectId}/settings/review`);
        await expect(
            page.getByRole("heading", { name: projectReviewSettingsProjectName }),
        ).toBeVisible();

        await use(new DevProjectReviewSettingsPage(page));
    },
});
