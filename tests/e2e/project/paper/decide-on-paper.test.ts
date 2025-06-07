import { test } from "./project-paper-view-page-fixtures";
import { ReviewDecision } from "$lib/model/api/review";
import { expect } from "@playwright/test";

test.describe("Decide on Paper Tests", () => {
    test("When the user decides on a paper by clicking the corresponding decision button, then a review is submitted and the next paper to review is opened", async ({
        page,
        decideOnPaper,
    }) => {
        await decideOnPaper.openProjectPaperView(
            decideOnPaper.projectId,
            decideOnPaper.localProjectPaperIds[0],
        );

        await decideOnPaper.decideOnPaper(ReviewDecision.ACCEPTED);
        await expect(
            page.getByRole("heading", {
                name: decideOnPaper.projectPaperNames[1],
            }),
        ).toBeVisible();
    });

    test("When the user presses one of the shortcuts for a decision, then a review is submitted and the next paper to review is opened", async ({
        page,
        decideOnPaper,
    }) => {
        await decideOnPaper.openProjectPaperView(
            decideOnPaper.projectId,
            decideOnPaper.localProjectPaperIds[1],
        );
        await expect(decideOnPaper.acceptButton).toBeEnabled();
        await expect(decideOnPaper.nextPaperButton).toBeEnabled();
        await page.keyboard.press("Control+a");
        await expect(
            page.getByRole("heading", {
                name: decideOnPaper.projectPaperNames[2],
            }),
        ).toBeVisible();
    });

    test("When the user selects certain review criteria and clicks a decision button, then a review is submitted and the decision is shown (because there is no other paper to review).", async ({
        page,
        decideOnPaper,
    }) => {
        await decideOnPaper.openProjectPaperView(
            decideOnPaper.projectId,
            decideOnPaper.localProjectPaperIds[2],
        );

        await decideOnPaper.decideOnPaper(ReviewDecision.ACCEPTED);
        await expect(decideOnPaper.submittedReviewToast).toBeVisible();

        await expect(
            page.getByRole("heading", {
                name: decideOnPaper.projectPaperNames[3],
            }),
        ).toBeVisible();
    });

    test("When the user opens a project paper in review mode that was already reviewed by the user, then it is not possible to change any decision (including review criteria).", async ({
        page,
        decideOnPaper,
    }) => {
        await decideOnPaper.openProjectPaperView(
            decideOnPaper.projectId,
            decideOnPaper.localProjectPaperIds[3],
        );
        await decideOnPaper.decideOnPaper(ReviewDecision.ACCEPTED);
        await expect(decideOnPaper.submittedReviewToast).toBeVisible();
        await expect(decideOnPaper.noMorePapersToReviewToast).toBeVisible();

        await page.reload();

        await expect(decideOnPaper.acceptButton).toBeDisabled();
        await expect(decideOnPaper.declineButton).toBeDisabled();
        await expect(decideOnPaper.maybeButton).toBeDisabled();

        await expect(decideOnPaper.acceptButton).toContainClass("ring-1");
        await expect(decideOnPaper.declineButton).not.toContainClass("ring-1");
        await expect(decideOnPaper.maybeButton).not.toContainClass("ring-1");

        await expect(decideOnPaper.exampleInclusionCriterion.getByRole("checkbox")).toBeDisabled();
        await expect(
            decideOnPaper.exampleHardExclusionCriterion.getByRole("checkbox"),
        ).toBeDisabled();
        await expect(decideOnPaper.exampleInclusionCriterion.getByRole("checkbox")).toBeChecked();
    });
});
