import { expect, type Locator, type Page } from "@playwright/test";

export class ProjectSetupSettingsPageModel {
    readonly page: Page;
    readonly heading: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.getByRole("heading", { name: "Default Fetcher Settings" });
    }

    getFetcherRow(fetcherName: string) {
        return this.page
            .getByTestId("settings-section-default-fetcher-settings")
            .getByRole("listitem")
            .filter({ hasText: fetcherName });
    }

    async addFetcher(fetcherName: string) {
        const fetcherRow = this.getFetcherRow(fetcherName).first();
        await fetcherRow.getByRole("button").click();
        await this.page.getByTestId("alert-dialog-action").click();
    }

    async deleteFetcher(fetcherName: string) {
        const fetcherRow = this.getFetcherRow(fetcherName);
        await fetcherRow.getByRole("button").nth(1).click();
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
}
