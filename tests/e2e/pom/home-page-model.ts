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

    /**
     * Opens the account settings page.
     */
    async openAccountSettings() {
        await expect(this.page.getByRole("heading", { name: "Settings" })).not.toBeVisible();
        await this.page.getByRole("button", { name: /[A-Z]{2}/ }).click();
        await this.page.getByRole("link", { name: "Settings" }).click();
    }
}
