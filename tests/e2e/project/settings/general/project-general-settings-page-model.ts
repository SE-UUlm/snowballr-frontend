import { expect, type Locator, type Page } from "@playwright/test";

export class ProjectGeneralSettingsPageModel {
    readonly page: Page;
    readonly heading: Locator;
    readonly archivedBadge: Locator;
    readonly projectNameInput: Locator;
    readonly renameButton: Locator;
    readonly archiveButton: Locator;
    readonly reactivateButton: Locator;
    readonly errorAlert: Locator;
    readonly deleteButton: Locator;
    readonly deleteProjectDialog: Locator;
    readonly deleteProjectInput: Locator;
    readonly deleteProjectConfirmButton: Locator;

    projectId: string;
    projectName: string;

    constructor(page: Page) {
        this.page = page;
        this.projectId = "";
        this.projectName = "Project 1";

        this.heading = page.getByRole("heading", { name: this.projectName });
        this.archivedBadge = page.getByRole("navigation").getByText("Archived");
        this.projectNameInput = page.getByLabel("Project Name");
        this.renameButton = page.getByRole("button", { name: "Rename" });
        this.archiveButton = page.getByRole("button", { name: "Archive Project" });
        this.reactivateButton = page.getByRole("button", { name: "Activate Project" });
        this.errorAlert = page.getByRole("alert");
        this.deleteButton = page.getByRole("button", { name: "Delete" });
        this.deleteProjectDialog = page.getByRole("alertdialog", { name: "Delete This Project" });
        this.deleteProjectInput = this.deleteProjectDialog.getByRole("textbox");
        this.deleteProjectConfirmButton = this.deleteProjectDialog.getByRole("button", {
            name: "Delete This Project",
        });
    }

    /**
     * Changes the name of the project.
     *
     * @param projectName - the new project name
     */
    async changeProjectName(projectName: string) {
        await this.projectNameInput.fill(projectName);
        await this.renameButton.click();
        this.projectName = projectName;
    }

    async deleteProject() {
        await this.archiveButton.hover();
        await this.page.mouse.wheel(0, 1000); // Scroll down to make the delete button visible

        await this.deleteButton.click();
        await expect(this.deleteProjectDialog).toBeVisible();

        await this.deleteProjectInput.fill(this.projectName);
        await this.deleteProjectConfirmButton.click();
    }
}
