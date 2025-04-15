import { test as base } from "./general-fixture";
import { DevReadingListPage } from "$tests/e2e/pom/reading-list-page-model";

type ReadingListPage = {
    readingListPage: DevReadingListPage;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - reading list page
 */
export const test = base.extend<ReadingListPage>({
    readingListPage: async ({ page }, use) => {
        await use(new DevReadingListPage(page));
    },
});
