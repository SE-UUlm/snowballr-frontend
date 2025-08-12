import { expect, type Locator, type Page } from "@playwright/test";
import { ProjectPaperViewPageModel } from "$tests/e2e/project/paper/project-paper-view-page-model";
import { ProjectDashboardPageModel } from "$tests/e2e/project/dashboard/project-dashboard-page-model";

export class HomePageModel {
    readonly page: Page;
    readonly heading: Locator;
    readonly createProjectDialog: Locator;
    readonly openCreateProjectDialogButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.getByRole("heading", { name: "SnowballR", exact: true });
        this.createProjectDialog = page.getByRole("dialog", { name: "Create Project" });
        this.openCreateProjectDialogButton = page.getByRole("button", {
            name: "Create new Project",
        });
    }

    /**
     * Returns the list link element of the homepage with the given name
     *
     * @param name - the name of the list element
     */
    getListElementLink(name: string) {
        return this.page.getByRole("link", { name: name });
    }

    /**
     * Opens and navigates to the project paper view of the project paper with the given name
     *
     * @param paperName - the name of the project paper to navigate to
     */
    async openProjectPaper(paperName: string) {
        await expect(this.getListElementLink(paperName)).toBeVisible();
        await this.getListElementLink(paperName).click();
        await expect(new ProjectPaperViewPageModel(this.page).getHeading(paperName)).toBeVisible();
    }

    /**
     * Opens and navigates to the project dashboard of the project the given name
     *
     * @param projectName - the name of the project to navigate to
     */
    async openProject(projectName: string) {
        await this.getListElementLink(projectName).click();
        await expect(
            new ProjectDashboardPageModel(this.page).getHeading(projectName),
        ).toBeVisible();
    }

    /**
     * Opens the dialog for creating a new project.
     */
    async openCreateProjectDialog() {
        await expect(this.createProjectDialog).not.toBeVisible();
        await this.openCreateProjectDialogButton.click();
    }
}
