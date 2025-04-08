import { expect, type Locator, type Page } from "@playwright/test";

export class DevHomePage {
    readonly page: Page;
    readonly createProjectDialog: Locator;
    readonly openCreateProjectDialogButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.createProjectDialog = page.getByRole("dialog", { name: "Create Project" });
        this.openCreateProjectDialogButton = page.getByTestId("dialog-trigger");
    }

    /**
     * Opens the dialog for creating a new project.
     */
    async openCreateProjectDialog() {
        await expect(this.createProjectDialog).not.toBeVisible();
        await this.openCreateProjectDialogButton.click();
    }
}
