import { expect, type Locator, type Page } from "@playwright/test";

export class ConfirmMaybeDecisionDialogModel {
    readonly page: Page;
    readonly confirmButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.confirmButton = page.getByRole("button", { name: "Confirm" });
    }

    getDialog(enable: boolean) {
        return this.page.getByRole("alertdialog", {
            name: `${enable ? "Enable" : "Disable"} 'Maybe' as Decision?`,
        });
    }

    /**
     * Confirms the decision in the dialog by clicking the confirm button.
     *
     * @param state - the state of the dialog.
     */
    async confirmDecision(state: boolean) {
        await expect(this.getDialog(state)).toBeVisible();
        await this.confirmButton.click();
    }
}
