import { test as base } from "./general-fixture";
import { DevHomePage } from "$tests/e2e/pom/home-page-model";
import { DevCreateProjectDialog } from "$tests/e2e/pom/create-project-dialog-model";

type HomePageFixtures = {
    homePage: DevHomePage;
    createProjectDialog: DevCreateProjectDialog;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - home page
 * - the dialog for creating a new project
 */
export const test = base.extend<HomePageFixtures>({
    homePage: async ({ page }, use) => {
        await use(new DevHomePage(page));
    },

    createProjectDialog: async ({ page }, use) => {
        await use(new DevCreateProjectDialog(page));
    },
});
