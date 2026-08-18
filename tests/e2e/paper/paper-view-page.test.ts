import { test } from "./paper-view-page-fixtures";
import { expect } from "@playwright/test";

test.describe("Paper View Navigation", () => {
    test("When navigating to the paper view, then the page is displayed", async ({
        page,
        paperViewPage,
        homePage,
        projectPaperViewPage,
        readingListPage,
        navigationBar,
    }) => {
        await page.goto("/");

        await homePage.openProjectPaper(paperViewPage.paperNames[0]);
        await projectPaperViewPage.getReadingListButton(true).click();
        await expect(navigationBar.getUserAvatarButton()).toBeVisible();
        await navigationBar.openUserMenu();
        await navigationBar.getReadingListLink().click();
        await expect(paperViewPage.getReferencesListEntry(0)).toBeVisible();
        await readingListPage.readingListEntries.first().click();
        await expect(paperViewPage.getHeading(paperViewPage.paperNames[0])).toBeVisible();
    });
});

test.describe("Paper View Tests", () => {
    test("When the user clicks on the information button, then the paper information is displayed", async ({
        paperViewPage,
    }) => {
        await paperViewPage.documentButton.click();
        await expect(paperViewPage.generalInformationLabel).not.toBeVisible();
        await paperViewPage.informationButton.click();
        await expect(paperViewPage.generalInformationLabel).toBeVisible();
    });

    test.fixme("When the user clicks on the document button, then pdf document is displayed", async ({
        paperViewPage,
    }) => {
        await paperViewPage.documentButton.click();
    });

    test("When the user clicks on the show more information button, then the publication type, publication name and the external ids are displayed", async ({
        paperViewPage,
    }) => {
        await paperViewPage.showMoreInformationButton.click();
        await expect(paperViewPage.publicationTypeLabel).toBeVisible();
        await expect(paperViewPage.publicationNameLabel).toBeVisible();
        await expect(paperViewPage.externalIdsLabel).toBeVisible();

        await paperViewPage.showLessInformationButton.click();
        await expect(paperViewPage.publicationTypeLabel).not.toBeVisible();
        await expect(paperViewPage.publicationNameLabel).not.toBeVisible();
        await expect(paperViewPage.externalIdsLabel).not.toBeVisible();
    });

    test("When the user clicks on a referenced paper in the paper view, then the paper view of the referenced paper is displayed", async ({
        paperViewPage,
    }) => {
        await paperViewPage.navigateToReferencePaper(0);
        await expect(paperViewPage.getHeading(paperViewPage.paperNames[0])).toBeVisible();
    });
});
