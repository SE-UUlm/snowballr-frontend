import { expect, type Locator, type Page } from "@playwright/test";
import { ConfirmMaybeDecisionDialogModel } from "$tests/e2e/project/settings/slr/confirm-maybe-decision-dialog-model";

export class ProjectSLRSettingsPageModel {
    readonly page: Page;
    readonly confirmMaybeDecisionDialog: ConfirmMaybeDecisionDialogModel;

    readonly heading: Locator;
    readonly maybeAsDecisionSwitch: Locator;

    readonly projectName: string;

    projectId: string;
    projectPaperId: string;

    constructor(page: Page) {
        this.page = page;
        this.projectName = "Project 1";

        this.confirmMaybeDecisionDialog = new ConfirmMaybeDecisionDialogModel(page);

        this.heading = page.getByRole("heading", { name: this.projectName });
        this.maybeAsDecisionSwitch = page.getByRole("switch", {
            name: "Allow 'Maybe' as decision on a Paper",
        });

        this.projectId = "";
        this.projectPaperId = "";
    }

    /**
     * Toggles the "Maybe as decision" switch to the desired state.
     *
     * @param state - The desired state of the "Maybe as Decision" switch.
     */
    async toggleMaybeAsDecisionSwitch(state: boolean) {
        await expect(this.maybeAsDecisionSwitch).toBeEnabled();
        if ((await this.maybeAsDecisionSwitch.isChecked()) !== state) {
            await this.maybeAsDecisionSwitch.click();
            await this.confirmMaybeDecisionDialog.confirmDecision(state);
        }
        if (state) {
            await expect(this.maybeAsDecisionSwitch).toBeChecked();
        } else {
            await expect(this.maybeAsDecisionSwitch).not.toBeChecked();
        }
    }
}
