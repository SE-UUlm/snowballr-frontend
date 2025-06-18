import { test as base } from "../utils/fixtures/shared-fixture";
import { expect } from "@playwright/test";
import { NavigationBarModel } from "$tests/e2e/navigation-bar-model";
import { ArchivedProjectsPageModel } from "$tests/e2e/archivedprojects/archived-projects-page-model";

type ArchivedProjectsPageFixture = {
    archivedProjectsPage: ArchivedProjectsPageModel;
    navigationBar: NavigationBarModel;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - archived projects page
 * - navigation bar
 */
export const test = base.extend<ArchivedProjectsPageFixture>({
    archivedProjectsPage: async ({ page }, use) => {
        const archivedProjectsPage = new ArchivedProjectsPageModel(page);
        await page.goto("/archivedprojects");
        await expect(archivedProjectsPage.heading).toBeVisible();

        await use(archivedProjectsPage);
    },

    navigationBar: async ({ page }, use) => {
        await use(new NavigationBarModel(page));
    },
});
