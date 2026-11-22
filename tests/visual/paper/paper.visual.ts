import { expect } from "@playwright/test";
import { test } from "#tests/visual/utils/visual-fixture.js";
import { gotoAndSettle } from "#tests/visual/utils/helper.js";
import { PaperViewPageModel } from "#tests/e2e/paper/paper-view-page-model.js";
import { PAPERS } from "#tests/visual/utils/visual-data.js";

test.describe("Paper view", () => {
    test("When a paper is opened outside of a project, then it matches the baseline", async ({
        page,
        visualData,
    }) => {
        const paperViewPage = new PaperViewPageModel(page);
        await gotoAndSettle(
            page,
            `/paper/${visualData.paperIds.contractTesting}`,
            paperViewPage.getHeading(PAPERS.contractTesting.title),
        );

        await expect(page).toHaveScreenshot("paper.png", { fullPage: true });
    });

    test("When more information is shown, then it matches the baseline", async ({
        page,
        visualData,
    }) => {
        const paperViewPage = new PaperViewPageModel(page);
        await gotoAndSettle(
            page,
            `/paper/${visualData.paperIds.contractTesting}`,
            paperViewPage.showMoreInformationButton,
        );
        await paperViewPage.showMoreInformationButton.click();
        await expect(paperViewPage.externalIdsLabel).toBeVisible();

        await expect(page).toHaveScreenshot("paper-more-information.png", { fullPage: true });
    });
});
