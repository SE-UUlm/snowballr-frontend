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
     * Opens the user settings page.
     */
    async openLinkInUserMenuDialog(linkName: LinkName) {
        await this.page.getByRole("button", { name: /^[A-Z]{2}$/ }).click();
        await this.page.getByRole("link", { name: linkName }).click();
        await expect(this.page.getByRole("heading", { name: linkName })).toBeVisible();
    }

    /**
     * Opens the account settings page.
     */
    async openAccountSettings() {
        await this.openSettings();
        await this.page.getByRole("link", { name: "Account" }).click();
    }

    /**
     * Opens the shortcuts settings page.
     */
    async openShortcutsSettings() {
        await this.openSettings();
        await this.page.getByRole("link", { name: "Shortcuts" }).click();
    }
}
