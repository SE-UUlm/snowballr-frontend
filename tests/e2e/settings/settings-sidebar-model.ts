import { type Locator, type Page } from "@playwright/test";

export class SettingsSidebarModel {
    readonly page: Page;
    readonly account: Locator;
    readonly projectSetup: Locator;
    readonly shortcuts: Locator;
    readonly review: Locator;

    constructor(page: Page) {
        this.page = page;
        this.account = page.getByRole("link", { name: "Account" });
        this.projectSetup = page.getByRole("link", { name: "Project Setup" });
        this.shortcuts = page.getByRole("link", { name: "Shortcuts" });
        this.review = page.getByRole("link", { name: "Review" });
    }
}
