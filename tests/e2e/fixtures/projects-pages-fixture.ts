import { test as base } from "./general-fixture";
import { DevProjectPapersPage } from "$tests/e2e/pom/project-papers-page-model";

type ProjectsPagesFixture = {
    projectPapersPage: DevProjectPapersPage;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - project papers page
 */
export const test = base.extend<ProjectsPagesFixture>({
    projectPapersPage: async ({ page }, use) => {
        await use(new DevProjectPapersPage(page));
    },
});
