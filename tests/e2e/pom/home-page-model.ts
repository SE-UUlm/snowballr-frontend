import { expect, type Locator, type Page } from "@playwright/test";

export class DevHomePage {
    readonly page: Page;
    readonly projectCreateDialog: Locator;
    readonly openProjectCreateDialogButton: Locator;
    readonly cancelProjectCreationButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.projectCreateDialog = page.getByRole("dialog", { name: "Create Project" });
        this.openProjectCreateDialogButton = page.getByTestId("dialog-trigger-button");
        this.cancelProjectCreationButton = page.getByRole("button", { name: "Cancel" });
    }

    async openCreateProjectDialog() {
        await expect(this.projectCreateDialog).not.toBeVisible();
        await this.openProjectCreateDialogButton.click();
    }

    async closeCreateProjectDialog() {
        await expect(this.projectCreateDialog).toBeVisible();
        await this.cancelProjectCreationButton.click();
    }

    async createProject() {
        await this.openProjectCreateDialogButton.click();
        await this.page.getByLabel("Name").fill("Demo project 1");
        await this.page.getByLabel("Members").fill("max@mustermann.de");
        await this.page.getByLabel("Members").pressSequentially("john");
        await this.page.getByLabel("Members").press("Tab");

        await this.page.locator("button[type=submit]", { hasText: "Create Project" }).click();
    }
}
