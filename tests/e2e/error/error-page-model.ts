import type { Locator, Page } from "@playwright/test";

export class ErrorPageModel {
    readonly page: Page;
    readonly headline: Locator;
    readonly bodyText: Locator;
    readonly errorCodeText: Locator;
    readonly backToDashboardButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.headline = page.getByRole("heading", { level: 1 });
        this.bodyText = page.locator("h1 + div");
        this.errorCodeText = page.getByText(/\(Error Code: \d{3}\)/);
        this.backToDashboardButton = page.getByRole("button", { name: "Back to Dashboard" });
    }
}
