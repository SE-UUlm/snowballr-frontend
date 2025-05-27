import { test as base } from "../../utils/fixtures/shared-fixture";
import { DevReadingListPage } from "$tests/e2e/readinglist/pom/reading-list-page-model";
import { DevHomePage } from "../../homepage/pom/home-page-model";
import { expect } from "@playwright/test";
import { Nothing } from "$lib/model/api/base";
import { defaultPaperIds } from "../tests/reading-list.test";

type ReadingListPageAndHomepagePage = {
    readingListPage: DevReadingListPage;
    homepage: DevHomePage;
};

/**
 * Extends the default **custom** fixture by providing the page object models for the
 * - reading list page and
 * - home page
 *
 * It navigates to the reading list before each test, clears the current version of the
 * reading list and add default papers to keep a consistent
 * starting state for each test
 */
export const test = base.extend<{ readingListPageAndHomepagePage: ReadingListPageAndHomepagePage }>(
    {
        readingListPageAndHomepagePage: async ({ page, apiClient }, use) => {
            const currentList = await apiClient.getReadingList(Nothing).response;
            if (currentList?.papers) {
                await Promise.all(
                    currentList.papers.map((paper) =>
                        apiClient.removePaperFromReadingList({ id: paper.id }),
                    ),
                );
            }
            await Promise.all(defaultPaperIds.map((id) => apiClient.addPaperToReadingList({ id })));

            await page.goto("/");
            await expect(page.getByRole("heading", { name: "SnowballR" })).toBeVisible();

            const homepage = new DevHomePage(page);
            await homepage.openLinkInUserMenuDialog("Reading List");

            await use({ readingListPage: new DevReadingListPage(page), homepage: homepage });
        },
    },
);
