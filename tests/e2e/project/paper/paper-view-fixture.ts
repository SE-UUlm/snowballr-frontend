import { test as base } from "../../utils/fixtures/shared-fixture";
import { DevPaperViewPage } from "$tests/e2e/project/paper/paper-view-model";

type PaperViewFixture = {
    paperViewPage: DevPaperViewPage;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - paper view page
 */
export const test = base.extend<PaperViewFixture>({
    paperViewPage: async ({ page }, use) => {
        await use(new DevPaperViewPage(page));
    },
});
