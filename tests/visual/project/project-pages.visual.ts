import { expect } from "@playwright/test";
import { test } from "$tests/visual/utils/visual-fixture";
import { gotoAndSettle } from "$tests/visual/utils/helper";
import { ProjectDashboardPageModel } from "$tests/e2e/project/dashboard/project-dashboard-page-model";
import { ProjectPapersPageModel } from "$tests/e2e/project/papers/project-papers-page-model";
import { ProjectPaperViewPageModel } from "$tests/e2e/project/paper/project-paper-view-page-model";
import { ACTIVE_PROJECT_NAME, PAPERS } from "$tests/visual/utils/visual-data";

test.describe("Project pages", () => {
    test("When the project dashboard is opened, then it matches the baseline", async ({
        page,
        visualData,
    }) => {
        const dashboardPage = new ProjectDashboardPageModel(page);
        await gotoAndSettle(
            page,
            `/project/${visualData.activeProjectId}/dashboard`,
            dashboardPage.projectInformationLabel,
        );

        await expect(page).toHaveScreenshot("dashboard.png", { fullPage: true });
    });

    test("When the papers page is opened, then it matches the baseline", async ({
        page,
        visualData,
    }) => {
        const papersPage = new ProjectPapersPageModel(page);
        await gotoAndSettle(
            page,
            `/project/${visualData.activeProjectId}/papers`,
            papersPage.getStageTrigger(1),
        );

        await expect(page).toHaveScreenshot("papers.png", { fullPage: true });
    });

    test("When a stage is expanded on the papers page, then it matches the baseline", async ({
        page,
        visualData,
    }) => {
        const papersPage = new ProjectPapersPageModel(page);
        await gotoAndSettle(
            page,
            `/project/${visualData.activeProjectId}/papers`,
            papersPage.getStageTrigger(0),
        );
        await papersPage.getStageTrigger(0).click();
        await expect(papersPage.getPaperByTitle(PAPERS.contractTesting.title)).toBeVisible();

        await expect(page).toHaveScreenshot("papers-stage-expanded.png", { fullPage: true });
    });

    test("When the filters are shown on the papers page, then it matches the baseline", async ({
        page,
        visualData,
    }) => {
        const papersPage = new ProjectPapersPageModel(page);
        await gotoAndSettle(
            page,
            `/project/${visualData.activeProjectId}/papers`,
            papersPage.getStageTrigger(0),
        );
        await papersPage.showFiltersButton.click();
        await expect(papersPage.decisionFilterButton).toBeVisible();

        await expect(page).toHaveScreenshot("papers-filters.png", { fullPage: true });
    });

    test("When an undecided project paper is opened, then it matches the baseline", async ({
        page,
        visualData,
    }) => {
        const paperViewPage = new ProjectPaperViewPageModel(page);
        // the local id of "endToEndFlakiness", the first undecided paper
        await gotoAndSettle(
            page,
            `/project/${visualData.activeProjectId}/paper/2`,
            paperViewPage.getHeading(PAPERS.endToEndFlakiness.title),
        );

        await expect(page).toHaveScreenshot("project-paper.png", { fullPage: true });
    });

    test("When an accepted project paper is opened, then it matches the baseline", async ({
        page,
        visualData,
    }) => {
        const paperViewPage = new ProjectPaperViewPageModel(page);
        await gotoAndSettle(
            page,
            `/project/${visualData.activeProjectId}/paper/0`,
            paperViewPage.getHeading(PAPERS.contractTesting.title),
        );

        await expect(page).toHaveScreenshot("project-paper-accepted.png", { fullPage: true });
    });

    test("When a project paper is in edit mode, then it matches the baseline", async ({
        page,
        visualData,
    }) => {
        const paperViewPage = new ProjectPaperViewPageModel(page);
        await gotoAndSettle(
            page,
            `/project/${visualData.activeProjectId}/paper/2`,
            paperViewPage.getHeading(PAPERS.endToEndFlakiness.title),
        );
        await paperViewPage.toggleEditModeButton.click();
        await expect(paperViewPage.savePaperChangesButton).toBeVisible();

        await expect(page).toHaveScreenshot("project-paper-edit.png", { fullPage: true });
    });

    test("When the add-paper page is opened, then it matches the baseline", async ({
        page,
        visualData,
    }) => {
        const paperViewPage = new ProjectPaperViewPageModel(page);
        await gotoAndSettle(
            page,
            `/project/${visualData.activeProjectId}/paper/new?stage=0`,
            paperViewPage.savePaperChangesButton,
        );

        await expect(page).toHaveScreenshot("project-paper-new.png", { fullPage: true });
    });

    test("When the statistics page is opened, then it matches the baseline", async ({
        page,
        visualData,
    }) => {
        await gotoAndSettle(
            page,
            `/project/${visualData.activeProjectId}/statistics`,
            page.getByRole("navigation").getByText(ACTIVE_PROJECT_NAME),
        );

        await expect(page).toHaveScreenshot("statistics.png", { fullPage: true });
    });

    test("When a project without papers is opened, then the empty papers page matches the baseline", async ({
        page,
        apiClient,
    }) => {
        const project = await apiClient.createProject({ name: "Empty Project" }).response;
        const papersPage = new ProjectPapersPageModel(page);
        await gotoAndSettle(page, `/project/${project.id}/papers`, papersPage.getStageTrigger(0));

        await expect(page).toHaveScreenshot("papers-empty.png", { fullPage: true });
    });
});
