import { getName } from "$lib/utils/common-helper";
import { expect, type Locator, type Page } from "@playwright/test";

export class PromoteMemberDialogModel {
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
            name: `Promote ${displayName} to a Project Admin`,
        });
        this.confirmButton = this.dialog.getByRole("button", {
            name: `Promote Member to a Project Admin`,
        });
        this.cancelButton = this.dialog.getByRole("button", { name: "Cancel" });
    }

    /**
     * Promotes the user to an admin.
     */
    async promote() {
        await expect(this.dialog).toBeVisible();
        await this.confirmButton.click();
        await expect(this.dialog).not.toBeVisible();
    }

    /**
     * Cancels the promotion of the user to an admin.
     */
    async cancel() {
        await expect(this.dialog).toBeVisible();
        await this.cancelButton.click();
        await expect(this.dialog).not.toBeVisible();
    }
}
