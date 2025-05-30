import { test as base } from "../../utils/fixtures/shared-fixture";
import { DevProjectPapersPage } from "$tests/e2e/project/papers/project-papers-page-model";
import { projectId } from "./papers-overview.test";
import { expect } from "@playwright/test";

type ProjectsPapersFixture = {
    projectPapersPage: DevProjectPapersPage;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - project papers page
 */
export const test = base.extend<ProjectsPapersFixture>({
    projectPapersPage: async ({ page }, use) => {
        await page.goto(`project/${projectId}/papers`);
        await expect(page.getByRole("tab", { name: "Papers" })).toBeVisible();

        await use(new DevProjectPapersPage(page));
    },
});
