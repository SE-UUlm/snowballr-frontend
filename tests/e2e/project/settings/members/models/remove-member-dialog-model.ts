import { getName } from "$lib/utils/common-helper";
import { expect, type Locator, type Page } from "@playwright/test";

export class RemoveMemberDialogModel {
    readonly page: Page;
    readonly dialog: Locator;
    readonly confirmButton: Locator;
    readonly cancelButton: Locator;

    constructor(page: Page, user: { firstName?: string; lastName?: string; email: string }) {
        let displayName: string;
        if (user.firstName && user.lastName) {
            displayName = getName({ firstName: user.firstName, lastName: user.lastName });
        } else {
            displayName = user.email;
        }

        this.page = page;
        this.dialog = page.getByRole("alertdialog", {
            name: `Remove ${displayName} From This Project`,
        });
        this.confirmButton = this.dialog.getByRole("button", {
            name: `Remove Member From This Project`,
        });
        this.cancelButton = this.dialog.getByRole("button", { name: "Cancel" });
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
