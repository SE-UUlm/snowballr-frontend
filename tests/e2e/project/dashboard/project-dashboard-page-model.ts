import { expect, type Locator, type Page } from "@playwright/test";
import { ProjectPaperViewPageModel } from "$tests/e2e/project/paper/project-paper-view-page-model";

export class ProjectDashboardPageModel {
    readonly page: Page;
    readonly projectInformationLabel: Locator;

    readonly projectName: string;
    readonly paperName: string;

    constructor(page: Page) {
        this.page = page;
        this.projectInformationLabel = page.getByText("Project Information");

        this.projectName = "Project 1";
        this.paperName = "Paper 1";
    }

    /**
     * Returns a heading element based on a specified paper title.
     *
     * @param paperTitle - The title of the paper to locate within the navigation role.
     */
    getHeading(paperTitle: string) {
        return this.page.getByRole("navigation").getByText(paperTitle, { exact: false });
    }

    /**
     * Opens and navigates to the project paper view of the project paper with the given name
     *
     * @param paperName - the name of the project paper to navigate to
     */
    async openProjectPaper(paperName: string) {
        await this.page.getByRole("link", { name: paperName }).click();
        await expect(new ProjectPaperViewPageModel(this.page).getHeading(paperName)).toBeVisible();
    }
}
