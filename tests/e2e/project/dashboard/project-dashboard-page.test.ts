import { expect } from "@playwright/test";
import { test } from "./project-dashboard-page-fixture";

test.describe("Project Dashboard Tests", () => {
    test("When navigating to the project dashboard, then the page is displayed.", async ({
        page,
        projectDashboardPage,
        homePage,
        projectPaperViewPage,
        projectNavigationBar,
    }) => {
        // Navigate directly to the dashboard
        await page.goto("/");
        await homePage.openProject(projectDashboardPage.projectName);
        await expect(projectDashboardPage.projectInformationLabel).toBeVisible();

        // Navigate to project paper view
        await page.goto("/");
        await homePage.openProjectPaper(projectDashboardPage.paperName);
        await expect(projectPaperViewPage.getHeading(projectDashboardPage.paperName)).toBeVisible();

        // Navigate to dashboard
        await projectNavigationBar.goBackButton.click();
        await expect(
            projectDashboardPage.getHeading(projectDashboardPage.projectName),
        ).toBeVisible();
        await expect(projectDashboardPage.projectInformationLabel).toBeVisible();
    });
});
