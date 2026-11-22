import { expect } from "@playwright/test";
import { test } from "#tests/visual/utils/visual-fixture.js";
import { gotoAndSettle } from "#tests/visual/utils/helper.js";
import { ReadingListPageModel } from "#tests/e2e/readinglist/reading-list-page-model.js";
import { PAPERS, seedVisualData } from "#tests/visual/utils/visual-data.js";

test.describe("Reading list", () => {
    test("When the reading list is opened, then it matches the baseline", async ({
        page,
        apiClient,
    }) => {
        await seedVisualData(apiClient);
        const readingListPage = new ReadingListPageModel(page);
        await gotoAndSettle(
            page,
            "/readinglist",
            readingListPage.getPaperByTitle(PAPERS.endToEndFlakiness.title),
        );

        await expect(page).toHaveScreenshot("readinglist.png", { fullPage: true });
    });

    test("When the reading list is empty, then it matches the baseline", async ({ page }) => {
        await gotoAndSettle(page, "/readinglist", page.getByText(/^Your reading list is empty\./));

        await expect(page).toHaveScreenshot("readinglist-empty.png", { fullPage: true });
    });
});
