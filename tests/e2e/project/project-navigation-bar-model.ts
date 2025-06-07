import { type Locator, type Page } from "@playwright/test";
import { NavigationBarModel } from "$tests/e2e/navigation-bar-model";

export class ProjectNavigationBarModel extends NavigationBarModel {
    readonly dashboardTab: Locator;
    readonly papersTab: Locator;
    readonly statisticsTab: Locator;
    readonly settingsTab: Locator;

    constructor(page: Page) {
        super(page);
        this.dashboardTab = this.page.getByRole("tab", { name: "Dashboard" });
        this.papersTab = this.page.getByRole("tab", { name: "Papers" });
        this.statisticsTab = this.page.getByRole("tab", { name: "Statistics" });
        this.settingsTab = this.page.getByRole("tab", { name: "Settings" });
    }
}
