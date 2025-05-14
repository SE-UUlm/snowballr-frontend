import { expect, type Locator, type Page } from "@playwright/test";

export class DevRemoveMemberDialog {
    readonly page: Page;
    readonly dialog: Locator;
    readonly openButton: Locator;
    readonly confirmButton: Locator;
    readonly cancelButton: Locator;

    constructor(page: Page, user: { email: string }) {
        this.page = page;
        this.dialog = page.getByRole("alertdialog", {
            name: `Remove ${user.email} From This Project`,
        });
        this.openButton = page.locator(`button[aria-label="Remove member ${user.email}"]`);
        this.confirmButton = this.dialog.getByRole("button", {
            name: `Remove ${user.email} From This Project`,
        });
        this.cancelButton = this.dialog.getByRole("button", { name: "Cancel" });
    }

    /**
     * Opens the dialog for removing a user from the project.
     */
    async open() {
        await expect(this.dialog).not.toBeVisible();
        await this.openButton.click();
        await expect(this.dialog).toBeVisible();
    }

    /**
     * Removes the user from the project.
     */
    async remove() {
        await expect(this.dialog).toBeVisible();
        await this.confirmButton.click();
        await expect(this.dialog).not.toBeVisible();
    }

    /**
     * Cancels the removal of the user from the project.
     */
    async cancel() {
        await expect(this.dialog).toBeVisible();
        await this.cancelButton.click();
        await expect(this.dialog).not.toBeVisible();
    }
}
