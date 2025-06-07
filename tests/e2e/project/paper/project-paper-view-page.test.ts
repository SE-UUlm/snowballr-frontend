import { test } from "./project-paper-view-page-fixtures";
import { expect } from "@playwright/test";

test.describe("Project Paper View Tests", () => {
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
            .dblclick();

        await expect(
            projectPaperViewPage.getHeading(projectPaperViewPage.projectPaperNames[0]),
        ).toBeVisible();
        await expect(projectPaperViewPage.nextPaperButton).toBeVisible();
    });
});
