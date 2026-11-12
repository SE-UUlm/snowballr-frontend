import { expect } from "@playwright/test";
import { test } from "$tests/visual/utils/visual-fixture";
import { gotoAndSettle } from "$tests/visual/utils/helper";
import { HomePageModel } from "$tests/e2e/homepage/home-page-model";
import { NavigationBarModel } from "$tests/e2e/navigation-bar-model";
import { ProjectPapersPageModel } from "$tests/e2e/project/papers/project-papers-page-model";
import { AddPaperDialogModel } from "$tests/e2e/project/papers/add-paper-dialog-model";
import { ProjectPaperViewPageModel } from "$tests/e2e/project/paper/project-paper-view-page-model";
import { PAPERS } from "$tests/visual/utils/visual-data";

/*
Open overlays (menus, dropdowns, dialogs, tooltips). Page screenshots are used where the overlay is
positioned relative to its trigger, so the placement is covered as well.
 */
test.describe("Component states", () => {
    test("When the user menu is opened, then it matches the baseline", async ({ page }) => {
        const homePage = new HomePageModel(page);
        const navigationBar = new NavigationBarModel(page);
        await gotoAndSettle(page, "/", homePage.heading);
        await navigationBar.openUserMenu();

        await expect(page).toHaveScreenshot("user-menu.png");
    });

    test("When the decision filter is opened, then the dropdown matches the baseline", async ({
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
        await papersPage.decisionFilterButton.click();
        await expect(page.getByRole("option").first()).toBeVisible();

        await expect(page).toHaveScreenshot("decision-filter.png");
    });

    test("When the sort options are opened, then the dropdown matches the baseline", async ({
        page,
        visualData,
    }) => {
        const papersPage = new ProjectPapersPageModel(page);
        await gotoAndSettle(
            page,
            `/project/${visualData.activeProjectId}/papers`,
            papersPage.getStageTrigger(0),
        );
        await papersPage.sortOptionSelect.click();
        await expect(page.getByRole("option").first()).toBeVisible();

        await expect(page).toHaveScreenshot("sort-options.png");
    });

    test("When the add-paper dialog is opened, then it matches the baseline", async ({
        page,
        visualData,
    }) => {
        const addPaperDialog = new AddPaperDialogModel(page);
        await gotoAndSettle(
            page,
            `/project/${visualData.activeProjectId}/papers`,
            addPaperDialog.stageTrigger,
        );
        await addPaperDialog.openStage();
        await addPaperDialog.open();

        await expect(addPaperDialog.dialog).toHaveScreenshot("add-paper-dialog.png");
    });

    test("When hovering the help icon of a criterion, then the tooltip matches the baseline", async ({
        page,
        visualData,
    }) => {
        const paperViewPage = new ProjectPaperViewPageModel(page);
        await gotoAndSettle(
            page,
            `/project/${visualData.activeProjectId}/paper/2`,
            paperViewPage.getHeading(PAPERS.endToEndFlakiness.title),
        );
        // The help icon's accessible name is the criterion's description.
        const description = "The paper addresses microservice or service-based architectures.";
        await page.getByRole("button", { name: description }).hover();
        await expect(page.getByText(description, { exact: true })).toBeVisible();

        await expect(page).toHaveScreenshot("criterion-tooltip.png");
    });
});
