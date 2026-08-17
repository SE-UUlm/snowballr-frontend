import { expect, type Locator, type Page } from "@playwright/test";
import { ConfirmMaybeDecisionDialogModel } from "$tests/e2e/project/settings/slr/confirm-maybe-decision-dialog-model";
import type { AuthSnowballRClient } from "$tests/e2e/utils/helper/mock-backend";

export class ProjectSLRSettingsPageModel {
    readonly page: Page;
    readonly confirmMaybeDecisionDialog: ConfirmMaybeDecisionDialogModel;

    readonly heading: Locator;
    readonly maybeAsDecisionSwitch: Locator;
    readonly snowballingTypeForwardRadio: Locator;
    readonly snowballingTypeBackwardRadio: Locator;
    readonly snowballingTypeBothRadio: Locator;

    readonly projectName: string;

    projectId: string;
    projectPaperId: string;

    apiClient: AuthSnowballRClient;

    constructor(page: Page, apiClient: AuthSnowballRClient) {
        this.apiClient = apiClient;
        this.page = page;
        this.projectName = "Project 1";

        this.confirmMaybeDecisionDialog = new ConfirmMaybeDecisionDialogModel(page);

        this.heading = page.getByRole("heading", { name: this.projectName });
        this.maybeAsDecisionSwitch = page.getByRole("switch", {
            name: "Allow 'Maybe' as decision on a Paper",
        });
        this.snowballingTypeForwardRadio = page.getByRole("radio", { name: "Forward" });
        this.snowballingTypeBackwardRadio = page.getByRole("radio", { name: "Backward" });
        this.snowballingTypeBothRadio = page.getByRole("radio", { name: "Both" });

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

    getFetcherRow(fetcherName: string) {
        return this.page
            .getByTestId("settings-section-fetcher-settings")
            .getByRole("listitem")
            .filter({ hasText: fetcherName });
    }

    getFetcherTitle(fetcherName: string) {
        return this.page.getByRole("heading", { name: fetcherName, exact: true });
    }

    async openEditFetcherDialog(fetcherName: string) {
        const fetcherRow = this.getFetcherRow(fetcherName);
        await fetcherRow.getByRole("button").first().click();
    }

    async deleteFetcher(fetcherName: string) {
        const fetcherRow = this.getFetcherRow(fetcherName);
        await fetcherRow.getByRole("button").nth(1).click();
        await this.page.getByTestId("alert-dialog-action").click();
    }

    async addFetcher(fetcherName: string) {
        const fetcherRow = this.getFetcherRow(fetcherName).first();
        await fetcherRow.getByRole("button").click();
        await this.page.getByTestId("alert-dialog-action").click();
    }

    async ensureFetcherAdded(fetcherName: string) {
        const fetcherRow = this.getFetcherRow(fetcherName).first();
        await expect(fetcherRow.getByRole("button")).toHaveCount(2);
    }

    async ensureFetcherRemoved(fetcherName: string) {
        const fetcherRow = this.getFetcherRow(fetcherName).first();
        await expect(fetcherRow.getByRole("button")).toHaveCount(1);
    }

    async getResetButton(fetcherName: string) {
        return this.page
            .getByRole("alertdialog", { name: `Edit ${fetcherName} Fetcher Options` })
            .getByTestId("key-set-default-btn");
    }

    async ensureResetButtonState(fetcherName: string, shouldBeEnabled: boolean) {
        const resetButton = await this.getResetButton(fetcherName);
        if (shouldBeEnabled) {
            await expect(resetButton).toBeEnabled();
        } else {
            await expect(resetButton).toBeDisabled();
        }
    }

    async selectSnowballingType(type: "Forward" | "Backward" | "Both") {
        let radio: Locator;
        switch (type) {
            case "Forward":
                radio = this.snowballingTypeForwardRadio;
                break;
            case "Backward":
                radio = this.snowballingTypeBackwardRadio;
                break;
            case "Both":
                radio = this.snowballingTypeBothRadio;
                break;
        }

        await radio.click();

        await expect(radio).toBeChecked();
        await expect(
            this.page.getByText("Successfully updated the project settings."),
        ).toBeVisible();
    }
}
