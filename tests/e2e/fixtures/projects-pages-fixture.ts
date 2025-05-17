import { test as base } from "./shared-fixture";
import { DevProjectPapersPage } from "$tests/e2e/pom/project-papers-page-model";
import { projectId } from "../papers-overview.test";
import { expect } from "@playwright/test";

type ProjectsPagesFixture = {
    projectPapersPage: DevProjectPapersPage;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - project papers page
 */
export const test = base.extend<ProjectsPagesFixture>({
    projectPapersPage: async ({ page }, use) => {
        await page.goto(`project/${projectId}/papers`);
        await expect(page.getByRole("tab", { name: "Papers" })).toBeVisible();

        await use(new DevProjectPapersPage(page));
    },
});
