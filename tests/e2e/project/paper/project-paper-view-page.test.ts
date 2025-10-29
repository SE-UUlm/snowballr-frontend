import { test } from "./project-paper-view-page-fixtures";
import { expect } from "@playwright/test";
import { ReviewDecision } from "$lib/model/api/review";

test.describe("Project Paper View Navigation", () => {
    test("When navigating to the project paper view, then the page is displayed", async ({
        page,
        projectPaperViewPage,
        homePage,
        projectDashboardPage,
        projectPapersPage,
        projectNavigationBar,
    }) => {
        await page.goto("/");

        // Directly navigate to the project paper view
        await homePage.openProjectPaper(projectPaperViewPage.projectPaperNames[0]);
        await expect(
            projectPaperViewPage.getHeading(projectPaperViewPage.projectPaperNames[0]),
        ).toBeVisible();
        await expect(projectPaperViewPage.nextPaperButton).toBeVisible();

        // Navigate over the project dashboard
        await page.goto("/");

        await homePage.openProject(projectPaperViewPage.projectName);
        await projectDashboardPage.openProjectPaper(projectPaperViewPage.projectPaperNames[0]);

        await expect(
            projectPaperViewPage.getHeading(projectPaperViewPage.projectPaperNames[0]),
        ).toBeVisible();
        await expect(projectPaperViewPage.nextPaperButton).toBeVisible();

        // Navigate over the papers overview page
        await page.goto("/");

        await homePage.openProject(projectPaperViewPage.projectName);
        await projectNavigationBar.papersTab.click();

        await projectPapersPage.getStageButton(0).click();
        await projectPapersPage
            .getPaperByTitle(projectPaperViewPage.projectPaperNames[0])
            .getByRole("link", { name: "Open Paper" })
            .click();

        await expect(
            projectPaperViewPage.getHeading(projectPaperViewPage.projectPaperNames[0]),
        ).toBeVisible();
        await expect(projectPaperViewPage.nextPaperButton).toBeVisible();
    });
});

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

test.describe("Decide on Paper Tests", () => {
    test.fixme(
        "When the user decides on a paper by clicking the corresponding decision button, then a review is submitted and the next paper to review is opened",
        async ({ page, decideOnPaper }) => {
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
        },
    );

    test.fixme(
        "When the user presses one of the shortcuts for a decision, then a review is submitted and the next paper to review is opened",
        async ({ page, decideOnPaper }) => {
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
        },
    );

    test.fixme(
        "When the user selects certain review criteria and clicks a decision button, then a review is submitted and the decision is shown (because there is no other paper to review).",
        async ({ page, decideOnPaper }) => {
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
        },
    );

    test.fixme(
        "When the user opens a project paper in review mode that was already reviewed by the user, then it is not possible to change any decision (including review criteria).",
        async ({ page, decideOnPaper }) => {
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

            await expect(
                decideOnPaper.exampleInclusionCriterion.getByRole("checkbox"),
            ).toBeDisabled();
            await expect(
                decideOnPaper.exampleHardExclusionCriterion.getByRole("checkbox"),
            ).toBeDisabled();
            await expect(
                decideOnPaper.exampleInclusionCriterion.getByRole("checkbox"),
            ).toBeChecked();
        },
    );
});

test.describe("Update Paper Tests", () => {
    test("When the user edits a field and saves, then a success toast is shown", async ({
        projectPaperViewPage,
    }) => {
        await projectPaperViewPage.openProjectPaperView(
            projectPaperViewPage.projectId,
            projectPaperViewPage.localProjectPaperIds[0],
        );

        // Enter edit mode
        await projectPaperViewPage.toggleEditModeButton.click();

        // Change title
        const titleInput = projectPaperViewPage.getToggleableInput("title");
        await titleInput.fill("");
        await titleInput.fill("Updated Title");

        // Save
        await projectPaperViewPage.savePaperChangesButton.click();

        // Expect success toast
        await expect(projectPaperViewPage.updatedPaperSuccessToast).toBeVisible();
    });

    test("When the user enters an invalid year and saves, then an error toast is shown", async ({
        page,
        projectPaperViewPage,
    }) => {
        await projectPaperViewPage.openProjectPaperView(
            projectPaperViewPage.projectId,
            projectPaperViewPage.localProjectPaperIds[0],
        );

        // Enter edit mode
        await projectPaperViewPage.toggleEditModeButton.click();

        // Set invalid year
        const yearInput = projectPaperViewPage.getToggleableInput("year");
        const previousYear = await yearInput.inputValue();
        await yearInput.fill("");
        await yearInput.fill("abcd");

        // Attempt to save
        await projectPaperViewPage.savePaperChangesButton.click();

        // Expect validation error toast
        await expect(projectPaperViewPage.yearValidationErrorToast).toBeVisible();

        await page.reload();

        // Expect no changes were saved
        await expect(yearInput).toHaveValue(previousYear);
    });
});

test.describe("Create Paper Tests", () => {
    test("When the user fills out the create paper form and saves, then a success toast is shown", async ({
        projectPaperViewPage,
    }) => {
        await projectPaperViewPage.openCreateProjectPaperView(projectPaperViewPage.projectId, "1");

        // Fill out form
        const titleInput = projectPaperViewPage.getToggleableInput("title");
        await titleInput.fill("New Paper Title");

        const authorsInput = projectPaperViewPage.getToggleableInput("authors");
        await authorsInput.fill("John Doe; Jane Smith");

        const yearInput = projectPaperViewPage.getToggleableInput("year");
        await yearInput.fill("2024");

        // Save
        await projectPaperViewPage.savePaperChangesButton.click();

        // Expect success toast
        await expect(projectPaperViewPage.createdPaperSuccessToast).toBeVisible();

        // Expect that paper view shows the newly created paper
        await expect(projectPaperViewPage.getHeading("New Paper Title")).toBeVisible();
    });

    test("When the user enters an invalid year and saves, then an error toast is shown", async ({
        projectPaperViewPage,
    }) => {
        await projectPaperViewPage.openCreateProjectPaperView(projectPaperViewPage.projectId, "1");

        // Set invalid year
        const yearInput = projectPaperViewPage.getToggleableInput("year");
        await yearInput.fill("abcd");

        // Attempt to create
        await projectPaperViewPage.savePaperChangesButton.click();

        // Expect validation error toast
        await expect(projectPaperViewPage.yearValidationErrorToast).toBeVisible();
    });
});
