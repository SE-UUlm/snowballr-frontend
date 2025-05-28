import { expect, type Locator, type Page } from "@playwright/test";

export class DevProjectSLRSettingsPage {
    readonly page: Page;
    readonly maybeAsDecisionSwitch: Locator;
    readonly confirmButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.maybeAsDecisionSwitch = page.getByRole("switch", {
            name: "Allow 'Maybe' as decision on a Paper",
        });
        this.confirmButton = page.getByRole("button", { name: "Confirm" });
    }

    /**
     * Opens the SLR settings page for a specific project.
     *
     * @param projectId - The ID of the project to open SLR settings for.
     * @param projectName - The name of the project to verify in the settings page.
     */
    async openSLRProjectSettings(projectId: string, projectName: string) {
        await this.page.goto(`project/${projectId}/settings/slr`);
        await expect(this.page.getByRole("heading", { name: projectName })).toBeVisible();
    }

    /**
     * Toggles the "Maybe as decision" switch to the desired state.
     *
     * @param state - The desired state of the "Maybe as Decision" switch.
     */
    async toggleMaybeAsDecisionSwitch(state: boolean) {
        if ((await this.maybeAsDecisionSwitch.isChecked()) !== state) {
            await this.maybeAsDecisionSwitch.click();
            await this.confirmButton.click();
        }
        if (state) {
            await expect(this.maybeAsDecisionSwitch).toBeChecked();
        } else {
            await expect(this.maybeAsDecisionSwitch).not.toBeChecked();
        }
    }
}
