import { test } from "./project-paper-view-page-fixtures";
import { expect } from "@playwright/test";

test.describe("Paper Navigation Tests", () => {
    test("When the user is not in review mode and clicks the next paper button, then the next paper in the same project with the succeeding localId is shown.", async ({
        page,
        paperNavigation,
    }) => {
        await paperNavigation.changeReviewMode(false, paperNavigation.projectPaperNames[0]);

        await paperNavigation.goToNextPaper();
        await expect(paperNavigation.nextPaperButton).toBeEnabled();
        await expect(
            page
                .getByRole("heading", {
                    name: paperNavigation.projectPaperNames[1],
                })
                .first(),
        ).toBeVisible();
    });
    test("When the user is not in review mode and clicks the previous paper button, then the previous paper in the same project with the preceeding localId is shown.", async ({
        page,
        paperNavigation,
    }) => {
        await paperNavigation.changeReviewMode(false, paperNavigation.projectPaperNames[2]);
        await paperNavigation.goToPreviousPaper();
        await expect(paperNavigation.previousPaperButton).toBeEnabled();
        await expect(
            page
                .getByRole("heading", {
                    name: paperNavigation.projectPaperNames[1],
                })
                .first(),
        ).toBeVisible();
    });
    test("When the user is in review mode and clicks the next paper button, then the next paper in the same project without submitted review is shown.", async ({
        page,
        paperNavigation,
    }) => {
        await paperNavigation.changeReviewMode(true, paperNavigation.projectPaperNames[0]);

        await paperNavigation.goToNextPaper();
        await expect(
            page.getByRole("heading", {
                name: paperNavigation.projectPaperNames[2],
            }),
        ).toBeVisible();
    });
    test("When the user is in review mode and clicks the previous paper button, then the last visited paper in the same project is shown.", async ({
        page,
        paperNavigation,
    }) => {
        await paperNavigation.changeReviewMode(true, paperNavigation.projectPaperNames[0]);
        await paperNavigation.goToNextPaper();
        await expect(
            page.getByRole("heading", {
                name: paperNavigation.projectPaperNames[2],
            }),
        ).toBeVisible();
        await paperNavigation.goToPreviousPaper();
        await expect(
            page.getByRole("heading", {
                name: paperNavigation.projectPaperNames[0],
            }),
        ).toBeVisible();
    });
});
