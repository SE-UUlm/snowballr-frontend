import { type Locator, type Page } from "@playwright/test";

export class ProjectSettingsSidebarModel {
    readonly page: Page;
    readonly general: Locator;
    readonly members: Locator;
    readonly slr: Locator;
    readonly review: Locator;

    constructor(page: Page) {
        this.page = page;
        this.general = page.getByRole("link", { name: "General" });
        this.members = page.getByRole("link", { name: "Members" });
        this.slr = page.getByRole("link", { name: "SLR" });
        this.review = page.getByRole("link", { name: "Review" });
    }
}
